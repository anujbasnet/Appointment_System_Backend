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
  logoUrl: String, // stored image URL or base64 data URI
  coverPhotoUrl: String,
  description: String,
  imageUrl: String, // generic main image if different from logo
  socialMedia: {
    instagram: String,
    facebook: String,
    telegram: String,
  },
  workingHours: {
    type: Object,
    default: {
      'Monday - Friday': '9:00 AM - 6:00 PM',
      'Saturday': '10:00 AM - 4:00 PM',
      'Sunday': 'Closed'
    }
  },
  staff: { type: Array, default: [] },
  services: { type: Array, default: [] },
  user_type: { type: String, default: "business" },
  created_at: { type: Date, default: Date.now },
  loginStatus: { type: Boolean, default: false }
});

const Business = mongoose.model("Business", businessSchema);
export default Business;