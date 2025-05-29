


$(document).ready(function() {
  document.documentElement.classList.add('ready');
  if (typeof $.fn.turn !== 'function') {
    console.error('Turn.js not loaded:', $.fn.turn);
    return;
  }

  fetch('haikus.json')
    .then(res => res.json())
    .then(data => {
      const $fb = $('#flipbook').empty();

      // Generate a random order for the comic pages
      const pagesOrder = data.map((_, i) => i);
      // Fisher-Yates shuffle
      for (let i = pagesOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pagesOrder[i], pagesOrder[j]] = [pagesOrder[j], pagesOrder[i]];
      }

      // Title page
      $fb.append(
        `<div class="page title">
           <h1>WHAT IS ART?</h1>
         </div>`
      );

      // Comic pages in randomized order (haikus match their image index)
      pagesOrder.forEach(idx => {
        const num = idx + 1;
        $fb.append(
          `<div class="page">
             <div class="comic-frame">
               <img src="images/webp/${num}.webp" alt="Comic ${num}">
             </div>
           </div>`
        );
      });

      // Initialize Turn.js with dynamic sizing
      const $firstImg = $fb.find('img').first();
      const initFlipbook = (w, h) => {
        $fb.css({ width: w + 'px', height: h + 'px' }).turn({
          width: w,
          height: h,
          display: 'single',
          autoCenter: false,
          gradients: true,
          acceleration: true,
          elevation:50,
          duration: 1800,
          cornerSize: 100
        });

        // Update haiku text on each turn, using the randomized order
        $fb.off('turned').on('turned', function(e, page) {
          if (page === 1) {
            $('#haikuDisplay').text('');
          } else {
            const dataIdx = pagesOrder[page - 2];
            $('#haikuDisplay').text(data[dataIdx]);
          }
        });



 // 1. Function to wrap **just the text nodes** under a given element
    function wrapText(node) {
      // Skip if already processed

      if (node.nodeType === Node.ELEMENT_NODE && node.id === 'haikuDisplay') return;
      if (node.nodeType === Node.ELEMENT_NODE && node.dataset.fadeWrapped) return;
      // Only process text nodes with real content
      if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.textContent)) {
        const parent = node.parentNode;
        const text = node.textContent;
        const frag = document.createDocumentFragment();

        for (const char of text) {
          if (char === ' ') {
            frag.appendChild(document.createTextNode(' '));
            continue;
          }
          const span = document.createElement('span');
          span.textContent = char;
          span.className = 'fade-in-letter';
          // random delay 0–2s
          span.style.setProperty('--delay', (Math.random()*2).toFixed(2) + 's');
          // random rotation –20° to +20°
          span.style.setProperty('--rotate-start', (Math.random()*40 - 20).toFixed(0) + 'deg');
          frag.appendChild(span);
        }
        parent.replaceChild(frag, node);
        parent.dataset.fadeWrapped = 'true';
      }
      // If element node, recurse into children
      else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const child of Array.from(node.childNodes)) {
          wrapText(child);
        }
      }
    }

    // 2. Initial pass on existing content
    document.querySelectorAll('body *').forEach(el => wrapText(el));

  




        
        // Random comic on "?" button click
        $('#nextBtn').off('click').on('click', function() {
          const totalPages = $fb.turn('pages');
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
