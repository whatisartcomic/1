let current = Math.floor(Math.random() * 54) + 1;
const total = 54;

fetch('haikus.json')
  .then(response => response.json())
  .then(data => {
    const comic = document.getElementById('comic');
    const haiku = document.getElementById('haiku');
    const nextBtn = document.getElementById('nextBtn');

    const update = () => {
      comic.src = `images/${current}.png`;
      haiku.textContent = data[current - 1];
    };

    const next = () => {
      let next = Math.floor(Math.random() * total) + 1;
      while (next === current) {
        next = Math.floor(Math.random() * total) + 1;
      }
      current = next;
      update();
    };

    nextBtn.addEventListener('click', next);

    // Swipe detection
    let touchStartX = null;

    document.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
      if (!touchStartX) return;
      let deltaX = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(deltaX) > 50) next();
      touchStartX = null;
    });

    update();
  });
