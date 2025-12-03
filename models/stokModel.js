const db = require('./db');

const StokBarang = {
    getAll: (callback) => {
        const query = 'SELECT * FROM stok_barang ORDER BY created_at DESC';
        db.query(query, callback);
    },
    
    getById: (id, callback) => {
        const query = 'SELECT * FROM stok_barang WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    
    create: (data, callback) => {
        const query = 'INSERT INTO stok_barang (nama_barang, jumlah, harga, kategori) VALUES (?, ?, ?, ?)';
        db.query(query, [data.nama_barang, data.jumlah, data.harga, data.kategori], callback);
    },
    
    update: (id, data, callback) => {
        const query = 'UPDATE stok_barang SET nama_barang = ?, jumlah = ?, harga = ?, kategori = ? WHERE id = ?';
        db.query(query, [data.nama_barang, data.jumlah, data.harga, data.kategori, id], callback);
    },
    
    delete: (id, callback) => {
        const query = 'DELETE FROM stok_barang WHERE id = ?';
        db.query(query, [id], callback);
    },
    
    getByKategori: (kategori, callback) => {
        let query = 'SELECT * FROM stok_barang';
        let params = [];
        
        if (kategori && kategori !== 'all') {
            query += ' WHERE kategori = ?';
            params.push(kategori);
        }
        
        query += ' ORDER BY created_at DESC';
        db.query(query, params, callback);
    }
};

module.exports = StokBarang;