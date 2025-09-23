import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone_number: String,
  address: String,
  service_name: String,
  service_type: String,
  user_type: { type: String, default: "business" },
  created_at: { type: Date, default: Date.now },
  loginStatus: { type: Boolean, default: false }
});

const Business = mongoose.model("Business", businessSchema);
export default Business;