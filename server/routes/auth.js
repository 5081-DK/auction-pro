const express =
require("express");

const router =
express.Router();

const mongoose =
require("mongoose");

/* USER SCHEMA */

const userSchema =
new mongoose.Schema({

  username:String,

  password:String

});

/* USER MODEL */

const User =
mongoose.models.User ||

mongoose.model(
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

      /* CHECK EXISTING */

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