const express = require('express');
const mongoose = require('mongoose');
const path = require('path');



const usersRoutes = require('./routes/user'); //importation de "backend\routes\user.js"
const saucesRoutes = require('./routes/sauce'); //importation de "backend\routes\sauce.js"


mongoose.connect('mongodb+srv://Miralles:MmG00Ds7gxTDpjp6@clusterp6.4zny5ad.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });


app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', usersRoutes);
app.use('/api/sauces', saucesRoutes);


module.exports = app;