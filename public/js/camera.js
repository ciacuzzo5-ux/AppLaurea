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

    // File Input Listeners
    if (this.photoInput) {
      this.photoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleSingleMedia(e.target.files[0], 'image');
        }
        e.target.value = '';
      });
    }

    if (this.videoInput) {
      this.videoInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleSingleMedia(e.target.files[0], 'video');
        }
        e.target.value = '';
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
        e.target.value = '';
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

    if (titleEl) {
      titleEl.innerText = type === 'video' ? 'Condividi il Video 🎥' : 'Condividi la Foto 📸';
    }

    if (container) {
      container.innerHTML = '';
      if (type === 'video') {
        const video = document.createElement('video');
        video.src = mediaUrl;
        video.controls = true;
        video.playsInline = true;
        video.autoplay = true;
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

  closeUploadModal() {
    const modal = document.getElementById('photo-upload-modal');
    if (modal) modal.classList.add('hidden');
    this.capturedFile = null;
  },

  async uploadMultipleFiles(files) {
    const author = App.getGuestName() || 'Invitato';
    const formData = new FormData();
    formData.append('author', author);
    formData.append('caption', '');

    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i], files[i].name || `media-${i}.jpg`);
    }

    App.showToast(`⏳ Caricamento di ${files.length} file in alta qualità...`);

    try {
      const res = await API.uploadPhoto(formData);
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
    }
  }
};

window.Camera = Camera;
