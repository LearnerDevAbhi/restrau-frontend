/**
 * Builds a printable table card (PNG) on a canvas: restaurant name, table
 * number, the QR code and bilingual "scan to order" instructions.
 */
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export async function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadTableCard({ qrDataUrl, restaurantName, tableLabel, tableName, lineEn, lineHi, filename }) {
  await document.fonts?.ready;
  const W = 1200;
  const H = 1700;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, W, H);

  // Header band
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(0, 0, W, 260);
  ctx.fillStyle = '#fff6ef';
  ctx.textAlign = 'center';
  ctx.font = '600 72px Fraunces, Mukta, Georgia, serif';
  ctx.fillText(restaurantName, W / 2, 160, W - 120);

  // Table number
  ctx.fillStyle = '#1f1a17';
  ctx.font = '700 120px Fraunces, Mukta, Georgia, serif';
  ctx.fillText(tableLabel, W / 2, 440, W - 120);
  if (tableName) {
    ctx.fillStyle = '#6f655d';
    ctx.font = '500 44px Inter, Mukta, sans-serif';
    ctx.fillText(tableName, W / 2, 510, W - 120);
  }

  // QR
  const qr = await loadImage(qrDataUrl);
  const size = 820;
  const x = (W - size) / 2;
  const y = 570;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ebe3d9';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x - 30, y - 30, size + 60, size + 60, 36);
  ctx.fill();
  ctx.stroke();
  ctx.drawImage(qr, x, y, size, size);

  // Instructions
  ctx.fillStyle = '#1f1a17';
  ctx.font = '600 50px Inter, Mukta, sans-serif';
  ctx.fillText(lineEn, W / 2, 1540, W - 120);
  ctx.fillStyle = '#6f655d';
  ctx.font = '500 46px Mukta, sans-serif';
  ctx.fillText(lineHi, W / 2, 1615, W - 120);

  await downloadDataUrl(canvas.toDataURL('image/png'), filename);
}
