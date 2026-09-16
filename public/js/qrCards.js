/**
 * QR Cards Module: Generates printable QR table cards with the live URL for smartphones
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
          colorDark: "#081026",
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

    // Try opening clean print window first (optimal on both desktop and mobile browsers)
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
      background: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Outfit', sans-serif;
      padding: 20px;
    }
    .table-card-preview {
      background: #ffffff;
      color: #081026;
      border-radius: 20px;
      padding: 16px;
      margin: 0 auto;
      max-width: 340px;
      width: 100%;
      box-shadow: 0 16px 48px rgba(0,0,0,0.18);
    }
    .card-inner-border {
      border: 2.5px solid #081026;
      border-radius: 14px;
      padding: 20px 16px 18px 16px;
      text-align: center;
      position: relative;
      background: radial-gradient(ellipse at 50% 0%, #fff8f0 0%, #ffffff 60%);
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
      color: #081026;
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
      color: #555;
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
      box-shadow: 0 4px 20px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(139,26,46,0.2);
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
      background: #081026;
      color: #ffd700;
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
      color: #333;
      margin-top: 6px;
      font-weight: 400;
      font-style: italic;
      line-height: 1.5;
    }
    @media print {
      body { min-height: auto; padding: 0; }
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

    App.showToast('⏳ Creazione immagine in alta definizione...');

    // Assicura che i font personalizzati siano pronti prima del rendering su canvas
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('Font loading check:', e);
      }
    }

    const targetUrl = this.mobileUrl || window.location.origin;

    // Dimensioni HD — proporzioni carta da visita/segnaposto (verticale)
    const width = 1200;
    const height = 1700;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Helper per rettangoli arrotondati
    const roundRect = (x, y, w, h, r) => {
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

    // 1. Sfondo pagina bianco puro
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 2. Card principale — sfondo bianco con sfumatura calda in alto
    const cardX = 60, cardY = 60;
    const cardW = width - 120, cardH = height - 120;
    const cardR = 40;

    const cardGrad = ctx.createRadialGradient(width / 2, cardY + 200, 50, width / 2, cardY + 300, cardH);
    cardGrad.addColorStop(0, '#fff8f0');
    cardGrad.addColorStop(0.5, '#ffffff');
    cardGrad.addColorStop(1, '#ffffff');
    roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.fillStyle = cardGrad;
    ctx.fill();

    // 3. Bordo card navy scuro
    roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.strokeStyle = '#081026';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 4. Banda colorata in cima (bordeaux → oro → bordeaux)
    const topBarGrad = ctx.createLinearGradient(cardX, 0, cardX + cardW, 0);
    topBarGrad.addColorStop(0, '#8B1A2E');
    topBarGrad.addColorStop(0.5, '#C5A059');
    topBarGrad.addColorStop(1, '#8B1A2E');
    roundRect(cardX, cardY, cardW, 12, cardR);
    ctx.fillStyle = topBarGrad;
    ctx.fill();

    // 5. Decorazione • 🎓 •
    ctx.textAlign = 'center';
    ctx.font = '48px sans-serif';
    ctx.fillStyle = '#8B1A2E';
    ctx.fillText('• 🎓 •', width / 2, cardY + 120);

    // 6. Nome "Chiara Iacuzzo" in Pinyon Script — colore nero/navy
    ctx.font = '148px "Pinyon Script", cursive, serif';
    ctx.fillStyle = '#081026';
    ctx.fillText('Chiara Iacuzzo', width / 2, cardY + 290);

    // 7. "GRADUATION PARTY" — bordeaux uppercase
    ctx.font = 'bold 52px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#8B1A2E';
    ctx.letterSpacing = '6px';
    ctx.fillText('GRADUATION PARTY', width / 2, cardY + 380);

    // 8. Data — grigio sottile
    ctx.font = '38px "Outfit", sans-serif';
    ctx.fillStyle = '#777777';
    ctx.fillText('16 Settembre 2026', width / 2, cardY + 448);

    // 9. Riquadro QR — bianco con anello bordeaux sottile
    const qrSize = 700;
    const qrX = (width - qrSize) / 2;
    const qrY = cardY + 510;
    const qrBoxW = qrSize + 56;
    const qrBoxH = qrSize + 56;
    const qrBoxX = qrX - 28;
    const qrBoxY = qrY - 28;

    // Ombra sottile
    ctx.shadowColor = 'rgba(0,0,0,0.10)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 8;
    roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Anello bordeaux
    roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 28);
    ctx.strokeStyle = 'rgba(139, 26, 46, 0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();

    const renderAndExport = (qrSource) => {
      if (qrSource) {
        ctx.drawImage(qrSource, qrX, qrY, qrSize, qrSize);
      }

      // Logo 🎓 centrale sul QR
      const logoR = 58;
      const logoX = width / 2;
      const logoY = qrY + qrSize / 2;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
      ctx.fillStyle = '#081026';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = '56px sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎓', logoX, logoY + 3);

      // 10. Istruzione in corsivo serif sotto il QR
      ctx.textBaseline = 'alphabetic';
      ctx.font = 'italic 42px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#333333';
      const instrY = qrBoxY + qrBoxH + 80;
      ctx.fillText('Inquadra il codice per condividere', width / 2, instrY);
      ctx.fillText('foto, video e dediche speciali', width / 2, instrY + 62);

      // 11. Salva PNG
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
        App.showToast('✨ Immagine segnaposto in alta qualità salvata!');
      }, 'image/png');
    };

    // Generazione del QR Code nativo ad alta risoluzione in un elemento virtuale
    try {
      const tempDiv = document.createElement('div');
      new QRCode(tempDiv, {
        text: targetUrl,
        width: qrSize,
        height: qrSize,
        colorDark: "#081026",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel ? QRCode.CorrectLevel.H : 2
      });

      const highResCanvas = tempDiv.querySelector('canvas');
      const highResImg = tempDiv.querySelector('img');

      if (highResCanvas) {
        renderAndExport(highResCanvas);
      } else if (highResImg && highResImg.complete && highResImg.naturalWidth > 0) {
        renderAndExport(highResImg);
      } else if (highResImg) {
        highResImg.onload = () => renderAndExport(highResImg);
      } else {
        const fallbackCanvas = this.qrTarget ? this.qrTarget.querySelector('canvas') : null;
        renderAndExport(fallbackCanvas);
      }
    } catch (err) {
      console.warn('Fallback al canvas a schermo:', err);
      const fallbackCanvas = this.qrTarget ? this.qrTarget.querySelector('canvas') : null;
      renderAndExport(fallbackCanvas);
    }
  }
};

window.QrCards = QrCards;
