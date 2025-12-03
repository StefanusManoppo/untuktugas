const db = require('./db');
const bcrypt = require('bcryptjs');

const User = {
    findByUsername: (username, callback) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        db.query(query, [username], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    verifyPassword: (plainPassword, hashedPassword) => {
        return bcrypt.compareSync(plainPassword, hashedPassword);
    },

    // Fungsi baru untuk membuat user
    createUser: (userData, callback) => {
        const hashedPassword = bcrypt.hashSync(userData.password, 10);
        const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [userData.username, hashedPassword, 'visitor'], callback);
    },

    // Fungsi untuk check apakah username sudah ada
    checkUsernameExists: (username, callback) => {
        const query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
        db.query(query, [username], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0].count > 0);
        });
    }
};

module.exports = User;