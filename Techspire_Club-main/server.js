require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const nodemailer = require('nodemailer');
const validator = require('validator');

const app = express();

// Security + parsing
app.use(helmet());
app.use(express.json({ limit: '12kb' }));
app.use(express.urlencoded({ extended: true }));

// CORS: allow all by default for development; lock this down in production
app.use(cors());

// Basic rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// POST /api/contact
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Sanitize inputs
    const safeName = validator.escape(String(name));
    const safeEmail = validator.normalizeEmail(String(email));
    const safeMessage = validator.escape(String(message));

    // If SMTP is configured, send an email; otherwise log and respond (demo mode)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || `${safeName} <${safeEmail}>`,
        to: process.env.TO_EMAIL || process.env.SMTP_USER,
        subject: `Contact form message from ${safeName}`,
        text: `Name: ${safeName}\nEmail: ${safeEmail}\n\n${safeMessage}`,
      };

      await transporter.sendMail(mailOptions);
      return res.json({ ok: true });
    }

    // Demo fallback (no SMTP configured)
    console.info('Contact form received (no SMTP):', { name: safeName, email: safeEmail, message: safeMessage });
    return res.json({ ok: true, demo: true, message: 'Received (no SMTP configured)' });
  } catch (err) {
    console.error('Error in /api/contact', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Serve static files from current working directory (the website files)
app.use(express.static(path.join(__dirname)));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
