import nodemailer from 'nodemailer';

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const { EMAIL_USER, EMAIL_PASS, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (EMAIL_USER && EMAIL_PASS) {
    // Prefer Gmail if configured. Use an App Password for GMAIL_PASS (2FA required).
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
    return transporter;
  }
  if (SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: Number(SMTP_PORT) === 465, // use TLS if port 465
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });
    return transporter;
  }
  console.warn('Email not configured; set GMAIL_USER/GMAIL_PASS or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS');
  return null;
}

export async function sendBusinessAppointmentEmail({
  to,
  businessName,
  serviceName,
  customerName,
  date,
  time,
  specialistName
}) {
  const tx = getTransporter();
  if (!tx) {
    return { ok: false, skipped: true };
  }
  const from = process.env.FROM_EMAIL || process.env.EMAIL_USER ;
  const subject = `New appointment request (${date} ${time})`;
  const text = `Hello${businessName ? ' ' + businessName : ''},\n\n` +
    `You have a new appointment request.\n` +
    `Customer: ${customerName || 'N/A'}\n` +
    `Service: ${serviceName || 'N/A'}\n` +
    `Specialist: ${specialistName || 'N/A'}\n` +
    `When: ${date} at ${time}\n\n` +
  `Status: waiting (awaiting confirmation)\n\n` +
    `This is an automated message.`;
  const html = `
    <p>Hello${businessName ? ' ' + businessName : ''},</p>
    <p>You have a <strong>new appointment request</strong>.</p>
    <ul>
      <li><strong>Customer:</strong> ${customerName || 'N/A'}</li>
      <li><strong>Service:</strong> ${serviceName || 'N/A'}</li>
      <li><strong>Specialist:</strong> ${specialistName || 'N/A'}</li>
      <li><strong>When:</strong> ${date} at ${time}</li>
  <li><strong>Status:</strong> waiting (awaiting confirmation)</li>
    </ul>
    <p>Please <strong>confirm</strong> this appointment as soon as possible in app or website.</p>
    <p>This is an automated message.</p>
  `;
  try {
    await tx.sendMail({ from, to, subject, text, html });
    return { ok: true };
  } catch (err) {
    console.error('Failed to send appointment email', err);
    return { ok: false, error: String(err) };
  }
}

export async function sendCustomerAppointmentStatusEmail({
  to,
  customerName,
  businessName,
  serviceName,
  date,
  time,
  status
}) {
  const tx = getTransporter();
  if (!tx) {
    return { ok: false, skipped: true };
  }
  const from = process.env.EMAIL_USER;
  const normalized = String(status || '').toLowerCase();
  const title = normalized === 'booked' ? 'confirmed' : (normalized === 'canceled' ? 'canceled' : normalized);
  const subject = `Your appointment has been ${title}`;
  const text = `Hello${customerName ? ' ' + customerName : ''},\n\n` +
    `Your appointment ${serviceName ? 'for ' + serviceName + ' ' : ''}on ${date} at ${time} with ${businessName || 'the business'} has been ${title}.\n\n` +
    `If you have any questions, reply to this email.\n` +
    `This is an automated message.`;
  const html = `
    <p>Hello${customerName ? ' ' + customerName : ''},</p>
    <p>Your appointment ${serviceName ? 'for <strong>' + serviceName + '</strong> ' : ''}on <strong>${date}</strong> at <strong>${time}</strong> with <strong>${businessName || 'the business'}</strong> has been <strong>${title}</strong>.</p>
    <p>If you have any questions, reply to this email.</p>
    <p>This is an automated message.</p>
  `;
  try {
    await tx.sendMail({ from, to, subject, text, html });
    return { ok: true };
  } catch (err) {
    console.error('Failed to send customer status email', err);
    return { ok: false, error: String(err) };
  }
}
