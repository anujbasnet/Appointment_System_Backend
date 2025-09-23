import User from "../models/User.js";
import Business from "../models/Business.js";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";

// USERS 
export const readUsers = async () => await User.find({});
export const writeUsers = async (users) => await User.insertMany(users);
export const addUser = async (userData) => await new User(userData).save();
export const updateUser = async (id, data) =>
  await User.findOneAndUpdate({ id }, data, { new: true });
export const deleteUser = async (id) =>
  await User.findOneAndDelete({ id });

// BUSINESSES 
export const readBusinesses = async () => await Business.find({});
export const writeBusinesses = async (businesses) =>
  await Business.insertMany(businesses);
export const addBusiness = async (businessData) =>
  await new Business(businessData).save();
export const updateBusiness = async (id, data) =>
  await Business.findOneAndUpdate({ id }, data, { new: true });
export const deleteBusiness = async (id) =>
  await Business.findOneAndDelete({ id });

// APPOINTMENTS 
export const readAppointments = async () => await Appointment.find({});
export const writeAppointments = async (appointments) =>
  await Appointment.insertMany(appointments);
export const addAppointment = async (appointmentData) =>
  await new Appointment(appointmentData).save();
export const updateAppointment = async (id, data) =>
  await Appointment.findOneAndUpdate({ id }, data, { new: true });
export const deleteAppointment = async (id) =>
  await Appointment.findOneAndDelete({ id });

// SERVICES 
export const readServices = async () => await Service.find({});
export const writeServices = async (services) =>
  await Service.insertMany(services);
export const addService = async (serviceData) =>
  await new Service(serviceData).save();
export const updateService = async (id, data) =>
  await Service.findOneAndUpdate({ id }, data, { new: true });
export const deleteService = async (id) =>
  await Service.findOneAndDelete({ id });
