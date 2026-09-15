/**
 * Camera Module: Direct phone camera for Photos & Videos (iOS Safari & Android Chrome)
 */

const Camera = {
  capturedFile: null,
  capturedType: 'image', // 'image' or 'video'

  init() {
    this.photoInput = document.getElementById('camera-photo-input');
    this.videoInput = document.getElementById('camera-video-input');
    this.galleryInput = document.getElementById('native-file-input');

    this.openCamBtn = document.getElementById('open-camera-menu-btn');
    this.openGalleryBtn = document.getElementById('open-gallery-upload-btn');
    this.emptyCaptureBtn = document.getElementById('empty-capture-btn');

    // Action Sheet Modal
    this.sheetModal = document.getElementById('camera-sheet-modal');
    this.sheetBtnPhoto = document.getElementById('sheet-btn-photo');
    this.sheetBtnVideo = document.getElementById('sheet-btn-video');
    this.sheetBtnGallery = document.getElementById('sheet-btn-gallery');
    this.closeSheetBtn = document.getElementById('close-sheet-btn');

    this.bindEvents();
  },

  bindEvents() {
    // Open action sheet
    if (this.openCamBtn) {
      this.openCamBtn.addEventListener('click', () => this.openActionSheet());
    }
    if (this.emptyCaptureBtn) {
      this.emptyCaptureBtn.addEventListener('click', () => this.openActionSheet());
    }

    // Direct Gallery button
    if (this.openGalleryBtn) {
      this.openGalleryBtn.addEventListener('click', () => {
        if (this.galleryInput) this.galleryInput.click();
      });
    }

    // Action Sheet options
    if (this.sheetBtnPhoto) {
      this.sheetBtnPhoto.addEventListener('click', () => {
        this.closeActionSheet();
        if (this.photoInput) this.photoInput.click();
      });
    }

    if (this.sheetBtnVideo) {
      this.sheetBtnVideo.addEventListener('click', () => {
        this.closeActionSheet();
        if (this.videoInput) this.videoInput.click();
      });
    }

    if (this.sheetBtnGallery) {
      this.sheetBtnGallery.addEventListener('click', () => {
        this.closeActionSheet();
        if (this.galleryInput) this.galleryInput.click();
      });
    }

    if (this.closeSheetBtn) {
      this.closeSheetBtn.addEventListener('click', () => this.closeActionSheet());
    }

    // File Input Listeners (Never clear input.value prematurely on Safari!)
    if (this.photoInput) {
      this.photoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleSingleMedia(e.target.files[0], 'image');
        }
      });
    }

    if (this.videoInput) {
      this.videoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleSingleMedia(e.target.files[0], 'video');
        }
      });
    }

    if (this.galleryInput) {
      this.galleryInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          if (e.target.files.length === 1) {
            const file = e.target.files[0];
            const isVid = file.type.startsWith('video/') || /\.(mp4|mov|webm|3gp|m4v)$/i.test(file.name);
            this.handleSingleMedia(file, isVid ? 'video' : 'image');
          } else {
            this.uploadMultipleFiles(e.target.files);
          }
        }
      });
    }
  },

  openActionSheet() {
    if (this.sheetModal) this.sheetModal.classList.remove('hidden');
  },

  closeActionSheet() {
    if (this.sheetModal) this.sheetModal.classList.add('hidden');
  },

  handleSingleMedia(file, type) {
    this.capturedFile = file;
    this.capturedType = type;
    const url = URL.createObjectURL(file);
    this.openUploadModal(url, type);
  },

  openUploadModal(mediaUrl, type) {
    const modal = document.getElementById('photo-upload-modal');
    const container = document.getElementById('upload-preview-container');
    const authorInput = document.getElementById('author-input');
    const titleEl = document.getElementById('upload-modal-title');
    const videoHint = document.getElementById('upload-video-hint');
    const progressContainer = document.getElementById('upload-progress-container');

    if (titleEl) {
      titleEl.innerText = type === 'video' ? 'Condividi il Video 🎥' : 'Condividi la Foto 📸';
    }

    if (videoHint) {
      if (type === 'video') videoHint.classList.remove('hidden');
      else videoHint.classList.add('hidden');
    }

    if (progressContainer) {
      progressContainer.classList.add('hidden');
    }

    if (container) {
      container.innerHTML = '';
      if (type === 'video') {
        const video = document.createElement('video');
        video.src = mediaUrl;
        video.controls = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.autoplay = true;
        video.muted = true; // Crucial for Safari mobile inline preview
        video.loop = true;
        container.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = mediaUrl;
        img.alt = 'Anteprima';
        container.appendChild(img);
      }
    }

    if (authorInput) authorInput.value = App.getGuestName() || '';
    if (modal) modal.classList.remove('hidden');
  },

  resetInputs() {
    if (this.photoInput) this.photoInput.value = '';
    if (this.videoInput) this.videoInput.value = '';
    if (this.galleryInput) this.galleryInput.value = '';
    this.capturedFile = null;
  },

  closeUploadModal() {
    const modal = document.getElementById('photo-upload-modal');
    if (modal) modal.classList.add('hidden');
    this.resetInputs();
  },

  async uploadMultipleFiles(files) {
    const author = App.getGuestName() || 'Invitato';
    const formData = new FormData();
    formData.append('author', author);
    formData.append('caption', '');

    let totalBytes = 0;
    const MAX_SINGLE_SIZE = 95 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > MAX_SINGLE_SIZE) {
        const mb = (files[i].size / (1024 * 1024)).toFixed(0);
        App.showToast(`⚠️ Il file "${files[i].name}" è troppo grande (${mb}MB, max 95MB).`);
        this.resetInputs();
        return;
      }
      totalBytes += files[i].size;
      formData.append('photos', files[i], files[i].name || `media-${i}.jpg`);
    }

    App.showToast(`⏳ Caricamento di ${files.length} ricordi in corso...`);

    try {
      const res = await API.uploadPhoto(formData, (percent) => {
        App.showToast(`⏳ Caricamento: ${percent}%...`);
      });
      App.showToast(`✨ ${files.length} ricordi pubblicati con successo!`);
      if (res.photos) {
        Gallery.addPhotos(res.photos);
      }
      if (window.confetti) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#a81028', '#ffca28', '#ffffff']
        });
      }
    } catch (e) {
      console.error('Multiple upload error:', e);
      App.showToast(`❌ ${e.message || 'Errore durante il caricamento'}`);
    } finally {
      this.resetInputs();
    }
  }
};

window.Camera = Camera;
