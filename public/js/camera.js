/**
 * Camera Module: Direct phone camera for Photos & Gallery upload for Photos and Videos
 */

const Camera = {
  capturedFile: null,
  capturedType: 'image', // 'image' or 'video'

  init() {
    this.photoInput = document.getElementById('camera-photo-input');
    this.galleryInput = document.getElementById('native-file-input');

    this.openCamBtn = document.getElementById('open-camera-menu-btn');
    this.openGalleryBtn = document.getElementById('open-gallery-upload-btn');
    this.emptyCaptureBtn = document.getElementById('empty-capture-btn');

    // Action Sheet Modal
    this.sheetModal = document.getElementById('camera-sheet-modal');
    this.sheetBtnPhoto = document.getElementById('sheet-btn-photo');
    this.sheetBtnGallery = document.getElementById('sheet-btn-gallery');
    this.closeSheetBtn = document.getElementById('close-sheet-btn');

    this.bindEvents();
  },

  bindEvents() {
    // Direct native picker (1 tap to Scatta o Carica)
    if (this.openCamBtn) {
      this.openCamBtn.addEventListener('click', () => {
        if (this.galleryInput) this.galleryInput.click();
      });
    }
    if (this.emptyCaptureBtn) {
      this.emptyCaptureBtn.addEventListener('click', () => {
        if (this.galleryInput) this.galleryInput.click();
      });
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
      });
    }

    if (this.galleryInput) {
      this.galleryInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          if (e.target.files.length === 1) {
            const file = e.target.files[0];
            const isVid = (file.type && file.type.startsWith('video/')) || /\.(mp4|mov|webm|3gp|m4v)$/i.test(file.name);
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

  pausePreviewVideo() {
    const video = document.querySelector('#upload-preview-container video');
    if (video) {
      try {
        video.pause();
      } catch (e) {}
    }
  },

  resetInputs() {
    this.pausePreviewVideo();
    if (this.photoInput) this.photoInput.value = '';
    if (this.galleryInput) this.galleryInput.value = '';
    this.capturedFile = null;
  },

  closeUploadModal() {
    this.pausePreviewVideo();
    const modal = document.getElementById('photo-upload-modal');
    if (modal) modal.classList.add('hidden');
    this.resetInputs();
  },

  // High-performance client-side image compression for mobile uploads
  async compressImage(file, maxDimension = 2048, quality = 0.85) {
    if (!file || !file.type || !file.type.startsWith('image/') || file.type === 'image/gif') {
      return file;
    }
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (!width || !height) {
          resolve(file);
          return;
        }

        // Scale down if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
          } else {
            const baseName = file.name ? file.name.replace(/\.[^.]+$/, '') : 'foto';
            const compressedFile = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
            resolve(compressedFile);
          }
        }, 'image/jpeg', quality);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };

      img.src = url;
    });
  },

  async uploadMultipleFiles(files) {
    const author = App.getGuestName() || 'Invitato';
    const formData = new FormData();
    formData.append('author', author);
    formData.append('caption', '');

    const MAX_SINGLE_SIZE = 95 * 1024 * 1024;

    App.showToast(`⏳ Ottimizzazione di ${files.length} ricordi...`);

    for (let i = 0; i < files.length; i++) {
      let f = files[i];
      if (f.size > MAX_SINGLE_SIZE) {
        const mb = (f.size / (1024 * 1024)).toFixed(0);
        App.showToast(`⚠️ Il file "${f.name}" è troppo grande (${mb}MB, max 95MB).`);
        this.resetInputs();
        return;
      }

      // Compress if it's an image
      if (f.type && f.type.startsWith('image/')) {
        try {
          f = await this.compressImage(f);
        } catch (e) {
          console.warn('Compression skipped for file', f.name, e);
        }
      }

      formData.append('photos', f, f.name || `media-${i}.jpg`);
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
