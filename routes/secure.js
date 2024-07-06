const express = require('express');
const { verifyToken, checkRole } = require('../middlewares/role');

const router = express.Router();

router.get('/admin', verifyToken, checkRole('admin'), (req, res) => {
    res.json({ message: 'Welcome, admin!' });
});

module.exports = router;
