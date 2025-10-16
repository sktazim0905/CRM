import users from "../models/user.js";
import  Auth from '../common/auth.js'
import moment from  "moment";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import  bcrypt from'bcrypt';


dotenv.config();
// const csv = require("fast-csv");
// const fs = require("fs");
// const BASE_URL = process.env.BASE_URL


const create =async(req,res)=>{
    try {
        let user = await users.findOne({email:req.body.email})
        if(!user){
            req.body.password = await Auth.hashPassword(req.body.password)
            await users.create(req.body)
            res.status(201).send({
                message:"user Create Sucessfully"
            })
        }
        else{
            res.status(400).send({
                message:`User with ${req.body.email} already extist`
            })
        }

    } catch (error) {
        res.status(500).send({
            message:"Internal Server error",
            error:error.message
        })
        
    }
}

const login = async (req,res)=>{
    try {
        let user = await users.findOne({email:req.body.email})
        if(user){
            let hashCompare = await Auth.hashCompare(req.body.password,user.password)
      
        if(hashCompare){
            let token = await Auth.createToken({
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            status:user.status
            // profile:user.profile,
            // mobile:user.mobile,
            //  gender:user.gender, 
            //  location:user.location,
            //  status:user.status 
             
            

            })

            let userData = await users.findOne({email:req.body.email},{_id:0,password:0,createdAt:0,email:0})
            res.status(200).send({
                message:"login Successfull",
                token,
                userData
            })
           
        }
        else{
            res.status(400).send({
                message:`Invaild Passsword`
            })
        }
    }
    else{
        res.status(400).send({
            message:`Account with ${req.body.email } does not exists!`
        })
    }

       
    } catch (error) {
        res.status(500).send({
            message:`Internal Server Error `,
            error:error.message 
        })
        
    }

}



const registerUser = async (req, res) => {
    const { name, email, status, mobile, add, desc, password } = req.body;

    try {
        if (!name || !email || !password || !mobile || !add || !desc || !status) {
            return res.status(400).json({message:"Please fill in all the required fields."});
        }

        const hashedPassword = await Auth.hashPassword(password);
        const prenumber=await users.findOne({ mobile:mobile });
        const preUser = await users.findOne({ email: email });

        if (preUser) {
          
            return res.status(400).send({message:` ${req.body.email }  is already present.`});
        }
if(prenumber)
{
    return res.status(400).send({message:` ${req.body.mobile} is already present.`});
}
        const newUser = new users({
            name, email, status, mobile, add, desc, password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({message:"User Created Successfully", newUser});
        console.log(newUser);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json("Internal Server Error");
    }
};

const getUserData = async (req, res) => {
    try {
        const userData = await users.find();
        const totalUsers = await users.countDocuments({role:'user'});
        const activeUsers = await users.countDocuments({ status: 'Active' });
        const inactiveUsers = await users.countDocuments({ status: 'InActive' });
       

        res.status(200).json({userData,totalUsers,activeUsers,inactiveUsers});
     
        console.log(userData);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json("Internal Server Error");
    }
};
// const getUserData = async (req, res) => {
//     try {
//         const userData = await users.find();
//         const totalUsers = await users.countDocuments({role:'user'});
//         const activeUsers = await users.countDocuments({ status: 'Active' });
//         const inactiveUsers = await users.countDocuments({ status: 'InActive' });
       

//         res.status(200).json({userData,totalUsers,activeUsers, inactiveUsers});
     
//         console.log(userData);
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json("Internal Server Error");
//     }
// };




const getIndividualUser = async (req, res) => {
    try {
        const { id } = req.params;

        const userIndividual = await users.findById(id);

        if (!userIndividual) {
            return res.status(404).json("User not found");
        }

        console.log(userIndividual);
        res.status(200).json(userIndividual);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json("Internal Server Error");
    }
};


// const updateUserData = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Update email
//         const updatedUser = await users.findByIdAndUpdate(id, { email: req.body.email }, {
//             new: true
//         });

//         // Check if there's a new password in the request
//         if (req.body.password) {
//             // Hash the new password
//             const hashedPassword = await bcrypt.hash(req.body.password, 10);

//             // Update the password with the hashed one
//             updatedUser.password = hashedPassword;
//         }

//         // Save the updated user with the new password if applicable
//         const savedUser = await updatedUser.save();

//         console.log(savedUser);
//         res.status(201).json(savedUser);

//     } catch (error) {
//         console.error(error);
//         res.status(400).json(error);
//     }
// };

const updateUserData =async(req,res)=>{
    try {
        const {id} = req.params;
        // const hashedPassword = await Auth.hashPassword(password);
                       
        req.body.password = await Auth.hashPassword(req.body.password)
        const updateduser = await users.findByIdAndUpdate(id,req.body,{
            new:true
        });
       
        console.log(updateduser);
        res.status(201).json(updateduser);

    } catch (error) {
        res.status(400).json(error);
    }
}



const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await users.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json("User not found");
        }

        console.log(deletedUser);
        res.status(200).json(deletedUser);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json("Internal Server Error");
    }
};


// resetpassword



const resetpassword = async (req, res) => {
    const { email } = req.body;
    try {
      let user = await users.findOne({ email });
      if (!user) {
        return res.status(404).send({ message: "user not found" });
      }
  
      // const token = Math.random().toString(36).slice(-8);
      const generateOTP = () => {
        const characters = "0123456789";
        return Array.from(
          { length: 6 },
          () => characters[Math.floor(Math.random() * characters.length)]
        ).join("");
      };
      const token = generateOTP();
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 300000; //5 minutes
  
      await user.save();
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user:  process.env.USER_MAILER,
          pass: process.env.PASS_MAILER,
        },
      });
      const resetUrl = `${`https://customer-relationship-management-mern.netlify.app/user/resetpassword`}`;
  
      const mailOptions = {
        from: "harishvinayagamoorthi@gmail.com",
        to: user.email,
        subject: "Password Reset Request",
        html: `
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>We received a request to reset your password. Here is your One-Time Password (OTP): <strong>${token}</strong></p>
        <p>This OTP is Expired in 5 minutes </p>
        <p>Please click the following link to reset your password:</p>
        <a href=${resetUrl}>Reset Password</a>
        <p>If you did not make this request, please ignore this email.</p>
        <p>Thank you,</p>
        <p>From Validation</p>
      `,
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.status(404).json({ message: "Something Went Wrong, try Again!" });
        } else {
          res
            .status(200)
            .json({ message: " Password Reset Email sent: " + info.response });
        }
      });
    } catch (error) {
      res.status(500).send({
        message: `Internal Server Error `,
        error: error.message,
      });
    }
  };




// Token Verfication
// Token Verification and Password Reset
const passwordtoken = async (req, res) => {
    try {
      const { token } = req.body;
      const { password } = req.body;
  
      console.log("Received token:", token);
  
      const user = await users.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
  
      console.log("Found user:", user);
  
      if (!user) {
        return res.status(404).json({ message: "Invalid OTP" });
      }
  
      if (user.resetPasswordExpires < Date.now()) {
        return res.status(401).json({ message: "OTP Expires" });
      } else {
        console.log("Resetting password for user:", user.email);
        user.password = await Auth.hashPassword(password);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
  
        res.json({ message: "Password reset successfully" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };







export default{
    login,
    create,
    registerUser,
    getUserData,
    getIndividualUser,
    updateUserData,
    deleteUser,
    resetpassword,
    passwordtoken
};


