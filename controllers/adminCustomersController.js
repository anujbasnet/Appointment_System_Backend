import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// GET /api/admin/customers
// Query params: page, limit, search, status
export const listCustomersWithStats = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 25, 1), 200);
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim().toLowerCase();
    const status = (req.query.status || 'all').toLowerCase();

    // Build user match
    const userMatch = { role: { $in: [undefined, 'customer', 'customer'.toString()] } };
    if (search) {
      userMatch.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { selectedCity: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'active') userMatch.loginStatus = true;
    if (status === 'inactive') userMatch.loginStatus = false;

    // Aggregation: only pull minimal fields, then lookup appointments counts.
    const pipeline = [
      { $match: userMatch },
      { $project: { _id: 0, id: 1, name: 1, email: 1, loginStatus: 1, phone: 1, selectedCity: 1 } },
      { $sort: { name: 1 } },
      { $skip: skip },
      { $limit: limit },
      // Lookup appointments for each user to count (and optional revenue placeholder)
      { $lookup: {
          from: 'appointments',
          localField: 'id',
          foreignField: 'userId',
          as: 'appointments'
        }
      },
      { $addFields: {
          appointmentCount: { $size: '$appointments' },
          // Placeholder: serviceCost not tracked currently (no price field in Appointment model) => 0
          serviceCost:  { $literal: 0 },
          status: { $cond: [{ $eq: ['$loginStatus', true] }, 'Active', 'Inactive'] }
        }
      },
      { $project: { appointments: 0 } }
    ];

    const [items, totalCount] = await Promise.all([
      User.aggregate(pipeline),
      User.countDocuments(userMatch)
    ]);

    res.status(200).json({
      customers: items,
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit)
    });
  } catch (err) {
    console.error('Error fetching customers (agg)', err);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ['name','email','phone','selectedCity','loginStatus'];
    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }
    const user = await User.findOneAndUpdate({ id }, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'Customer not found' });
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      selectedCity: user.selectedCity,
      loginStatus: user.loginStatus,
      status: user.loginStatus ? 'Active' : 'Inactive'
    });
  } catch (err) {
    console.error('Error updating customer', err);
    res.status(500).json({ message: 'Failed to update customer' });
  }
};

export default { listCustomersWithStats, updateCustomer };