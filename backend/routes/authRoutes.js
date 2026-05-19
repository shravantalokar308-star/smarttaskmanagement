const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

const nodemailer = require('nodemailer');

router.get('/test-email', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      connectionTimeout: 5000, // 5 seconds
      greetingTimeout: 5000,
      socketTimeout: 5000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Synapse Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Synapse SMTP Connection Test',
      text: 'If you receive this, SMTP credentials are working correctly on the server!',
    });

    res.json({
      success: true,
      message: 'SMTP connection verified and test email sent successfully!',
      messageId: info.messageId,
      env: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASSWORD_SET: !!process.env.SMTP_PASSWORD,
        SMTP_PASSWORD_LENGTH: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : 0,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'SMTP test failed',
      error: error.message,
      env: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASSWORD_SET: !!process.env.SMTP_PASSWORD,
        SMTP_PASSWORD_LENGTH: process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.length : 0,
      }
    });
  }
});

module.exports = router;
