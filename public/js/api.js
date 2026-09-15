/**
 * API Service & Real-Time SSE Client for Graduation Photo & Dedications Gallery
 */

const API = {
  // Fetch current event details
  async getEvent() {
    try {
      const res = await fetch('/api/event');
      return await res.json();
    } catch (e) {
      console.error('Error loading event:', e);
      return null;
    }
  },

  // Update event details
  async updateEvent(eventData) {
    try {
      const res = await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      return await res.json();
    } catch (e) {
      console.error('Error updating event:', e);
      throw e;
    }
  },

  // Fetch all photos & videos
  async getPhotos() {
    try {
      const res = await fetch('/api/photos');
      const photos = await res.json();
      try {
        localStorage.setItem('laurea_cached_photos', JSON.stringify(photos));
      } catch(e){}
      return photos;
    } catch (e) {
      console.warn('Offline: returning cached photos');
      const cached = localStorage.getItem('laurea_cached_photos');
      return cached ? JSON.parse(cached) : [];
    }
  },

  // Upload Photo / Video (FormData)
  async uploadPhoto(formData) {
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || (data && data.success === false)) {
        const errorMsg = (data && data.error) ? data.error : `Errore caricamento (Status ${res.status})`;
        throw new Error(errorMsg);
      }
      return data;
    } catch (e) {
      console.error('Upload error:', e);
      throw e;
    }
  },

  // Add reaction to a photo/video
  async reactToPhoto(photoId, emoji) {
    try {
      const res = await fetch(`/api/photos/${photoId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });
      return await res.json();
    } catch (e) {
      console.error('Reaction error:', e);
      throw e;
    }
  },

  // Delete photo/video
  async deletePhoto(photoId) {
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (e) {
      console.error('Delete error:', e);
      throw e;
    }
  },

  // ==================== DEDICATIONS API ====================
  async getDedications() {
    try {
      const res = await fetch('/api/dedications');
      return await res.json();
    } catch (e) {
      console.error('Error loading dedications:', e);
      return [];
    }
  },

  async postDedication(author, message) {
    try {
      const res = await fetch('/api/dedications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, message })
      });
      if (!res.ok) throw new Error('Invio dedica fallito');
      return await res.json();
    } catch (e) {
      console.error('Dedication error:', e);
      throw e;
    }
  },

  async reactToDedication(dedicationId, emoji) {
    try {
      const res = await fetch(`/api/dedications/${dedicationId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });
      return await res.json();
    } catch (e) {
      console.error('Dedication reaction error:', e);
      throw e;
    }
  },

  async deleteDedication(dedicationId) {
    try {
      const res = await fetch(`/api/dedications/${dedicationId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (e) {
      console.error('Delete dedication error:', e);
      throw e;
    }
  },

  // Subscribe to real-time Server-Sent Events (SSE)
  initLiveSync(handlers = {}) {
    if (!window.EventSource) return;

    const evtSource = new EventSource('/api/photos/stream');

    evtSource.addEventListener('new_photos', (event) => {
      try {
        const newPhotos = JSON.parse(event.data);
        if (handlers.onNewPhotos) handlers.onNewPhotos(newPhotos);
      } catch (e) {}
    });

    evtSource.addEventListener('reaction_updated', (event) => {
      try {
        const update = JSON.parse(event.data);
        if (handlers.onReactionUpdated) handlers.onReactionUpdated(update);
      } catch (e) {}
    });

    evtSource.addEventListener('photo_deleted', (event) => {
      try {
        const { photoId } = JSON.parse(event.data);
        if (handlers.onPhotoDeleted) handlers.onPhotoDeleted(photoId);
      } catch (e) {}
    });

    evtSource.addEventListener('new_dedication', (event) => {
      try {
        const newDedication = JSON.parse(event.data);
        if (handlers.onNewDedication) handlers.onNewDedication(newDedication);
      } catch (e) {}
    });

    evtSource.addEventListener('dedication_reacted', (event) => {
      try {
        const update = JSON.parse(event.data);
        if (handlers.onDedicationReacted) handlers.onDedicationReacted(update);
      } catch (e) {}
    });

    evtSource.addEventListener('dedication_deleted', (event) => {
      try {
        const { dedicationId } = JSON.parse(event.data);
        if (handlers.onDedicationDeleted) handlers.onDedicationDeleted(dedicationId);
      } catch (e) {}
    });

    evtSource.addEventListener('event_updated', (event) => {
      try {
        const updatedEvent = JSON.parse(event.data);
        if (handlers.onEventUpdated) handlers.onEventUpdated(updatedEvent);
      } catch (e) {}
    });
  }
};

window.API = API;
