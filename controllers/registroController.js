const Registro = require('../models/Registro');
const { v4: uuidv4 } = require('uuid');
const { generarQR } = require('../utils/qrGenerator');
const { enviarCorreoConQR } = require('../utils/emailSender');


const BASE_URL = 'https://power11-form.onrender.com/api/registro/verificar'; // asegúrate de que coincida con tu dominio real

// REGISTRO
exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, cedula, empresa, cargo } = req.body;
        const token = uuidv4();

        const nuevoRegistro = new Registro({ nombre, email, cedula, empresa, cargo, token });
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
        <head><title>Validación de QR</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: auto; background-color: #f7f7f7; border-radius: 10px;">
          <h1 style="color: ${color}; text-align: center;">${mensaje}</h1>
          <hr/>
          <div style="font-size: 16px; color: #333;">
            <p><strong>Nombre:</strong> ${usuario.nombre}</p>
            <p><strong>Cédula:</strong> ${usuario.cedula}</p>
            <p><strong>Empresa:</strong> ${usuario.empresa}</p>
            <p><strong>Cargo:</strong> ${usuario.cargo}</p>
            <p><strong>Email:</strong> ${usuario.email}</p>
            <p><strong>Fecha de ingreso:</strong> ${new Date(usuario.fechaIngreso || usuario.updatedAt).toLocaleString()}</p>
            <p><strong>Estado:</strong> ${yaIngresado ? 'Ya ingresó' : 'Ingreso registrado'}</p>
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
                token
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

