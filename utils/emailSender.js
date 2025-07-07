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
        <div style="background-color: #f2f3f8; font-family: 'Roboto', Arial, sans-serif; padding: 50px 20px;">
            <div
                style="max-width: 620px; margin: auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.08); overflow: hidden;">

                <!-- Encabezado visual -->
                <div style="background: linear-gradient(90deg, #0a2f5c, #1d71b8); text-align: center; padding: 40px 30px 30px;">

                    <!-- Contenedor para los logos en fila -->
                    <div
                        style="display: flex; justify-content: center; align-items: center; gap: 30px; flex-wrap: wrap; margin-bottom: 20px;">
                        <img src="https://www.nexsysla.com/co/wp-content/uploads/sites/2/2022/06/nexsys-logo-light-2023.png"
                            alt="Logo Nexsys" style="width: 130px;" />

                        <img src="https://pngimg.com/d/ibm_PNG19649.png" alt="Logo IBM" style="width: 100px;" />
                    </div>

                    <!-- Texto debajo de las imágenes -->
                    <h1 style="margin: 0; font-size: 24px; color: #fff; font-weight: 600;">
                        ¡Tu invitación al Evento Power11 está Lista!
                    </h1>
                </div>

                <!-- Cuerpo del contenido con fondo blanco asegurado -->
                <div style="padding: 30px; background-color: #ffffff;">
                    <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                        👋 Hola <strong>${nombre}</strong>,<br /><br />
                        Has sido registrado exitosamente al evento <strong>Power11</strong> de IBM y Nexsys.
                        Presenta el siguiente código QR el día <strong>24 de julio</strong> para ingresar al evento.
                    </p>

                    <!-- QR -->
                    <div style="text-align: center; margin: 30px 0;">
                        <img src="cid:qrimage" alt="Código QR" style="width: 220px;" />
                        <p style="font-size: 14px; color: #555; margin-top: 10px;">
                            Escanea este código para verificar tu entrada
                        </p>
                    </div>

                    <!-- Declaraciones -->
                    <div style="background-color: #f8f9fb; border-left: 4px solid #004080; padding: 20px; font-size: 10px; color: #444; border-radius: 8px;">
                        <p style="margin: 0;">
                            <b>Cláusula de Confidencialidad:</b> Este mensaje es confidencial y dirigido exclusivamente a su destinatario. Si usted no lo es, elimínelo 
                            y notifique al remitente. Nexsys del Ecuador no se responsabiliza por el uso indebido de la información. Conforme a la Ley Orgánica de 
                            Protección de Datos, Nexsys del Ecuador puede realizar transferencias internacionales de datos por el uso de sistemas con almacenamiento 
                            externo, así como transferencias a terceros para servicios como facturación, despacho, notificación, marketing, entre otros. En Nexsys del 
                            Ecuador estamos comprometidos con la protección de su información y privacidad.
                        </p>
                    </div>

                    <!-- CTA -->
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.ibm.com/events/power11"
                            style="display: inline-block; background-color: #004080; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                            Ver detalles del evento
                        </a>
                    </div>

                    <!-- Firma -->
                    <p style="text-align: right; color: #004080; font-weight: bold; margin: 0;">
                        Equipo NEXSYS - IBM
                    </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f2f3f8; text-align: center; font-size: 12px; color: #888; padding: 15px;">
                    Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.
                </div>
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
