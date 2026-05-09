/* TOURNAMENT ID */

let tournamentId = "";

/* LOAD SAVED TOURNAMENT */

const savedTournamentId =
localStorage.getItem(
  "tournamentId"
);

if(savedTournamentId){

  tournamentId =
  savedTournamentId;

}

/* LOGOUT */

function logout(){

  localStorage.removeItem(
    "admin"
  );

  window.location.href =
  "index.html";

}

/* CREATE TOURNAMENT */

async function createTournament(){

  const name =
  document.getElementById(
    "tname"
  ).value;

  const tournamentIdInput =
  document.getElementById(
    "tid"
  ).value;

  const password =
  document.getElementById(
    "tpass"
  ).value;

  if(
    name === "" ||
    tournamentIdInput === "" ||
    password === ""
  ){

    alert(
      "Fill all fields"
    );

    return;

  }

  try{

    const res = await fetch(

      "http://localhost:5000/createTournament",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          name,

          tournamentId:
          tournamentIdInput,

          password

        })

      }

    );

    const data =
    await res.json();

    tournamentId =
    data._id;

    localStorage.setItem(

      "tournamentId",

      tournamentId

    );

    localStorage.removeItem(
      "soldPlayers"
    );

    localStorage.removeItem(
      "auctionStarted"
    );

    alert(
      "Tournament Created"
    );

    showOutput(
      "🏏 Tournament Created"
    );

  }catch(err){

    console.log(err);

  }

}

/* ADD TEAM */

async function addTeam(){

  if(tournamentId === ""){

    alert(
      "Create tournament first"
    );

    return;

  }

  const team = {

    name:
    document.getElementById(
      "teamName"
    ).value,

    password:
    document.getElementById(
      "teamPass"
    ).value,

    purse:
    Number(

      document.getElementById(
        "teamPurse"
      ).value

    ),

    logo:
    document.getElementById(
      "teamLogo"
    ).value,

    players:[]
  };

  try{

    await fetch(

      "http://localhost:5000/addTeam",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          id:tournamentId,

          team

        })

      }

    );

    alert(
      "Team Added"
    );

    showOutput(
      `✅ Team Added:
       ${team.name}`
    );

  }catch(err){

    console.log(err);

  }

}

/* ADD PLAYER */

async function addPlayer(){

  if(tournamentId === ""){

    alert(
      "Create tournament first"
    );

    return;

  }

  const player = {

    name:
    document.getElementById(
      "playerName"
    ).value,

    photo:
    document.getElementById(
      "playerPhoto"
    ).value,

    matches:
    Number(

      document.getElementById(
        "matches"
      ).value

    ),

    runs:
    Number(

      document.getElementById(
        "runs"
      ).value

    ),

    wickets:
    Number(

      document.getElementById(
        "wickets"
      ).value

    ),

    basePrice:
    Number(

      document.getElementById(
        "basePrice"
      ).value

    )

  };

  try{

    await fetch(

      "http://localhost:5000/addPlayer",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          id:tournamentId,

          player

        })

      }

    );

    alert(
      "Player Added"
    );

    showOutput(
      `🏏 Player Added:
       ${player.name}`
    );

  }catch(err){

    console.log(err);

  }

}

/* SHOW OUTPUT */

function showOutput(text){

  const output =
  document.getElementById(
    "output"
  );

  output.innerHTML +=
  `<p>${text}</p>`;

}

/* START AUCTION */

function startAuction(){

  const savedId =
  localStorage.getItem(
    "tournamentId"
  );

  if(
    !savedId ||
    savedId === "undefined"
  ){

    alert(
      "Tournament Missing"
    );

    return;

  }

  window.location.href =
  "auction.html";

}