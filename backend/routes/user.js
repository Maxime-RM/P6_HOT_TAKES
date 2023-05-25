const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');
const passwordValidation = require("../middleware/password_validation")
const emailValidation = require("../middleware/email_validation")

router.post('/signup', passwordValidation,emailValidation, userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;