import * as mongoHelper from "../utils/mongoHelper.js";
import Business from "../models/Business.js";

// Get business by ID
export const getBusinessById = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch business directly from MongoDB
  const business = await Business.findOne({ id });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.status(200).json(business);
  } catch (err) {
    console.error("Error fetching business:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Update business by ID
export const updateBusinessById = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedBusiness = await mongoHelper.updateBusiness(id, updatedData);

    if (!updatedBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.status(200).json({
      message: "Business details updated successfully",
      business: updatedBusiness,
    });
  } catch (err) {
    console.error("Error updating business:", err);
    res.status(500).json({ message: "Server error" });
  }
};
