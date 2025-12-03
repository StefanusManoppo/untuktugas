const express = require('express');
const router = express.Router();
const Finance = require('../models/financeModel');
const Approval = require('../models/approvalModel');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Pemasukan Page - Semua role bisa akses (READ)
router.get('/pemasukan', requireAuth, (req, res) => {
    Finance.getAllPemasukan((err, results) => {
        if (err) {
            console.error(err);
            return res.render('pemasukan', {
                title: 'Laporan Pemasukan',
                user: req.session.user,
                pemasukan: [],
                total: 0,
                error: 'Gagal memuat data pemasukan'
            });
        }
        
        Finance.getTotalPemasukan((err, totalResult) => {
            const total = totalResult[0]?.total || 0;
            
            res.render('pemasukan', {
                title: 'Laporan Pemasukan',
                user: req.session.user,
                pemasukan: results,
                total: total,
                success: req.query.success,
                error: req.query.error
            });
        });
    });
});

// Add Pemasukan - Admin langsung, Montir pakai approval, Visitor tidak bisa
router.post('/pemasukan', requireAuth, (req, res) => {
    const { deskripsi, nominal } = req.body;
    const tanggal = new Date().toISOString().split('T')[0];
    const user = req.session.user;
    
    if (!deskripsi || !nominal) {
        return res.redirect('/laporan/pemasukan?error=Deskripsi dan nominal wajib diisi');
    }
    
    // Admin langsung create
    if (user.role === 'admin') {
        Finance.addPemasukan({ tanggal, deskripsi, nominal }, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/laporan/pemasukan?error=Gagal menambah data pemasukan');
            }
            res.redirect('/laporan/pemasukan?success=Data pemasukan berhasil ditambahkan');
        });
    }
    // Montir request approval
    else if (user.role === 'montir') {
        const requestData = {
            montir_id: user.id,
            action_type: 'create',
            table_name: 'pemasukan',
            data: { tanggal, deskripsi, nominal }
        };
        
        Approval.createRequest(requestData, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/laporan/pemasukan?error=Gagal membuat request approval');
            }
            res.redirect('/laporan/pemasukan?success=Request berhasil dikirim, menunggu approval admin');
        });
    }
    // Visitor tidak bisa
    else {
        res.redirect('/laporan/pemasukan?error=Anda tidak memiliki akses untuk menambah data');
    }
});

// Pengeluaran Page - Semua role bisa akses (READ) dengan filter
router.get('/pengeluaran', requireAuth, (req, res) => {
    const { kategori, start_date, end_date } = req.query;
    
    let queryCallback = (err, results) => {
        if (err) {
            console.error(err);
            return res.render('pengeluaran', {
                title: 'Laporan Pengeluaran',
                user: req.session.user,
                pengeluaran: [],
                total: 0,
                error: 'Gagal memuat data pengeluaran'
            });
        }
        
        Finance.getTotalPengeluaran((err, totalResult) => {
            const total = totalResult[0]?.total || 0;
            
            res.render('pengeluaran', {
                title: 'Laporan Pengeluaran',
                user: req.session.user,
                pengeluaran: results,
                total: total,
                kategori: kategori || 'all',
                start_date: start_date || '',
                end_date: end_date || '',
                success: req.query.success,
                error: req.query.error
            });
        });
    };
    
    if (start_date && end_date) {
        Finance.getPengeluaranByDateRange(start_date, end_date, kategori, queryCallback);
    } else {
        Finance.getAllPengeluaran(queryCallback);
    }
});

// Add Pengeluaran - Admin langsung, Montir pakai approval, Visitor tidak bisa
router.post('/pengeluaran', requireAuth, (req, res) => {
    const { deskripsi, nominal, kategori } = req.body;
    const tanggal = new Date().toISOString().split('T')[0];
    const user = req.session.user;
    
    if (!deskripsi || !nominal || !kategori) {
        return res.redirect('/laporan/pengeluaran?error=Semua field wajib diisi');
    }
    
    // Admin langsung create
    if (user.role === 'admin') {
        Finance.addPengeluaran({ tanggal, deskripsi, nominal, kategori }, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/laporan/pengeluaran?error=Gagal menambah data pengeluaran');
            }
            res.redirect('/laporan/pengeluaran?success=Data pengeluaran berhasil ditambahkan');
        });
    }
    // Montir request approval
    else if (user.role === 'montir') {
        const requestData = {
            montir_id: user.id,
            action_type: 'create',
            table_name: 'pengeluaran',
            data: { tanggal, deskripsi, nominal, kategori }
        };
        
        Approval.createRequest(requestData, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/laporan/pengeluaran?error=Gagal membuat request approval');
            }
            res.redirect('/laporan/pengeluaran?success=Request berhasil dikirim, menunggu approval admin');
        });
    }
    // Visitor tidak bisa
    else {
        res.redirect('/laporan/pengeluaran?error=Anda tidak memiliki akses untuk menambah data');
    }
});

// Riwayat Transaksi Page - Semua role bisa akses (READ) dengan filter
router.get('/riwayat', requireAuth, (req, res) => {
    const { start_date, end_date } = req.query;
    
    let queryCallback = (err, results) => {
        if (err) {
            console.error(err);
            return res.render('riwayat', {
                title: 'Riwayat Transaksi',
                user: req.session.user,
                transaksi: [],
                saldo: 0,
                error: 'Gagal memuat data transaksi'
            });
        }
        
        Finance.getSaldoAkhir((err, saldoResult) => {
            const saldo = saldoResult[0]?.saldo_akhir || 0;
            
            res.render('riwayat', {
                title: 'Riwayat Transaksi',
                user: req.session.user,
                transaksi: results,
                saldo: saldo,
                start_date: start_date || '',
                end_date: end_date || '',
                success: req.query.success,
                error: req.query.error
            });
        });
    };
    
    if (start_date && end_date) {
        Finance.getTransactionsByDateRange(start_date, end_date, queryCallback);
    } else {
        Finance.getAllTransactions(queryCallback);
    }
});

module.exports = router;