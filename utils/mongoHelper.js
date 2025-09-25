import User from "../models/User.js";
import Business from "../models/Business.js";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";

// USERS
export const readUsers = async () => User.find({});
export const writeUsers = async (users) => User.insertMany(users);
export const addUser = async (userData) => new User(userData).save();
export const updateUser = async (id, data) =>
  User.findOneAndUpdate({ id }, data, { new: true });
export const deleteUser = async (id) =>
  User.findOneAndDelete({ id });

// BUSINESSES
export const readBusinesses = async () => Business.find({});
export const writeBusinesses = async (businesses) => Business.insertMany(businesses);
export const addBusiness = async (businessData) => new Business(businessData).save();
export const updateBusiness = async (id, data) =>
  Business.findOneAndUpdate({ id }, data, { new: true });
export const deleteBusiness = async (id) =>
  Business.findOneAndDelete({ id });

// APPOINTMENTS
export const readAppointments = async () => Appointment.find({});
export const writeAppointments = async (appointments) => Appointment.insertMany(appointments);
export const addAppointment = async (appointmentData) => new Appointment(appointmentData).save();
export const updateAppointment = async (id, data) =>
  Appointment.findOneAndUpdate({ id }, data, { new: true });
export const deleteAppointment = async (id) =>
  Appointment.findOneAndDelete({ id });

// SERVICES 
export const readServices = async () => Service.find({});
export const writeServices = async (services) => Service.insertMany(services);
export const addService = async (serviceData) => new Service(serviceData).save();
export const updateService = async (id, data) =>
  Service.findOneAndUpdate({ id }, data, { new: true });
export const deleteService = async (id) =>
  Service.findOneAndDelete({ id });
