// migrateBusinesses.js
import connectDB from "./utils/db.js";
import { addBusiness } from "./utils/mongoHelper.js";

const migrateBusinesses = async () => {
  await connectDB();

  // Example data for migration. Replace with your real data or JSON import if needed.
  const businesses = [
    {
      id: "1758459970502",
      full_name: "John Doe",
      email: "johndoe@example.com",
      password: "$2b$10$6p9Z13ZnslEni2R7DN0vx.43X1tFCFDNoDXdR1m9SM1jZJJNLwnfe",
      phone_number: "1234567890",
      address: "123 Street, City",
      service_name: "Haircut",
      service_type: "Personal Care",
      user_type: "business",
      created_at: new Date(),
      loginStatus: false,
    },
    // Add more businesses here if needed
  ];

  for (const business of businesses) {
    await addBusiness(business);
  }

  console.log("Businesses migration to MongoDB complete!");
  process.exit();
};

migrateBusinesses();
