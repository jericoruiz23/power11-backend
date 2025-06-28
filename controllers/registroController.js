const Registro = require('../models/Registro');
const { v4: uuidv4 } = require('uuid');
const { generarQR } = require('../utils/qrGenerator');

const BASE_URL = 'https://power11-form.onrender.com/api/verificar'; // asegúrate de que coincida con tu dominio real

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
                        <h1 style="color: red;">❌ QR no válido o no registrado.</h1>
                    </body>
                </html>
            `);
        }

        if (usuario.estado === 'inactivo') {
            return res.send(`
                <html>
                    <head><title>Ya ingresado</title></head>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1 style="color: orange;">⚠️ ${usuario.nombre} ya ingresó al evento.</h1>
                        <p>Fecha de ingreso: ${new Date(usuario.fechaIngreso || usuario.updatedAt).toLocaleString()}</p>
                    </body>
                </html>
            `);
        }

        // Primera vez que se escanea: registrar ingreso
        usuario.estado = 'inactivo';
        usuario.fechaIngreso = new Date();
        await usuario.save();

        return res.send(`
            <html>
                <head><title>Acceso registrado</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: green;">✅ ¡Bienvenido ${usuario.nombre}!</h1>
                    <p>Tu ingreso ha sido registrado con éxito el ${new Date(usuario.fechaIngreso).toLocaleString()}</p>
                </body>
            </html>
        `);

        

    } catch (error) {
        console.error('Error verificando QR:', error);
        return res.send(`
            <html>
                <head><title>Error</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: red;">❌ Error al verificar QR.</h1>
                    <p>Intenta nuevamente más tarde.</p>
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
