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
      letter-spacing: 6px;
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
      letter-spacing: 1px;
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
    .card-divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 4px 16px 8px 16px;
      color: #C5A059;
      font-size: 0.8rem;
      letter-spacing: 4px;
    }
    .card-divider::before, .card-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, #C5A059, transparent);
    }
    .card-instruction-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 0.82rem;
      color: #333;
      margin-top: 2px;
      font-weight: 400;
      font-style: italic;
      line-height: 1.5;
    }
    .card-hashtag {
      font-size: 0.72rem;
      font-weight: 700;
      color: #8B1A2E;
      margin-top: 6px;
      letter-spacing: 0.5px;
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

    // Dimensioni alta definizione (HD - 1600x2200 px - ideale per stampa fotografica nitidissima)
    const width = 1600;
    const height = 2200;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Sfondo elegante con gradiente perla/avorio
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.5, '#fbf8f2');
    bgGrad.addColorStop(1, '#f4eee2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Bordo esterno Oro
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 10;
    ctx.strokeRect(44, 44, width - 88, height - 88);

    // 3. Bordo interno Bordeaux Laurea
    ctx.strokeStyle = '#7a1b28';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(66, 66, width - 132, height - 132);

    // 4. Laurel dots & Tocco (• 🎓 •)
    ctx.textAlign = 'center';
    ctx.font = '64px sans-serif';
    ctx.fillStyle = '#7a1b28';
    ctx.fillText('• 🎓 •', width / 2, 210);

    // 5. Titolo in Pinyon Script (peso naturale, non grassetto, spaziatura curata)
    ctx.font = '120px "Pinyon Script", cursive, serif';
    ctx.fillStyle = '#7a1b28';
    ctx.fillText('Chiara Iacuzzo’s', width / 2, 355);
    ctx.fillText('Graduation Party', width / 2, 495);

    // 6. Riquadro QR Code ad alta risoluzione
    const qrSize = 740;
    const qrX = (width - qrSize) / 2;
    const qrY = 630;
    const pad = 30;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX - pad, qrY - pad, qrSize + (pad * 2), qrSize + (pad * 2));
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX - pad, qrY - pad, qrSize + (pad * 2), qrSize + (pad * 2));

    const renderAndExport = (qrSource) => {
      if (qrSource) {
        ctx.drawImage(qrSource, qrX, qrY, qrSize, qrSize);
      }

      // Logo centrale con tocco di laurea sul QR Code
      const logoSize = 130;
      const logoX = width / 2;
      const logoY = qrY + (qrSize / 2);

      ctx.beginPath();
      ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#081026';
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = '64px sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎓', logoX, logoY + 4);

      // 7. Istruzioni eleganti in basso
      ctx.textBaseline = 'alphabetic';
      ctx.font = 'italic 54px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#333333';
      ctx.fillText('Inquadra il codice per condividere', width / 2, 1600);
      ctx.fillText('foto, video e dediche speciali', width / 2, 1680);

      // 8. Hashtag
      ctx.font = 'bold 44px "Outfit", sans-serif';
      ctx.fillStyle = '#8B1A2E';
      ctx.fillText('#ChiaraLaurea2026', width / 2, 1760);

      // 9. Linea separatore dorata
      const grad = ctx.createLinearGradient(200, 0, width - 200, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, '#C5A059');
      grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 1560);
      ctx.lineTo(width - 200, 1560);
      ctx.stroke();

      // 10. Download PNG
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

    // Generazione del QR Code nativo ad alta risoluzione (740x740 pixel) in un elemento virtuale
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
