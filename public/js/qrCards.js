/**
 * QR Cards Module: Generates printable QR table cards with the live URL for smartphones
 * Styled in the website's elegant ivory-cream / bordeaux / gold theme.
 */

const QrCards = {
  qrTarget: null,
  mobileUrl: '',

  init() {
    this.qrTarget = document.getElementById('qrcode-target');
    this.urlBadge = document.getElementById('qr-direct-url-text');

    const printBtn = document.getElementById('print-qr-btn');
    const downloadImgBtn = document.getElementById('download-card-img-btn');
    const copyLinkBtn = document.getElementById('copy-qr-link-btn');

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printCard();
      });
    }

    if (downloadImgBtn) {
      downloadImgBtn.addEventListener('click', () => {
        this.downloadCardImage();
      });
    }

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const urlToCopy = this.mobileUrl || window.location.origin;
        navigator.clipboard.writeText(urlToCopy);
        App.showToast('📋 Link festa per smartphone copiato!');
      });
    }
  },

  updateEventInfo(event) {
    if (!event) return;
    this.mobileUrl = event.mobileUrl || window.location.origin;
    const realUrlEl = document.getElementById('qr-modal-real-url');
    if (realUrlEl) {
      realUrlEl.innerText = `Link attivo: ${this.mobileUrl}`;
    }
    this.generateQRCode(this.mobileUrl);
  },

  generateQRCode(url) {
    if (!this.qrTarget) return;
    this.qrTarget.innerHTML = '';

    const targetUrl = url || this.mobileUrl || window.location.origin;

    if (window.QRCode) {
      try {
        new QRCode(this.qrTarget, {
          text: targetUrl,
          width: 260,
          height: 260,
          colorDark: "#1C0B10",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel ? QRCode.CorrectLevel.H : 2
        });
      } catch (err) {
        console.error('QR code generation error:', err);
      }
    }
  },

  printCard() {
    const cardEl = document.getElementById('printable-table-card');
    if (!cardEl) {
      window.print();
      return;
    }

    try {
      const cardHtml = cardEl.outerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Stampa Segnaposto - Chiara Iacuzzo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Outfit:wght@500;600;700&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #F8F0E8;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Outfit', sans-serif;
      padding: 20px;
    }
    .table-card-preview {
      background: #ffffff;
      color: #1C0B10;
      border-radius: 20px;
      padding: 16px;
      margin: 0 auto;
      max-width: 340px;
      width: 100%;
      box-shadow: 0 16px 40px rgba(80, 20, 35, 0.12);
      border: 1px solid rgba(139, 26, 46, 0.10);
    }
    .card-inner-border {
      border: 2px solid #8B1A2E;
      border-radius: 14px;
      padding: 20px 16px 18px 16px;
      text-align: center;
      position: relative;
      background: radial-gradient(ellipse at 50% 0%, #fff9f2 0%, #ffffff 60%);
      overflow: hidden;
    }
    .card-inner-border::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8B1A2E, #C5A059, #8B1A2E);
    }
    .card-top-laurel {
      font-size: 1.25rem;
      letter-spacing: 4px;
      color: #8B1A2E;
      margin-bottom: 4px;
    }
    .card-pinyon-title {
      font-family: 'Pinyon Script', cursive, serif;
      font-size: 2.4rem;
      line-height: 1.1;
      color: #1C0B10;
      font-weight: 400;
      margin: 4px 0 2px 0;
      letter-spacing: 0.5px;
    }
    .card-party-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #8B1A2E;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .card-party-subtitle {
      font-size: 0.72rem;
      color: #9A7A82;
      font-weight: 500;
      margin-bottom: 14px;
      letter-spacing: 0.8px;
    }
    .qr-canvas-wrapper {
      position: relative;
      width: 220px;
      height: 220px;
      margin: 0 auto 14px auto;
      background: #fff;
      padding: 10px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(80, 20, 35, 0.08), 0 0 0 1.5px rgba(139,26,46,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-canvas-wrapper img, .qr-canvas-wrapper canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
    }
    .qr-center-logo {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #640D1F;
      color: #C5A059;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 2.5px solid #ffffff;
    }
    .card-instruction-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 0.82rem;
      color: #5C3340;
      margin-top: 6px;
      font-weight: 400;
      font-style: italic;
      line-height: 1.5;
    }
    @media print {
      body { min-height: auto; padding: 0; background: #ffffff; }
      @page { margin: 1cm; size: auto; }
      .table-card-preview { box-shadow: none; }
    }
  </style>
</head>
<body>
  ${cardHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`);
        printWindow.document.close();
        return;
      }
    } catch (e) {
      console.warn('Popup print blocked, falling back to window.print()', e);
    }

    // Direct fallback
    window.print();
  },

  async downloadCardImage() {
    const cardEl = document.getElementById('printable-table-card');
    if (!cardEl) return;

    App.showToast('⏳ Creazione immagine...');

    // Attendi caricamento dei font web per una resa impeccabile
    if (document.fonts) {
      try {
        await Promise.all([
          document.fonts.load('140px "Pinyon Script"'),
          document.fonts.load('bold 46px "Outfit"'),
          document.fonts.load('italic 38px "Playfair Display"'),
          document.fonts.ready
        ]);
      } catch (e) {
        console.warn('Font load note:', e);
      }
    }

    const targetUrl = this.mobileUrl || window.location.origin;

    // Dimensioni canvas HD (1200 x 1800 — rapporto 2:3 ideale per stampa e smartphone)
    const W = 1200;
    const H = 1800;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Palette ufficiale del sito (Crema / Bordeaux / Oro)
    const COLOR_BG_PAGE   = '#F8F0E8'; // Crema avorio dello sfondo
    const COLOR_CARD_BG   = '#FFFFFF'; // Bianco puro della card
    const COLOR_BORDEAUX  = '#8B1A2E'; // Bordeaux nobile
    const COLOR_BORD_DARK = '#640D1F'; // Bordeaux profondo
    const COLOR_GOLD      = '#C5A059'; // Oro champagne
    const COLOR_TEXT_MAIN = '#1C0B10'; // Scuro caldo elegante
    const COLOR_TEXT_MED  = '#5C3340'; // Bordeaux medio secondario
    const COLOR_TEXT_MUTE = '#9A7A82'; // Grigio-rosato per la data

    // Helper per disegnare rettangoli arrotondati
    const drawRoundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    /* ── 1. SFONDO COMPLETO (Crema Avorio) ── */
    ctx.fillStyle = COLOR_BG_PAGE;
    ctx.fillRect(0, 0, W, H);

    /* ── 2. CARD CENTRALE FLUTTUANTE (Bianco con ombra calda e morbida) ── */
    const cardX = 64;
    const cardY = 64;
    const cardW = W - 128; // 1072
    const cardH = H - 128; // 1672
    const cardRadius = 40;

    // Ombra calda bordeaux
    ctx.shadowColor = 'rgba(80, 20, 35, 0.12)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;
    drawRoundRect(cardX, cardY, cardW, cardH, cardRadius);
    ctx.fillStyle = COLOR_CARD_BG;
    ctx.fill();

    // Reset ombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Sottilissimo bordo esterno card
    drawRoundRect(cardX, cardY, cardW, cardH, cardRadius);
    ctx.strokeStyle = 'rgba(139, 26, 46, 0.10)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* ── 3. CORNICE INTERNA (.card-inner-border dello stile web) ── */
    const inPad = 28;
    const inX = cardX + inPad;
    const inY = cardY + inPad;
    const inW = cardW - (inPad * 2);
    const inH = cardH - (inPad * 2);
    const inRadius = 24;

    // Sfondo radiale avorio sfumato interno
    const inGrad = ctx.createRadialGradient(W / 2, inY + 50, 40, W / 2, inY + 300, inW * 0.75);
    inGrad.addColorStop(0, '#FFF9F2');
    inGrad.addColorStop(0.7, '#FFFFFF');
    inGrad.addColorStop(1, '#FFFFFF');
    drawRoundRect(inX, inY, inW, inH, inRadius);
    ctx.fillStyle = inGrad;
    ctx.fill();

    // Bordo bordeaux nobile
    drawRoundRect(inX, inY, inW, inH, inRadius);
    ctx.strokeStyle = COLOR_BORDEAUX;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    /* ── 4. NASTRO ACCENTO SUPERIORE (Bordeaux - Oro - Bordeaux) ── */
    ctx.save();
    // Clip per seguire la curva superiore della cornice interna
    drawRoundRect(inX, inY, inW, inH, inRadius);
    ctx.clip();
    const stripeGrad = ctx.createLinearGradient(inX, 0, inX + inW, 0);
    stripeGrad.addColorStop(0,   COLOR_BORDEAUX);
    stripeGrad.addColorStop(0.5, COLOR_GOLD);
    stripeGrad.addColorStop(1,   COLOR_BORDEAUX);
    ctx.fillStyle = stripeGrad;
    ctx.fillRect(inX, inY, inW, 9);
    ctx.restore();

    /* ── 5. DECORAZIONE SUPERIORE: • 🎓 • ── */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '44px sans-serif';
    ctx.fillStyle = COLOR_BORDEAUX;
    ctx.fillText('• 🎓 •', W / 2, inY + 110);

    /* ── 6. NOME: "Chiara Iacuzzo" in Pinyon Script ── */
    ctx.font = '148px "Pinyon Script", cursive, serif';
    ctx.fillStyle = COLOR_TEXT_MAIN;
    ctx.fillText('Chiara Iacuzzo', W / 2, inY + 265);

    /* ── 7. TITOLO: "GRADUATION PARTY" ── */
    ctx.font = 'bold 44px "Outfit", sans-serif';
    ctx.fillStyle = COLOR_BORDEAUX;
    ctx.fillText('GRADUATION PARTY', W / 2, inY + 345);

    /* ── 8. DATA: "16 Settembre 2026" ── */
    ctx.font = '500 32px "Outfit", sans-serif';
    ctx.fillStyle = COLOR_TEXT_MUTE;
    ctx.fillText('16 Settembre 2026', W / 2, inY + 404);

    /* ── 9. RIQUADRO QR CODE (.qr-canvas-wrapper) ── */
    const qrSize = 640;
    const qrPad = 26;
    const qrBoxW = qrSize + (qrPad * 2);
    const qrBoxH = qrSize + (qrPad * 2);
    const qrBoxX = (W - qrBoxW) / 2;
    const qrBoxY = inY + 448;
    const qrX = qrBoxX + qrPad;
    const qrY = qrBoxY + qrPad;

    // Ombra morbida per il riquadro QR
    ctx.shadowColor = 'rgba(80, 20, 35, 0.08)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    drawRoundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 22);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Reset ombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Bordo sottile dorato/bordeaux attorno al QR
    drawRoundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 22);
    ctx.strokeStyle = 'rgba(139, 26, 46, 0.20)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* ── FUNZIONE DI COMPLETAMENTO E DOWNLOAD ── */
    const renderAndExport = (qrSource) => {
      // Disegna il QR Code
      if (qrSource) {
        ctx.drawImage(qrSource, qrX, qrY, qrSize, qrSize);
      }

      // Badge circolare centrale sul QR (🎓)
      const logoRadius = 54;
      const logoCenterX = W / 2;
      const logoCenterY = qrY + (qrSize / 2);

      ctx.beginPath();
      ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
      ctx.fillStyle = COLOR_BORD_DARK;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Emoji tocco di laurea al centro
      ctx.font = '52px sans-serif';
      ctx.fillStyle = COLOR_GOLD;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎓', logoCenterX, logoCenterY + 2);

      // ── Testo Istruzione sotto al QR ──
      ctx.textBaseline = 'alphabetic';
      ctx.font = 'italic 38px "Playfair Display", Georgia, serif';
      ctx.fillStyle = COLOR_TEXT_MED;
      const textBaseY = qrBoxY + qrBoxH + 74;
      ctx.fillText('Inquadra il codice per condividere', W / 2, textBaseY);
      ctx.fillText('foto, video e dediche speciali', W / 2, textBaseY + 54);

      // Esporta l'immagine PNG
      canvas.toBlob((blob) => {
        if (!blob) {
          App.showToast('Errore durante la creazione dell\'immagine');
          return;
        }
        const fileUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = 'Segnaposto-Chiara-Iacuzzo.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(fileUrl), 2500);
        App.showToast('✨ Immagine segnaposto salvata!');
      }, 'image/png');
    };

    // Generazione del QR ad alta risoluzione in elemento temporaneo
    try {
      const tempDiv = document.createElement('div');
      new QRCode(tempDiv, {
        text: targetUrl,
        width: qrSize,
        height: qrSize,
        colorDark: COLOR_TEXT_MAIN,
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel ? QRCode.CorrectLevel.H : 2
      });

      const hiCanvas = tempDiv.querySelector('canvas');
      const hiImg = tempDiv.querySelector('img');

      if (hiCanvas) {
        renderAndExport(hiCanvas);
      } else if (hiImg && hiImg.complete && hiImg.naturalWidth > 0) {
        renderAndExport(hiImg);
      } else if (hiImg) {
        hiImg.onload = () => renderAndExport(hiImg);
      } else {
        renderAndExport(this.qrTarget ? this.qrTarget.querySelector('canvas') : null);
      }
    } catch (err) {
      console.warn('Fallback al canvas a schermo:', err);
      renderAndExport(this.qrTarget ? this.qrTarget.querySelector('canvas') : null);
    }
  }
};

window.QrCards = QrCards;
