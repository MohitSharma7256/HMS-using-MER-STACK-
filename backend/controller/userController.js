import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utlis/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async(req,res,next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role
    } = req.body;
    if(
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        !nic ||
        !role
    ) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }
    let user = await User.findOne({email});
    if(user){
        return next(new ErrorHandler("User Already Register!", 400));
    }
    user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role
    });
    generateToken(user, "User Register!", 200, res);
});

export const login = catchAsyncErrors(async(req, res, next) => {
    const {email, password, confirmPassword, role} = req.body;
    if(!email || !password || !confirmPassword || !role) {
        return next(new ErrorHandler("Please Provide All Details!", 400));
    }
    if(password != confirmPassword) {
        return next (new ErrorHandler("Password and Confirm Password Do Not Match!", 400));
    }
    const user = await User.findOne({email}).select("+password");
    if(!user) {
        return next (new ErrorHandler("Invalid Password Or Email!", 400)); 
    }
    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Password Or Email", 400));
    }
    if (role !== user.role) {
        return next(new ErrorHandler("User With This Role Not Found!", 400));
    }
    generateToken(user, "User Login Successfully!", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
    } = req.body;

    // Check if all required fields are present
    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }

    try {
        // Check if a user with the provided email already exists
        const isRegistered = await User.findOne({ email });
        if (isRegistered) {
            return next(new ErrorHandler(`${isRegistered.role} with this email already exists!`, 400));
        }

        // If the user doesn't exist, create a new admin user
        const admin = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password,
            gender,
            dob,
            nic,
            role: "Admin",
        });

        res.status(200).json({
            success: true,
            message: "New Admin Registered!",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500)); // Handle any unexpected errors
    }
});



export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Doctor Avatar Required!", 400));
    }
    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
      return next(new ErrorHandler("File Format Not Supported!", 400));
    }
    const {
      firstName,
      lastName,
      email,
      phone,
      nic,
      dob,
      gender,
      password,
      doctorDepartment,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !nic ||
      !dob ||
      !gender ||
      !password ||
      !doctorDepartment ||
      !docAvatar
    ) {
      return next(new ErrorHandler("Please Fill Full Form!", 400));
    }
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
      return next(
        new ErrorHandler("Doctor With This Email Already Exists!", 400)
      );
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
      docAvatar.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );
      return next(
        new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
      );
    }
    const doctor = await User.create({
      firstName,
      lastName,
      email,
      phone,
      nic,
      dob,
      gender,
      password,
      role: "Doctor",
      doctorDepartment,
      docAvatar: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
    });
    res.status(200).json({
      success: true,
      message: "New Doctor Registered",
      doctor,
    });
  });



export const getAllDoctors = catchAsyncErrors(async(req, res, next)=>{
    const doctors = await User.find({ role: "Doctor"});
    res.status(200).json({
        success: true,
        doctors,
    });
});

export const getUserDetails = catchAsyncErrors(async(req, res, next)=>{
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});


// Controller function to get patient details
export const getPatientDetails = async (req, res, next) => {
    try {
        // Retrieve the authenticated patient user from req.user
        const patient = req.user;

        // Send the patient details in the response
        res.status(200).json({
            success: true,
            patient,
        });
    } catch (error) {
        // Handle errors
        next(error);
    }
};



// Log-Out Admin
export const logoutAdmin = catchAsyncErrors(async(req, res, next)=>{
    res
        .status(200)
        .cookie("admintoken", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
        })
        .json({
            success: true,
            message: "Admin Log Out Successfully!",
        });
});

// Log-Out User
export const logoutPatient = catchAsyncErrors(async(req, res, next)=>{
    res
        .status(200)
        .cookie("patientToken", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
        })
        .json({
            success: true,
            message: "Patient Log Out Successfully!",
        });
});