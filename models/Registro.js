const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  cedula: String,
  empresa: String,   
  cargo: String,     
  token: String,
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registro', registroSchema);
