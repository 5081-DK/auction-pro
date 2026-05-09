const router = require("express").Router();

const bcrypt = require("bcryptjs");

const User = require("../models/User");

/* SIGNUP */

router.post("/signup", async (req,res)=>{

  try{

    const hash =
    await bcrypt.hash(
      req.body.password,
      10
    );

    const user = new User({

      username:req.body.username,

      password:hash

    });

    await user.save();

    res.json({
      success:true
    });

  }catch(err){

    res.json({
      success:false
    });

  }

});

/* LOGIN */

router.post("/login", async (req,res)=>{

  const user =
  await User.findOne({

    username:req.body.username

  });

  if(!user){

    return res.json({
      success:false
    });

  }

  const valid =
  await bcrypt.compare(

    req.body.password,

    user.password

  );

  if(!valid){

    return res.json({
      success:false
    });

  }

  res.json({

    success:true,

    user

  });

});

module.exports = router;