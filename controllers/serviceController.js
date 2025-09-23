import * as mongoHelper from "../utils/mongoHelper.js";

// --- Get all services ---
export const getServices = async (req, res) => {
  try {
    const services = await mongoHelper.readServices();
    res.status(200).json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Get service by ID ---
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const services = await mongoHelper.readServices();
    const service = services.find(s => String(s.id) === String(id));
    if (!service) return res.status(404).json({ message: "Service not found" });

    res.status(200).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Add a new service ---
export const addService = async (req, res) => {
  try {
    const { name, price, category, description, duration } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const newService = {
      id: Date.now().toString(),
      name,
      price,
      category,
      duration,
      description: description || "",
      createdAt: new Date(),
    };

    const savedService = await mongoHelper.addService(newService);
    res.status(201).json(savedService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Update a service ---
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, duration } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const updatedService = await mongoHelper.updateService(id, {
      name,
      price,
      category,
      description: description || "",
      duration,
    });

    if (!updatedService) return res.status(404).json({ message: "Service not found" });
    res.status(200).json(updatedService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Delete a service ---
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await mongoHelper.deleteService(id);
    if (!deleted) return res.status(404).json({ message: "Service not found" });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
