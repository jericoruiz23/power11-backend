const QRCode = require('qrcode');

exports.generarQR = async (texto) => {
  return await QRCode.toDataURL(texto);
};
