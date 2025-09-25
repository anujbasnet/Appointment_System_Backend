// controllers/notificationsController.js
import nodemailer from "nodemailer";
import Business from "../models/Business.js";
import User from "../models/User.js";

// Configure your SMTP transporter (Gmail example)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // your email app password
  },
});

export const sendToBusinesses = async (req, res) => {
  try {
    const { subject, message } = req.body;

    // Fetch all business emails
    const businesses = await Business.find({});
    const emails = businesses.map((b) => b.email).filter(Boolean);

    if (!emails.length) return res.status(400).json({ success: false, message: "No business emails found" });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Emails sent to businesses successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendToCustomers = async (req, res) => {
  try {
    const { subject, message } = req.body;

    // Fetch all customer emails
    const customers = await User.find({});
    const emails = customers.map((u) => u.email).filter(Boolean);

    if (!emails.length) return res.status(400).json({ success: false, message: "No customer emails found" });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: emails,
      subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Emails sent to customers successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
