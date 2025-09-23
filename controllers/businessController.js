import * as mongoHelper from "../utils/mongoHelper.js";

// @desc Get all businesses
export const getBusinesses = async (req, res) => {
  try {
    const businesses = await mongoHelper.readBusinesses();
    res.status(200).json(businesses);
  } catch (err) {
    console.error("Error getting businesses:", err);
    res.status(500).json({ message: "Failed to fetch businesses" });
  }
};

// @desc Update a business by ID
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInfo = req.body;

    const updatedBusiness = await mongoHelper.updateBusiness(id, updatedInfo);

    if (!updatedBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.status(200).json(updatedBusiness);
  } catch (err) {
    console.error("Error updating business:", err);
    res.status(500).json({ message: "Failed to update business" });
  }
};
