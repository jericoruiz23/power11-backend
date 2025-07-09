const Registro = require('../models/Registro');
const { v4: uuidv4 } = require('uuid');
const { generarQR } = require('../utils/qrGenerator');
const { enviarCorreoConQR } = require('../utils/emailSender');

const BASE_URL = 'https://power11-form.onrender.com/api/registro/verificar'; // asegúrate de que coincida con tu dominio real

// CREAR USUARIO
exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, cedula, empresa, cargo, partner, celular } = req.body;

        // Validar que no exista ya el email o cédula
        const existente = await Registro.findOne({
            $or: [
                { email: email },
                { cedula: cedula }
            ]
        });

        if (existente) {
            return res.status(400).json({
                error: 'El correo o la cédula ya están registrados.'
            });
        }

        const token = uuidv4();
        const nuevoRegistro = new Registro({
            nombre,
            email,
            cedula,
            empresa,
            cargo,
            partner,
            celular,
            token,
            nuevo: true,
            fechaIngreso: new Date()
        });

        await nuevoRegistro.save();

        // Generar QR con la URL completa
        const qrURL = `${BASE_URL}/${token}`;
        const qrImage = await generarQR(qrURL);

        res.status(201).json({ mensaje: 'Registro exitoso.', token, qrImage });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};
// VERIFICAR QR
exports.verificarQR = async (req, res) => {
    try {
        const secretHeader = req.headers['x-app-secret'];
        const SECRET = process.env.APP_SECRET || 'un-secreto-muy-fuerte-que-no-vas-a-compartir';

        if (!secretHeader || secretHeader !== SECRET) {
            return res.status(403).send(`
                <html>
                  <head><title>Acceso denegado</title></head>
                  <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: red;">❌ Acceso no autorizado</h1>
                    <p>No tienes permiso para acceder a esta página.</p>
                  </body>
                </html>
            `);
        }

        const { token } = req.params;
        const usuario = await Registro.findOne({ token });

        if (!usuario) {
            return res.send(`
                <html>
                  <head><title>QR inválido</title></head>
                  <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: red;">❌ QR no válido</h1>
                    <p>Este código no está registrado en la base de datos.</p>
                  </body>
                </html>
            `);
        }

        let mensaje = '';
        let color = '';
        let yaIngresado = false;

        if (usuario.estado === 'inactivo') {
            yaIngresado = true;
            mensaje = `⚠️ ${usuario.nombre} ya ingresó al evento.`;
            color = 'orange';
        } else {
            // Registrar ingreso
            usuario.estado = 'inactivo';
            const utcMinus5 = new Date(new Date().getTime() - 5 * 60 * 60 * 1000);
            usuario.fechaIngreso = utcMinus5;
            await usuario.save();
            mensaje = `✅ Ingreso registrado exitosamente.`;
            color = 'green';
        }

        return res.send(`
            <html>
                <head>
                    <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f7f7f7;
                        padding: 40px 20px;
                        max-width: 600px;
                        margin: 30px auto;
                        border-radius: 12px;
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                        color: #333;
                    }
                    h1 {
                        color: ${color};
                        text-align: center;
                        font-weight: 700;
                        margin-bottom: 24px;
                    }
                    hr {
                        border: none;
                        border-top: 1px solid #ddd;
                        margin-bottom: 24px;
                    }
                    .info p {
                        font-size: 16px;
                        line-height: 1.5;
                        margin: 8px 0;
                    }
                    .info strong {
                        color: #555;
                        width: 120px;
                        display: inline-block;
                    }
                    /* Para el estado, un estilo especial */
                    .estado {
                        font-weight: 600;
                        color: ${yaIngresado ? '#e67e22' : '#27ae60'};
                        margin-top: 16px;
                    }
                    </style>
                </head>
                <body>
                    <h1>${mensaje}</h1>
                    <hr />
                    <div class="info">
                    <p><strong>Nombre:</strong> ${usuario.nombre}</p>
                    <p><strong>Cédula:</strong> ${usuario.cedula}</p>
                    <p><strong>Empresa:</strong> ${usuario.empresa}</p>
                    <p><strong>Cargo:</strong> ${usuario.cargo}</p>
                    <p><strong>Email:</strong> ${usuario.email}</p>
                    <p><strong>BP:</strong> ${usuario.partner}</p>
                    <p><strong>Fecha de ingreso:</strong> ${(usuario.fechaIngreso || new Date()).toLocaleString()}</p>
                    <p class="estado"><strong>Estado:</strong> ${yaIngresado ? 'Ya ingresó' : 'Ingreso registrado'}</p>
                    </div>
                </body>
                </html>

        `);
    } catch (error) {
        console.error('Error verificando QR:', error);
        return res.send(`
            <html>
              <head><title>Error</title></head>
              <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: red;">❌ Error al verificar QR</h1>
                <p>Por favor intenta nuevamente más tarde.</p>
              </body>
            </html>
        `);
    }
};

// OBTENER TODOS
exports.obtenerRegistros = async (req, res) => {
    try {
        const registros = await Registro.find().sort({ createdAt: -1 });
        res.status(200).json(registros);
    } catch (error) {
        console.error('Error obteniendo registros:', error);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
};

// ELIMINAR
exports.eliminarRegistro = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Registro.findByIdAndDelete(id);

        if (!eliminado) {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }

        res.status(200).json({ mensaje: 'Registro eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando registro:', error);
        res.status(500).json({ error: 'Error al eliminar registro' });
    }
};

// ENVIO MASIVO
exports.enviarQRsMasivo = async (req, res) => {
    try {
        const registros = await Registro.find({
            email: { $exists: true, $ne: '' },
            token: { $exists: true, $ne: '' },
            correoEnviado: false // solo a los que aún no se ha enviado
        });

        let enviados = 0;

        for (const usuario of registros) {
            try {
                await enviarCorreoConQR({
                    destinatario: usuario.email,
                    nombre: usuario.nombre,
                    token: usuario.token
                });

                // Marca como enviado
                await Registro.findByIdAndUpdate(usuario._id, { correoEnviado: true });

                enviados++;
            } catch (error) {
                console.error(`❌ Error enviando a ${usuario.email}:`, error.message);
            }
        }

        res.status(200).json({ mensaje: `Correos enviados: ${enviados}/${registros.length}` });
    } catch (error) {
        console.error('❌ Error en envío masivo:', error);
        res.status(500).json({ error: 'Error al enviar correos masivos' });
    }
};

//INGESTA MASIVA EXCEL
exports.ingestaMasiva = async (req, res) => {
    try {
        const registros = req.body;

        if (!Array.isArray(registros)) {
            return res.status(400).json({ error: 'Se esperaba un array de registros.' });
        }

        const resultados = {
            insertados: 0,
            duplicadosLocales: [],
            duplicadosEnBD: [],
        };

        const seen = new Set();
        const unicos = [];

        for (const reg of registros) {
            const clave = `${reg.email?.toLowerCase()}-${reg.cedula}`;
            if (seen.has(clave)) {
                resultados.duplicadosLocales.push(reg);
            } else {
                seen.add(clave);
                unicos.push(reg);
            }
        }

        for (const reg of unicos) {
            const existe = await Registro.findOne({
                $or: [
                    { email: reg.email?.toLowerCase() },
                    { cedula: reg.cedula }
                ]
            });

            if (existe) {
                resultados.duplicadosEnBD.push(reg);
                continue;
            }

            const token = uuidv4();
            const nuevo = new Registro({
                nombre: reg.nombre,
                email: reg.email,
                cedula: reg.cedula,
                empresa: reg.empresa,
                cargo: reg.cargo,
                token,
                nuevo: false
            });

            await nuevo.save();
            resultados.insertados++;
        }

        return res.status(200).json(resultados);
    } catch (error) {
        console.error('Error en ingesta masiva:', error);
        res.status(500).json({ error: 'Error en ingesta masiva' });
    }
};

//INSIGHTS
exports.obtenerInsights = async (req, res) => {
    try {
        const registros = await Registro.find();

        const totalRegistrados = registros.length;
        const totalAsistentes = registros.filter(r => r.estado === 'inactivo').length;
        const nuevos = registros.filter(r => r.nuevo === true).length;

        const porcentajeAsistencia =
            totalRegistrados > 0
                ? ((totalAsistentes * 100) / totalRegistrados).toFixed(2)
                : 0;

        return res.json({
            totalRegistrados,
            totalAsistentes,
            porcentajeAsistencia: Number(porcentajeAsistencia),
            nuevos
        });
    } catch (error) {
        console.error('Error al obtener insights:', error);
        return res.status(500).json({ error: 'Error al obtener métricas' });
    }
};
