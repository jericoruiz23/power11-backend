const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    cedula: String,
    empresa: String,
    cargo: String,
    token: String,
    estado: { type: String, default: 'activo' },
    fechaIngreso: Date,
}, { timestamps: true });

module.exports = mongoose.model('Registro', RegistroSchema);
