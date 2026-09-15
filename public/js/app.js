/**
 * Main App Orchestrator for Graduation Party: Iacuzzo Chiara
 */

const App = {
  eventData: null,

  async init() {
    // 1. Initialize sub-modules
    Gallery.init();
    Dedications.init();
    Camera.init();
    Lightbox.init();
    QrCards.init();

    // 2. Setup modals and listeners
    this.setupModals();
    this.setupOnboarding();
    this.setupNavigation();
    this.setupPhotoUploadForm();
    this.setupEventSettings();

    // 3. Load initial data
    await this.loadInitialData();

    // 4. Connect Live SSE
    this.setupLiveSync();

    // 5. Update Guest badge
    this.updateGuestBadge();
  },

  setupModals() {
    // QR Modal open/close for Chiara
    const qrBtn = document.getElementById('header-qr-btn');
    const qrModal = document.getElementById('qr-print-modal');
    const closeQrBtn = document.getElementById('close-qr-modal-btn');

    if (qrBtn) {
      qrBtn.addEventListener('click', () => {
        if (this.eventData) QrCards.updateEventInfo(this.eventData);
        if (qrModal) qrModal.classList.remove('hidden');
      });
    }

    if (closeQrBtn) {
      closeQrBtn.addEventListener('click', () => {
        if (qrModal) qrModal.classList.add('hidden');
      });
    }
  },

  setupNavigation() {
    const tabBtns = document.querySelectorAll('.bottom-tab-bar .tab-nav-item[data-target]');
    const views = document.querySelectorAll('.main-viewport .app-view');
    const subnav = document.getElementById('gallery-subnav');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        if (!targetId) return;

        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        views.forEach(view => {
          if (view.id === targetId) {
            view.classList.add('active');
          } else {
            view.classList.remove('active');
          }
        });

        // Hide gallery subnav chips when viewing Dediche
        if (subnav) {
          subnav.style.display = targetId === 'view-gallery' ? 'flex' : 'none';
        }
      });
    });
  },

  setupOnboarding() {
    const guestName = this.getGuestName();
    const onboardingModal = document.getElementById('onboarding-modal');
    const onboardingForm = document.getElementById('onboarding-form');

    if (!guestName && onboardingModal) {
      onboardingModal.classList.remove('hidden');
    }

    if (onboardingForm) {
      onboardingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('guest-name-input');
        const name = input.value.trim();
        if (name) {
          this.setGuestName(name);
          onboardingModal.classList.add('hidden');
          this.updateGuestBadge();
          this.showToast(`Benvenuto/a ${name}! 🎓`);

          if (window.confetti) {
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#a81028', '#ffca28', '#ffffff']
            });
          }
        }
      });
    }

    const guestBadge = document.getElementById('header-guest-name');
    if (guestBadge) {
      guestBadge.addEventListener('click', () => {
        const current = this.getGuestName() || '';
        const newName = prompt('Modifica il tuo nome per le dediche:', current);
        if (newName && newName.trim()) {
          this.setGuestName(newName.trim());
          this.updateGuestBadge();
          Gallery.updateFilterCounts();
        }
      });
    }
  },

  setupPhotoUploadForm() {
    const form = document.getElementById('photo-details-form');
    const closeBtn = document.getElementById('close-upload-modal-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        Camera.closeUploadModal();
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const author = document.getElementById('author-input').value.trim() || this.getGuestName() || 'Invitato';
        const caption = document.getElementById('caption-input').value.trim();
        const submitBtn = document.getElementById('submit-upload-btn');

        this.setGuestName(author);
        this.updateGuestBadge();

        if (!Camera.capturedFile) {
          this.showToast('Nessun file selezionato.');
          return;
        }

        const file = Camera.capturedFile;
        // Limit check for Render cloud reverse proxy (95MB safe margin)
        const MAX_SIZE = 95 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          const mb = (file.size / (1024 * 1024)).toFixed(0);
          this.showToast(`⚠️ Il file è troppo pesante (${mb}MB, max 95MB). Prova a tagliare il video o caricalo in 1080p!`);
          return;
        }

        const progressContainer = document.getElementById('upload-progress-container');
        const progressBar = document.getElementById('upload-progress-bar');
        const progressPercent = document.getElementById('upload-progress-percent');
        const progressLabel = document.getElementById('upload-progress-label');

        if (progressContainer) progressContainer.classList.remove('hidden');
        if (progressBar) progressBar.style.width = '0%';
        if (progressPercent) progressPercent.innerText = '0%';
        if (progressLabel) progressLabel.innerText = Camera.capturedType === 'video' ? 'Invio video in corso...' : 'Invio foto in corso...';

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader"></i> Pubblicazione...';
        lucide.createIcons();

        try {
          const origName = file.name || (Camera.capturedType === 'video' ? 'video.mp4' : 'foto.jpg');

          const formData = new FormData();
          formData.append('author', author);
          formData.append('caption', caption);
          formData.append('photos', file, origName);

          const res = await API.uploadPhoto(formData, (percent) => {
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressPercent) progressPercent.innerText = `${percent}%`;
            submitBtn.innerHTML = `<i data-lucide="loader"></i> Caricamento: ${percent}%`;
          });

          Camera.closeUploadModal();

          if (res.photos) {
            Gallery.addPhotos(res.photos);
          }

          if (window.confetti) {
            confetti({
              particleCount: 90,
              spread: 90,
              origin: { y: 0.5 },
              colors: ['#a81028', '#ffca28', '#ffffff']
            });
          }

          this.showToast('🎉 Ricordo pubblicato nella galleria!');
          document.getElementById('caption-input').value = '';
        } catch (err) {
          console.error('Upload error:', err);
          this.showToast(`❌ ${err.message || 'Errore durante la pubblicazione'}`);
        } finally {
          if (progressContainer) progressContainer.classList.add('hidden');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="send"></i> Pubblica nella Galleria!';
          lucide.createIcons();
        }
      });
    }
  },

  setupEventSettings() {
    const openBtn = document.getElementById('header-settings-btn');
    const modal = document.getElementById('event-settings-modal');
    const closeBtn = document.getElementById('close-settings-modal-btn');
    const form = document.getElementById('event-settings-form');

    const openSettings = async () => {
      if (!this.eventData) return;
      document.getElementById('settings-title').value = this.eventData.title || '';
      document.getElementById('settings-subtitle').value = this.eventData.subtitle || '';
      document.getElementById('settings-hashtag').value = this.eventData.hashtag || '';

      try {
        const res = await fetch('/api/tunnel-config');
        const cfg = await res.json();
        const domEl = document.getElementById('settings-ngrok-domain');
        const tokEl = document.getElementById('settings-ngrok-token');
        if (domEl) domEl.value = cfg.ngrokDomain || '';
        if (tokEl) tokEl.value = cfg.ngrokToken || '';
      } catch (e) {}

      if (modal) modal.classList.remove('hidden');
    };

    if (openBtn) openBtn.addEventListener('click', openSettings);
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const updated = {
          title: document.getElementById('settings-title').value.trim(),
          subtitle: document.getElementById('settings-subtitle').value.trim(),
          hashtag: document.getElementById('settings-hashtag').value.trim()
        };

        const ngrokDomain = (document.getElementById('settings-ngrok-domain')?.value || '').trim();
        const ngrokToken = (document.getElementById('settings-ngrok-token')?.value || '').trim();

        try {
          const res = await API.updateEvent(updated);
          this.eventData = res;
          this.applyEventData(res);

          // Save tunnel config
          const tunnelRes = await fetch('/api/tunnel-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: ngrokDomain ? 'ngrok' : 'cloudflare',
              ngrokDomain,
              ngrokToken
            })
          });
          const tunnelData = await tunnelRes.json();

          modal.classList.add('hidden');
          if (ngrokDomain) {
            this.showToast('✨ Link permanente Ngrok attivato!');
          } else {
            this.showToast('✨ Dettagli festa salvati!');
          }
        } catch (e) {
          this.showToast('❌ Impossibile aggiornare i dettagli.');
        }
      });
    }
  },

  async loadInitialData() {
    try {
      const [event, photos, dedications] = await Promise.all([
        API.getEvent(),
        API.getPhotos(),
        API.getDedications()
      ]);

      if (event) {
        this.eventData = event;
        this.applyEventData(event);
      }

      if (photos) {
        Gallery.setPhotos(photos);
      }

      if (dedications) {
        Dedications.setDedications(dedications);
      }
    } catch (e) {
      console.error('Initial load error:', e);
    }
  },

  applyEventData(event) {
    if (!event) return;
    const headerTitle = document.getElementById('header-event-title');
    if (headerTitle) headerTitle.innerText = event.title || 'Festa di Laurea';
    QrCards.updateEventInfo(event);
  },

  setupLiveSync() {
    API.initLiveSync({
      onNewPhotos: (newPhotos) => {
        Gallery.addPhotos(newPhotos);
        const author = newPhotos[0] ? newPhotos[0].author : 'Un invitato';
        this.showToast(`📸 ${author} ha aggiunto un nuovo ricordo!`);
      },
      onReactionUpdated: ({ photoId, reactions }) => {
        Gallery.updateReaction(photoId, reactions);
        if (Lightbox.currentIndex !== -1 && Lightbox.photos[Lightbox.currentIndex]?.id === photoId) {
          Lightbox.updateReactionCounts(reactions);
        }
      },
      onPhotoDeleted: (photoId) => {
        Gallery.removePhoto(photoId);
      },
      onNewDedication: (newDedication) => {
        Dedications.addDedication(newDedication);
        this.showToast(`💌 ${newDedication.author} ha scritto una dedica!`);
      },
      onDedicationReacted: ({ dedicationId, reactions }) => {
        Dedications.updateReaction(dedicationId, reactions);
      },
      onDedicationDeleted: (dedicationId) => {
        Dedications.removeDedication(dedicationId);
      },
      onEventUpdated: (updatedEvent) => {
        this.eventData = updatedEvent;
        this.applyEventData(updatedEvent);
      }
    });
  },

  getGuestName() {
    return localStorage.getItem('laurea_guest_name') || '';
  },

  setGuestName(name) {
    localStorage.setItem('laurea_guest_name', name);
  },

  updateGuestBadge() {
    const guestPill = document.getElementById('header-guest-name');
    const name = this.getGuestName();
    if (guestPill) {
      guestPill.innerText = name ? name : 'Inserisci Nome';
    }
  },

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
};

window.App = App;

window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
