const router = require("express").Router();

const Tournament =
require("../models/Tournament");

/* CREATE TOURNAMENT */

router.post(
  "/createTournament",
  async (req,res) => {

    try{

      const tournament =
      new Tournament({

        name:req.body.name,

        tournamentId:
        req.body.tournamentId,

        password:req.body.password,

        teams:[],

        players:[]

      });

      const savedTournament =
      await tournament.save();

      res.json({

        success:true,

        _id:savedTournament._id

      });

    }catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

});

/* ADD TEAM */

router.post(
  "/addTeam",
  async (req,res) => {

    try{

      const tournament =
      await Tournament.findById(
        req.body.id
      );

      if(!tournament){

        return res.json({
          success:false
        });

      }

      tournament.teams.push(
        req.body.team
      );

      await tournament.save();

      res.json({
        success:true
      });

    }catch(err){

      console.log(err);

      res.json({
        success:false
      });

    }

});

/* ADD PLAYER */

router.post(
  "/addPlayer",
  async (req,res) => {

    try{

      const tournament =
      await Tournament.findById(
        req.body.id
      );

      if(!tournament){

        return res.json({
          success:false
        });

      }

      tournament.players.push(
        req.body.player
      );

      await tournament.save();

      res.json({
        success:true
      });

    }catch(err){

      console.log(err);

      res.json({
        success:false
      });

    }

});

/* GET PLAYERS */

router.get(
  "/getPlayers/:id",
  async (req,res) => {

    try{

      const tournament =
      await Tournament.findById(
        req.params.id
      );

      if(!tournament){

        return res.json([]);

      }

      res.json(
        tournament.players
      );

    }catch(err){

      console.log(err);

      res.status(500).json({
        success:false
      });

    }

});

/* TEAM LOGIN */

router.post(
  "/teamLogin",
  async (req,res) => {

    try{

      const {

        tournamentId,

        teamName,

        password

      } = req.body;

      const tournament =
      await Tournament.findById(
        tournamentId
      );

      if(!tournament){

        return res.json({
          success:false
        });

      }

      const team =
      tournament.teams.find(

        t =>

        t.name === teamName &&

        t.password === password

      );

      if(!team){

        return res.json({
          success:false
        });

      }

      /* SUCCESS RESPONSE */

      res.json({

        success:true,

        tournamentId:
        tournament._id,

        team

      });

    }

    catch(err){

      console.log(err);

      res.json({
        success:false
      });

    }

});

/* SELL PLAYER */

router.post(
  "/sellPlayer",
  async (req,res) => {

    try{

      const {

        tournamentId,

        playerName,

        teamName,

        soldPrice

      } = req.body;

      const tournament =
      await Tournament.findById(
        tournamentId
      );

      if(!tournament){

        return res.json({
          success:false
        });

      }

      /* FIND PLAYER */

      const player =
      tournament.players.find(

        p => p.name === playerName

      );

      if(player){

        player.sold = true;

        player.soldTo = teamName;

        player.soldPrice = soldPrice;

      }

      /* FIND TEAM */

      const team =
      tournament.teams.find(

        t => t.name === teamName

      );

      if(team){

        team.players.push({

          name:playerName,

          soldPrice

        });

        /* DEDUCT PURSE */

        team.purse -= soldPrice;

      }

      await tournament.save();

      res.json({
        success:true
      });

    }catch(err){

      console.log(err);

      res.status(500).json({
        success:false
      });

    }

});

/* GET TEAM PURSE */

router.post(
  "/getTeamPurse",
  async (req,res) => {

    try{

      const {

        tournamentId,

        teamName

      } = req.body;

      const tournament =
      await Tournament.findById(
        tournamentId
      );

      if(!tournament){

        return res.json({
          success:false
        });

      }

      const team =
      tournament.teams.find(

        t => t.name === teamName

      );

      if(!team){

        return res.json({
          success:false
        });

      }

      res.json({

        success:true,

        purse:team.purse

      });

    }catch(err){

      console.log(err);

      res.json({
        success:false
      });

    }

});

/* GET TOURNAMENT */

router.get(

  "/getTournament/:id",

  async(req,res)=>{

    try{

      const tournament =

      await Tournament.findById(
        req.params.id
      );

      res.json(
        tournament
      );

    }

    catch(err){

      console.log(err);

      res.status(500).json({

        success:false

      });

    }

  }

);

module.exports = router;