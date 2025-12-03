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
    // Cek apakah ada parameter signup_success dari query string
    const signupSuccess = req.query.signup_success === 'true';
    
    res.render('login', { 
        title: 'Login',
        user: null,
        error: null,
        signup_success: signupSuccess
    });
});

// Login process with validation
router.post('/login', redirectIfAuth, (req, res) => {
    const { username, password } = req.body;
    
    // Validation: Check if fields are empty
    if (!username || !password) {
        return res.render('login', {
            title: 'Login',
            user: null,
            error: 'Username dan password wajib diisi!',
            signup_success: false
        });
    }

    // Validation: Check minimum length
    if (username.trim().length < 3) {
        return res.render('login', {
            title: 'Login',
            user: null,
            error: 'Username minimal 3 karakter!',
            signup_success: false
        });
    }

    if (password.length < 5) {
        return res.render('login', {
            title: 'Login',
            user: null,
            error: 'Password minimal 5 karakter!',
            signup_success: false
        });
    }
    
    // Find user in database
    User.findByUsername(username, (err, user) => {
        if (err) {
            console.error(err);
            return res.render('login', {
                title: 'Login',
                user: null,
                error: 'Terjadi kesalahan sistem',
                signup_success: false
            });
        }
        
        if (!user || !User.verifyPassword(password, user.password)) {
            return res.render('login', {
                title: 'Login',
                user: null,
                error: 'Username atau password salah!',
                signup_success: false
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

// ========== SIGNUP ROUTES ==========

// Signup page
router.get('/signup', redirectIfAuth, (req, res) => {
    res.render('signup', { 
        title: 'Sign Up',
        user: null,
        error: null,
        success: null
    });
});

// Signup process with validation
router.post('/signup', redirectIfAuth, (req, res) => {
    const { username, password, retype_password } = req.body;
    
    // Validation 1: Check if all fields are filled
    if (!username || !password || !retype_password) {
        return res.render('signup', {
            title: 'Sign Up',
            user: null,
            error: 'Semua field wajib diisi!',
            success: null
        });
    }

    // Validation 2: Username minimum 3 characters
    if (username.trim().length < 3) {
        return res.render('signup', {
            title: 'Sign Up',
            user: null,
            error: 'Username minimal 3 karakter!',
            success: null
        });
    }

    // Validation 3: Username only alphanumeric and underscore
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return res.render('signup', {
            title: 'Sign Up',
            user: null,
            error: 'Username hanya boleh huruf, angka, dan underscore!',
            success: null
        });
    }

    // Validation 4: Password minimum 5 characters
    if (password.length < 5) {
        return res.render('signup', {
            title: 'Sign Up',
            user: null,
            error: 'Password minimal 5 karakter!',
            success: null
        });
    }

    // Validation 5: Password must match retype password
    if (password !== retype_password) {
        return res.render('signup', {
            title: 'Sign Up',
            user: null,
            error: 'Password dan Retype Password tidak cocok!',
            success: null
        });
    }

    // Validation 6: Check if username already exists
    User.checkUsernameExists(username, (err, exists) => {
        if (err) {
            console.error(err);
            return res.render('signup', {
                title: 'Sign Up',
                user: null,
                error: 'Terjadi kesalahan sistem',
                success: null
            });
        }

        if (exists) {
            return res.render('signup', {
                title: 'Sign Up',
                user: null,
                error: 'Username sudah digunakan! Silakan pilih username lain.',
                success: null
            });
        }

        // All validations passed - Create new user
        User.createUser({ username, password }, (err, result) => {
            if (err) {
                console.error(err);
                return res.render('signup', {
                    title: 'Sign Up',
                    user: null,
                    error: 'Gagal membuat akun. Silakan coba lagi.',
                    success: null
                });
            }

            // Signup successful - render page dengan success message
            // Tidak redirect langsung, biarkan JavaScript handle redirect
            res.render('signup', {
                title: 'Sign Up',
                user: null,
                error: null,
                success: 'Akun berhasil dibuat! Anda akan diarahkan ke halaman login dalam 3 detik...'
            });
        });
    });
});

module.exports = router;