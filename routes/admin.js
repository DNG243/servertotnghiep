const express = require('express');
const router = express.Router();

const adminController = require('../controller/admin');


// Route để đăng nhập
router.post('/login', adminController.login);

// Route để đăng xuất
router.post('/logout', adminController.logout);

module.exports = router;
