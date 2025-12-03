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
    }
};

module.exports = User;