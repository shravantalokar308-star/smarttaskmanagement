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
const https = require('https');

// Helper to make HTTPS POST requests for diagnostics
const sendHttpsPost = (url, headers, body) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            ok: false,
            status: res.statusCode,
            json: { message: data },
          });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(JSON.stringify(body));
    req.end();
  });
};

router.get('/test-email', async (req, res) => {
  // 1. Test Brevo first if configured (to bypass SMTP ports on Render free tier)
  if (process.env.BREVO_API_KEY) {
    try {
      const senderEmail = process.env.SMTP_USER || 'shravantalokar@gmail.com';
      const response = await sendHttpsPost(
        'https://api.brevo.com/v3/smtp/email',
        { 'api-key': process.env.BREVO_API_KEY },
        {
          sender: { name: 'Synapse Test', email: senderEmail },
          to: [{ email: senderEmail, name: 'Synapse Owner' }],
          subject: 'Synapse Brevo API Connection Test',
          htmlContent: '<p>If you receive this, your Brevo API configuration is working perfectly on Render!</p>',
        }
      );

      if (response.ok) {
        return res.json({
          success: true,
          message: 'Brevo API connection verified and test email sent successfully!',
          messageId: response.json.messageId,
          env: {
            BREVO_API_KEY_SET: true,
            BREVO_API_KEY_PREVIEW: process.env.BREVO_API_KEY.slice(0, 7) + '...',
            SMTP_USER: senderEmail,
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Brevo API test failed',
          error: response.json,
          env: {
            BREVO_API_KEY_SET: true,
            SMTP_USER: senderEmail,
          }
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Brevo API test threw exception',
        error: error.message,
        env: {
          BREVO_API_KEY_SET: true,
        }
      });
    }
  }

  // 2. Test Resend if configured (to bypass SMTP ports on Render free tier)
  if (process.env.RESEND_API_KEY) {
    try {
      const sender = process.env.RESEND_FROM || 'Synapse Workspace <onboarding@resend.dev>';
      const toEmail = process.env.SMTP_USER || 'shravantalokar@gmail.com';
      
      const response = await sendHttpsPost(
        'https://api.resend.com/emails',
        { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        {
          from: sender,
          to: toEmail,
          subject: 'Synapse Resend API Connection Test',
          html: '<p>If you receive this, your Resend API configuration is working perfectly on Render!</p>',
        }
      );

      if (response.ok) {
        return res.json({
          success: true,
          message: 'Resend API connection verified and test email sent successfully!',
          resendId: response.json.id,
          env: {
            RESEND_API_KEY_SET: true,
            RESEND_API_KEY_PREVIEW: process.env.RESEND_API_KEY.slice(0, 7) + '...',
            RESEND_FROM: sender,
            SMTP_USER: toEmail,
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Resend API test failed',
          error: response.json,
          env: {
            RESEND_API_KEY_SET: true,
            RESEND_FROM: sender,
            SMTP_USER: toEmail,
          }
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Resend API test threw exception',
        error: error.message,
        env: {
          RESEND_API_KEY_SET: true,
        }
      });
    }
  }

  // 2. Fallback SMTP diagnostics
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      family: 4, // Force IPv4 to prevent ENETUNREACH errors on cloud platforms without IPv6 support
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
