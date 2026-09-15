/**
 * Dedications Module: Libro delle Dediche & Auguri per Chiara
 */

const Dedications = {
  items: [],

  init() {
    this.container = document.getElementById('dedications-list');
    this.emptyState = document.getElementById('dedications-empty-state');
    this.openModalBtn = document.getElementById('open-dedication-modal-btn');
    this.modal = document.getElementById('dedication-modal');
    this.closeModalBtn = document.getElementById('close-dedication-modal-btn');
    this.form = document.getElementById('dedication-form');
    this.countBadge = document.getElementById('count-filter-dedications');
    this.tabBadge = document.getElementById('tab-dedications-badge');

    this.bindEvents();
  },

  bindEvents() {
    if (this.openModalBtn) {
      this.openModalBtn.addEventListener('click', () => this.openModal());
    }

    if (this.closeModalBtn) {
      this.closeModalBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.form) {
      this.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const authorInput = document.getElementById('dedication-author-input');
        const messageInput = document.getElementById('dedication-message-input');
        const submitBtn = document.getElementById('submit-dedication-btn');

        const author = authorInput.value.trim() || App.getGuestName() || 'Invitato';
        const message = messageInput.value.trim();

        if (!message) return;

        App.setGuestName(author);
        App.updateGuestBadge();

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader"></i> Invio...';
        lucide.createIcons();

        try {
          const res = await API.postDedication(author, message);
          if (res.dedication) {
            this.addDedication(res.dedication);
          }
          this.closeModal();
          messageInput.value = '';

          if (window.confetti) {
            confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#ffd700', '#8b1528', '#00e5ff', '#ffffff']
            });
          }

          App.showToast('💌 Dedica inviata con successo!');
        } catch (err) {
          App.showToast('❌ Errore durante l\'invio della dedica');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="send"></i> Invia Dedica 💌';
          lucide.createIcons();
        }
      });
    }
  },

  openModal() {
    const authorInput = document.getElementById('dedication-author-input');
    if (authorInput) {
      authorInput.value = App.getGuestName() || '';
    }
    if (this.modal) this.modal.classList.remove('hidden');
  },

  closeModal() {
    if (this.modal) this.modal.classList.add('hidden');
  },

  setDedications(list) {
    this.items = list || [];
    this.updateCount();
    this.render();
  },

  addDedication(dedication) {
    if (!dedication) return;
    const exists = this.items.some(d => d.id === dedication.id);
    if (!exists) {
      this.items.unshift(dedication);
      this.updateCount();
      this.render();
    }
  },

  updateReaction(id, reactions) {
    const item = this.items.find(d => d.id === id);
    if (item) {
      item.reactions = reactions;
      this.render();
    }
  },

  removeDedication(id) {
    this.items = this.items.filter(d => d.id !== id);
    this.updateCount();
    this.render();
  },

  updateCount() {
    const count = this.items.length;
    if (this.countBadge) this.countBadge.innerText = count;
    if (this.tabBadge) {
      this.tabBadge.innerText = count > 0 ? count : '';
      this.tabBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  },

  render() {
    if (!this.container) return;

    if (!this.items || this.items.length === 0) {
      this.container.innerHTML = '';
      if (this.emptyState) this.emptyState.classList.remove('hidden');
      return;
    }

    if (this.emptyState) this.emptyState.classList.add('hidden');

    let html = '';

    this.items.forEach(item => {
      const date = item.timestamp ? new Date(item.timestamp) : new Date();
      const timeStr = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      const reactions = item.reactions || {};

      html += `
        <div class="dedication-card" data-id="${item.id}">
          <div class="dedication-card-header">
            <div class="dedication-avatar">💌</div>
            <div class="dedication-author-info">
              <h4 class="dedication-author-name">${escapeHtml(item.author || 'Invitato')}</h4>
              <span class="dedication-time">${timeStr}</span>
            </div>
            <button class="dedication-delete-btn" data-id="${item.id}" title="Elimina dedica">
              <i data-lucide="trash-2"></i>
            </button>
          </div>

          <div class="dedication-quote-body">
            <span class="dedication-quote-mark">“</span>
            <p class="dedication-text">${escapeHtml(item.message)}</p>
          </div>

          <div class="dedication-card-footer">
            <div class="dedication-reactions">
              <button class="dedication-react-btn" data-id="${item.id}" data-emoji="❤️">
                <span>❤️</span> <span class="d-count">${reactions['❤️'] || 0}</span>
              </button>
              <button class="dedication-react-btn" data-id="${item.id}" data-emoji="🎓">
                <span>🎓</span> <span class="d-count">${reactions['🎓'] || 0}</span>
              </button>
              <button class="dedication-react-btn" data-id="${item.id}" data-emoji="🥂">
                <span>🥂</span> <span class="d-count">${reactions['🥂'] || 0}</span>
              </button>
              <button class="dedication-react-btn" data-id="${item.id}" data-emoji="🎉">
                <span>🎉</span> <span class="d-count">${reactions['🎉'] || 0}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    this.container.innerHTML = html;

    // Attach reaction listeners
    this.container.querySelectorAll('.dedication-react-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        const emoji = btn.dataset.emoji;

        if (window.confetti) {
          const rect = btn.getBoundingClientRect();
          confetti({
            particleCount: 15,
            spread: 40,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight
            }
          });
        }

        try {
          const res = await API.reactToDedication(id, emoji);
          if (res.reactions) {
            this.updateReaction(id, res.reactions);
          }
        } catch (err) {}
      });
    });

    // Attach delete listeners
    this.container.querySelectorAll('.dedication-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        if (confirm('Sei sicuro di voler eliminare questa dedica?')) {
          try {
            await API.deleteDedication(id);
            this.removeDedication(id);
            App.showToast('🗑️ Dedica eliminata');
          } catch (err) {
            App.showToast('❌ Errore durante l\'eliminazione');
          }
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

window.Dedications = Dedications;
