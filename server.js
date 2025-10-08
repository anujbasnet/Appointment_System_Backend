import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import businessEmbeddedServices from "./routes/businessEmbeddedServices.js";
import businessRoutes from "./routes/business_settings.js";
import adminBusinessRoutes from "./routes/businessRoutes.js";
import connectDB from "./utils/db.js";
import adminRoutes from "./routes/admin.js";
import notificationsRoutes from "./routes/notifications.js";

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

// Route imports
import customerAuthRoutes from "./routes/customerAuth.js";
import businessAuthRoutes from "./routes/businessAuth.js";
import appointmentRoutes from "./routes/appointments.js";

const app = express();

// MIDDLEWARE
app.use(cors()); // Enable CORS
// Increase body limit to accommodate base64 staff avatars / cover photos
app.use(express.json({ limit: '15mb' })); // adjust if you expect larger images

// ROUTES
app.use("/api/auth", customerAuthRoutes);          // Customer authentication routes
app.use("/api/auth/business", businessAuthRoutes); // Business authentication routes
app.use("/api/appointments", appointmentRoutes);   // Appointment routes

// NOTE: Global /api/services removed in favor of embedded services under /api/business/:businessId/services
app.use('/api/business', businessEmbeddedServices); // embedded services first
app.use('/api/business', businessRoutes);
app.use('/api/admin/business', adminBusinessRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);
// DEFAULT ROUTE
app.get("/", (req, res) => {
  res.send("API is running");
});

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// CREATE DEFAULT ADMIN 
import Admin from "./models/Admin.js";

const createDefaultAdmin = async () => {
  const existing = await Admin.findOne({ username: "admin" });
  if (!existing) {
    // Let schema pre-save hook handle hashing
    await Admin.create({ username: "admin", password: "admin" });
    console.log("Default admin created: admin/admin");
  }
};
createDefaultAdmin();