const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

const BASE_URL = 'https://power11-form.onrender.com/api/registro/verificar';
const LOGO_PATH = path.join(__dirname, './abeja.svg'); // asegúrate de que este SVG tenga width/height válidos

exports.generarQR = async (token) => {
  const canvasSize = 500;
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');

  const url = `${BASE_URL}/${token}`;

  // Generar el QR en el canvas
  await QRCode.toCanvas(canvas, url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: canvasSize,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  // Cargar el logo
  const logo = await loadImage(LOGO_PATH);

  // Configurar dimensiones
  const logoSize = canvasSize * 0.2;
  const logoRadius = logoSize / 2;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;

  // Fondo blanco circular
  ctx.beginPath();
  ctx.arc(centerX, centerY, logoRadius + 8, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Clip circular
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, logoRadius, 0, Math.PI * 2);
  ctx.clip();

  // Dibujar logo más pequeño
  const abejaEscala = 0.6;
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

  // Devolver como Data URL base64
  return canvas.toDataURL('image/png');
};
