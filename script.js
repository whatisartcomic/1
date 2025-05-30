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

  // Fetch haikus and build flipbook pages
  fetch('haikus.json')
    .then(res => res.json())
    .then(data => {
      const $fb = $('#flipbook').css('visibility', 'hidden').empty();

      // Randomize page order
      const pagesOrder = data.map((_, i) => i);
      for (let i = pagesOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pagesOrder[i], pagesOrder[j]] = [pagesOrder[j], pagesOrder[i]];
      }

      // Title page
      $fb.append(`<div class="page title"><h1>WHAT IS ART?</h1></div>`);

      // Comic pages
      pagesOrder.forEach(idx => {
        const imgNum = idx + 1;
        $fb.append(
          `<div class="page"><div class="comic-frame"><img src="images/webp/${imgNum}.webp" alt="Comic ${imgNum}"></div></div>`
        );
      });

      // Text wrapping utility
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
                span.className = 'fade-in-word';
                span.textContent = tok;
                span.style.setProperty('--delay', (Math.random() * 2).toFixed(2) + 's');
                span.style.setProperty('--rotate-start', '0deg');
                frag.appendChild(span);
              }
            });
          } else {
            for (const char of text) {
              if (char === ' ') frag.appendChild(document.createTextNode(' '));
              else {
                const span = document.createElement('span');
                span.className = 'fade-in-letter';
                span.textContent = char;
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

      // Initial wrap of headings
      document.querySelectorAll('#flipbook h1, #flipbook h2, #flipbook h3').forEach(wrapText);

      // Initialize flipbook when first image loads
      const $firstImg = $fb.find('img').first();
      const initFlipbook = (w, h) => {
        $('#flipbook').css({ width: w + 'px', height: h + 'px', visibility: 'visible' });

        // Initialize Turn.js
        $fb.turn({
          width:        w,
          height:       h,
          display:      'single',
          autoCenter:   false,
          gradients:    true,
          acceleration: true,
          elevation:    200,
          duration:     4000,
          cornerSize:   50,  // create wrappers but will remove interactions
          when: {
            // Block any corner drag/tap
            start: function(e, pageObject, corner) {
              if (corner) e.preventDefault();
            },
            // Haiku display update
            turned: function(e, page) {
              const p = document.getElementById('haikuDisplay');
              if (page === 1) p.textContent = '';
              else {
                const dataIdx = pagesOrder[page - 2];
                p.textContent = data[dataIdx];
                delete p.dataset.fadeWrapped;
                wrapText(p);
              }
            }
          }
        });

        // Remove corner elements entirely
        $fb.find('.corner').remove();

        // Only the button can turn pages
        $('#nextBtn')
          .off('click')
          .on('click', () => {
            const total   = $fb.turn('pages');
            const current = $fb.turn('page');
            let rand;
            do { rand = Math.floor(Math.random() * total) + 1; } while (rand === current);
            $fb.turn('page', rand);
          });
      };

      if ($firstImg[0].complete) initFlipbook($firstImg[0].naturalWidth, $firstImg[0].naturalHeight);
      else $firstImg.on('load', function() { initFlipbook(this.naturalWidth, this.naturalHeight); });

    })
    .catch(err => console.error('Failed to load haikus:', err));
});
