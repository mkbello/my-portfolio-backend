require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
  const {name, email, message} = req.body;
  if(!name || !email || !message) return res.status(400).json({ok:false, error:'Missing fields'});

  try {
    // create transporter using env variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOpts = {
      from: `"${name}" <${email}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `Portfolio contact from ${name}`,
      text: message,
      html: `<p>${message.replace(/\n/g,'<br/>')}</p><hr/><p>From: ${name} — ${email}</p>`
    };

    const info = await transporter.sendMail(mailOpts);
    console.log('Email sent:', info.messageId);
    res.json({ok:true});
  } catch (err) {
    console.error('Mail error', err);
    res.status(500).json({ok:false, error: 'Failed to send'});
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`));
