function checkOrientation() {
  if (window.innerHeight > window.innerWidth) {
    Swal.fire({
      icon: 'info',
      title: 'Rotate Your Device',
      text: 'This site works best in landscape mode.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      backdrop: true
    });
  } else {
    Swal.close();
  }
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
checkOrientation();

$(document).ready(function() {
  // 0) Ensure Turn.js is loaded
  if (typeof $.fn.turn !== 'function') {
    console.error('Turn.js not loaded:', $.fn.turn);
    return;
  }

  // Fetch haikus and set up the flipbook
  fetch('haikus.json')
    .then(res => res.json())
    .then(data => {
      const $fb = $('#flipbook').css('visibility','hidden');

      // Mutable order of pages (indices into data[])
      let pagesOrder = data.map((_, i) => i);

      // Utility: Fisher–Yates shuffle
      function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }

      // Initial randomization of page order
      shuffle(pagesOrder);

      // Utility: wrapText (letters for headings, words for paragraphs)
      function wrapText(node) {
        if (node.nodeType === Node.ELEMENT_NODE && node.dataset.fadeWrapped) return;

        if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.textContent)) {
          const parent = node.parentNode;
          const text = node.textContent;
          const frag = document.createDocumentFragment();

          if (parent.tagName === 'P') {
            // word-level wrap
            text.split(/(\s+)/).forEach(tok => {
              if (!tok.trim()) {
                frag.appendChild(document.createTextNode(tok));
              } else {
                const span = document.createElement('span');
                span.textContent = tok;
                span.className = 'fade-in-word';
                span.style.setProperty('--delay', (Math.random() * 2).toFixed(2) + 's');
                span.style.setProperty('--rotate-start', '0deg');
                frag.appendChild(span);
              }
            });
          } else {
            // letter-level wrap
            for (const char of text) {
              if (char === ' ') {
                frag.appendChild(document.createTextNode(' '));
              } else {
                const span = document.createElement('span');
                span.textContent = char;
                span.className = 'fade-in-letter';
                span.style.setProperty('--delay', (Math.random() * 2).toFixed(2) + 's');
                span.style.setProperty('--rotate-start', (Math.random() * 40 - 20).toFixed(0) + 'deg');
                frag.appendChild(span);
              }
            }
          }

          parent.replaceChild(frag, node);
          parent.dataset.fadeWrapped = 'true';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.childNodes.forEach(wrapText);
        }
      }

      // Wrap static headings in title page
      document.querySelectorAll('#flipbook h1, #flipbook h2, #flipbook h3').forEach(el => {
        wrapText(el);
      });

      let flipW, flipH;
      let rebuilding = false;

      // Build the flipbook markup based on current pagesOrder
      function buildMarkup() {
        $fb.empty();
        // Title page
        $fb.append(`
          <div class="page title">
            <h1>WHAT IS ART?</h1>
          </div>
        `);
        // Comic pages
        pagesOrder.forEach(idx => {
          const num = idx + 1;
          $fb.append(`
            <div class="page">
              <div class="comic-frame">
                <img src="images/webp/${num}.webp" alt="Comic ${num}">
              </div>
            </div>
          `);
        });
      }

      // Initialize the turn.js flipbook
      function initFlipbook(w, h) {
        flipW = w;
        flipH = h;
        buildMarkup();

        $fb.css({ width: w + 'px', height: h + 'px' }).turn({
          width: w,
          height: h,
          display: 'single',
          autoCenter: false,
          gradients: true,
          acceleration: true,
          elevation: 100,
          duration: 1800,
          cornerSize: 100,
          when: {
            turned: function(e, page) {
              const p = document.getElementById('haikuDisplay');
              if (page === 1) {
                p.textContent = '';
              } else {
                const dataIdx = pagesOrder[page - 2];
                p.textContent = data[dataIdx];
                delete p.dataset.fadeWrapped;
                wrapText(p);
              }
            }
          }
        });

        // Show flipbook after init
        $fb.css('visibility', 'visible');
      }

      // Wait for first image to load then initialize
      const $firstImg = $fb.find('img').first();
      if ($firstImg[0].complete) {
        initFlipbook($firstImg[0].naturalWidth, $firstImg[0].naturalHeight);
      } else {
        $firstImg.on('load', function() {
          initFlipbook(this.naturalWidth, this.naturalHeight);
        });
      }

      // Rebuild & reshuffle on every page turn
      $(document).on('turned', '#flipbook', function(e, page) {
        if (rebuilding) return;
        rebuilding = true;

        setTimeout(() => {
          // 1) get the current data index
          const currentDataIdx = (page === 1 ? null : pagesOrder[page - 2]);

          // 2) reshuffle the order
          pagesOrder = data.map((_, i) => i);
          shuffle(pagesOrder);

          // 3) destroy old flipbook
          $fb.turn('destroy');

          // 4) rebuild & reinit
          initFlipbook(flipW, flipH);

          // 5) jump to same content at its new position
          let newPage = 1;
          if (currentDataIdx !== null) {
            newPage = pagesOrder.indexOf(currentDataIdx) + 2;
          }
          $fb.turn('page', newPage);

          rebuilding = false;
        }, 0);
      });

      // Next button: random single jump (optional)
      $('#nextBtn').off('click').on('click', () => {
        const total = $fb.turn('pages');
        const randomPage = Math.floor(Math.random() * (total - 1)) + 2;
        $fb.turn('page', randomPage);
      });
    })
    .catch(err => console.error('Failed to load haikus:', err));
});
