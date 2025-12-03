const db = require('./db');

const Approval = {
    // Create approval request
    createRequest: (data, callback) => {
        const query = `
            INSERT INTO approval_requests 
            (montir_id, action_type, table_name, data_json, item_id) 
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(query, [
            data.montir_id,
            data.action_type,
            data.table_name,
            JSON.stringify(data.data),
            data.item_id || null
        ], callback);
    },
    
    // Get all pending requests (untuk admin)
    getPendingRequests: (callback) => {
        const query = `
            SELECT ar.*, u.username as montir_name 
            FROM approval_requests ar
            JOIN users u ON ar.montir_id = u.id
            WHERE ar.status = 'pending'
            ORDER BY ar.created_at DESC
        `;
        db.query(query, callback);
    },
    
    // Get requests by montir
    getRequestsByMontir: (montirId, callback) => {
        const query = `
            SELECT * FROM approval_requests 
            WHERE montir_id = ?
            ORDER BY created_at DESC
        `;
        db.query(query, [montirId], callback);
    },
    
    // Approve request
    approveRequest: (requestId, adminNotes, callback) => {
        const query = 'UPDATE approval_requests SET status = ?, admin_notes = ? WHERE id = ?';
        db.query(query, ['approved', adminNotes, requestId], callback);
    },
    
    // Reject request
    rejectRequest: (requestId, adminNotes, callback) => {
        const query = 'UPDATE approval_requests SET status = ?, admin_notes = ? WHERE id = ?';
        db.query(query, ['rejected', adminNotes, requestId], callback);
    },
    
    // Get request by ID
    getById: (id, callback) => {
        const query = 'SELECT * FROM approval_requests WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    
    // Execute approved action
    executeAction: (request, callback) => {
        const data = JSON.parse(request.data_json);
        
        switch (request.table_name) {
            case 'stok_barang':
                executeStokAction(request, data, callback);
                break;
            case 'pemasukan':
                executePemasukanAction(request, data, callback);
                break;
            case 'pengeluaran':
                executePengeluaranAction(request, data, callback);
                break;
            default:
                callback(new Error('Invalid table name'));
        }
    }
};

// Helper functions untuk execute action
function executeStokAction(request, data, callback) {
    let query;
    let params;
    
    switch (request.action_type) {
        case 'create':
            query = 'INSERT INTO stok_barang (nama_barang, jumlah, harga, kategori) VALUES (?, ?, ?, ?)';
            params = [data.nama_barang, data.jumlah, data.harga, data.kategori];
            break;
        case 'update':
            query = 'UPDATE stok_barang SET nama_barang = ?, jumlah = ?, harga = ?, kategori = ? WHERE id = ?';
            params = [data.nama_barang, data.jumlah, data.harga, data.kategori, request.item_id];
            break;
        case 'delete':
            query = 'DELETE FROM stok_barang WHERE id = ?';
            params = [request.item_id];
            break;
        default:
            return callback(new Error('Invalid action type'));
    }
    
    db.query(query, params, callback);
}

function executePemasukanAction(request, data, callback) {
    let query;
    let params;
    
    switch (request.action_type) {
        case 'create':
            query = 'INSERT INTO pemasukan (tanggal, deskripsi, nominal) VALUES (?, ?, ?)';
            params = [data.tanggal, data.deskripsi, data.nominal];
            break;
        case 'delete':
            query = 'DELETE FROM pemasukan WHERE id = ?';
            params = [request.item_id];
            break;
        default:
            return callback(new Error('Invalid action type'));
    }
    
    db.query(query, params, callback);
}

function executePengeluaranAction(request, data, callback) {
    let query;
    let params;
    
    switch (request.action_type) {
        case 'create':
            query = 'INSERT INTO pengeluaran (tanggal, deskripsi, nominal, kategori) VALUES (?, ?, ?, ?)';
            params = [data.tanggal, data.deskripsi, data.nominal, data.kategori];
            break;
        case 'delete':
            query = 'DELETE FROM pengeluaran WHERE id = ?';
            params = [request.item_id];
            break;
        default:
            return callback(new Error('Invalid action type'));
    }
    
    db.query(query, params, callback);
}

module.exports = Approval;