const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

const BASE_URL = 'https://power11-form.onrender.com/api/registro/verificar';
const LOGO_PATH = path.join(__dirname, './abeja.svg');

exports.generarQR = async (token) => {
  const canvasSize = 500;
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');

  const url = `${BASE_URL}/${token}`;

  // Generar QR
  await QRCode.toCanvas(canvas, url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: canvasSize,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  // Cargar logo SVG
  const logo = await loadImage(LOGO_PATH);

  // Dimensiones del logo y círculo blanco de fondo
  const logoSize = canvasSize * 0.18;  // un poco más pequeño para que no tape mucho QR
  const logoRadius = logoSize / 2;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;

  // Fondo blanco circular con margen para el logo
  ctx.beginPath();
  ctx.arc(centerX, centerY, logoRadius + 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Clip circular para que el logo quede recortado
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, logoRadius, 0, Math.PI * 2);
  ctx.clip();

  // Dibujar el logo escalado y centrado
  const abejaEscala = 0.7;  // Escala dentro del círculo, para no llenarlo completamente
  const abejaSize = logoSize * abejaEscala;
  const abejaOffset = abejaSize / 2;

  ctx.drawImage(
    logo,
    centerX - abejaOffset,
    centerY - abejaOffset,
    abejaSize,
    abejaSize
  );

  ctx.restore();

  // Devolver la imagen como base64
  return canvas.toDataURL('image/png');
};
