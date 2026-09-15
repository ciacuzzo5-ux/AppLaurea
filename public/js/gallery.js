/**
 * Gallery Module: Renders clean, unified photo & video grid with filters and layout switching.
 */

const Gallery = {
  photos: [],
  activeFilter: 'all',
  currentLayout: 'grid-3-cols', // 'grid-3-cols', 'grid-2-cols', 'grid-1-col'

  init() {
    this.gridContainer = document.getElementById('photos-grid');
    this.emptyState = document.getElementById('gallery-empty-state');
    this.subnavFilters = document.querySelectorAll('.filter-chip');
    this.gridToggleBtn = document.getElementById('grid-toggle-btn');
    this.gridIcon = document.getElementById('grid-icon');

    // Attach Filter Listeners
    this.subnavFilters.forEach(chip => {
      chip.addEventListener('click', () => {
        this.subnavFilters.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeFilter = chip.dataset.filter;
        this.render();
      });
    });

    // Grid Layout Switcher
    if (this.gridToggleBtn) {
      this.gridToggleBtn.addEventListener('click', () => {
        if (this.currentLayout === 'grid-3-cols') {
          this.currentLayout = 'grid-2-cols';
          this.gridIcon.setAttribute('data-lucide', 'grid-2x2');
        } else if (this.currentLayout === 'grid-2-cols') {
          this.currentLayout = 'grid-1-col';
          this.gridIcon.setAttribute('data-lucide', 'square');
        } else {
          this.currentLayout = 'grid-3-cols';
          this.gridIcon.setAttribute('data-lucide', 'grid-3x3');
        }
        lucide.createIcons();
        this.gridContainer.className = `photos-grid ${this.currentLayout}`;
      });
    }
  },

  setPhotos(photos) {
    this.photos = photos || [];
    this.updateFilterCounts();
    this.render();
  },

  addPhotos(newPhotos) {
    if (!Array.isArray(newPhotos)) newPhotos = [newPhotos];
    const ids = new Set(this.photos.map(p => p.id));
    newPhotos.forEach(p => {
      if (!ids.has(p.id)) {
        this.photos.unshift(p);
      }
    });
    this.updateFilterCounts();
    this.render();
  },

  updateReaction(photoId, reactions) {
    const item = this.photos.find(p => p.id === photoId);
    if (item) {
      item.reactions = reactions;
      this.render();
    }
  },

  removePhoto(photoId) {
    this.photos = this.photos.filter(p => p.id !== photoId);
    this.updateFilterCounts();
    this.render();
  },

  getFilteredPhotos() {
    const currentUserName = App.getGuestName();

    switch (this.activeFilter) {
      case 'my':
        return this.photos.filter(p => p.author && p.author.toLowerCase() === currentUserName.toLowerCase());
      case 'dedications':
        return this.photos.filter(p => p.caption && p.caption.trim().length > 0);
      case 'videos':
        return this.photos.filter(p => p.type === 'video');
      case 'all':
      default:
        return this.photos;
    }
  },

  updateFilterCounts() {
    const currentUserName = App.getGuestName();
    const allCount = this.photos.length;
    const myCount = this.photos.filter(p => p.author && p.author.toLowerCase() === currentUserName.toLowerCase()).length;
    const dedicationsCount = this.photos.filter(p => p.caption && p.caption.trim().length > 0).length;
    const videosCount = this.photos.filter(p => p.type === 'video').length;

    const countAllEl = document.getElementById('count-filter-all');
    const countMyEl = document.getElementById('count-filter-my');
    const countDedEl = document.getElementById('count-filter-dedications');
    const countVidEl = document.getElementById('count-filter-videos');
    const headerCountEl = document.getElementById('header-photo-count');

    if (countAllEl) countAllEl.innerText = allCount;
    if (countMyEl) countMyEl.innerText = myCount;
    if (countDedEl) countDedEl.innerText = dedicationsCount;
    if (countVidEl) countVidEl.innerText = videosCount;
    if (headerCountEl) headerCountEl.innerText = `${allCount} Ricordi`;
  },

  render() {
    const filtered = this.getFilteredPhotos();

    if (!filtered || filtered.length === 0) {
      this.gridContainer.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');

    let html = '';

    filtered.forEach(item => {
      const totalReactions = Object.values(item.reactions || {}).reduce((s, v) => s + v, 0);
      const hasCaption = item.caption && item.caption.trim().length > 0;
      const isVideo = item.type === 'video';

      html += `
        <div class="photo-tile" data-id="${item.id}">
          ${isVideo ? `
            <video src="${item.url}#t=0.1" preload="metadata" muted playsinline></video>
            <div class="tile-video-badge">▶ Video</div>
          ` : `
            <img src="${item.url}" alt="${item.caption || 'Ricordo Laurea'}" loading="lazy" />
          `}
          ${totalReactions > 0 ? `<div class="tile-reactions-pill">❤️ ${totalReactions}</div>` : ''}
          ${hasCaption ? `
            <div class="tile-caption-indicator" title="${item.caption}">
              <span>💌</span> ${escapeHtml(item.caption)}
            </div>
          ` : ''}
          <div class="tile-author-tag">${escapeHtml(item.author || 'Ospite')}</div>
        </div>
      `;
    });

    this.gridContainer.innerHTML = html;

    // Attach click handlers to open Lightbox
    this.gridContainer.querySelectorAll('.photo-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const itemId = tile.dataset.id;
        const index = this.photos.findIndex(p => p.id === itemId);
        if (index !== -1) {
          Lightbox.open(this.photos, index);
        }
      });
    });

    lucide.createIcons();
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.Gallery = Gallery;
