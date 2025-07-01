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
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px;">
        <div style="text-align: center;">
          <img src="cid:qrimage" alt="Código QR" style="width: 220px;" />
        </div>
        <h2>Hola ${nombre},</h2>
        <p>Gracias por registrarte en el evento Power11.<br/>
        Presenta el siguiente código QR al ingresar el día <strong>24 de julio</strong>.</p>
        <p>Equipo NEXSYS - IBM</p>
      </div>
    </div>
  `,
        attachments: [
            {
                filename: 'qr.png',
                content: qrBuffer,
                cid: 'qrimage' // Esto es lo que enlaza con src="cid:qrimage"
            }
        ]
    };


    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a ${destinatario}`);
};
