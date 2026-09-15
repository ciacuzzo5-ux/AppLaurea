/**
 * Slideshow Module: Live Projector / TV Wall Mode with automated photo rotation
 */

const Slideshow = {
  photos: [],
  currentIndex: 0,
  timer: null,
  isPlaying: true,
  intervalMs: 5000,

  init() {
    this.container = document.getElementById('view-slideshow');
    this.slideImg = document.getElementById('slideshow-img');
    this.titleEl = document.getElementById('slideshow-title');
    this.authorEl = document.getElementById('slideshow-author');
    this.captionEl = document.getElementById('slideshow-caption-text');
    this.reactionsEl = document.getElementById('slideshow-reactions');
    this.filmstripEl = document.getElementById('slideshow-filmstrip');
    this.toggleBtn = document.getElementById('slideshow-toggle-btn');
    this.playIcon = document.getElementById('slideshow-play-icon');
    this.fullscreenBtn = document.getElementById('slideshow-fullscreen-btn');

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.togglePlay());
    }

    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }
  },

  start(photos) {
    this.photos = photos || [];
    if (this.photos.length === 0) return;

    this.currentIndex = 0;
    this.renderFilmstrip();
    this.showSlide(this.currentIndex);
    this.play();
  },

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isPlaying = false;
  },

  play() {
    this.stop();
    this.isPlaying = true;
    if (this.playIcon) {
      this.playIcon.setAttribute('data-lucide', 'pause');
      lucide.createIcons();
    }
    this.timer = setInterval(() => {
      this.next();
    }, this.intervalMs);
  },

  togglePlay() {
    if (this.isPlaying) {
      this.stop();
      if (this.playIcon) {
        this.playIcon.setAttribute('data-lucide', 'play');
        lucide.createIcons();
      }
    } else {
      this.play();
    }
  },

  next() {
    if (this.photos.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.photos.length;
    this.showSlide(this.currentIndex);
  },

  showSlide(index) {
    if (!this.photos[index]) return;
    const photo = this.photos[index];

    // Smooth transition
    this.slideImg.style.opacity = '0';
    setTimeout(() => {
      this.slideImg.src = photo.url;
      this.slideImg.style.opacity = '1';
    }, 200);

    this.authorEl.innerText = photo.author || 'Invitato';
    this.captionEl.innerText = photo.caption ? `"${photo.caption}"` : 'Momento indimenticabile 🎓';

    const reactionSummary = Object.entries(photo.reactions || {})
      .filter(([_, count]) => count > 0)
      .map(([emo, count]) => `${emo} ${count}`)
      .join(' • ');

    this.reactionsEl.innerText = reactionSummary || '❤️ Lascia una reazione!';

    // Highlight active thumbnail
    if (this.filmstripEl) {
      const thumbs = this.filmstripEl.querySelectorAll('.filmstrip-thumb');
      thumbs.forEach((t, i) => {
        if (i === index) t.classList.add('active');
        else t.classList.remove('active');
      });
    }
  },

  renderFilmstrip() {
    if (!this.filmstripEl) return;
    this.filmstripEl.innerHTML = '';
    this.photos.forEach((photo, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `filmstrip-thumb ${idx === this.currentIndex ? 'active' : ''}`;
      thumb.innerHTML = `<img src="${photo.url}" alt="thumb">`;
      thumb.addEventListener('click', () => {
        this.currentIndex = idx;
        this.showSlide(idx);
      });
      this.filmstripEl.appendChild(thumb);
    });
  },

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.container.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  }
};

window.Slideshow = Slideshow;
