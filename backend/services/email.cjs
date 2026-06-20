// ============================================================
// backend/services/email.cjs
// Enhanced SMTP email service:
//  - SMTP connectivity verification on startup
//  - Retry logic (up to 3 attempts with exponential backoff)
//  - Enriched logging: candidateName, candidateEmail, jobTitle, statusTrigger, errorMessage
//  - In-memory fallback when Supabase email_logs table is unavailable
//  - Full status-based HTML email templates
// ============================================================
const nodemailer = require('nodemailer');
const { supabase } = require('../db.cjs');

// ── In-memory fallback log cache ────────────────────────────────────────────
const localEmailLogs = [];

// ── SMTP connection status ───────────────────────────────────────────────────
let smtpVerified = false;
let smtpError = null;

// ── Build transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 10000,
  greetingTimeout:   5000,
  socketTimeout:     10000,
});

// ── Verify SMTP connectivity on startup ─────────────────────────────────────
(async () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('[Email Service] ⚠️  SMTP credentials not configured — running in mock mode.');
    return;
  }
  try {
    await transporter.verify();
    smtpVerified = true;
    console.log('[Email Service] ✅  SMTP connection verified successfully.');
    console.log(`[Email Service]    Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}:${process.env.SMTP_PORT || '587'}`);
    console.log(`[Email Service]    User: ${process.env.SMTP_USER}`);
  } catch (err) {
    smtpError = err.message;
    console.warn('[Email Service] ⚠️  SMTP verification failed:', err.message);
    console.warn('[Email Service]    Emails will still attempt to send, but delivery may fail.');
  }
})();

// ── Email Templates ──────────────────────────────────────────────────────────
function getEmailTemplate(status, { candidateName, jobTitle, company }) {
  const templates = {
    'Applied': {
      subject: `✅ Application Received — ${jobTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#7C6BFF;margin-bottom:8px">📋 Application Received, ${candidateName}!</h2>
          <p style="color:#374151;font-size:15px">We have successfully received your application for the <strong>${jobTitle}</strong> role at <strong>${company}</strong>.</p>
          <p style="color:#6B7280;font-size:14px">Our AI screening engine is now evaluating your profile. You will receive updates as your application progresses through the hiring pipeline.</p>
          <div style="margin-top:24px;padding:16px;background:#EDE9FE;border-radius:8px">
            <p style="color:#7C6BFF;font-weight:bold;margin:0">Position: ${jobTitle}</p>
            <p style="color:#7C6BFF;margin:4px 0 0">Status: Application Received</p>
          </div>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">This is an automated message from the AI Recruitment System. Please do not reply to this email.</p>
        </div>`,
      text: `Hi ${candidateName}, we have received your application for ${jobTitle} at ${company}. You will be notified as your status updates.`,
    },

    'Shortlisted': {
      subject: `🎉 You've been Shortlisted — ${jobTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#7C6BFF;margin-bottom:8px">🎉 Great News, ${candidateName}!</h2>
          <p style="color:#374151;font-size:15px">You have been <strong>shortlisted</strong> for the <strong>${jobTitle}</strong> role at <strong>${company}</strong>.</p>
          <p style="color:#6B7280;font-size:14px">Our team was impressed with your profile and resume. The next step will be an interview invitation — please keep an eye on your email.</p>
          <div style="margin-top:24px;padding:16px;background:#EDE9FE;border-radius:8px">
            <p style="color:#7C6BFF;font-weight:bold;margin:0">Position: ${jobTitle}</p>
            <p style="color:#7C6BFF;margin:4px 0 0">Company: ${company}</p>
            <p style="color:#7C6BFF;margin:4px 0 0">Status: Shortlisted ✨</p>
          </div>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">This is an automated message from the AI Recruitment System.</p>
        </div>`,
      text: `Hi ${candidateName}, congratulations! You have been shortlisted for ${jobTitle} at ${company}. Please watch your email for interview scheduling.`,
    },

    'Interview Scheduled': {
      subject: `📅 Interview Scheduled — ${jobTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#4FFAF0;margin-bottom:8px">📅 Interview Scheduled, ${candidateName}!</h2>
          <p style="color:#374151;font-size:15px">Your interview has been scheduled for the <strong>${jobTitle}</strong> position at <strong>${company}</strong>.</p>
          <p style="color:#6B7280;font-size:14px">Please check your candidate dashboard for the exact date and time. Make sure to prepare and be on time. Best of luck!</p>
          <div style="margin-top:24px;padding:16px;background:#E0F7F5;border-radius:8px">
            <p style="color:#0D9488;font-weight:bold;margin:0">Position: ${jobTitle}</p>
            <p style="color:#0D9488;margin:4px 0 0">Company: ${company}</p>
            <p style="color:#0D9488;margin:4px 0 0">Status: Interview Scheduled 📅</p>
          </div>
          <p style="color:#6B7280;font-size:14px;margin-top:20px">Tips for success:<br/>• Research the company thoroughly<br/>• Review the job requirements<br/>• Prepare your STAR-format answers<br/>• Test your tech setup if it's a video interview</p>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">This is an automated message from the AI Recruitment System.</p>
        </div>`,
      text: `Hi ${candidateName}, your interview for ${jobTitle} at ${company} has been scheduled. Please check your candidate dashboard for the date and time.`,
    },

    'Selected': {
      subject: `✅ Congratulations! You've been Selected — ${jobTitle}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#10b981;margin-bottom:8px">✅ Congratulations, ${candidateName}!</h2>
          <p style="color:#374151;font-size:15px">We are thrilled to inform you that you have been <strong>selected</strong> for the <strong>${jobTitle}</strong> role at <strong>${company}</strong>.</p>
          <p style="color:#6B7280;font-size:14px">A member of our team will reach out shortly with the formal offer and next steps. Welcome aboard!</p>
          <div style="margin-top:24px;padding:16px;background:#D1FAE5;border-radius:8px;border-left:4px solid #10b981">
            <p style="color:#059669;font-weight:bold;margin:0">🎊 Position: ${jobTitle}</p>
            <p style="color:#059669;margin:4px 0 0">Company: ${company}</p>
            <p style="color:#059669;margin:4px 0 0">Status: Selected ✅</p>
          </div>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">This is an automated message from the AI Recruitment System.</p>
        </div>`,
      text: `Hi ${candidateName}, congratulations! You have been selected for ${jobTitle} at ${company}. Our team will contact you shortly with next steps.`,
    },

    'Rejected': {
      subject: `Application Status Update`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px">
          <h2 style="color:#374151;margin-bottom:8px">Application Status Update</h2>
          <p style="color:#374151;font-size:15px">Dear ${candidateName},</p>
          <p style="color:#374151;font-size:15px">Thank you for your interest in the <strong>${jobTitle}</strong> position and for taking the time to apply.</p>
          <p style="color:#6B7280;font-size:14px">After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.</p>
          <p style="color:#6B7280;font-size:14px">We appreciate your interest in our organization and encourage you to apply for future opportunities that align with your skills and experience.</p>
          <p style="color:#6B7280;font-size:14px">We wish you all the best in your career journey.</p>
          <div style="margin-top:24px;padding:16px;background:#F3F4F6;border-radius:8px;border-left:4px solid #9CA3AF">
            <p style="color:#6B7280;font-weight:bold;margin:0">Position: ${jobTitle}</p>
            <p style="color:#6B7280;margin:4px 0 0">Company: ${company}</p>
          </div>
          <p style="color:#374151;font-size:14px;margin-top:20px">Regards,<br/><strong>Recruitment Team</strong></p>
          <p style="color:#9CA3AF;font-size:12px;margin-top:16px">This is an automated message from the AI Recruitment System.</p>
        </div>`,
      text: `Dear ${candidateName},\n\nThank you for your interest in the ${jobTitle} position and for taking the time to apply.\n\nAfter careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.\n\nWe appreciate your interest in our organization and encourage you to apply for future opportunities that align with your skills and experience.\n\nWe wish you all the best in your career journey.\n\nRegards,\nRecruitment Team`,
    },
  };

  return templates[status] || null;
}

// ── Enriched email log ───────────────────────────────────────────────────────
async function logEmail({ recipient, subject, body, status, candidateName, candidateEmail, jobTitle, statusTrigger, errorMessage }) {
  const sentAt = new Date().toISOString();
  const localEntry = {
    id:              `local-${Math.random().toString(36).substring(2, 9)}`,
    recipient,
    subject,
    body,
    status,
    candidate_name:  candidateName  || null,
    candidate_email: candidateEmail || recipient,
    job_title:       jobTitle       || null,
    status_trigger:  statusTrigger  || null,
    error_message:   errorMessage   || null,
    sent_at:         sentAt,
  };

  // Always keep in memory
  localEmailLogs.unshift(localEntry);
  // Prevent unbounded growth
  if (localEmailLogs.length > 500) localEmailLogs.pop();

  const dbRecord = {
    recipient,
    subject,
    body,
    status,
    candidate_name:  candidateName  || null,
    candidate_email: candidateEmail || recipient,
    job_title:       jobTitle       || null,
    status_trigger:  statusTrigger  || null,
    error_message:   errorMessage   || null,
    sent_at:         sentAt,
  };

  try {
    const { error } = await supabase.from('email_logs').insert(dbRecord);
    if (error) {
      console.warn('[Email Service] DB log insert failed (using memory fallback):', error.message);
    } else {
      console.log(`[Email Service] 📝 Email log saved to DB — Status: ${status} | Trigger: ${statusTrigger || 'N/A'}`);
    }
  } catch (err) {
    console.warn('[Email Service] DB logging threw exception (using memory fallback):', err.message);
  }
}

// ── Fetch email logs ─────────────────────────────────────────────────────────
async function getEmailLogs() {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(200);

    if (error || !data) return localEmailLogs;
    // Merge in-memory logs that may not be in DB yet
    const dbIds = new Set(data.map(d => d.id));
    const memOnly = localEmailLogs.filter(l => !dbIds.has(l.id));
    return [...memOnly, ...data].sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at)).slice(0, 200);
  } catch {
    return localEmailLogs;
  }
}

// ── Get SMTP status ──────────────────────────────────────────────────────────
function getSmtpStatus() {
  const hasCredentials = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  return {
    configured:    hasCredentials,
    verified:      smtpVerified,
    error:         smtpError,
    host:          process.env.SMTP_HOST || 'smtp.gmail.com',
    port:          process.env.SMTP_PORT || '587',
    user:          process.env.SMTP_USER || '',
    mode:          hasCredentials ? 'SMTP' : 'Mock',
  };
}

// ── Re-verify SMTP on demand ─────────────────────────────────────────────────
async function verifySmtp() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { success: false, message: 'SMTP credentials not configured. Running in mock mode.' };
  }
  try {
    await transporter.verify();
    smtpVerified = true;
    smtpError = null;
    return { success: true, message: 'SMTP connection verified successfully.' };
  } catch (err) {
    smtpVerified = false;
    smtpError = err.message;
    return { success: false, message: err.message };
  }
}

// ── Send email with retry ─────────────────────────────────────────────────────
async function sendEmail({ to, subject, html, text, candidateName, jobTitle, statusTrigger, maxRetries = 3 }) {
  // Validate recipient
  if (!to || !to.includes('@')) {
    console.error(`[Email Service] ❌ Invalid recipient email: "${to}". Aborting send.`);
    await logEmail({
      recipient: to || 'unknown',
      subject: subject || 'N/A',
      body: 'Invalid recipient address',
      status: 'Failed: Invalid recipient',
      candidateName,
      candidateEmail: to,
      jobTitle,
      statusTrigger,
      errorMessage: `Invalid recipient email address: "${to}"`,
    });
    throw new Error(`Invalid recipient email: ${to}`);
  }

  const emailBody = text || (html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '');

  console.log(`[Email Service] 📧 Preparing email → ${to} | Status: ${statusTrigger || 'N/A'} | Job: ${jobTitle || 'N/A'}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const errMsg = 'SMTP Authentication Error: Credentials not configured.';
    console.error(`[Email Service] 💀 ${errMsg}`);
    await logEmail({
      recipient: to, subject, body: emailBody,
      status:    `Failed: ${errMsg}`,
      candidateName, candidateEmail: to, jobTitle, statusTrigger,
      errorMessage: errMsg,
    });
    throw new Error(errMsg);
  }

  // ── Real SMTP with retry ───────────────────────────────────────────────────
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Email Service] Attempt ${attempt}/${maxRetries} → ${to}`);
      const info = await transporter.sendMail({
        from:    process.env.SMTP_FROM || `"AI Recruitment System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });

      console.log(`[Email Service] ✅ Sent (attempt ${attempt}) — MessageId: ${info.messageId}`);
      await logEmail({
        recipient: to, subject, body: emailBody, status: 'Sent',
        candidateName, candidateEmail: to, jobTitle, statusTrigger,
      });
      return { success: true, info, attempt };

    } catch (err) {
      lastError = err;
      console.warn(`[Email Service] ❌ Attempt ${attempt} failed: ${err.message}`);

      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
        console.log(`[Email Service] ⏳ Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  // All retries exhausted
  console.error(`[Email Service] 💀 All ${maxRetries} attempts failed for ${to}: ${lastError.message}`);
  await logEmail({
    recipient: to, subject, body: emailBody,
    status:    `Failed: ${lastError.message}`,
    candidateName, candidateEmail: to, jobTitle, statusTrigger,
    errorMessage: lastError.message,
  });
  throw lastError;
}

// ── Send status-based email (convenience wrapper) ────────────────────────────
async function sendStatusEmail({ to, status, candidateName, jobTitle, company }) {
  const template = getEmailTemplate(status, { candidateName, jobTitle, company });
  if (!template) {
    console.log(`[Email Service] ℹ️  No template for status "${status}" — skipping.`);
    return null;
  }
  return sendEmail({
    to,
    subject:       template.subject,
    html:          template.html,
    text:          template.text,
    candidateName,
    jobTitle,
    statusTrigger: status,
  });
}

module.exports = { sendEmail, sendStatusEmail, logEmail, getEmailLogs, getSmtpStatus, verifySmtp, getEmailTemplate };
