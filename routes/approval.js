const express = require('express');
const router = express.Router();
const Approval = require('../models/approvalModel');

// Middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        return res.status(403).send('Access denied');
    }
};

// Admin: Lihat semua pending requests
router.get('/pending', requireAuth, requireAdmin, (req, res) => {
    Approval.getPendingRequests((err, requests) => {
        if (err) {
            console.error(err);
            return res.render('approval-pending', {
                title: 'Pending Approvals',
                user: req.session.user,
                requests: [],
                error: 'Gagal memuat data approval'
            });
        }
        
        res.render('approval-pending', {
            title: 'Pending Approvals',
            user: req.session.user,
            requests: requests,
            success: req.query.success,
            error: req.query.error
        });
    });
});

// Admin: Approve request
router.post('/approve/:id', requireAuth, requireAdmin, (req, res) => {
    const requestId = req.params.id;
    const adminNotes = req.body.admin_notes || '';
    
    Approval.getById(requestId, (err, request) => {
        if (err || !request) {
            return res.redirect('/approval/pending?error=Request tidak ditemukan');
        }
        
        // Execute the action
        Approval.executeAction(request, (err) => {
            if (err) {
                console.error(err);
                return res.redirect('/approval/pending?error=Gagal mengeksekusi action');
            }
            
            // Update status to approved
            Approval.approveRequest(requestId, adminNotes, (err) => {
                if (err) {
                    console.error(err);
                    return res.redirect('/approval/pending?error=Gagal approve request');
                }
                res.redirect('/approval/pending?success=Request berhasil di-approve');
            });
        });
    });
});

// Admin: Reject request
router.post('/reject/:id', requireAuth, requireAdmin, (req, res) => {
    const requestId = req.params.id;
    const adminNotes = req.body.admin_notes || 'Ditolak oleh admin';
    
    Approval.rejectRequest(requestId, adminNotes, (err) => {
        if (err) {
            console.error(err);
            return res.redirect('/approval/pending?error=Gagal reject request');
        }
        res.redirect('/approval/pending?success=Request berhasil ditolak');
    });
});

// Montir: Lihat status request mereka
router.get('/my-requests', requireAuth, (req, res) => {
    if (req.session.user.role !== 'montir') {
        return res.status(403).send('Access denied');
    }
    
    Approval.getRequestsByMontir(req.session.user.id, (err, requests) => {
        if (err) {
            console.error(err);
            return res.render('approval-my-requests', {
                title: 'My Requests',
                user: req.session.user,
                requests: [],
                error: 'Gagal memuat data'
            });
        }
        
        res.render('approval-my-requests', {
            title: 'My Approval Requests',
            user: req.session.user,
            requests: requests,
            error: null
        });
    });
});

module.exports = router;