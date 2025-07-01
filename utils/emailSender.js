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
    const qrBuffer = await QRCode.toBuffer(linkQR);

    const mailOptions = {
        from: `"Power11 Registro" <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: 'Tu acceso al evento Power11',
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center;">
                <img src="https://www.nexsysla.com/co/wp-content/uploads/sites/2/2022/06/nexsys-logo-light-2023.png" alt="IBM Logo" style="width: 120px; margin-bottom: 20px;" />
            </div>
            <h2 style="color: #0a2f5c;">Hola ${nombre},</h2>
            <p style="font-size: 16px; color: #333333;">
                🎉 Gracias por registrarte en el evento <strong>Power11</strong>.<br/>
                Presenta el siguiente código QR al ingresar el día <strong>24 de julio</strong>:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <img src="cid:qrimage" alt="Código QR" style="width: 220px;" />
            </div>
            <p style="font-size: 16px; color: #333333;">
                Si tienes alguna duda, puedes responder a este correo.<br/>
                ¡Nos vemos pronto!
            </p>
            <p style="font-size: 16px; color: #0a2f5c; font-weight: bold;">
                — Equipo NEXSYS - IBM
            </p>
            </div>
        </div>
        `,
        attachments: [
            {
                filename: 'qr.png',
                content: qrBuffer,
                cid: 'qrimage'
            }
        ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a ${destinatario}`);
};
