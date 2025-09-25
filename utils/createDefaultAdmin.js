import Admin from "../models/Admin.js";

const createDefaultAdmin = async () => {
  const existing = await Admin.findOne({ username: "admin" });
  if (!existing) {
    await Admin.create({ username: "admin", password: "admin" }); // pre-save hook hashes it
    console.log("Default admin created: admin/admin");
  }
};

export default createDefaultAdmin;
