import { readServices, writeServices } from "../utils/fileHelper.js";

// Ensure the fileHelper has readServices/writeServices functions, similar to users/business

export const getServices = (req, res) => {
  try {
    const services = readServices();
    res.status(200).json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addService = (req, res) => {
  try {
    const { name, price, category, description, duration } = req.body;
    console.log("Incoming body:", req.body);

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const services = readServices();
    const newService = {
      id: Date.now().toString(),
      name,
      price,
      category,
      duration,
      description: description || "",
      createdAt: new Date().toISOString(),
    };

    services.push(newService);
    writeServices(services);

    res.status(201).json(newService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
