var RunningCharts = (function () {
  var cache = null;

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

  function loadData(callback) {
    if (cache) {
      callback(cache);
      return;
    }
    fetch('/assets/data/running.json')
      .then(function (res) { return res.json(); })
      .then(function (records) {
        records.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
        cache = records;
        callback(cache);
      });
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
    var marathon = records[records.length - 1];
    var tiles = [
      { value: formatDuration(marathon.moving_time_s), label: 'Finish time' },
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
    chartColors: chartColors,
    loadData: loadData,
    formatPace: formatPace,
    formatDuration: formatDuration,
    renderHeroStats: renderHeroStats
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

  function isoWeekStart(dateStr) {
    var d = new Date(dateStr + 'T00:00:00');
    var day = (d.getUTCDay() + 6) % 7; // Monday = 0
    d.setUTCDate(d.getUTCDate() - day);
    return d.toISOString().slice(0, 10);
  }

  var weeks = {};
  trainingRuns.forEach(function (r) {
    var wk = isoWeekStart(r.date);
    if (!weeks[wk]) weeks[wk] = { total: 0, longRun: 0 };
    weeks[wk].total += r.distance_km;
    if (r.title.indexOf('Long Run') !== -1) {
      weeks[wk].longRun = Math.max(weeks[wk].longRun, r.distance_km);
    }
  });

  var labels = Object.keys(weeks).sort();
  var totals = labels.map(function (wk) { return Math.round(weeks[wk].total * 10) / 10; });
  var longRuns = labels.map(function (wk) { return Math.round(weeks[wk].longRun * 10) / 10; });
  var colors = RunningCharts.chartColors();

  new Chart(canvas, {
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
  new Chart(canvas, {
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
};

RunningCharts.renderPaceTrendChart = function (records) {
  var canvas = document.getElementById('chart-pace-trend');
  if (!canvas) return;
  var agg = RunningCharts._monthlyAgg(records, 'avg_pace_s_per_km', 'avg', function (r) { return r.distance_km >= 3; });
  var colors = RunningCharts.chartColors();
  new Chart(canvas, {
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
};

RunningCharts.renderHrTrendChart = function (records) {
  var canvas = document.getElementById('chart-hr-trend');
  if (!canvas) return;
  var agg = RunningCharts._monthlyAgg(records, 'avg_hr', 'avg');
  var colors = RunningCharts.chartColors();
  new Chart(canvas, {
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
};

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('stat-row')) return;
  RunningCharts.loadData(function (records) {
    RunningCharts.renderHeroStats(records);
  });
});
