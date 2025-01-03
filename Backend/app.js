const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Twilio Configuration
const accountSid = 'ACbc'; // Your Twilio Account SID
const authToken = '0d1'; // Your Twilio Auth Token
const client = twilio(accountSid, authToken);

// Google OAuth2 Configuration
const GOOGLE_CLIENT_ID = '287'; // Replace with your actual Google Client ID
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Msmothi1028@', // Your MySQL root password
    database: 'logindb', // Your database name
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});




// Google SignIn Endpoint
app.post('/google-login', async (req, res) => {
    const { tokenId } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: '287', // Your Google Client ID
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const username = payload.name;

        // Check if the user exists in the database
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error logging in' });
            } else if (results.length === 0) {
                // If user doesn't exist, create a new account
                const insertSql = 'INSERT INTO users (username, email) VALUES (?, ?)';
                db.query(insertSql, [username, email], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error registering user' });
                    }
                    res.status(200).json({ message: 'User registered successfully', user: { email, username } });
                });
            } else {
                // User exists, return user data
                res.status(200).json({ message: 'Google Sign-in Successful', user: results[0] });
            }
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid Google token' });
    }
});



// Signup Endpoint
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error registering user' });
            }
            res.status(200).json({ message: 'User registered successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error hashing password' });
    }
});

// Login Endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging in' });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    });
});

// Generate and Send OTP
app.post('/send-otp', (req, res) => {
    const { phone_number } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expirationTime = new Date(Date.now() + 5 * 60000);

    const sql = 'INSERT INTO otp_table (phone_number, otp, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expires_at = ?';
    db.query(sql, [phone_number, otp, expirationTime, otp, expirationTime], (err) => {
        if (err) {
            res.status(500).json({ message: 'Error saving OTP' });
        } else {
            client.messages
                .create({
                    body: `Your OTP is ${otp}. It is valid for 5 minutes.`,
                    from: '+15634125348',
                    to: phone_number,
                })
                .then(() => res.status(200).json({ message: 'OTP sent successfully' }))
                .catch((error) => res.status(500).json({ message: 'Error sending OTP', error }));
        }
    });
});

// Verify OTP
app.post('/verify-otp', (req, res) => {
    const { phone_number, otp } = req.body;

    const sql = 'SELECT * FROM otp_table WHERE phone_number = ? AND otp = ?';
    db.query(sql, [phone_number, otp], (err, results) => {
        if (err || results.length === 0 || new Date(results[0].expires_at) < new Date()) {
            res.status(401).json({ message: 'Invalid or expired OTP' });
        } else {
            res.status(200).json({ message: 'OTP verified successfully' });
        }
    });
});

// Forget Password Endpoint
app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiration = new Date(Date.now() + 15 * 60 * 1000);

        const updateSql = 'UPDATE users SET reset_token = ?, token_expiration = ? WHERE email = ?';
        db.query(updateSql, [token, expiration, email], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error generating reset token' });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: 'mothi3302@gmail.com', pass: 'nsbeiojyplgznrpq' },
            });

            const resetLink = `http://10.0.2.2:3000/reset-password?token=${token}`;
            const mailOptions = {
                from: 'mothi3302@gmail.com',
                to: email,
                subject: 'Password Reset',
                text: `Click the following link to reset your password: ${resetLink}`,
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    res.status(500).json({ message: 'Error sending email' });
                } else {
                    res.status(200).json({ message: 'Reset link sent to your email' });
                }
            });
        });
    });
});

// Reset Password Endpoint
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    const sql = 'SELECT * FROM users WHERE reset_token = ? AND token_expiration > NOW()';
    db.query(sql, [token], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateSql = 'UPDATE users SET password = ?, reset_token = NULL, token_expiration = NULL WHERE reset_token = ?';
        db.query(updateSql, [hashedPassword, token], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error resetting password' });
            }
            res.status(200).json({ message: 'Password reset successful' });
        });
    });
});

// Server Start
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
