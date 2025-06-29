const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

// Configura tu correo Outlook
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, // tu correo outlook
        pass: process.env.EMAIL_PASS  // tu contraseña o app password
    }
});

exports.enviarCorreoConQR = async ({ destinatario, nombre, token }) => {
    const linkQR = `https://power11-form.onrender.com/api/registro/verificar/${token}`;
    const qrDataURL = await QRCode.toDataURL(linkQR);

    const mailOptions = {
        from: `"Power11 Registro" <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: 'Tu acceso al evento Power11',
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Hola ${nombre},</h2>
                <p>Gracias por registrarte. Presenta el siguiente código QR al ingresar al evento el <strong>24 de julio</strong>:</p>
                <img src="${qrDataURL}" alt="Código QR" style="width: 200px; margin: 20px 0;" />
                <p>Nos vemos pronto,<br/>Equipo Power11</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a ${destinatario}`);
};
