const express = require('express');
const router = express.Router();
const StokBarang = require('../models/stokModel');
const Approval = require('../models/approvalModel');

// Middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Stok barang page - READ untuk semua role yang login
router.get('/barang', requireAuth, (req, res) => {
    StokBarang.getAll((err, results) => {
        if (err) {
            console.error(err);
            return res.render('stok-barang', {
                title: 'Data Stok Barang',
                user: req.session.user,
                stok: [],
                error: 'Gagal memuat data stok',
                success: null
            });
        }
        
        const success = req.query.success || null;
        const error = req.query.error || null;
        
        res.render('stok-barang', {
            title: 'Data Stok Barang',
            user: req.session.user,
            stok: results,
            success: success,
            error: error
        });
    });
});

// Add stok barang
router.post('/barang', requireAuth, (req, res) => {
    const { nama_barang, jumlah, harga, kategori } = req.body;
    const user = req.session.user;
    
    // Validation
    if (!nama_barang || !jumlah || !harga || !kategori) {
        return res.redirect('/stok/barang?error=Semua field wajib diisi');
    }
    
    // Jika admin, langsung create
    if (user.role === 'admin') {
        StokBarang.create({ nama_barang, jumlah, harga, kategori }, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/stok/barang?error=Gagal menambah data');
            }
            res.redirect('/stok/barang?success=Data berhasil ditambahkan');
        });
    } 
    // Jika montir, buat approval request
    else if (user.role === 'montir') {
        const requestData = {
            montir_id: user.id,
            action_type: 'create',
            table_name: 'stok_barang',
            data: { nama_barang, jumlah, harga, kategori }
        };
        
        Approval.createRequest(requestData, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/stok/barang?error=Gagal membuat request approval');
            }
            res.redirect('/stok/barang?success=Request berhasil dikirim, menunggu approval admin');
        });
    }
    // Visitor tidak bisa create
    else {
        res.redirect('/stok/barang?error=Anda tidak memiliki akses untuk menambah data');
    }
});

// Edit stok barang page
router.get('/barang/edit/:id', requireAuth, (req, res) => {
    const user = req.session.user;
    
    // Visitor tidak bisa akses edit page
    if (user.role === 'visitor') {
        return res.redirect('/stok/barang?error=Anda tidak memiliki akses untuk edit data');
    }
    
    const id = req.params.id;
    
    StokBarang.getById(id, (err, barang) => {
        if (err || !barang) {
            console.error(err);
            return res.redirect('/stok/barang?error=Data tidak ditemukan');
        }
        
        res.render('edit-barang', {
            title: 'Edit Stok Barang',
            user: req.session.user,
            barang: barang,
            error: null
        });
    });
});

// Update stok barang
router.post('/barang/edit/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    const { nama_barang, jumlah, harga, kategori } = req.body;
    const user = req.session.user;
    
    // Validation
    if (!nama_barang || !jumlah || !harga || !kategori) {
        return res.redirect(`/stok/barang/edit/${id}?error=Semua field wajib diisi`);
    }
    
    // Jika admin, langsung update
    if (user.role === 'admin') {
        StokBarang.update(id, { nama_barang, jumlah, harga, kategori }, (err) => {
            if (err) {
                console.error(err);
                return res.redirect(`/stok/barang/edit/${id}?error=Gagal mengupdate data`);
            }
            res.redirect('/stok/barang?success=Data berhasil diupdate');
        });
    }
    // Jika montir, buat approval request
    else if (user.role === 'montir') {
        const requestData = {
            montir_id: user.id,
            action_type: 'update',
            table_name: 'stok_barang',
            data: { nama_barang, jumlah, harga, kategori },
            item_id: id
        };
        
        Approval.createRequest(requestData, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/stok/barang?error=Gagal membuat request approval');
            }
            res.redirect('/stok/barang?success=Request update berhasil dikirim, menunggu approval admin');
        });
    }
    // Visitor tidak bisa update
    else {
        res.redirect('/stok/barang?error=Anda tidak memiliki akses untuk update data');
    }
});

// Delete stok barang
router.post('/barang/delete/:id', requireAuth, (req, res) => {
    const id = req.params.id;
    const user = req.session.user;
    
    // Jika admin, langsung delete
    if (user.role === 'admin') {
        StokBarang.delete(id, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/stok/barang?error=Gagal menghapus data');
            }
            res.redirect('/stok/barang?success=Data berhasil dihapus');
        });
    }
    // Jika montir, buat approval request
    else if (user.role === 'montir') {
        const requestData = {
            montir_id: user.id,
            action_type: 'delete',
            table_name: 'stok_barang',
            data: {},
            item_id: id
        };
        
        Approval.createRequest(requestData, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/stok/barang?error=Gagal membuat request approval');
            }
            res.redirect('/stok/barang?success=Request hapus berhasil dikirim, menunggu approval admin');
        });
    }
    // Visitor tidak bisa delete
    else {
        res.redirect('/stok/barang?error=Anda tidak memiliki akses untuk hapus data');
    }
});

module.exports = router;