$(document).ready(function() {
  if (typeof $.fn.turn !== 'function') {
    console.error('Turn.js did not load. $.fn.turn is', $.fn.turn);
    return;
  }

  fetch('haikus.json')
    .then(res => res.json())
    .then(data => {
      const $fb = $('#flipbook');

      // 1. Title page spread: blank left + title on right
      $fb.append('<div class="page blank"></div>');
      $fb.append(`
        <div class="page title">
          <h1>WHAT IS ART?</h1>
        </div>
      `);

      // 2. For each comic: blank left + content right
      data.forEach((haiku, i) => {
        const num = i + 1;
        $fb.append('<div class="page blank"></div>');
        $fb.append(`
          <div class="page">
            <div class="comic-frame">
              <img src="images/${num}.png" alt="Comic ${num}">
            </div>
            <pre class="haiku">${haiku}</pre>
          </div>
        `);
      });

      // 3. Initialize Turn.js in double-page mode
      $fb.turn({
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.9,
        autoCenter: true,
        display: 'double',
        gradients: true,
        acceleration: true,
        duration: 600
      });

      // 4. Advance on “?” click
      $('#nextBtn').on('click', () => $fb.turn('next'));
    })
    .catch(err => console.error('Failed to fetch haikus.json:', err));
});
