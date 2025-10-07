import Business from "../models/Business.js";

// Helper to shape a service object
function buildService({ name, price, category, description, duration }) {
  return {
    id: Date.now().toString(),
    name,
    price,
    category: category || "",
    duration: duration || 0,
    description: description || "",
    createdAt: new Date(),
  };
}

// GET /api/business/:businessId/services
export async function listEmbeddedServices(req, res) {
  try {
    const { businessId } = req.params;
    let biz = await Business.findOne({ id: businessId });
    if (!biz) {
      // fallback: maybe provided the Mongo _id instead of custom id
      try { biz = await Business.findById(businessId); } catch {}
    }
    if (!biz) return res.status(404).json({ message: "Business not found" });
    return res.status(200).json(biz.services || []);
  } catch (e) {
    console.error("listEmbeddedServices error", e);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/business/:businessId/services
export async function addEmbeddedService(req, res) {
  try {
    const { businessId } = req.params;
    const { name, price, category, description, duration } = req.body;
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ message: "Name and price are required" });
    }
    let biz = await Business.findOne({ id: businessId });
    if (!biz) {
      try { biz = await Business.findById(businessId); } catch {}
    }
    if (!biz) return res.status(404).json({ message: "Business not found" });
    const svc = buildService({ name, price, category, description, duration });
    if (!Array.isArray(biz.services)) biz.services = [];
    biz.services.unshift(svc);
    await biz.save();
    res.status(201).json(svc);
  } catch (e) {
    console.error("addEmbeddedService error", e);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/business/:businessId/services/:serviceId
export async function updateEmbeddedService(req, res) {
  try {
    const { businessId, serviceId } = req.params;
    const { name, price, category, description, duration } = req.body;
    let biz = await Business.findOne({ id: businessId });
    if (!biz) {
      try { biz = await Business.findById(businessId); } catch {}
    }
    if (!biz) return res.status(404).json({ message: "Business not found" });
    const idx = (biz.services || []).findIndex(s => String(s.id) === String(serviceId));
    if (idx === -1) return res.status(404).json({ message: "Service not found" });
    const existing = biz.services[idx];
    biz.services[idx] = {
      ...existing,
      name: name ?? existing.name,
      price: price ?? existing.price,
      category: category ?? existing.category,
      description: description ?? existing.description,
      duration: duration ?? existing.duration,
    };
    await biz.save();
    res.status(200).json(biz.services[idx]);
  } catch (e) {
    console.error("updateEmbeddedService error", e);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/business/:businessId/services/:serviceId
export async function deleteEmbeddedService(req, res) {
  try {
    const { businessId, serviceId } = req.params;
    let biz = await Business.findOne({ id: businessId });
    if (!biz) {
      try { biz = await Business.findById(businessId); } catch {}
    }
    if (!biz) return res.status(404).json({ message: "Business not found" });
    const before = biz.services.length;
    biz.services = biz.services.filter(s => String(s.id) !== String(serviceId));
    if (biz.services.length === before) return res.status(404).json({ message: "Service not found" });
    await biz.save();
    res.status(204).send();
  } catch (e) {
    console.error("deleteEmbeddedService error", e);
    res.status(500).json({ message: "Server error" });
  }
}
