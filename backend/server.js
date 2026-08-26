require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin.split(',') }));

// Basic protection against form-spam / abuse
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many submissions, please try again later.' }
});

// ---------- Optional email notifications ----------
let transporter = null;
if (process.env.EMAIL_ENABLED === 'true') {
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function notifyByEmail(subject, text) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.NOTIFY_TO || process.env.SMTP_USER,
      subject,
      text
    });
  } catch (err) {
    console.error('Email notification failed:', err.message);
  }
}

// ---------- Helpers ----------
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ---------- API routes ----------
app.get('/api/health', (req, res) => {
  res.json({ ok: true, status: 'up', time: new Date().toISOString() });
});

app.post('/api/contact', formLimiter, async (req, res) => {
  const { name, email, organization, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'name, email and message are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO contacts (name, email, organization, message) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim(), (organization || '').trim(), message.trim()]
    );

    notifyByEmail(
      `New portfolio contact from ${name}`,
      `Name: ${name}\nEmail: ${email}\nOrganization: ${organization || '-'}\nMessage:\n${message}`
    );

    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Something went wrong.' });
  }
});

app.post('/api/newsletter', formLimiter, async (req, res) => {
  const { email } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO subscribers (email) VALUES (?)',
      [email.trim().toLowerCase()]
    );
    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(200).json({ ok: true, message: 'Already subscribed.' });
    }
    console.error(err);
    res.status(500).json({ ok: false, error: 'Something went wrong.' });
  }
});

// Simple admin-style read endpoints (protect these before going to production!)
app.get('/api/admin/contacts', async (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  const [rows] = await pool.query('SELECT * FROM contacts ORDER BY id DESC');
  res.json(rows);
});

app.get('/api/admin/subscribers', async (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  const [rows] = await pool.query('SELECT * FROM subscribers ORDER BY id DESC');
  res.json(rows);
});

// ---------- Serve the frontend ----------
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database.');
    console.error('code:', err.code);
    console.error('message:', err.message);
    if (err.errors && err.errors.length) {
      console.error('underlying errors:');
      err.errors.forEach((e, i) => console.error(`  [${i}]`, e.code || '', e.message || e));
    }
    console.error(err);
    process.exit(1);
  });
