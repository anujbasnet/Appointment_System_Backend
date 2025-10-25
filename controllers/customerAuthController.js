import * as mongoHelper from "../utils/mongoHelper.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// --- Register ---
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, avatar, selectedCity } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const users = await mongoHelper.readUsers();
    if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name: name || "",
      email: cleanEmail,
      password: hashedPassword,
      role: role || "customer",
      phone: phone || "",
      avatar: avatar || "",
      selectedCity: selectedCity || null,
      loginStatus: false,
    };

    await mongoHelper.addUser(newUser);
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- Login ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const users = await mongoHelper.readUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Update loginStatus in DB
    await mongoHelper.updateUser(user.id, { loginStatus: true });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "365d" });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        selectedCity: user.selectedCity,
        loginStatus: true,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- Get logged-in user ---
export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await mongoHelper.readUsers();
    const user = users.find(u => u.id === decoded.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      selectedCity: user.selectedCity,
      loginStatus: user.loginStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid token" });
  }
};

// --- Update logged-in user ---
export const updateMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, phone, avatar, selectedCity } = req.body;

    const updatedFields = {};
    if (name !== undefined) updatedFields.name = name;
    if (phone !== undefined) updatedFields.phone = phone;
    if (avatar !== undefined) updatedFields.avatar = avatar;
    if (selectedCity !== undefined) updatedFields.selectedCity = selectedCity;

    const updatedUser = await mongoHelper.updateUser(decoded.id, updatedFields);
    if (!updatedUser) return res.status(404).json({ msg: "User not found" });

    res.status(200).json({
      msg: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        selectedCity: updatedUser.selectedCity,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid token" });
  }
};

// --- Logout ---
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await mongoHelper.updateUser(decoded.id, { loginStatus: false });

    res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid token" });
  }
};

// --- Change password ---
export const changePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ msg: "Missing fields" });
    const users = await mongoHelper.readUsers();
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Current password incorrect" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await mongoHelper.updateUser(user.id, { password: hashedPassword });
    res.status(200).json({ msg: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Invalid token" });
  }
};
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { loginStatus } = req.body;

    // ✅ Allow string "blocked" or boolean false
    if (loginStatus !== "blocked" && loginStatus !== false) {
      return res.status(400).json({ msg: "Invalid loginStatus value" });
    }

    // Update user in your database
    const updatedUser = await mongoHelper.updateUser(id, { loginStatus });

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      msg: `User ${loginStatus === "blocked" ? "blocked" : "unblocked"} successfully`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user status:", err);
    res.status(500).json({ msg: "Server error while updating user status" });
  }
};
