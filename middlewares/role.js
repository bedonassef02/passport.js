const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access token is missing or invalid' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid access token' });

        req.user = user;
        next();
    });
};

const checkRole = (role) => {
    return (req, res, next) => {
        User.findById(req.user.id).then(user => {
            if (!user) return res.status(404).json({ message: 'User not found' });
            if (user.role !== role) return res.status(403).json({ message: 'Insufficient privileges' });

            next();
        }).catch(err => console.log(err));
    };
};

module.exports = { verifyToken, checkRole };
