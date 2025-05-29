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

      // Initialize Turn.js dynamically sizing
      const $firstImg = $fb.find('img').first();
      const initFlipbook = (w, h) => {
        $fb
          .css({ width: w + 'px', height: h + 200 +  'px' })
          .turn({
            width: w,
            height: h,
            display: 'single',
            autoCenter: false,
            gradients: true,
            acceleration: false,
            duration: 900
          });

        // Bind turn events
        $fb.off('turned').on('turned', function(e, page) {
          $('#haikuDisplay').text(page === 1 ? '' : data[page - 2]);
        });
        // Advance on "?" click
        $('#nextBtn').off('click').on('click', function() {
          $fb.turn('next');
        });
      };

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
