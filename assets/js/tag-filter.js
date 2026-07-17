document.addEventListener('DOMContentLoaded', function () {
  var filterBar = document.getElementById('tag-filter');
  var postList = document.getElementById('post-list');

  if (!filterBar || !postList) {
    return;
  }

  var pills = filterBar.querySelectorAll('.tag-pill');
  var cards = postList.querySelectorAll('.post-card');

  filterBar.addEventListener('click', function (event) {
    var pill = event.target.closest('.tag-pill');
    if (!pill) {
      return;
    }

    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.remove('active');
    }
    pill.classList.add('active');

    var selectedTag = pill.getAttribute('data-tag');

    for (var j = 0; j < cards.length; j++) {
      var card = cards[j];
      if (selectedTag === 'all') {
        card.style.display = '';
        continue;
      }
      var tags = (card.getAttribute('data-tags') || '').split(',');
      card.style.display = tags.indexOf(selectedTag) !== -1 ? '' : 'none';
    }
  });
});
