/**
 * Lightbox Module: Fullscreen media viewer for both Photos and HD Videos
 */

const Lightbox = {
  photos: [],
  currentIndex: 0,
  touchStartX: 0,
  touchEndX: 0,

  init() {
    this.modal = document.getElementById('lightbox-modal');
    this.mediaContainer = document.getElementById('lightbox-media-container');
    this.counter = document.getElementById('lightbox-counter');
    this.authorName = document.getElementById('lightbox-author-name');
    this.authorAvatar = document.getElementById('lightbox-author-avatar');
    this.photoTime = document.getElementById('lightbox-photo-time');
    this.captionText = document.getElementById('lightbox-caption-text');
    this.stage = document.getElementById('lightbox-stage');

    this.reactBtns = document.querySelectorAll('.react-btn');
    this.closeBtn = document.getElementById('lightbox-close-btn');
    this.prevBtn = document.getElementById('lightbox-prev-btn');
    this.nextBtn = document.getElementById('lightbox-next-btn');
    this.downloadBtn = document.getElementById('lightbox-download-single-btn');
    this.shareBtn = document.getElementById('lightbox-share-btn');
    this.deleteBtn = document.getElementById('lightbox-delete-btn');

    this.bindEvents();
  },

  bindEvents() {
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    this.reactBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        this.addReaction(emoji, btn);
      });
    });

    if (this.shareBtn) {
      this.shareBtn.addEventListener('click', () => this.shareCurrentMedia());
    }

    if (this.deleteBtn) {
      this.deleteBtn.addEventListener('click', () => this.deleteCurrentMedia());
    }

    // Touch Swipe Navigation for Mobile
    if (this.stage) {
      this.stage.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.stage.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });
    }

    document.addEventListener('keydown', (e) => {
      if (this.modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  },

  open(photos, index = 0) {
    this.photos = photos || [];
    this.currentIndex = index;
    this.modal.classList.remove('hidden');
    this.renderCurrentMedia();
  },

  close() {
    this.pauseAnyVideo();
    this.modal.classList.add('hidden');
  },

  pauseAnyVideo() {
    if (this.mediaContainer) {
      const vid = this.mediaContainer.querySelector('video');
      if (vid) vid.pause();
    }
  },

  prev() {
    if (this.currentIndex > 0) {
      this.pauseAnyVideo();
      this.currentIndex--;
      this.renderCurrentMedia();
    }
  },

  next() {
    if (this.currentIndex < this.photos.length - 1) {
      this.pauseAnyVideo();
      this.currentIndex++;
      this.renderCurrentMedia();
    }
  },

  handleSwipe() {
    const diffX = this.touchEndX - this.touchStartX;
    if (Math.abs(diffX) > 45) {
      if (diffX < 0) this.next();
      else this.prev();
    }
  },

  renderCurrentMedia() {
    const item = this.photos[this.currentIndex];
    if (!item) return;

    this.mediaContainer.innerHTML = '';

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.id = 'lightbox-main-video';
      video.src = item.url;
      video.controls = true;
      video.playsInline = true;
      video.autoplay = true;
      video.loop = true;
      this.mediaContainer.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.id = 'lightbox-main-img';
      img.src = item.url;
      img.alt = item.caption || 'Foto';
      this.mediaContainer.appendChild(img);
    }

    this.counter.innerText = `${this.currentIndex + 1} di ${this.photos.length}`;
    this.authorName.innerText = item.author || 'Invitato';
    this.authorAvatar.innerText = (item.author && item.author.includes('Chiara')) ? '🎓' : '✨';

    if (item.timestamp) {
      const date = new Date(item.timestamp);
      this.photoTime.innerText = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } else {
      this.photoTime.innerText = 'Stasera';
    }

    if (item.caption && item.caption.trim().length > 0) {
      this.captionText.innerText = `"${item.caption}"`;
      this.captionText.style.display = 'block';
    } else {
      this.captionText.style.display = 'none';
    }

    // Download Link
    this.downloadBtn.href = item.url;
    const ext = item.type === 'video' ? '.mp4' : '.jpg';
    this.downloadBtn.setAttribute('download', `Ricordo-Laurea-Chiara-${item.id}${ext}`);

    // Update Reactions
    this.updateReactionCounts(item.reactions || {});
  },

  updateReactionCounts(reactions) {
    document.getElementById('react-count-heart').innerText = reactions['❤️'] || 0;
    document.getElementById('react-count-grad').innerText = reactions['🎓'] || 0;
    document.getElementById('react-count-toast').innerText = reactions['🥂'] || 0;
    document.getElementById('react-count-party').innerText = reactions['🎉'] || 0;
  },

  async addReaction(emoji, btnElement) {
    const item = this.photos[this.currentIndex];
    if (!item) return;

    if (window.confetti && btnElement) {
      const rect = btnElement.getBoundingClientRect();
      confetti({
        particleCount: 16,
        spread: 45,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight
        }
      });
    }

    try {
      const res = await API.reactToPhoto(item.id, emoji);
      if (res.reactions) {
        item.reactions = res.reactions;
        this.updateReactionCounts(item.reactions);
        Gallery.updateReaction(item.id, item.reactions);
      }
    } catch (e) {
      console.error('Failed to react:', e);
    }
  },

  async shareCurrentMedia() {
    const item = this.photos[this.currentIndex];
    if (!item) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Festa di Laurea di Chiara',
          text: item.caption || 'Guarda questo ricordo dalla festa di laurea! 🎓',
          url: window.location.origin + item.url
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.origin + item.url);
      App.showToast('📋 Link copiato negli appunti!');
    }
  },

  async deleteCurrentMedia() {
    const item = this.photos[this.currentIndex];
    if (!item) return;

    if (confirm('Sei sicuro di voler eliminare questo elemento?')) {
      try {
        await API.deletePhoto(item.id);
        App.showToast('🗑️ Elemento eliminato');
        Gallery.removePhoto(item.id);
        if (this.photos.length <= 1) {
          this.close();
        } else {
          this.next();
        }
      } catch (e) {
        App.showToast('❌ Errore durante l\'eliminazione');
      }
    }
  }
};

window.Lightbox = Lightbox;
