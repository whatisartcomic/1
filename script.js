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

      // Initialize Turn.js with dynamic sizing
      const $firstImg = $fb.find('img').first();
      const initFlipbook = (w, h) => {
        $fb
          .css({ width: w + 'px' })
          .turn({
            width: w,
            display: 'single',
            autoCenter: false,
            gradients: true,
            acceleration: false,
            duration: 900
          });

        // Update haiku text on each turn
        $fb.off('turned').on('turned', function(e, page) {
          $('#haikuDisplay').text(page === 1 ? '' : data[page - 2]);
        });

        // Advance to a random comic on "?" click
        $('#nextBtn').off('click').on('click', function() {
          const totalPages = $fb.turn('pages');
          // Pages 2 through totalPages are comics
          const randomPage = Math.floor(Math.random() * (totalPages - 1)) + 2;
          $fb.turn('page', randomPage);
        });
      };

      // Wait for first image to load (or use cached dimensions)
      if ($firstImg[0].complete) {
        initFlipbook($firstImg[0].naturalWidth, $firstImg[0].naturalHeight);
      } else {
        $firstImg.on('load', function() {
          initFlipbook(this.naturalWidth, this.naturalHeight);
        });
      }
    })
    .catch(err => console.error('Failed to load haikus:', err));
});
