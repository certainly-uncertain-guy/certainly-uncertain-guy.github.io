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

    Object.keys(byCity).forEach(function (city) {
      var info = byCity[city];
      var pos = project(info.lat, info.lng);
      var r = 4 + 22 * Math.sqrt(info.distance / maxDistance);
      var circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', pos[0]);
      circle.setAttribute('cy', pos[1]);
      circle.setAttribute('r', r.toFixed(1));
      circle.setAttribute('class', 'us-map-bubble');
      var title = document.createElementNS(ns, 'title');
      title.textContent = city + ': ' + Math.round(info.distance) + ' km across ' + info.count + ' runs';
      circle.appendChild(title);
      svg.appendChild(circle);

      if (r >= LABEL_MIN_R) {
        var label = document.createElementNS(ns, 'text');
        label.setAttribute('x', pos[0]);
        label.setAttribute('y', pos[1] - r - 4);
        label.setAttribute('class', 'us-map-label');
        label.setAttribute('text-anchor', 'middle');
        label.textContent = city;
        svg.appendChild(label);
      }
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
