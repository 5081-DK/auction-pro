const mongoose =
require("mongoose");

const TournamentSchema =
new mongoose.Schema({

  name:String,

  tournamentId:String,

  password:String,

  teams:[{

    name:String,

    password:String,

    purse:Number,

    logo:String,

    players:[Object]

  }],

  players:[{

    name:String,

    photo:String,

    matches:Number,

    runs:Number,

    wickets:Number,

    basePrice:Number,

    sold:{
      type:Boolean,
      default:false
    },

    soldTo:String,

    soldPrice:Number

  }]

});

module.exports =
mongoose.model(
  "Tournament",
  TournamentSchema
);