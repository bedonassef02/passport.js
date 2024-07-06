const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Token = require('../models/Token');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    User.findOne({ email }).then(user => {
        if (user) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({ name, email, password });
        newUser.save().then(user => res.json(user)).catch(err => console.log(err));
    });
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: info.message });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const newToken = new Token({ userId: user.id, token: refreshToken });
        newToken.save().then(() => {
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
            res.json({ accessToken });
        }).catch(err => console.log(err));
    })(req, res, next);
});

// Token refresh
router.post('/token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    Token.findOne({ token: refreshToken }).then(tokenDoc => {
        if (!tokenDoc) return res.status(403).json({ message: 'Invalid refresh token' });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Invalid refresh token' });

            const accessToken = generateAccessToken(user);
            res.json({ accessToken });
        });
    }).catch(err => console.log(err));
});

// Google OAuth2
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const accessToken = generateAccessToken(req.user);
        const refreshToken = generateRefreshToken(req.user);

        const newToken = new Token({ userId: req.user.id, token: refreshToken });
        newToken.save().then(() => {
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
            res.json({ accessToken });
        }).catch(err => console.log(err));
    }
);

module.exports = router;
