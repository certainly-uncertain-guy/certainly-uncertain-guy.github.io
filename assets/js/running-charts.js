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

document.addEventListener('DOMContentLoaded', function () {
  if (!document.getElementById('stat-row')) return;
  RunningCharts.loadData(function (records) {
    RunningCharts.renderHeroStats(records);
  });
});
