import Appointment from "../models/Appointment.js";

// Demote appointments stuck in 'waiting' for more than 10 minutes to 'notbooked'
export async function demoteWaitingToNotBooked() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  try {
    await Appointment.updateMany(
      { status: 'waiting', created_at: { $lte: tenMinutesAgo } },
      { $set: { status: 'notbooked' } }
    );
  } catch (err) {
    console.warn('statusCleaner: failed to demote waiting -> notbooked', err);
  }
}

export function startStatusCleaner() {
  // run every minute
  setInterval(() => {
    demoteWaitingToNotBooked();
  }, 60 * 1000);
}
