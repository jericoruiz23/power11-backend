require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const registroRoutes = require('./routes/registroRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/registro', registroRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(process.env.PORT, () => {
      console.log(`Servidor conectado en el puerto: ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('Error conectando a MongoDB', err));
