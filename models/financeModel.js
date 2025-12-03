const db = require('./db');

const Finance = {
    // Pemasukan Operations
    getAllPemasukan: (callback) => {
        const query = 'SELECT * FROM pemasukan ORDER BY tanggal DESC, created_at DESC';
        db.query(query, callback);
    },
    
    getPemasukanByDateRange: (startDate, endDate, callback) => {
        const query = 'SELECT * FROM pemasukan WHERE tanggal BETWEEN ? AND ? ORDER BY tanggal DESC';
        db.query(query, [startDate, endDate], callback);
    },
    
    addPemasukan: (data, callback) => {
        const query = 'INSERT INTO pemasukan (tanggal, deskripsi, nominal) VALUES (?, ?, ?)';
        db.query(query, [data.tanggal, data.deskripsi, data.nominal], callback);
    },
    
    getTotalPemasukan: (callback) => {
        const query = 'SELECT SUM(nominal) as total FROM pemasukan';
        db.query(query, callback);
    },
    
    getPemasukanHarian: (callback) => {
        const query = 'SELECT tanggal, SUM(nominal) as total FROM pemasukan GROUP BY tanggal ORDER BY tanggal DESC';
        db.query(query, callback);
    },
    
    // Pengeluaran Operations
    getAllPengeluaran: (callback) => {
        const query = 'SELECT * FROM pengeluaran ORDER BY tanggal DESC, created_at DESC';
        db.query(query, callback);
    },
    
    getPengeluaranByDateRange: (startDate, endDate, kategori, callback) => {
        let query = 'SELECT * FROM pengeluaran WHERE tanggal BETWEEN ? AND ?';
        let params = [startDate, endDate];
        
        if (kategori && kategori !== 'all') {
            query += ' AND kategori = ?';
            params.push(kategori);
        }
        
        query += ' ORDER BY tanggal DESC';
        db.query(query, params, callback);
    },
    
    addPengeluaran: (data, callback) => {
        const query = 'INSERT INTO pengeluaran (tanggal, deskripsi, nominal, kategori) VALUES (?, ?, ?, ?)';
        db.query(query, [data.tanggal, data.deskripsi, data.nominal, data.kategori], callback);
    },
    
    getTotalPengeluaran: (callback) => {
        const query = 'SELECT SUM(nominal) as total FROM pengeluaran';
        db.query(query, callback);
    },
    
    getPengeluaranByKategori: (callback) => {
        const query = 'SELECT kategori, SUM(nominal) as total FROM pengeluaran GROUP BY kategori';
        db.query(query, callback);
    },
    
    // Riwayat Transaksi
    getAllTransactions: (callback) => {
        const query = `
            SELECT 
                tanggal, 
                'Pemasukan' as jenis, 
                deskripsi, 
                nominal,
                created_at
            FROM pemasukan 
            UNION ALL 
            SELECT 
                tanggal, 
                'Pengeluaran' as jenis, 
                deskripsi, 
                nominal,
                created_at
            FROM pengeluaran 
            ORDER BY tanggal DESC, created_at DESC
        `;
        db.query(query, callback);
    },
    
    getTransactionsByDateRange: (startDate, endDate, callback) => {
        const query = `
            SELECT 
                tanggal, 
                'Pemasukan' as jenis, 
                deskripsi, 
                nominal,
                created_at
            FROM pemasukan 
            WHERE tanggal BETWEEN ? AND ?
            UNION ALL 
            SELECT 
                tanggal, 
                'Pengeluaran' as jenis, 
                deskripsi, 
                nominal,
                created_at
            FROM pengeluaran 
            WHERE tanggal BETWEEN ? AND ?
            ORDER BY tanggal DESC, created_at DESC
        `;
        db.query(query, [startDate, endDate, startDate, endDate], callback);
    },
    
    getSaldoAkhir: (callback) => {
        const query = `
            SELECT 
                (SELECT COALESCE(SUM(nominal), 0) FROM pemasukan) - 
                (SELECT COALESCE(SUM(nominal), 0) FROM pengeluaran) as saldo_akhir
        `;
        db.query(query, callback);
    }
};

module.exports = Finance;