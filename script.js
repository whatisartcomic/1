$(document).ready(function() {
  if (typeof $.fn.turn !== 'function') {
    console.error('Turn.js not loaded:', $.fn.turn);
    return;
  }

  fetch('haikus.json')
    .then(res => res.json())
    .then(data => {
      const $fb = $('#flipbook').empty();

      // Title page
      $fb.append(`
        <div class="page title">
          <h1>WHAT IS ART?</h1>
        </div>
      `);

      // Comic pages (no internal haiku)
      data.forEach((_, i) => {
        const num = i + 1;
        $fb.append(`
          <div class="page">
            <div class="comic-frame">
              <img src="images/webp/${num}.webp" alt="Comic ${num}">
            </div>
          </div>
        `);
      });

      // Initialize Turn.js
      //const w = $fb.width();
      //const h = $fb.height();
      const w = 800;
      const h = 600;
      $fb.turn({
        width: w,
        height: h,
        display: 'single',
        autoCenter: false,
        gradients: true,
        acceleration: false,
        duration: 600
      });

      // On each turn, update/clear haiku
      $fb.bind('turned', function(e, page) {
        if (page === 1) {
          $('#haikuDisplay').text('');
        } else {
          $('#haikuDisplay').text(data[page - 2]);
        }
      });

      // Advance on “?” click
      $('#nextBtn').off('click').on('click', () => {
        $fb.turn('next');
      });
    })
    .catch(err => console.error('Failed to load haikus:', err));
});
