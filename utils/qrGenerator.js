const QRCode = require('qrcode');

exports.generarQR = async (token) => {
  const url = `https://power11-form.onrender.com/api/registro/verificar/${token}`;
  return await QRCode.toDataURL(url);
};
