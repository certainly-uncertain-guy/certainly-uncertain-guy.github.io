var RunningCharts = (function () {
  var cache = null;
  // Callbacks queued while a fetch is already in flight. `null` means no fetch
  // is currently running. Without this, the three near-simultaneous callers on
  // page load (hero stats, the map, the post's inline chart init) would each
  // see `cache === null` and fire their own duplicate request.
  var pendingCallbacks = null;

  // Race day. Used to pick the marathon record explicitly rather than assuming
  // it is the chronologically last row, so a later logged run does not silently
  // get relabelled as "the marathon".
  var MARATHON_DATE = '2026-07-26';

  // Live Chart.js instances, keyed by canvas element id, together with enough
  // context to rebuild them when the theme changes.
  var registry = {};

  function chartColors() {
    var styles = getComputedStyle(document.documentElement);
    return {
      series1: styles.getPropertyValue('--chart-series-1').trim(),
      series2: styles.getPropertyValue('--chart-series-2').trim(),
      text: styles.getPropertyValue('--text-color').trim(),
      mutedText: styles.getPropertyValue('--light-text').trim(),
      grid: styles.getPropertyValue('--border-color').trim(),
      surface: styles.getPropertyValue('--light-background').trim()
    };
  }

  // Each render* function calls this immediately before `new Chart(...)` so a
  // re-render tears down the previous instance (Chart.js 4 refuses to reuse a
  // canvas that still has a live chart attached).
  function destroyChart(id) {
    if (registry[id]) {
      registry[id].chart.destroy();
      delete registry[id];
    }
  }

  function registerChart(id, chart, renderFn, records) {
    registry[id] = { chart: chart, render: renderFn, records: records };
  }

  // Colors are read from CSS custom properties at construction time and baked
  // into the Chart.js instance, so a theme flip needs a rebuild. Re-invoking
  // each render function re-reads chartColors() and re-registers the instance.
  function rerenderForTheme() {
    var entries = Object.keys(registry).map(function (id) { return registry[id]; });
    entries.forEach(function (entry) {
      try {
        entry.render(entry.records);
      } catch (err) {
        console.error('Failed to re-render chart for theme change:', err);
      }
    });
  }

  // Watch `data-theme` on <html> instead of listening for clicks on
  // #theme-toggle: the toggle's own handler (in _layouts/default.html) is
  // registered after this file's DOMContentLoaded handler, so a click listener
  // here would fire *before* the attribute flips and read stale colors. The
  // observer fires after the attribute has actually changed, and also covers
  // any other code path that changes the theme.
  function watchTheme() {
    if (typeof MutationObserver === 'undefined') return;
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'data-theme') {
          rerenderForTheme();
          return;
        }
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  function loadData(callback) {
    if (cache) {
      callback(cache);
      return;
    }
    if (pendingCallbacks) {
      pendingCallbacks.push(callback);
      return;
    }
    pendingCallbacks = [callback];
    fetch('/assets/data/running.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' fetching running.json');
        return res.json();
      })
      .then(function (records) {
        records.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
        cache = records;
        var queued = pendingCallbacks;
        pendingCallbacks = null;
        queued.forEach(function (cb) {
          // Isolate callbacks: one failing renderer must not starve the others.
          try {
            cb(cache);
          } catch (err) {
            console.error('Running data consumer failed:', err);
          }
        });
      })
      .catch(function (err) {
        pendingCallbacks = null;
        console.error('Could not load running data:', err);
      });
  }

  // Returns the marathon record, matched by date. Falls back to the longest run
  // in the dataset, then to the last record — both defensive, neither should
  // normally trigger.
  function findMarathon(records) {
    if (!records || records.length === 0) return null;
    for (var i = 0; i < records.length; i++) {
      if (records[i].date === MARATHON_DATE) return records[i];
    }
    var longest = null;
    records.forEach(function (r) {
      if (r.distance_km == null) return;
      if (!longest || r.distance_km > longest.distance_km) longest = r;
    });
    return longest || records[records.length - 1];
  }

  function formatPace(secondsPerKm) {
    if (secondsPerKm == null) return '--';
    var m = Math.floor(secondsPerKm / 60);
    var s = Math.round(secondsPerKm % 60);
    return m + ':' + (s < 10 ? '0' : '') + s + '/km';
  }

  function formatDuration(seconds) {
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.round(seconds % 60);
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return h + ':' + pad(m) + ':' + pad(s);
  }

  function renderHeroStats(records) {
    var container = document.getElementById('stat-row');
    if (!container) return;
    var marathon = findMarathon(records);
    if (!marathon) return;
    // `time_s` is the official finish time; `moving_time_s` excludes auto-pauses
    // and would disagree with the average pace shown in the next tile.
    var finish = marathon.time_s != null ? marathon.time_s : marathon.moving_time_s;
    var tiles = [
      { value: formatDuration(finish), label: 'Finish time' },
      { value: marathon.distance_km.toFixed(2) + ' km', label: 'Distance' },
      { value: formatPace(marathon.avg_pace_s_per_km), label: 'Avg pace' },
      { value: marathon.avg_hr + ' bpm', label: 'Avg heart rate' },
      { value: marathon.avg_cadence + ' spm', label: 'Avg cadence' }
    ];
    container.innerHTML = tiles.map(function (t) {
      return '<div class="stat-tile"><span class="stat-tile-value">' + t.value +
        '</span><span class="stat-tile-label">' + t.label + '</span></div>';
    }).join('');
  }

  return {
    MARATHON_DATE: MARATHON_DATE,
    chartColors: chartColors,
    loadData: loadData,
    findMarathon: findMarathon,
    formatPace: formatPace,
    formatDuration: formatDuration,
    renderHeroStats: renderHeroStats,
    _destroyChart: destroyChart,
    _registerChart: registerChart,
    _rerenderForTheme: rerenderForTheme,
    _watchTheme: watchTheme
  };
})();

RunningCharts.renderBuildupChart = function (records) {
  var canvas = document.getElementById('chart-buildup');
  if (!canvas) return;

  var trainingRuns = records.filter(function (r) {
    var parts = r.title.split(' - ');
    return parts.length > 1 && /^R[A-Z0-9]/.test(parts[1]);
  });
  if (trainingRuns.length === 0) return;

  // Gap detection below assumes ascending date order. `loadData` already
  // sorts `records` ascending, but sort defensively here too so this
  // function is correct regardless of how the caller ordered its input.
  trainingRuns.sort(function (a, b) { return a.date < b.date ? -1 : 1; });

  // The runner has trained for prior race cycles too, so the regex above can
  // sweep in unrelated earlier blocks. Within-cycle gaps (missed days/weeks)
  // stay well under a month; a gap of a month or more marks a break between
  // cycles. Keep only the continuous block that starts right after the LAST
  // such break (i.e. the current build-up through the marathon) — not just
  // the single largest gap, since an isolated stray run from an even older
  // cycle can otherwise create the largest gap without separating the most
  // recent unrelated cycle from the real one.
  var CYCLE_BREAK_DAYS = 30;
  if (trainingRuns.length > 1) {
    var cutIndex = 0;
    for (var i = 1; i < trainingRuns.length; i++) {
      var gapDays = (new Date(trainingRuns[i].date) - new Date(trainingRuns[i - 1].date)) / 86400000;
      if (gapDays >= CYCLE_BREAK_DAYS) {
        cutIndex = i;
      }
    }
    trainingRuns = trainingRuns.slice(cutIndex);
  }

  // Race day itself is titled "San Francisco Running" — no " - " separator and
  // no training code — so the filter above drops it. The post's caption says
  // the chart runs "through race day", so append the marathon explicitly.
  // This happens *after* the gap slice so the appended record cannot be cut
  // away, and so it cannot influence the cycle-break detection.
  var marathon = RunningCharts.findMarathon(records);
  if (marathon && trainingRuns.indexOf(marathon) === -1) {
    trainingRuns.push(marathon);
  }

  function isoWeekStart(dateStr) {
    // Parse as UTC ('Z') so it agrees with the getUTC*/setUTC*/toISOString
    // calls below; without it, readers east of UTC bucket into the wrong week.
    var d = new Date(dateStr + 'T00:00:00Z');
    var day = (d.getUTCDay() + 6) % 7; // Monday = 0
    d.setUTCDate(d.getUTCDate() - day);
    return d.toISOString().slice(0, 10);
  }

  var weeks = {};
  trainingRuns.forEach(function (r) {
    var wk = isoWeekStart(r.date);
    // `longRun` starts as null, not 0: weeks with no long run must plot as a
    // gap (bridged via spanGaps), not as a real 0 km data point.
    if (!weeks[wk]) weeks[wk] = { total: 0, longRun: null };
    weeks[wk].total += r.distance_km || 0;
    // The marathon is by definition the long run of race week, even though its
    // title does not say so.
    var isLongRun = r.title.indexOf('Long Run') !== -1 || r === marathon;
    if (isLongRun && r.distance_km != null) {
      weeks[wk].longRun = weeks[wk].longRun == null
        ? r.distance_km
        : Math.max(weeks[wk].longRun, r.distance_km);
    }
  });

  var labels = Object.keys(weeks).sort();
  var totals = labels.map(function (wk) { return Math.round(weeks[wk].total * 10) / 10; });
  var longRuns = labels.map(function (wk) {
    var v = weeks[wk].longRun;
    return v == null ? null : Math.round(v * 10) / 10;
  });
  var colors = RunningCharts.chartColors();

  RunningCharts._destroyChart('chart-buildup');
  var chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Weekly mileage (km)',
          data: totals,
          backgroundColor: colors.series1,
          borderRadius: 4,
          order: 2
        },
        {
          type: 'line',
          label: 'Long run distance (km)',
          data: longRuns,
          borderColor: colors.series2,
          backgroundColor: colors.series2,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0,
          // Bridge weeks with no long run instead of breaking the line there.
          spanGaps: true,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { ticks: { color: colors.mutedText, maxRotation: 0, autoSkip: true }, grid: { display: false } },
        y: { ticks: { color: colors.mutedText }, grid: { color: colors.grid }, title: { display: true, text: 'km', color: colors.mutedText } }
      },
      plugins: {
        legend: { display: true, labels: { color: colors.mutedText } },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });
  RunningCharts._registerChart('chart-buildup', chart, RunningCharts.renderBuildupChart, records);
};

RunningCharts._monthlyAgg = function (records, valueKey, aggType, filterFn) {
  var months = {};
  records.forEach(function (r) {
    if (filterFn && !filterFn(r)) return;
    var v = r[valueKey];
    if (v == null) return;
    var mk = r.date.slice(0, 7); // YYYY-MM
    if (!months[mk]) months[mk] = { sum: 0, count: 0 };
    months[mk].sum += v;
    months[mk].count += 1;
  });
  var labels = Object.keys(months).sort();
  var values = labels.map(function (mk) {
    var m = months[mk];
    return aggType === 'sum' ? m.sum : m.sum / m.count;
  });
  return { labels: labels, values: values };
};

RunningCharts.renderMonthlyMileageChart = function (records) {
  var canvas = document.getElementById('chart-monthly-mileage');
  if (!canvas) return;
  var agg = RunningCharts._monthlyAgg(records, 'distance_km', 'sum');
  var colors = RunningCharts.chartColors();
  RunningCharts._destroyChart('chart-monthly-mileage');
  var chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: agg.labels,
      datasets: [{
        label: 'Monthly distance (km)',
        data: agg.values.map(function (v) { return Math.round(v); }),
        backgroundColor: colors.series1,
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: colors.mutedText, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }, grid: { display: false } },
        y: { ticks: { color: colors.mutedText }, grid: { color: colors.grid } }
      },
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
    }
  });
  RunningCharts._registerChart('chart-monthly-mileage', chart, RunningCharts.renderMonthlyMileageChart, records);
};

RunningCharts.renderPaceTrendChart = function (records) {
  var canvas = document.getElementById('chart-pace-trend');
  if (!canvas) return;
  var agg = RunningCharts._monthlyAgg(records, 'avg_pace_s_per_km', 'avg', function (r) { return r.distance_km >= 3; });
  var colors = RunningCharts.chartColors();
  RunningCharts._destroyChart('chart-pace-trend');
  var chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: agg.labels,
      datasets: [{
        label: 'Avg pace (s/km, lower = faster)',
        data: agg.values.map(function (v) { return Math.round(v); }),
        borderColor: colors.series1,
        backgroundColor: colors.series1,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.15
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { ticks: { color: colors.mutedText, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }, grid: { display: false } },
        y: {
          reverse: true,
          ticks: {
            color: colors.mutedText,
            callback: function (v) { return RunningCharts.formatPace(v); }
          },
          grid: { color: colors.grid }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: { label: function (ctx) { return RunningCharts.formatPace(ctx.parsed.y); } }
        }
      }
    }
  });
  RunningCharts._registerChart('chart-pace-trend', chart, RunningCharts.renderPaceTrendChart, records);
};

RunningCharts.renderHrTrendChart = function (records) {
  var canvas = document.getElementById('chart-hr-trend');
  if (!canvas) return;
  var agg = RunningCharts._monthlyAgg(records, 'avg_hr', 'avg');
  var colors = RunningCharts.chartColors();
  RunningCharts._destroyChart('chart-hr-trend');
  var chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: agg.labels,
      datasets: [{
        label: 'Avg heart rate (bpm)',
        data: agg.values.map(function (v) { return Math.round(v); }),
        borderColor: colors.series1,
        backgroundColor: colors.series1,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.15
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { ticks: { color: colors.mutedText, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }, grid: { display: false } },
        y: { ticks: { color: colors.mutedText }, grid: { color: colors.grid } }
      },
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
    }
  });
  RunningCharts._registerChart('chart-hr-trend', chart, RunningCharts.renderHrTrendChart, records);
};

RunningCharts.renderCadenceTrendChart = function (records) {
  var canvas = document.getElementById('chart-cadence-trend');
  if (!canvas) return;
  var agg = RunningCharts._monthlyAgg(records, 'avg_cadence', 'avg');
  var colors = RunningCharts.chartColors();
  RunningCharts._destroyChart('chart-cadence-trend');
  var chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: agg.labels,
      datasets: [{
        label: 'Avg cadence (spm)',
        data: agg.values.map(function (v) { return Math.round(v); }),
        borderColor: colors.series1,
        backgroundColor: colors.series1,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        tension: 0.15
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { ticks: { color: colors.mutedText, maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }, grid: { display: false } },
        y: { ticks: { color: colors.mutedText }, grid: { color: colors.grid } }
      },
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
    }
  });
  RunningCharts._registerChart('chart-cadence-trend', chart, RunningCharts.renderCadenceTrendChart, records);
};

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('stat-row')) return;
  RunningCharts._watchTheme();
  RunningCharts.loadData(function (records) {
    RunningCharts.renderHeroStats(records);
  });
});
