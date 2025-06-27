const Registro = require('../models/Registro');
const { v4: uuidv4 } = require('uuid');
const { generarQR } = require('../utils/qrGenerator');
// const { enviarCorreo } = require('../utils/emailSender'); // Comenta esta línea

exports.registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, cedula, empresa, cargo } = req.body;
        const token = uuidv4();

        const nuevoRegistro = new Registro({ nombre, email, cedula, empresa, cargo, token });
        await nuevoRegistro.save();

        // Generar QR solo con el token, sin URL delante
        const qrImage = await generarQR(token);

        res.status(201).json({ mensaje: 'Registro exitoso.', token, qrImage });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};




exports.verificarQR = async (req, res) => {
    try {
        const { token } = req.params;
        const usuario = await Registro.findOne({ token });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'QR no válido o no registrado.' });
        }

        if (usuario.estado === 'inactivo') {
            return res.status(200).json({
                mensaje: `Este usuario ya ingresó al evento.`,
                nombre: usuario.nombre,
                estado: usuario.estado,
                fechaIngreso: usuario.fechaIngreso || usuario.updatedAt
            });
        }

        // Primera vez que lo escanea
        usuario.estado = 'inactivo';
        usuario.fechaIngreso = new Date();
        await usuario.save();

        return res.status(200).json({
            mensaje: `Bienvenido ${usuario.nombre}, acceso registrado.`,
            nombre: usuario.nombre,
            estado: usuario.estado,
            fechaIngreso: usuario.fechaIngreso
        });

    } catch (error) {
        console.error('Error verificando QR:', error);
        res.status(500).json({ error: 'Error al verificar QR' });
    }
};

exports.obtenerRegistros = async (req, res) => {
    try {
        const registros = await Registro.find().sort({ fechaRegistro: -1 }); // más recientes primero
        res.status(200).json(registros);
    } catch (error) {
        console.error('Error obteniendo registros:', error);
        res.status(500).json({ error: 'Error al obtener registros' });
    }
};

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


