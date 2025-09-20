import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { readUsers, writeUsers } from "../utils/fileHelper.js";

export const register = async (req, res) => {
  const { name, email, password, role, phone, avatar, selectedCity } = req.body;
  const users = readUsers();
  const cleanEmail = email.trim().toLowerCase();

  if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ msg: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    name: name || "",
    email: cleanEmail,
    password: hashedPassword,
    role: role || "customer",
    phone: phone || "",
    avatar: avatar || "",
    selectedCity: selectedCity || null,
    loginStatus: false,
  };

  users.push(newUser);
  writeUsers(users);
  res.json({ msg: "User registered successfully" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const cleanEmail = email.trim().toLowerCase();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

  if (userIndex === -1) return res.status(400).json({ msg: "Invalid credentials" });

  const user = users[userIndex];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  users[userIndex].loginStatus = true;
  writeUsers(users);

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "365d" });

  res.json({
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
};

export const getMe = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = readUsers();
    const user = users.find(u => u.id === decoded.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      selectedCity: user.selectedCity,
      loginStatus: user.loginStatus,
    });
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

export const updateMe = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === decoded.id);

    if (userIndex === -1) return res.status(404).json({ msg: "User not found" });

    const { name, phone, avatar, selectedCity } = req.body;

    if (name !== undefined) users[userIndex].name = name;
    if (phone !== undefined) users[userIndex].phone = phone;
    if (avatar !== undefined) users[userIndex].avatar = avatar;
    if (selectedCity !== undefined) users[userIndex].selectedCity = selectedCity;

    writeUsers(users);

    res.json({
      msg: "Profile updated successfully",
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role,
        phone: users[userIndex].phone,
        avatar: users[userIndex].avatar,
        selectedCity: users[userIndex].selectedCity,
      },
    });
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

export const logout = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === decoded.id);
    if (userIndex === -1) return res.status(404).json({ msg: "User not found" });

    users[userIndex].loginStatus = false;
    writeUsers(users);
    res.json({ msg: "Logged out successfully" });
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};
