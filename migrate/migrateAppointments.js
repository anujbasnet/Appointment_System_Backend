// migrateAppointments.js
import connectDB from "./utils/db.js";
import { addAppointment } from "./utils/mongoHelper.js";

const migrateAppointments = async () => {
  await connectDB();

  // Example: directly define appointments data here or import from another source
  const appointments = [
    {
      userId: "1758211931409",
      title: "Haircut",
      date: new Date("2025-09-25T10:00:00Z"),
      description: "Regular haircut",
      status: "upcoming",
    },
    {
      userId: "1758211931409",
      title: "Beard Trim",
      date: new Date("2025-09-26T12:00:00Z"),
      description: "",
      status: "upcoming",
    },
  ];

  for (const appointment of appointments) {
    await addAppointment(appointment);
  }

  console.log("Appointments migration to MongoDB complete!");
  process.exit();
};

migrateAppointments();
