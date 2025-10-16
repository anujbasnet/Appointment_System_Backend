import Appointment from "../models/Appointment.js";

// @desc Get business stats (total, completed, revenue) for today, week, month
export const getBusinessStats = async (req, res) => {
  try {
    const { businessId } = req.params;
    if (!businessId) return res.status(400).json({ message: "Missing businessId" });

    // Helper to get start of today, week, month
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Query all appointments for this business
    const appointments = await Appointment.find({ business_id: businessId });

    // Helper to filter and sum
    function getStats(startDate) {
      const filtered = appointments.filter(a => {
        const apptDate = new Date(a.date);
        return apptDate >= startDate;
      });
      const total = filtered.filter(a => a.status !== "canceled" && a.status !== "cancelled").length;
      const completed = filtered.filter(a => a.status === "completed").length;
      // Revenue: assume price is in a.servicePrice or a.price or a.amount
      const revenue = filtered.filter(a => a.status === "completed").reduce((sum, a) => sum + (a.servicePrice || a.price || a.amount || 0), 0);
      return { total, completed, revenue };
    }

    res.json({
      today: getStats(todayStart),
      week: getStats(weekStart),
      month: getStats(monthStart)
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch business stats" });
  }
};
