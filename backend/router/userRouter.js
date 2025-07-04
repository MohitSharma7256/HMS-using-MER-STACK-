// userRouter.js
import express from "express";
import { addNewAdmin, addNewDoctor, getAllDoctors, getPatientDetails, getUserDetails, login, logoutAdmin, logoutPatient, patientRegister } from "../controller/userController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/patient/register", patientRegister);
router.post("/login", login);

// Routes for admin
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);

// Routes for doctors
router.get("/doctors", isAdminAuthenticated, getAllDoctors); // Assuming only admin can access doctor list

// Route to get patient details
router.get("/patient/me", isPatientAuthenticated, getPatientDetails);

// Log-Out for Admin
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

// Log-Out for User
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);

// Add New Doctor for User
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);


export default router;
