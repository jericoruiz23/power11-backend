const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

// Configura tu correo Outlook
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="background-color: #f2f3f8; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table role="presentation" width="620" cellpadding="0" cellspacing="0" bgcolor="#ffffff"
                        style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); font-family: Arial, sans-serif; border-collapse: separate; border-spacing: 0;">
                        <tr>
                            <td
                                style="padding: 40px 30px 30px 20px; text-align: center; border-top-left-radius: 16px; border-top-right-radius: 16px;">
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="padding-bottom: 20px;">
                                            <div style="display: flex; align-items: center; justify-content: center;">
                                                <img src="https://www.nexsysla.com/co/wp-content/uploads/sites/2/2022/06/nexsys-logo-light-2023.png"
                                                    alt="Logo Nexsys" style="width: 130px; display: inline-block;" />
                                                <span style="display:inline-block; width:30px;"></span>
                                                <img src="https://myleanacademy.com/wp-content/uploads/2020/01/logo-ibm-png-ibm-logo-png-4464.png"
                                                    alt="Logo IBM" style="width: 100px; display: inline-block;" />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding-top: 25px; padding-bottom: 5px;">
                                            <p style="color: #005bb6; font-size: 24px; font-weight: 600; margin: 0;">
                                                ¡Tu entrada al Evento Power11 está Lista!
                                            </p>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px; background-color: #ffffff; color: #000000;">
                                <p style="font-size: 16px; margin: 0 0 20px;">
                                    👋 Hola <strong>${nombre}</strong>,<br /><br />
                                    Ha sido generado exitosamente tu invitación al evento <strong>Power11</strong> de IBM y Nexsys.<br />
                                    Presenta el siguiente código QR el día <strong>24 de julio</strong> para ingresar al evento.
                                </p>

                                <div style="text-align: center; margin: 30px 0;">
                                    <img src="cid:qrimage" alt="Código QR" style="width: 220px;" />
                                    <p style="font-size: 14px; color: #555; margin-top: 10px;">Escanea este código para
                                        verificar tu entrada</p>
                                </div>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="https://www.ibm.com/events/power11"
                                        style="display: inline-block; background-color: #004080; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                                        Ver detalles del evento
                                    </a>
                                </div>
                                <p style="text-align: right; color: #004080; font-weight: bold; margin: 0; padding-bottom: 10px; padding-right: 5px;">
                                    Equipo NEXSYS - IBM
                                </p>
                                <div
                                    style="background-color: #f8f9fb; border-left: 4px solid #004080; padding: 20px; font-size: 10px; color: #444; border-radius: 8px;">
                                    <p style="margin: 0;">
                                        <b>Cláusula de Confidencialidad:</b> Este mensaje es confidencial y dirigido
                                        exclusivamente a su destinatario. Si usted no lo es, elimínelo
                                        y notifique al remitente. Nexsys del Ecuador no se responsabiliza por el uso indebido de
                                        la información. Conforme a la Ley Orgánica de
                                        Protección de Datos, Nexsys del Ecuador puede realizar transferencias internacionales de
                                        datos por el uso de sistemas con almacenamiento
                                        externo, así como transferencias a terceros para servicios como facturación, despacho,
                                        notificación, marketing, entre otros. En Nexsys del
                                        Ecuador estamos comprometidos con la protección de su información y privacidad.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td
                                style="background-color: #f2f3f8; text-align: center; font-size: 12px; color: #888; padding: 15px; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
                                Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
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
