import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- FILE PATHS ---
const USERS_FILE = path.join(__dirname, "..", "data", "users.json");
const BUSINESS_FILE = path.join(__dirname, "..", "data", "business.json");
const APPOINTMENTS_FILE = path.join(__dirname, "..", "data", "appointments.json");
const SERVICES_FILE = path.join(__dirname, "..", "data", "services.json");

// Ensure files exist
[USERS_FILE, BUSINESS_FILE, APPOINTMENTS_FILE, SERVICES_FILE].forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf-8");
});

// --- USERS ---
export function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")) || [];
  } catch (err) {
    console.error("Error reading users.json:", err);
    return [];
  }
}

export function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// --- BUSINESSES ---
export function readBusinesses() {
  try {
    return JSON.parse(fs.readFileSync(BUSINESS_FILE, "utf-8")) || [];
  } catch (err) {
    console.error("Error reading business.json:", err);
    return [];
  }
}

export function writeBusinesses(businesses) {
  fs.writeFileSync(BUSINESS_FILE, JSON.stringify(businesses, null, 2));
}

// --- APPOINTMENTS ---
export function readAppointments() {
  try {
    return JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, "utf-8")) || [];
  } catch (err) {
    console.error("Error reading appointments.json:", err);
    return [];
  }
}

export function writeAppointments(appointments) {
  fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2));
}

// --- SERVICES ---
export function readServices() {
  try {
    return JSON.parse(fs.readFileSync(SERVICES_FILE, "utf-8")) || [];
  } catch (err) {
    console.error("Error reading services.json:", err);
    return [];
  }
}

export function writeServices(services) {
  fs.writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2));
}
