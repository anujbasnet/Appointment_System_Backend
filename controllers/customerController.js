import * as mongoHelper from "../utils/mongoHelper.js";

// @desc Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await mongoHelper.readUsers();
    res.status(200).json(customers);
  } catch (err) {
    console.error("Error getting customers:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};