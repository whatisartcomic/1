$(function() {
  fetch('haikus.json')
    .then(res => res.json())
    .then(data => {
      const $fb = $('#flipbook');

      // Title page
      $fb.append(`
        <div class="page title">
          <h1>WHAT IS ART?</h1>
        </div>
      `);

      // One page per comic+haiku
      data.forEach((haiku, i) => {
        const num = i + 1;
        $fb.append(`
          <div class="page">
            <div class="comic-frame">
              <img src="images/${num}.png" alt="Comic ${num}">
            </div>
            <pre class="haiku">${haiku}</pre>
          </div>
        `);
      });

      // Initialize Turn.js
      $fb.turn({
        width: 800,
        height: 1000,
        autoCenter: true,
        gradients: true,
        acceleration: true
      });

      // Next page on “?” click
      $('#nextBtn').on('click', () => {
        $fb.turn('next');
      });
    });
});
