const express = require('express');
const router = express.Router();
const StokBarang = require('../models/stokModel');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Laporan page
router.get('/', requireAuth, (req, res) => {
    const { kategori } = req.query;
    
    StokBarang.getByKategori(kategori, (err, results) => {
        if (err) {
            console.error(err);
            return res.render('laporan', {
                title: 'Laporan Stok Barang',
                user: req.session.user,
                stok: [],
                kategori: kategori || 'all',
                error: 'Gagal memuat data laporan'
            });
        }
        
        res.render('laporan', {
            title: 'Laporan Stok Barang',
            user: req.session.user,
            stok: results,
            kategori: kategori || 'all',
            error: null
        });
    });
});

module.exports = router;