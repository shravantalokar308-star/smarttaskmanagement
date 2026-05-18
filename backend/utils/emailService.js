const nodemailer = require('nodemailer');

// Create transporter only if keys are present in env
const createTransporter = () => {
  if (
    !process.env.SMTP_USER || 
    process.env.SMTP_USER === 'your-gmail-address@gmail.com' ||
    !process.env.SMTP_PASSWORD || 
    process.env.SMTP_PASSWORD === 'your-gmail-app-password'
  ) {
    console.warn('⚠️ SMTP email credentials are not fully configured in backend/.env. Email invites will log to console instead.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      // Prevents connection rejection due to local TLS/SSL handshake variations
      rejectUnauthorized: false,
    },
  });
};

// Initialize transporter once globally to prevent socket exhaustion and Gmail connection throttling
const transporter = createTransporter();

/**
 * Sends a premium styled HTML email invitation to a team member
 */
const sendProjectInvitationEmail = async ({ toEmail, toName, inviterName, projectName, projectId }) => {
  // Dynamic frontend workspace link fallback to localhost:5173
  const workspaceUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects/${projectId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Synapse Project Invitation</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0B0D19;
            color: #F3F4F6;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .card {
            background-color: #13172C;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          }
          .logo-container {
            display: inline-flex;
            height: 48px;
            width: 48px;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
            margin-bottom: 20px;
          }
          .logo-icon {
            font-size: 24px;
            color: white;
            line-height: 48px;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            color: #FFFFFF;
            margin-top: 0;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .subtitle {
            font-size: 11px;
            color: #818CF8;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 2px;
            margin-bottom: 24px;
          }
          p {
            font-size: 14px;
            color: #9CA3AF;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .highlight {
            color: #F3F4F6;
            font-weight: 600;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%);
            color: #FFFFFF !important;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            padding: 12px 28px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            transition: all 0.2s ease;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #4B5563;
            letter-spacing: 0.5px;
          }
          .footer a {
            color: #6366F1;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="card">
            <!-- Brand Logo -->
            <div class="logo-container">
              <span class="logo-icon">🌌</span>
            </div>
            
            <h1>Workspace Invitation</h1>
            <div class="subtitle">Synapse Task Sphere</div>
            
            <p>
              Hello <span class="highlight">${toName}</span>,<br><br>
              You've been invited by <span class="highlight">${inviterName}</span> to join the 
              <span class="highlight">"${projectName}"</span> project workspace on Synapse. 
              You can now collaborate, assign tasks, and track project velocities together!
            </p>
            
            <!-- Call to Action -->
            <a href="${workspaceUrl}" class="btn" target="_blank">
              Access Project Workspace
            </a>
          </div>
          
          <div class="footer">
            Sent automatically by <a href="#">Synapse Task Manager</a>.<br>
            Collaborative, high-performance team task sphere.
          </div>
        </div>
      </body>
    </html>
  `;

  // Dynamic from fallback strictly using the authenticated SMTP_USER to satisfy Gmail SPF policy
  const senderAddress = process.env.SMTP_FROM || `"Synapse Workspace" <${process.env.SMTP_USER}>`;

  // Clean, high-deliverability subject to prevent spam-folder placement
  const mailOptions = {
    from: senderAddress,
    to: toEmail,
    subject: `You've been invited to join the "${projectName}" workspace`,
    html: htmlContent,
  };

  if (!transporter) {
    // Development local logger if credentials are not configured
    console.log('\n======================================================');
    console.log('📧 DEVELOPMENT EMAIL INVITATION EMULATOR');
    console.log(`To: ${toName} <${toEmail}>`);
    console.log(`From: ${mailOptions.from}`);
    console.log(`Subject: ${mailOptions.subject}`);
    console.log(`Workspace URL: ${workspaceUrl}`);
    console.log('======================================================\n');
    return { success: true, emulated: true };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Project invitation email successfully sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send Nodemailer invitation email:', error);
    // Return success: false but catch it safely in controller so database transaction is NOT broken
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendProjectInvitationEmail,
};
