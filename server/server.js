const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const archiver = require('archiver');

const app = express();
const PORT = process.env.PORT || 3000;

// Directories
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const DEDICATIONS_FILE = path.join(DATA_DIR, 'dedications.json');
const EVENT_FILE = path.join(DATA_DIR, 'event.json');
const CLOUDFLARED_BIN = path.join(__dirname, '..', 'cloudflared.exe');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (with fresh cache-control for HTML and Service Worker)
app.use((req, res, next) => {
  if (req.path === '/' || req.path.endsWith('.html') || req.path === '/sw.js') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Public URL (Cloudflare, Ngrok, or Render Cloud)
let currentPublicUrl = process.env.RENDER_EXTERNAL_URL || '';

// Dynamic Host Detection (when running on Render or custom domain)
app.use((req, res, next) => {
  if (process.env.RENDER_EXTERNAL_URL) {
    currentPublicUrl = process.env.RENDER_EXTERNAL_URL;
  } else if (!currentPublicUrl || currentPublicUrl.includes('localhost') || currentPublicUrl.includes('192.168.')) {
    const host = req.get('host');
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1') && !host.startsWith('192.168.')) {
      currentPublicUrl = `${proto}://${host}`;
    }
  }
  next();
});

function getLocalIpAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// SSE Clients for live updates
let sseClients = [];

function broadcastSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (e) {}
  });
}

// Multer Storage Configuration (High Quality Photos & 4K Videos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) {
      if (file.mimetype.startsWith('video/')) ext = '.mp4';
      else if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else if (file.mimetype === 'image/heic') ext = '.heic';
      else ext = '.jpg';
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'media-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 300 * 1024 * 1024, // 300MB max for HD/4K videos and raw photos
    files: 25 
  },
  fileFilter: (req, file, cb) => {
    // Permissive filter accepting all photos, videos and mobile media formats
    cb(null, true);
  }
});

// Event Persistence
function getEvent() {
  const defaultEvent = {
    title: "Festa di Laurea di Chiara",
    subtitle: "Ingegneria Informatica",
    date: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }),
    hashtag: "#LaureaChiara2026",
    code: "CHIARA2026",
    localIp: getLocalIpAddress(),
    mobileUrl: currentPublicUrl || `http://${getLocalIpAddress()}:${PORT}`
  };

  if (!fs.existsSync(EVENT_FILE)) {
    fs.writeFileSync(EVENT_FILE, JSON.stringify(defaultEvent, null, 2), 'utf8');
    return defaultEvent;
  }
  try {
    const ev = JSON.parse(fs.readFileSync(EVENT_FILE, 'utf8'));
    ev.localIp = getLocalIpAddress();
    ev.mobileUrl = currentPublicUrl || `http://${getLocalIpAddress()}:${PORT}`;
    return ev;
  } catch (e) {
    return defaultEvent;
  }
}

function saveEvent(eventData) {
  fs.writeFileSync(EVENT_FILE, JSON.stringify(eventData, null, 2), 'utf8');
}

// Photos & Videos Persistence (NO sample photos, starts 100% clean)
function getPhotos() {
  if (!fs.existsSync(PHOTOS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(PHOTOS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function savePhotos(photos) {
  fs.writeFileSync(PHOTOS_FILE, JSON.stringify(photos, null, 2), 'utf8');
}

// Dedications (Libro degli Auguri / Guestbook) Persistence
function getDedications() {
  if (!fs.existsSync(DEDICATIONS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(DEDICATIONS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveDedications(dedications) {
  fs.writeFileSync(DEDICATIONS_FILE, JSON.stringify(dedications, null, 2), 'utf8');
}

// REST API ROUTES

// 1. Get Event & Network Info
app.get('/api/event', (req, res) => {
  res.json(getEvent());
});

// 2. Update Event
app.post('/api/event', (req, res) => {
  const current = getEvent();
  const updated = { ...current, ...req.body };
  saveEvent(updated);
  broadcastSSE('event_updated', updated);
  res.json(updated);
});

// 3. Get Media List
app.get('/api/photos', (req, res) => {
  res.json(getPhotos());
});

// 4. Upload Photos & Videos (Wrapped in safe callback)
app.post('/api/photos', (req, res) => {
  upload.array('photos', 25)(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      let errorMsg = 'Errore durante la ricezione del file. Riprova.';
      if (err.code === 'LIMIT_FILE_SIZE') {
        errorMsg = 'Il file supera la dimensione massima consentita (100MB).';
      } else if (err.message && err.message.toLowerCase().includes('unexpected end of form')) {
        errorMsg = 'Caricamento interrotto dal dispositivo o dalla rete. Riprova!';
      } else if (err.message) {
        errorMsg = err.message;
      }

      return res.status(400).json({
        success: false,
        error: errorMsg
      });
    }

    try {
      const author = (req.body.author || 'Invitato').trim();
      const caption = (req.body.caption || '').trim();
      const photos = getPhotos();
      const newMediaItems = [];

      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          const isVideo = (file.mimetype && file.mimetype.startsWith('video/')) || /\.(mp4|mov|webm|3gp|m4v|quicktime)$/i.test(file.originalname);
          const item = {
            id: 'media-' + Date.now() + '-' + Math.round(Math.random() * 1e4),
            filename: file.filename,
            type: isVideo ? 'video' : 'image',
            mimeType: file.mimetype || (isVideo ? 'video/mp4' : 'image/jpeg'),
            url: '/uploads/' + file.filename,
            author: author,
            caption: caption,
            timestamp: new Date().toISOString(),
            reactions: { "❤️": 0, "🎓": 0, "🥂": 0, "🎉": 0 }
          };
          newMediaItems.push(item);
          photos.unshift(item);
        });

        savePhotos(photos);
        broadcastSSE('new_photos', newMediaItems);

        res.status(201).json({
          success: true,
          message: `${newMediaItems.length} file caricati con successo!`,
          photos: newMediaItems
        });
      } else {
        res.status(400).json({ success: false, error: 'Nessun file ricevuto.' });
      }
    } catch (error) {
      console.error('Upload processing error:', error);
      res.status(500).json({ success: false, error: 'Errore durante il salvataggio del file.' });
    }
  });
});

// 5. Add / Increment Reaction on Photo/Video
app.post('/api/photos/:id/react', (req, res) => {
  const photoId = req.params.id;
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'Emoji richiesta' });

  const photos = getPhotos();
  const item = photos.find(p => p.id === photoId);
  if (!item) return res.status(404).json({ error: 'Elemento non trovato' });

  if (!item.reactions) item.reactions = {};
  item.reactions[emoji] = (item.reactions[emoji] || 0) + 1;

  savePhotos(photos);
  broadcastSSE('reaction_updated', { photoId, reactions: item.reactions, emoji });
  res.json({ success: true, reactions: item.reactions });
});

// 6. Delete Photo or Video
app.delete('/api/photos/:id', (req, res) => {
  const photoId = req.params.id;
  let photos = getPhotos();
  const idx = photos.findIndex(p => p.id === photoId);
  if (idx === -1) return res.status(404).json({ error: 'Elemento non trovato' });

  const [deleted] = photos.splice(idx, 1);
  savePhotos(photos);

  if (deleted.filename && !deleted.filename.startsWith('sample-')) {
    const filePath = path.join(UPLOADS_DIR, deleted.filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }

  broadcastSSE('photo_deleted', { photoId });
  res.json({ success: true, message: 'Elemento eliminato' });
});

// 7. Dedications (Libro delle Dediche) API
app.get('/api/dedications', (req, res) => {
  res.json(getDedications());
});

app.post('/api/dedications', (req, res) => {
  try {
    const author = (req.body.author || 'Invitato').trim();
    const message = (req.body.message || '').trim();

    if (!message) {
      return res.status(400).json({ error: 'Il testo della dedica non può essere vuoto' });
    }

    const dedications = getDedications();
    const newDedication = {
      id: 'dedica-' + Date.now() + '-' + Math.round(Math.random() * 1e4),
      author: author,
      message: message,
      timestamp: new Date().toISOString(),
      reactions: { "❤️": 0, "🎓": 0, "🥂": 0, "🎉": 0 }
    };

    dedications.unshift(newDedication);
    saveDedications(dedications);

    broadcastSSE('new_dedication', newDedication);

    res.status(201).json({ success: true, dedication: newDedication });
  } catch (error) {
    console.error('Dedication error:', error);
    res.status(500).json({ error: 'Errore durante il salvataggio della dedica' });
  }
});

app.post('/api/dedications/:id/react', (req, res) => {
  const dedicationId = req.params.id;
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'Emoji richiesta' });

  const dedications = getDedications();
  const item = dedications.find(d => d.id === dedicationId);
  if (!item) return res.status(404).json({ error: 'Dedica non trovata' });

  if (!item.reactions) item.reactions = {};
  item.reactions[emoji] = (item.reactions[emoji] || 0) + 1;

  saveDedications(dedications);
  broadcastSSE('dedication_reacted', { dedicationId, reactions: item.reactions, emoji });
  res.json({ success: true, reactions: item.reactions });
});

app.delete('/api/dedications/:id', (req, res) => {
  const dedicationId = req.params.id;
  let dedications = getDedications();
  const idx = dedications.findIndex(d => d.id === dedicationId);
  if (idx === -1) return res.status(404).json({ error: 'Dedica non trovata' });

  dedications.splice(idx, 1);
  saveDedications(dedications);

  broadcastSSE('dedication_deleted', { dedicationId });
  res.json({ success: true, message: 'Dedica eliminata' });
});

// 8. Real-Time SSE
app.get('/api/photos/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const clientId = Date.now() + Math.random();
  const client = { id: clientId, res };
  sseClients.push(client);

  const pingInterval = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(pingInterval);
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// 9. Download All as ZIP (Photos, Videos + Dedications)
app.get('/api/download-all', async (req, res) => {
  try {
    const photos = getPhotos();
    const dedications = getDedications();
    const event = getEvent();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="Festa-Laurea-Chiara-Tutti-I-Ricordi.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => res.status(500).send({ error: err.message }));
    archive.pipe(res);

    // Guestbook text summary
    let guestbookText = `🎓 ${event.title}\n📅 ${event.date}\n\n`;
    guestbookText += `==============================================\n`;
    guestbookText += `LIBRO DELLE DEDICHE & MESSAGGI DEGLI INVITATI\n`;
    guestbookText += `==============================================\n\n`;

    if (dedications.length > 0) {
      dedications.forEach((d, idx) => {
        guestbookText += `[Dedica #${idx + 1}] - ${new Date(d.timestamp).toLocaleString('it-IT')}\n`;
        guestbookText += `Da: ${d.author}\n`;
        guestbookText += `Messaggio: "${d.message}"\n`;
        const rSummary = Object.entries(d.reactions || {})
          .filter(([_, count]) => count > 0)
          .map(([emo, count]) => `${emo} ${count}`)
          .join(' | ');
        if (rSummary) guestbookText += `Reazioni: ${rSummary}\n`;
        guestbookText += `----------------------------------------------\n`;
      });
    }

    if (photos.some(p => p.caption)) {
      guestbookText += `\n==============================================\n`;
      guestbookText += `DIDASCALIE FOTO E VIDEO\n`;
      guestbookText += `==============================================\n\n`;
      photos.forEach((p, idx) => {
        if (p.caption) {
          guestbookText += `File #${idx + 1} (${p.type === 'video' ? 'VIDEO' : 'FOTO'}) - Da: ${p.author}\n`;
          guestbookText += `"${p.caption}"\n----------------------------------------------\n`;
        }
      });
    }

    archive.append(guestbookText, { name: 'LIBRO_DELLE_DEDICHE_E_AUGURI.txt' });

    photos.forEach((p, idx) => {
      if (p.filename && !p.filename.startsWith('sample-')) {
        const filePath = path.join(UPLOADS_DIR, p.filename);
        if (fs.existsSync(filePath)) {
          const safeAuthor = (p.author || 'Invitato').replace(/[^a-zA-Z0-9_-]/g, '_');
          const ext = path.extname(p.filename) || (p.type === 'video' ? '.mp4' : '.jpg');
          const prefix = p.type === 'video' ? 'Video' : 'Foto';
          archive.file(filePath, { name: `${prefix}_${idx + 1}_${safeAuthor}${ext}` });
        }
      }
    });

    await archive.finalize();
  } catch (e) {
    console.error('Download all error:', e);
    res.status(500).json({ error: 'Impossibile creare il file ZIP.' });
  }
});

// Function to start Cloudflare Quick Tunnel with Auto-Reconnect & Resilient HTTP/2 protocol
function startCloudflareTunnel(port) {
  const exePath = fs.existsSync(CLOUDFLARED_BIN) ? CLOUDFLARED_BIN : 'cloudflared';
  const args = [
    'tunnel',
    '--url', `http://127.0.0.1:${port}`,
    '--protocol', 'http2',
    '--retries', '99999',
    '--grace-period', '30s'
  ];

  console.log('Avvio Cloudflare Quick Tunnel (con riconnessione automatica)...');
  const cfProcess = spawn(exePath, args);

  const handleTunnelOutput = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && match[0]) {
      currentPublicUrl = match[0];
      console.log(`\n🌐 ========================================================`);
      console.log(`🌐 LINK DIRETTO 4G/5G CELLULARE (SENZA AVVISI O PASSWORD):`);
      console.log(`👉 ${currentPublicUrl}`);
      console.log(`🌐 ========================================================\n`);
      broadcastSSE('event_updated', getEvent());
    }
  };

  cfProcess.stdout.on('data', handleTunnelOutput);
  cfProcess.stderr.on('data', handleTunnelOutput);

  cfProcess.on('error', (err) => {
    console.warn('Avviso: avvio cloudflared fallito:', err.message);
  });

  cfProcess.on('close', (code) => {
    console.warn(`Tunnel Cloudflare terminato (codice ${code}). Riconnessione automatica tra 3s...`);
    setTimeout(() => {
      startCloudflareTunnel(port);
    }, 3000);
  });
}

// Keep-Alive / Health Endpoint (for Cron Polling & Anti-Sleep)
app.get(['/ping', '/healthz'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Auto-Keepalive: Ping itself every 9 minutes so Render free tier never sleeps
setInterval(() => {
  const urlToPing = currentPublicUrl || process.env.RENDER_EXTERNAL_URL;
  if (urlToPing && urlToPing.startsWith('http')) {
    try {
      const pingUrl = `${urlToPing.replace(/\/$/, '')}/ping`;
      const client = pingUrl.startsWith('https') ? require('https') : require('http');
      client.get(pingUrl, (res) => {
        // keep-alive ping succeeded
      }).on('error', () => {});
    } catch (e) {}
  }
}, 9 * 60 * 1000);

// Start Server
const localIp = getLocalIpAddress();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎓 ========================================================`);
  console.log(`🎓 SERVER FESTA DI LAUREA DI CHIARA AVVIATO!`);
  console.log(`💻 Dal Computer Locale:   http://localhost:${PORT}`);
  console.log(`📱 Su Rete Wi-Fi:        http://${localIp}:${PORT}`);
  console.log(`🎓 ========================================================`);

  const isCloudEnv = !!(process.env.RENDER || process.env.RENDER_EXTERNAL_URL || (process.env.PORT && process.env.PORT !== '3000' && !fs.existsSync(CLOUDFLARED_BIN)));

  if (isCloudEnv) {
    console.log(`\n☁️ ========================================================`);
    console.log(`☁️ SERVER ATTIVO ONLINE 24/7 SUL CLOUD (RENDER)!`);
    console.log(`👉 ${currentPublicUrl || 'https://app-laurea-chiara.onrender.com'}`);
    console.log(`☁️ ========================================================\n`);
  } else {
    startCloudflareTunnel(PORT);
  }
});
