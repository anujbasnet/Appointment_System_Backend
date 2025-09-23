import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import servicesRoutes from "./routes/serviceRoutes.js";
import businessRoutes from "./routes/business_settings.js";
import adminBusinessRoutes from "./routes/businessRoutes.js";
import connectDB from "./utils/db.js";
// Load environment variables from .env

dotenv.config();
connectDB();

// Route imports
import customerAuthRoutes from "./routes/customerAuth.js";
import businessAuthRoutes from "./routes/businessAuth.js";
import appointmentRoutes from "./routes/appointments.js";
  
const app = express();

// --- MIDDLEWARE ---

app.use(cors()); // Enable CORS
app.use(express.json()); 

// --- ROUTES ---
app.use("/api/auth", customerAuthRoutes);          // Customer authentication routes
app.use("/api/auth/business", businessAuthRoutes); // Business authentication routes
app.use("/api/appointments", appointmentRoutes);   // Appointment routes

// Add services routes here
app.use("/api/services", servicesRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/admin/business', adminBusinessRoutes);
// --- DEFAULT ROUTE ---
app.get("/", (req, res) => {
  res.send("API is running");
});

// --- ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
