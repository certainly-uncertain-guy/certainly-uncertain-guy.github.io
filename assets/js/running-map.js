var RunningMap = (function () {
  var VIEWBOX_W = 960, VIEWBOX_H = 600;
  var LNG_MIN = -125, LNG_MAX = -66, LAT_MIN = 24, LAT_MAX = 50;

  function project(lat, lng) {
    var x = (lng - LNG_MIN) / (LNG_MAX - LNG_MIN) * VIEWBOX_W;
    var y = (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * VIEWBOX_H;
    return [x, y];
  }

  function render(records) {
    var svg = document.getElementById('us-map-svg');
    var footnote = document.getElementById('us-map-footnote');
    if (!svg) return;

    var byCity = {};
    var mumbaiCount = 0;
    records.forEach(function (r) {
      if (r.city === 'Mumbai') { mumbaiCount++; return; }
      if (r.lat == null || r.lng == null) return;
      if (!byCity[r.city]) byCity[r.city] = { lat: r.lat, lng: r.lng, distance: 0, count: 0 };
      byCity[r.city].distance += r.distance_km;
      byCity[r.city].count += 1;
    });

    var maxDistance = Math.max.apply(null, Object.keys(byCity).map(function (c) { return byCity[c].distance; }));
    var ns = 'http://www.w3.org/2000/svg';
    // Labels for the smallest bubbles (r < 8) would collide with their own circle;
    // only label bubbles above that radius directly, per the dataviz skill's
    // "selective direct labels" rule (never a label on every mark).
    var LABEL_MIN_R = 8;
    // Approximate label glyph metrics for the 11px .us-map-label font, used
    // only for the collision-avoidance bounding-box check below.
    var LABEL_CHAR_W = 6.5;
    var LABEL_H = 12;

    var cityNames = Object.keys(byCity);
    var placed = []; // circle/title always render; only text labels are collision-checked

    // Compute geometry for every city up front so labels can be placed in
    // radius-descending order (biggest/most-important city wins ties for
    // space) independent of Object.keys() iteration order.
    var geo = cityNames.map(function (city) {
      var info = byCity[city];
      var pos = project(info.lat, info.lng);
      var r = 4 + 22 * Math.sqrt(info.distance / maxDistance);
      return { city: city, info: info, pos: pos, r: r };
    });

    geo.forEach(function (g) {
      var circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', g.pos[0]);
      circle.setAttribute('cy', g.pos[1]);
      circle.setAttribute('r', g.r.toFixed(1));
      circle.setAttribute('class', 'us-map-bubble');
      var title = document.createElementNS(ns, 'title');
      title.textContent = g.city + ': ' + Math.round(g.info.distance) + ' km across ' + g.info.count + ' runs';
      circle.appendChild(title);
      svg.appendChild(circle);
    });

    var labelCandidates = geo.filter(function (g) { return g.r >= LABEL_MIN_R; });
    labelCandidates.sort(function (a, b) { return b.r - a.r; });

    // Candidate anchor positions, tried in order of preference. A single fixed
    // position drops labels entirely in dense clusters (the Bay Area cities
    // project within a few pixels of each other at this scale, which cost San
    // Francisco — the post's narrative anchor — its label). Standard greedy
    // placement: take the first candidate that neither overlaps an already
    // placed label nor falls outside the viewBox.
    function anchorCandidates(g, w, h) {
      var x = g.pos[0], y = g.pos[1], r = g.r;
      var above = y - r - 4;
      var below = y + r + h;
      var mid = y + h / 3;
      return [
        { x: x, y: above, anchor: 'middle' },
        { x: x, y: below, anchor: 'middle' },
        { x: x + r + 4, y: mid, anchor: 'start' },
        { x: x - r - 4, y: mid, anchor: 'end' },
        { x: x + r + 4, y: above, anchor: 'start' },
        { x: x - r - 4, y: above, anchor: 'end' },
        { x: x + r + 4, y: below, anchor: 'start' },
        { x: x - r - 4, y: below, anchor: 'end' }
      ].map(function (c) {
        var left = c.anchor === 'middle' ? c.x - w / 2 : (c.anchor === 'start' ? c.x : c.x - w);
        c.box = { left: left, right: left + w, top: c.y - h, bottom: c.y };
        return c;
      });
    }

    function inBounds(box) {
      return box.left >= 0 && box.right <= VIEWBOX_W && box.top >= 0 && box.bottom <= VIEWBOX_H;
    }

    function collides(box) {
      return placed.some(function (p) {
        return box.left < p.right && box.right > p.left && box.top < p.bottom && box.bottom > p.top;
      });
    }

    labelCandidates.forEach(function (g) {
      var w = g.city.length * LABEL_CHAR_W;
      var h = LABEL_H;
      var chosen = null;
      var candidates = anchorCandidates(g, w, h);
      for (var i = 0; i < candidates.length; i++) {
        if (inBounds(candidates[i].box) && !collides(candidates[i].box)) {
          chosen = candidates[i];
          break;
        }
      }
      // Every anchor position is taken or off-canvas — drop this label.
      if (!chosen) return;

      var label = document.createElementNS(ns, 'text');
      label.setAttribute('x', chosen.x);
      label.setAttribute('y', chosen.y);
      label.setAttribute('class', 'us-map-label');
      label.setAttribute('text-anchor', chosen.anchor);
      label.textContent = g.city;
      svg.appendChild(label);
      placed.push(chosen.box);
    });

    if (footnote && mumbaiCount > 0) {
      footnote.textContent = 'Plus ' + mumbaiCount + ' run' + (mumbaiCount > 1 ? 's' : '') + ' in Mumbai, India while traveling (not shown on map).';
    }
  }

  return { render: render };
})();

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('us-map-svg')) return;
  RunningCharts.loadData(function (records) {
    RunningMap.render(records);
  });
});
