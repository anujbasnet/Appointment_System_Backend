// migrateUsers.js
import connectDB from "./utils/db.js";
import { addUser } from "./utils/mongoHelper.js";
import fs from "fs";

const migrateUsers = async () => {
  await connectDB();

  // Read users JSON
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  // Insert each user into MongoDB
  for (const user of users) {
    // Ensure id is a string to avoid type issues
    const newUser = { ...user, id: user.id.toString() };
    await addUser(newUser);
  }

  console.log("Users migration to MongoDB complete!");
  process.exit();
};

migrateUsers();
