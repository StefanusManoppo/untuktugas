const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'bengkel-lam-jaya-motor-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
const db = require('./models/db');

// Routes
const authRoutes = require('./routes/auth');
const stokRoutes = require('./routes/stok');
const financeRoutes = require('./routes/finance');
const approvalRoutes = require('./routes/approval');

app.use('/', authRoutes);
app.use('/stok', stokRoutes);
app.use('/laporan', financeRoutes);
app.use('/approval', approvalRoutes);

// ===== MIDDLEWARE FUNCTIONS =====

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware untuk admin only
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).render('error', {
            title: 'Access Denied',
            user: req.session.user,
            message: 'Anda tidak memiliki akses ke halaman ini. Hanya Admin yang diizinkan.'
        });
    }
};

// Middleware untuk admin dan montir
const requireAdminOrMontir = (req, res, next) => {
    if (req.session.user && (req.session.user.role === 'admin' || req.session.user.role === 'montir')) {
        next();
    } else {
        res.status(403).render('error', {
            title: 'Access Denied',
            user: req.session.user,
            message: 'Anda tidak memiliki akses ke halaman ini.'
        });
    }
};

// Middleware to redirect if already logged in
const redirectIfAuth = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};

// ===== ROUTES =====

// Home route - Conditional access based on role
app.get('/', (req, res) => {
    if (!req.session.user) {
        // Public view
        res.render('index', { 
            title: 'Bengkel Lam Jaya Motor',
            user: null
        });
    } else {
        // Dashboard berdasarkan role
        switch (req.session.user.role) {
            case 'admin':
                res.render('dashboard-admin', {
                    title: 'Dashboard Admin',
                    user: req.session.user
                });
                break;
            case 'montir':
                res.render('dashboard-montir', {
                    title: 'Dashboard Montir',
                    user: req.session.user
                });
                break;
            case 'visitor':
                res.render('dashboard-visitor', {
                    title: 'Dashboard Visitor',
                    user: req.session.user
                });
                break;
            default:
                res.redirect('/login');
        }
    }
});

// About Us route - Public only
app.get('/about', redirectIfAuth, (req, res) => {
    res.render('about', { 
        title: 'About Us - Bengkel Lam Jaya Motor',
        user: null
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        user: req.session.user || null,
        message: 'Halaman yang Anda cari tidak ditemukan.'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log('Bengkel Lam Jaya Motor - Specialist Tune Up');
    console.log('Default Login Credentials:');
    console.log('Admin: admin/12345');
    console.log('Montir: montir/montir123');
    console.log('Visitor: visitor/visitor123');
});