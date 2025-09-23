// migrateServices.js
import connectDB from "./utils/db.js";
import { addService } from "./utils/mongoHelper.js";

const migrateServices = async () => {
  await connectDB();

  // Example services data. Replace this with your actual JSON import if needed.
  const services = [
    {
      id: "1758459970502",
      name: "Haircut",
      price: 88,
      category: "Personal Care",
      duration: 55,
      description: "Basic haircut service",
      createdAt: new Date(),
    },
    // Add more services here if needed
  ];

  for (const service of services) {
    await addService(service);
  }

  console.log("Services migration to MongoDB complete!");
  process.exit();
};

migrateServices();
