
const Otp = require('../models/otp');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpDoc = new Otp({ email, otp });
  
    try {
      await otpDoc.save();
      console.log(`OTP ${otp} generated and saved for email: ${email}`);
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'panchalshivang938@gmail.com',
          pass: 'tjsp hepl uxlz ygpb' // Ensure this is correct and not compromised
        }
      });
  
      const mailOptions = {
        from: 'panchalshivang938@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending OTP email:', error);
          return res.status(500).json({ message: 'Failed to send OTP', error });
        } else {
          console.log('OTP email sent:', info.response);
          res.status(200).json({ message: 'OTP sent successfully' });
        }
      });
    } catch (err) {
      console.error('Error saving OTP:', err);
      res.status(500).json({ message: 'Internal server error', error: err });
    }
  };
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpDoc = await Otp.findOne({ email, otp });
    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    await Otp.deleteOne({ _id: otpDoc._id });
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err });
  }
};
