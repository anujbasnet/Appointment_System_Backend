import * as mongoHelper from "../utils/mongoHelper.js";
import Business from "../models/Business.js";
import { v4 as uuid } from "uuid";

// Normalize incoming avatar values to a consistent data URL (if possible)
function normalizeAvatar(input) {
  try {
    if (!input || typeof input !== 'string') return '';
    let trimmed = input.trim();
    if (!trimmed) return '';

    // 1. Already a valid data URL
    if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(trimmed)) return trimmed;

    // 2. If it looks like a data URL but missing ;base64 (rare malformed cases)
    if (/^data:image\/(png|jpe?g|gif|webp),/i.test(trimmed)) {
      // Insert ;base64 just after mime type
      trimmed = trimmed.replace(/^(data:image\/(png|jpe?g|gif|webp))(,)/i, (_, p1, p2) => `${p1};base64,`);
      return trimmed;
    }

    // 3. Raw base64 heuristic (allow non-multiple-of-4 lengths, pad if needed)
    const base64Regex = /^[A-Za-z0-9+/=\r\n]+$/;
    const cleaned = trimmed.replace(/\s+/g, '');
    if (cleaned.length > 40 && base64Regex.test(cleaned)) {
      let padded = cleaned;
      const mod = padded.length % 4;
      if (mod !== 0) {
        const needed = 4 - mod;
        padded = padded + '='.repeat(needed);
      }
      return `data:image/png;base64,${padded}`;
    }

    // 4. Remote absolute URL accepted
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    // 5. Relative path (e.g. /uploads/...): keep so client can decide base URL
    if (/^[/.]?(uploads|images|img)\//i.test(trimmed) || /^\//.test(trimmed)) {
      return trimmed; // client can prefix host
    }

    // 6. Anything else -> log once (sampled) and reject
    if (Math.random() < 0.02) { // sample to avoid log spam
      console.warn('normalizeAvatar rejected value (sampled)', {
        length: trimmed.length,
        preview: trimmed.slice(0, 50)
      });
    }
    return '';
  } catch (err) {
    console.error('normalizeAvatar error', err);
    return '';
  }
}

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

// ---- STAFF (Employees) management ----

// Ensure business exists helper
async function findBusiness(id) {
  return Business.findOne({ id });
}

export const getBusinessStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const business = await findBusiness(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.status(200).json({ staff: business.staff || [] });
  } catch (e) {
    console.error('Error fetching staff', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addBusinessStaff = async (req, res) => {
  const { id } = req.params; // business id
  const { name, title, avatarUrl } = req.body;
  if (!name || !title) return res.status(400).json({ message: 'name and title are required' });
  try {
    const business = await findBusiness(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    if (!Array.isArray(business.staff)) business.staff = [];
    const normalized = normalizeAvatar(avatarUrl);
    const staffMember = { id: uuid(), name, title, avatarUrl: normalized };
    business.staff.push(staffMember);
    await business.save();
    res.status(201).json({ staff: business.staff, staffMember });
  } catch (e) {
    console.error('Error adding staff', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBusinessStaff = async (req, res) => {
  const { id, staffId } = req.params;
  const { name, title, avatarUrl } = req.body;
  try {
    const business = await findBusiness(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    const idx = (business.staff || []).findIndex(s => s.id === staffId);
    if (idx === -1) return res.status(404).json({ message: 'Staff member not found' });
    if (name !== undefined) business.staff[idx].name = name;
    if (title !== undefined) business.staff[idx].title = title;
    if (avatarUrl !== undefined) {
      business.staff[idx].avatarUrl = normalizeAvatar(avatarUrl);
    }
    await business.save();
    res.status(200).json({ staffMember: business.staff[idx], staff: business.staff });
  } catch (e) {
    console.error('Error updating staff', e);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBusinessStaff = async (req, res) => {
  const { id, staffId } = req.params;
  try {
    const business = await findBusiness(id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    const before = (business.staff || []).length;
    business.staff = (business.staff || []).filter(s => s.id !== staffId);
    if (business.staff.length === before) return res.status(404).json({ message: 'Staff member not found' });
    await business.save();
    res.status(200).json({ message: 'Deleted', staff: business.staff });
  } catch (e) {
    console.error('Error deleting staff', e);
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateBusinessClient = async (req, res) => {
  const { id } = req.params; // business id
  const clientData = req.body; // full client object from frontend

  if (!clientData || !clientData.name || !clientData.email) {
    return res.status(400).json({ message: "Client name and email are required" });
  }

  try {
    // Find business
    const business = await Business.findOne({ id });
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Ensure clients array exists
    if (!Array.isArray(business.clients)) {
      business.clients = [];
    }

    // Check if this client already exists in the business
    const existingIndex = business.clients.findIndex(c => c.id === clientData.id);

    if (existingIndex !== -1) {
      // ✅ Update existing client
      business.clients[existingIndex] = {
        ...business.clients[existingIndex],
        ...clientData,
        avatar: normalizeAvatar(clientData.avatar),
      };
    } else {
      // ✅ Add new client
      const newClient = {
        ...clientData,
        avatar: normalizeAvatar(clientData.avatar),
      };
      business.clients.push(newClient);
    }

    await business.save();

    res.status(200).json({
      message: existingIndex !== -1
        ? "Client updated successfully"
        : "Client added successfully",
      clients: business.clients,
    });
  } catch (e) {
    console.error("Error updating or creating client:", e);
    res.status(500).json({ message: "Server error" });
  }
};
