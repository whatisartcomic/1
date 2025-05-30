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
      const $fb = $('#flipbook').empty();

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
        const num = idx + 1;
        $fb.append(`
          <div class="page">
            <div class="comic-frame">
              <img src="images/webp/${num}.webp" alt="Comic ${num}">
            </div>
          </div>
        `);
      });

      // 4) wrapText utility (letters for headings, words for paragraphs)
      function wrapText(node) {
        if (node.nodeType === Node.ELEMENT_NODE && node.dataset.fadeWrapped) return;

        if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.textContent)) {
          const parent = node.parentNode;
          const text = node.textContent;
          const frag = document.createDocumentFragment();

          // Word-level for <p>
          if (parent.tagName === 'P') {
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
          }
          // Letter-level for anything else (headings, etc.)
          else {
            for (const char of text) {
              if (char === ' ') {
                frag.appendChild(document.createTextNode(' '));
              } else {
                const span = document.createElement('span');
                span.textContent = char;
                span.className = 'fade-in-letter';
                span.style.setProperty('--delay', (Math.random() * 2).toFixed(2) + 's');
                span.style.setProperty('--rotate-start',
                  (Math.random() * 40 - 20).toFixed(0) + 'deg'
                );
                frag.appendChild(span);
              }
            }
          }

          parent.replaceChild(frag, node);
          parent.dataset.fadeWrapped = 'true';
        }
        else if (node.nodeType === Node.ELEMENT_NODE) {
          node.childNodes.forEach(wrapText);
        }
      }

      // 5) Initial wrap of any static text on the page
      document.querySelectorAll('body *').forEach(el => wrapText(el));

      // 6) Initialize Flipbook once first image is ready
      const $firstImg = $fb.find('img').first();
      const initFlipbook = (w, h) => {
        // a) Reveal the container
        const fbEl = document.getElementById('flipbook');
        fbEl.style.visibility = 'visible';  // or fbEl.classList.remove('preload');

        // b) Make sure the title heading inside #flipbook is already wrapped
        document.querySelectorAll('#flipbook h1, #flipbook h2, #flipbook h3, #flipbook h4, #flipbook h5, #flipbook h6')
          .forEach(el => {
            delete el.dataset.fadeWrapped;
            wrapText(el);
          });

        // c) Turn.js
        $fb.css({ width: w + 'px', height: h + 'px' }).turn({
          width: w,
          height: h,
          display: 'single',
          autoCenter: false,
          gradients: true,
          acceleration: true,
          elevation: 100,
          duration: 1800,
          cornerSize: 100
        });

       
        // d) On page turn, inject & wrap the haiku text
        $fb.off('turned').on('turned', function(e, page) {
          const p = document.getElementById('haikuDisplay');
          if (page === 1) {
            p.textContent = '';
          } else {
            const dataIdx = pagesOrder[page - 2];
            p.textContent = data[dataIdx];
            delete p.dataset.fadeWrapped;
            wrapText(p);
          }
        });

        // e) “?” button for random jump
        $('#nextBtn').off('click').on('click', () => {
          const total = $fb.turn('pages');
          const randomPage = Math.floor(Math.random() * (total - 1)) + 2;
          $fb.turn('page', randomPage);
        });
      };

      // Wait for the first image to load its dimensions
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
