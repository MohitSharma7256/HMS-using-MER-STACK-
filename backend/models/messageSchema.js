import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minLength: [3, "First Name Must Contain At Least 3 Characters!"]
    },
    lastName:{
        type: String,
        required: true,
        minLength: [3, "Last Name Must Contain At Least 3 Characters!"]
    },
    email:{
        type: String,
        required: true,
        validator: [validator.isEmail, "Please Provide A Valid Email!"]
    },
    phone: {
        type: String,
        required: true,
        minlength: [11, "Phone Number Must Contain Exactly 11 Digits!"], // Corrected 'minlength' spelling
        maxlength: [11, "Phone Number Must Contain Exactly 11 Digits!"]  // Corrected 'maxlength' spelling
    },
    message:{
        type: String,
        required: true,
        minlength: [10, "Message Must Contain At Least 10 Characters!"]
    },
});

export const Message = mongoose.model("Message", messageSchema);