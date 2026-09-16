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
          width: 170,
          height: 170,
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
  <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
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
      border-radius: 18px;
      padding: 14px;
      margin: 0 auto;
      max-width: 320px;
      width: 100%;
    }
    .card-inner-border {
      border: 2px solid #081026;
      border-radius: 14px;
      padding: 18px 12px;
      text-align: center;
      position: relative;
      background: radial-gradient(circle at 50% 50%, #ffffff 0%, #faf6f0 100%);
    }
    .card-top-laurel {
      font-size: 1.15rem;
      letter-spacing: 4px;
      color: #7a1b28;
      margin-bottom: 2px;
    }
    .card-pinyon-title {
      font-family: 'Pinyon Script', cursive, serif;
      font-size: 2.1rem;
      line-height: 1.15;
      color: #7a1b28;
      font-weight: 400;
      margin: 4px 0 6px 0;
      letter-spacing: 0.5px;
    }
    .card-party-subtitle {
      font-size: 0.8rem;
      color: #081026;
      font-weight: 700;
      margin-bottom: 12px;
    }
    .qr-canvas-wrapper {
      position: relative;
      width: 180px;
      height: 180px;
      margin: 0 auto 12px auto;
      background: #fff;
      padding: 8px;
      border-radius: 12px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
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
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      border: 2px solid #ffffff;
    }
    .card-instruction-text {
      font-size: 0.82rem;
      line-height: 1.4;
      color: #222;
      margin-top: 6px;
      font-weight: 600;
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

  downloadCardImage() {
    const cardEl = document.getElementById('printable-table-card');
    const qrCanvas = this.qrTarget ? this.qrTarget.querySelector('canvas') : null;
    const qrImg = this.qrTarget ? this.qrTarget.querySelector('img') : null;

    if (!cardEl) return;

    App.showToast('⏳ Creazione immagine segnaposto...');

    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(0.5, '#fbf8f2');
    bgGrad.addColorStop(1, '#f4eee2');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Outer Gold Border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, width - 48, height - 48);

    // 3. Inner Bordeaux Border
    ctx.strokeStyle = '#7a1b28';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // 4. Laurel dots & Cap
    ctx.textAlign = 'center';
    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#7a1b28';
    ctx.fillText('• 🎓 •', width / 2, 95);

    // 5. Title in Pinyon Script (Normal, non-bold)
    ctx.font = '68px "Pinyon Script", cursive, serif';
    ctx.fillStyle = '#7a1b28';
    ctx.fillText('Chiara Iacuzzo’s', width / 2, 175);
    ctx.fillText('Graduation Party', width / 2, 245);

    // 6. Subtitle
    ctx.font = 'bold 26px "Outfit", sans-serif';
    ctx.fillStyle = '#081026';
    ctx.fillText('Ingegneria Informatica 💻', width / 2, 305);

    // 7. QR Code Wrapper Background
    const qrSize = 360;
    const qrX = (width - qrSize) / 2;
    const qrY = 345;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

    // Draw QR Code
    const finishExport = () => {
      // Center cap logo on QR
      const logoSize = 64;
      const logoX = width / 2;
      const logoY = qrY + qrSize / 2;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#081026';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = '32px sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎓', logoX, logoY + 2);

      // 8. Bottom Instructions
      ctx.textBaseline = 'alphabetic';
      ctx.font = 'bold 28px "Outfit", sans-serif';
      ctx.fillStyle = '#1a1a1a';
      ctx.fillText('Inquadra per caricare foto, video', width / 2, 790);
      ctx.fillText('o lasciare una dedica!', width / 2, 830);

      // 9. Website URL footer
      ctx.font = '19px "Outfit", sans-serif';
      ctx.fillStyle = '#7a1b28';
      const realUrl = this.mobileUrl || window.location.origin;
      ctx.fillText(realUrl, width / 2, 885);

      // Download trigger
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

    if (qrCanvas) {
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
      finishExport();
    } else if (qrImg && qrImg.complete && qrImg.naturalWidth > 0) {
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      finishExport();
    } else if (qrImg) {
      qrImg.onload = () => {
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        finishExport();
      };
    } else {
      finishExport();
    }
  }
};

window.QrCards = QrCards;
