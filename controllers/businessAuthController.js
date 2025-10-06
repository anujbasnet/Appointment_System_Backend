import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Business from "../models/Business.js";

// --- Signup ---
export const signupBusiness = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      address,
      serviceName,
      serviceType,
      user_type,
      logoUrl,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !address ||
      !serviceName ||
      !serviceType
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if business already exists
    const existing = await Business.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newBusiness = new Business({
      id: Date.now().toString(),
      full_name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone_number: phoneNumber,
      address,
      service_name: serviceName,
      service_type: serviceType,
  user_type: user_type || "business",
  logoUrl: logoUrl || null,
      created_at: new Date(),
      loginStatus: false,
    });

    const savedBusiness = await newBusiness.save();

    return res.status(201).json({
      message: "Signup successful",
      business: { ...savedBusiness._doc, password: undefined },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Login ---
export const loginBusiness = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch business by email
    const business = await Business.findOne({ email: email.toLowerCase() });
    if (!business)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT
    const token = jwt.sign(
      { id: business.id, email: business.email, user_type: business.user_type },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "365d" }
    );

    // Update login status in DB
    business.loginStatus = true;
    await business.save();

    return res.status(200).json({
      message: "Login successful",
      token,
      business: { ...business._doc, password: undefined },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
