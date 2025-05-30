// script.js

function checkOrientation() {
  if (window.innerHeight > window.innerWidth) {
    Swal.fire({
      icon: 'info',
      title: 'Rotate Your Device',
      text: 'This site works best in landscape mode.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      backdrop: true,
      width: '60%',
      customClass: {
        popup: 'rotate-popup',
        title: 'rotate-title',
        content: 'rotate-content'
      }
    });
  } else {
    Swal.close();
  }
}

window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
checkOrientation();

$(document).ready(function() {
  // Ensure Turn.js is loaded
  if (typeof $.fn.turn !== 'function') {
    console.error('Turn.js not loaded:', $.fn.turn);
    return;
  }

  // Load haikus and build flipbook pages
  fetch('haikus.json')
    .then(res => res.json())
    .then(data => {
      const $fb = $('#flipbook').css('visibility', 'hidden').empty();

      // 1) Randomize page order
      const pagesOrder = data.map((_, i) => i);
      for (let i = pagesOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pagesOrder[i], pagesOrder[j]] = [pagesOrder[j], pagesOrder[i]];
      }

      // 2) Title page
      $fb.append(`
        <div class="page title">
          <h1>WHAT IS ART?</h1>
        </div>
      `);

      // 3) Comic pages
      pagesOrder.forEach(idx => {
        const imgNum = idx + 1;
        $fb.append(`
          <div class="page">
            <div class="comic-frame">
              <img src="images/webp/${imgNum}.webp" alt="Comic ${imgNum}">
            </div>
          </div>
        `);
      });

      // 4) Text wrapping utility
      function wrapText(node) {
        if (node.nodeType === Node.ELEMENT_NODE && node.dataset.fadeWrapped) return;
        if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.textContent)) {
          const parent = node.parentNode;
          const text = node.textContent;
          const frag = document.createDocumentFragment();

          if (parent.tagName === 'P') {
            text.split(/(\s+)/).forEach(tok => {
              if (!tok.trim()) frag.appendChild(document.createTextNode(tok));
              else {
                const span = document.createElement('span');
                span.textContent = tok;
                span.className = 'fade-in-word';
                span.style.setProperty('--delay', (Math.random() * 2).toFixed(2) + 's');
                span.style.setProperty('--rotate-start', '0deg');
                frag.appendChild(span);
              }
            });
          } else {
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

      // 5) Initial wrap of headings
      document.querySelectorAll('#flipbook h1, #flipbook h2, #flipbook h3').forEach(el => wrapText(el));

      // 6) Initialize Flipbook when first image loads
      const $firstImg = $fb.find('img').first();
      const initFlipbook = (w, h) => {
        // a) Size and show flipbook container
        $('#flipbook').css({ width: w + 'px', height: h + 'px', visibility: 'visible' });

        // b) Initialize Turn.js with no corner interactions
        $fb.turn({
          width:      w,
          height:     h,
          display:    'single',
          autoCenter: false,
          gradients:  true,
          acceleration:true,
          elevation:  200,
          duration:   4000,
          cornerSize: 0, // disable all corner drags and clicks
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

        // c) No refresh call needed; Turn.js v4 builds wrappers automatically

        // d) "?" button remains functional
        $('#nextBtn')
          .off('click')
          .on('click', () => {
            const total = $fb.turn('pages');
            const current = $fb.turn('page');
            let rand;
            do {
              rand = Math.floor(Math.random() * total) + 1;
            } while (rand === current);
            $fb.turn('page', rand);
          });
      };

      if ($firstImg[0].complete) {
        initFlipbook($firstImg[0].naturalWidth, this.naturalHeight || $firstImg[0].naturalHeight);
      } else {
        $firstImg.on('load', function() {
          initFlipbook(this.naturalWidth, this.naturalHeight);
        });
      }
    })
    .catch(err => console.error('Failed to load haikus:', err));
});
