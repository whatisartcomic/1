

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
       document.addEventListener("DOMContentLoaded", () => {
      // Select all text-bearing elements you want to animate
      const selectors = "h1, h2, h3, p, li, blockquote, span";
      document.querySelectorAll(selectors).forEach(el => {
        const text = el.textContent;
        el.textContent = ""; 
        // Wrap every character
        Array.from(text).forEach(char => {
          if (char === " ") {
            el.appendChild(document.createTextNode(" "));
            return;
          }
          const span = document.createElement("span");
          span.textContent = char;
          span.classList.add("fade-in-letter");
          // random delay between 0 and 2s
          const delay = (Math.random() * 2).toFixed(2) + "s";
          // random start rotation between -20° and +20°
          const rotate = (Math.random() * 40 - 20).toFixed(0) + "deg";
          span.style.setProperty("--delay", delay);
          span.style.setProperty("--rotate-start", rotate);
          el.appendChild(span);
        });
      });
    });     
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
