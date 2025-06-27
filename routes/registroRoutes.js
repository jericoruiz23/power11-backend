const express = require('express');
const router = express.Router();
const { registrarUsuario, verificarQR, obtenerRegistros, eliminarRegistro } = require('../controllers/registroController');

router.post('/', registrarUsuario);
router.get('/verificar/:token', verificarQR);
router.get('/', obtenerRegistros);
router.delete('/:id', eliminarRegistro);

module.exports = router;
