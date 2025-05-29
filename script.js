$(document).ready(function() {
  if (typeof $.fn.turn !== 'function') {
    console.error('Turn.js did not load. $.fn.turn is', $.fn.turn);
    return;
  }

  fetch('haikus.json')
    .then(res => res.json())
    .then(data => {
      const $fb = $('#flipbook').empty();

      // 1. Title page
      $fb.append(`
        <div class="page title">
          <h1>WHAT IS ART?</h1>
        </div>
      `);

      // 2. One page per comic+haiku
      data.forEach((haiku, i) => {
        const num = i + 1;
        $fb.append(`
          <div class="page">
            <div class="comic-frame">
              <img src="images/${num}.png" alt="Comic ${num}">
            </div>
            <pre class="haiku">${haiku}</pre>
          </div>
        `);
      });

      // 3. Initialize Turn.js for a single full-width page
      const containerWidth = $('#flipbook').width();
      const containerHeight = $('#flipbook').height();

      $fb.turn({
        width: containerWidth,
        height: containerHeight,
        autoCenter: true,
        display: 'single',
        gradients: true,
        acceleration: true,
        duration: 600
      });

      // 4. Advance on “?” click
      $('#nextBtn').off('click').on('click', () => {
        $fb.turn('next');
      });
    })
    .catch(err => console.error('Failed to fetch haikus.json:', err));
});
