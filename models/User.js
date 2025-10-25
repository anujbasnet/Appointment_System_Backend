import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "customer" },
  phone: { type: String, default: "" },
  avatar: { type: String, default: "" },
  selectedCity: { type: String, default: "" },
  loginStatus: { type: mongoose.Schema.Types.Mixed, default: false }
});

const User = mongoose.model("User", userSchema);
export default User;
