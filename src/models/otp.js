const { Schema, model } = require("mongoose");
const otpSchema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires in 5 minutes
 } );



const Otp = model('Otp', otpSchema);

module.exports = Otp;
