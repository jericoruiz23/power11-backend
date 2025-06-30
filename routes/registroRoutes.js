const express = require('express');
const router = express.Router();
const { registrarUsuario, verificarQR, obtenerRegistros, eliminarRegistro, enviarCorreoQR } = require('../controllers/registroController');

router.post('/', registrarUsuario);
router.get('/verificar/:token', verificarQR);
router.get('/', obtenerRegistros);
router.delete('/:id', eliminarRegistro);
router.post('/registro/enviar-masivo', enviarQRsMasivo); // ✅ único endpoint de envío de correos




module.exports = router;
