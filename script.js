


$(document).ready(function() {
 
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
  const p = document.getElementById('haikuDisplay');
  if (page === 1) {
    p.textContent = '';
  } else {
    const dataIdx = pagesOrder[page - 2];
    p.textContent = data[dataIdx];
    // Allow re‐wrapping by clearing the flag:
    delete p.dataset.fadeWrapped;
    // Now wrap the newly inserted text
    wrapText(p);
  }
});




 // 1. Function to wrap **just the text nodes** under a given element
    function wrapText(node) {
  // don’t re‐wrap the same parent
  if (node.nodeType === Node.ELEMENT_NODE && node.dataset.fadeWrapped) return;

  // only wrap real text
  if (node.nodeType === Node.TEXT_NODE && /\S/.test(node.textContent)) {
    const parent = node.parentNode;
    const text = node.textContent;
    const frag = document.createDocumentFragment();

    // if parent is a paragraph -> wrap words
    if (parent.tagName === 'P') {
      // split on whitespace but keep it
      const tokens = text.split(/(\s+)/);
      tokens.forEach(tok => {
        if (!tok.trim()) {
          frag.appendChild(document.createTextNode(tok));
        } else {
          const span = document.createElement('span');
          span.textContent = tok;
          span.className = 'fade-in-word';
          span.style.setProperty('--delay', (Math.random()*2).toFixed(2) + 's');
          span.style.setProperty('--rotate-start', '0deg');
          frag.appendChild(span);
        }
      });
    }
    // otherwise (e.g. H1–H6, or any other tag) -> wrap letters
    else {
      for (const char of text) {
        if (char === ' ') {
          frag.appendChild(document.createTextNode(' '));
        } else {
          const span = document.createElement('span');
          span.textContent = char;
          span.className = 'fade-in-letter';
          span.style.setProperty('--delay', (Math.random()*2).toFixed(2) + 's');
          span.style.setProperty('--rotate-start', (Math.random()*40 - 20).toFixed(0) + 'deg');
          frag.appendChild(span);
        }
      }
    }

    parent.replaceChild(frag, node);
    parent.dataset.fadeWrapped = 'true';
  }
  // recurse into element nodes
  else if (node.nodeType === Node.ELEMENT_NODE) {
    node.childNodes.forEach(wrapText);
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
