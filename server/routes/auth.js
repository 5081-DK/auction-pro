const express =
require("express");

const router =
express.Router();

const mongoose =
require("mongoose");

/* USER SCHEMA */

const userSchema =
new mongoose.Schema({

  username:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  }

});

/* USER MODEL */

const User =
mongoose.connection

.useDb("auctionpro")

.model(
  "User",
  userSchema
);

/* SIGNUP */

router.post(

  "/signup",

  async(req,res)=>{

    try{

      const {

        username,

        password

      } = req.body;

      /* VALIDATION */

      if(

        !username ||
        !password

      ){

        return res.json({

          success:false,

          message:
          "All fields required"

        });

      }

      /* CHECK EXISTING USER */

      const existingUser =
      await User.findOne({

        username

      });

      if(existingUser){

        return res.json({

          success:false,

          message:
          "User already exists"

        });

      }

      /* CREATE USER */

      const newUser =
      new User({

        username,

        password

      });

      await newUser.save();

      res.json({

        success:true,

        message:
        "Signup Successful"

      });

    }

    catch(err){

      console.log(err);

      res.json({

        success:false,

        message:
        "Signup Failed"

      });

    }

  }

);

/* LOGIN */

router.post(

  "/login",

  async(req,res)=>{

    try{

      const {

        username,

        password

      } = req.body;

      /* FIND USER */

      const user =
      await User.findOne({

        username,

        password

      });

      if(user){

        res.json({

          success:true,

          user

        });

      }

      else{

        res.json({

          success:false,

          message:
          "Invalid Credentials"

        });

      }

    }

    catch(err){

      console.log(err);

      res.json({

        success:false,

        message:
        "Login Failed"

      });

    }

  }

);

module.exports =
router;