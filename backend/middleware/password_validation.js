const passwordSchema = require('../models/Password');

module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        res.status(400).json({ message: 'Le mot de passe doit faire au moins 8 caractères et contenir au moins 1 majuscule et 1 chiffre.' });
    } else {
        next();
    }
};