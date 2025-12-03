const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

// Middleware to redirect if already logged in
const redirectIfAuth = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};

// Login page
router.get('/login', redirectIfAuth, (req, res) => {
    res.render('login', { 
        title: 'Login',
        user: null,
        error: null 
    });
});

// Login process
router.post('/login', redirectIfAuth, (req, res) => {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
        return res.render('login', {
            title: 'Login',
            user: null,
            error: 'Username dan password wajib diisi!'
        });
    }
    
    User.findByUsername(username, (err, user) => {
        if (err) {
            console.error(err);
            return res.render('login', {
                title: 'Login',
                user: null,
                error: 'Terjadi kesalahan sistem'
            });
        }
        
        if (!user || !User.verifyPassword(password, user.password)) {
            return res.render('login', {
                title: 'Login',
                user: null,
                error: 'Username atau password salah!'
            });
        }
        
        // Set session
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        
        res.redirect('/');
    });
});

module.exports = router;