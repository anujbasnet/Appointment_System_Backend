import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  duration: Number,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Service", serviceSchema);
