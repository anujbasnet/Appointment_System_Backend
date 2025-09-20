import { readBusinesses, writeBusinesses } from "../utils/fileHelper.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    const businesses = readBusinesses();
    const existing = businesses.find(
      (b) => b.email.toLowerCase() === email.toLowerCase()
    );
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newBusiness = {
      id: Date.now().toString(),
      full_name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone_number: phoneNumber,
      address,
      service_name: serviceName,
      service_type: serviceType,
      user_type: user_type || "business",
      created_at: new Date().toISOString(),
      loginStatus: false,
    };

    businesses.push(newBusiness);
    writeBusinesses(businesses);

    return res.status(201).json({
      message: "Signup successful",
      business: { ...newBusiness, password: undefined },
    });
  } catch (err) {
    console.error(err);
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

    const businesses = readBusinesses();
    const business = businesses.find(
      (b) => b.email.toLowerCase() === email.toLowerCase()
    );

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

    // Update login status in JSON file
    business.loginStatus = true;
    writeBusinesses(businesses);

    return res.status(200).json({
      message: "Login successful",
      token,
      business: { ...business, password: undefined },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
