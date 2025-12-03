const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const connection = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'bengkel_db', 
    port: 3306, 
    waitForConnections: true,
    connectionLimit: 10
});

connection.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL successfully!');
    connection.release();

    createTables();
});

function createTables() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'montir', 'visitor') DEFAULT 'visitor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    const createApprovalRequestsTable = `
        CREATE TABLE IF NOT EXISTS approval_requests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            montir_id INT NOT NULL,
            action_type ENUM('create', 'update', 'delete') NOT NULL,
            table_name ENUM('stok_barang', 'pemasukan', 'pengeluaran') NOT NULL,
            data_json TEXT NOT NULL,
            item_id INT NULL,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            admin_notes TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (montir_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    
    // Stok barang table
    const createStokTable = `
        CREATE TABLE IF NOT EXISTS stok_barang (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama_barang VARCHAR(100) NOT NULL,
            jumlah INT NOT NULL,
            harga DECIMAL(10,2) NOT NULL,
            kategori VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    // Pemasukan table
    const createPemasukanTable = `
        CREATE TABLE IF NOT EXISTS pemasukan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tanggal DATE NOT NULL,
            deskripsi VARCHAR(255) NOT NULL,
            nominal DECIMAL(12,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    // Pengeluaran table
    const createPengeluaranTable = `
        CREATE TABLE IF NOT EXISTS pengeluaran (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tanggal DATE NOT NULL,
            deskripsi VARCHAR(255) NOT NULL,
            nominal DECIMAL(12,2) NOT NULL,
            kategori VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    // Execute table creation
    connection.query(createUsersTable, (err) => {
        if (err) console.error('Error creating users table:', err);
    });
    
    connection.query(createApprovalRequestsTable, (err) => {
        if (err) console.error('Error creating approval_requests table:', err);
    });
    
    connection.query(createStokTable, (err) => {
        if (err) console.error('Error creating stok_barang table:', err);
    });
    
    connection.query(createPemasukanTable, (err) => {
        if (err) console.error('Error creating pemasukan table:', err);
    });
    
    connection.query(createPengeluaranTable, (err) => {
        if (err) console.error('Error creating pengeluaran table:', err);
    });
    
    // Insert default users
    const defaultPassword = bcrypt.hashSync('12345', 10);
    const montirPassword = bcrypt.hashSync('montir123', 10);
    const visitorPassword = bcrypt.hashSync('visitor123', 10);
    
    const insertDefaultUsers = `
        INSERT IGNORE INTO users (username, password, role) VALUES 
        ('admin', ?, 'admin'),
        ('montir', ?, 'montir'),
        ('visitor', ?, 'visitor')
    `;
    
    connection.query(insertDefaultUsers, [defaultPassword, montirPassword, visitorPassword], (err) => {
        if (err) console.error('Error inserting default users:', err);
        else console.log('Default users created');
    });
}

module.exports = connection;