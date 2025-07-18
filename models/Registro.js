const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    cedula: String,
    empresa: String,
    celular: String,
    cargo: String,
    partner: String,
    token: String,
    estado: { type: String, default: 'activo' },
    fechaIngreso: Date,
    correoEnviado: {
        type: Boolean,
        default: false
    },
    nuevo: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Registro', RegistroSchema);
