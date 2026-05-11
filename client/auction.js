/* API */

const API =
"https://auction-pro-api.onrender.com";

/* SOCKET CONNECTION */

const socket =
io(API);

/* TOURNAMENT ID */

const tournamentId =
localStorage.getItem(
  "tournamentId"
);

/* CLEAR OLD DATA */

if(
  !localStorage.getItem(
    "auctionStarted"
  )
){

  localStorage.removeItem(
    "soldPlayers"
  );

  localStorage.setItem(
    "auctionStarted",
    "true"
  );

}

/* VARIABLES */

let players = [];

let currentPlayerIndex = 0;

let currentBid = 0;

let highestBidder = "";

let loggedInTeam = "";

let loggedInPurse = 0;

let isAdmin = false;

let leaderboard = {};

/* FETCH PLAYERS */

async function fetchPlayers(){

  try{

    const res =
    await fetch(

      `${API}/getPlayers/${tournamentId}`

    );

    players =
    await res.json();

    if(players.length === 0){

      alert(
        "No Players Found"
      );

      return;

    }

    loadPlayer();

  }

  catch(err){

    console.log(err);

    alert(
      "Server Error"
    );

  }

}

/* LOAD PLAYER */

function loadPlayer(){

  const player =
  players[currentPlayerIndex];

  if(!player){

    alert(
      "Auction Finished"
    );

    return;

  }

  document.getElementById(
    "playerName"
  ).innerText =
  player.name;

  document.getElementById(
    "playerImage"
  ).src =
  player.photo;

  document.getElementById(
    "playerStats"
  ).innerText =

  `Matches:
   ${player.matches}
   | Runs:
   ${player.runs}
   | Wickets:
   ${player.wickets}`;

  document.getElementById(
    "basePrice"
  ).innerText =

  `Base Price:
   ₹${player.basePrice}`;

  currentBid =
  player.basePrice;

  highestBidder = "";

  document.getElementById(
    "currentBid"
  ).innerText =
  currentBid;

  document.getElementById(
    "highestBidder"
  ).innerText =
  "No Bids Yet";

  document.getElementById(
    "bidAmount"
  ).value = "";

  /* TV DISPLAY */

  if(
    document.getElementById(
      "tvPlayerImage"
    )
  ){

    document.getElementById(
      "tvPlayerImage"
    ).src =
    player.photo;

  }

  if(
    document.getElementById(
      "tvPlayerName"
    )
  ){

    document.getElementById(
      "tvPlayerName"
    ).innerText =
    player.name;

  }

  if(
    document.getElementById(
      "tvPlayerStats"
    )
  ){

    document.getElementById(
      "tvPlayerStats"
    ).innerText =

    `Matches:
     ${player.matches}
     | Runs:
     ${player.runs}
     | Wickets:
     ${player.wickets}`;

  }

}

/* ADMIN LOGIN */

function enableAdmin(){

  const pass =
  prompt(
    "Enter Admin Secret"
  );

  if(pass === "admin123"){

    isAdmin = true;

    alert(
      "Admin Enabled"
    );

  }

  else{

    alert(
      "Wrong Password"
    );

  }

}

/* TEAM LOGIN */

async function teamLogin(){

  const teamName =
  document.getElementById(
    "loginTeamName"
  ).value;

  const password =
  document.getElementById(
    "loginTeamPassword"
  ).value;

  try{

    const res =
    await fetch(

      `${API}/teamLogin`,

      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({

          tournamentId,

          teamName,

          password

        })

      }

    );

    const data =
    await res.json();

    if(data.success){

      loggedInTeam =
      data.team.name;

      loggedInPurse =
      data.team.purse;

      document.getElementById(
        "loggedTeam"
      ).innerText =

      `Logged Team:
       ${loggedInTeam}`;

      document.getElementById(
        "teamPurse"
      ).innerText =

      `Purse:
       ₹${loggedInPurse}`;

      document.getElementById(
        "teamLogo"
      ).src =

      data.team.logo ||

      "https://cdn-icons-png.flaticon.com/512/616/616494.png";

      alert(
        "Team Login Success"
      );

    }

    else{

      alert(
        "Invalid Credentials"
      );

    }

  }

  catch(err){

    console.log(err);

    alert(
      "Server Error"
    );

  }

}

/* FETCH PURSE */

async function fetchLatestPurse(){

  try{

    const res =
    await fetch(

      `${API}/getTeamPurse`,

      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({

          tournamentId,

          teamName:
          loggedInTeam

        })

      }

    );

    const data =
    await res.json();

    if(data.success){

      loggedInPurse =
      data.purse;

      document.getElementById(
        "teamPurse"
      ).innerText =

      `Purse:
       ₹${loggedInPurse}`;

    }

  }

  catch(err){

    console.log(err);

  }

}

/* PLACE BID */

async function placeBid(){

  if(loggedInTeam === ""){

    alert(
      "Login Team First"
    );

    return;

  }

  await fetchLatestPurse();

  const amount =
  Number(

    document.getElementById(
      "bidAmount"
    ).value

  );

  if(amount <= currentBid){

    alert(
      "Bid must be higher"
    );

    return;

  }

  if(amount > loggedInPurse){

    alert(
      "Not Enough Purse"
    );

    return;

  }

  socket.emit(
    "placeBid",
    {

      team:loggedInTeam,

      amount

    }

  );

}

/* BID UPDATE */

socket.on(
  "bidUpdate",
  data => {

    currentBid =
    data.amount;

    highestBidder =
    data.team;

    document.getElementById(
      "currentBid"
    ).innerText =
    currentBid;

    document.getElementById(
      "highestBidder"
    ).innerText =

    `Highest Bidder:
     ${highestBidder}`;

  }
);

/* PLAYER CHANGED */

socket.on(
  "playerChanged",
  data => {

    currentPlayerIndex =
    data.index;

    loadPlayer();

  }
);

/* RESET BID */

socket.on(
  "bidReset",
  () => {

    currentBid = 0;

    highestBidder = "";

    document.getElementById(
      "currentBid"
    ).innerText = "0";

    document.getElementById(
      "highestBidder"
    ).innerText =
    "No Bids Yet";

  }
);

/* SELL PLAYER */

async function sellPlayer(){

  if(!isAdmin){

    alert(
      "Admin Required"
    );

    return;

  }

  if(highestBidder === ""){

    alert(
      "No bids yet"
    );

    return;

  }

  const player =
  players[currentPlayerIndex];

  try{

    await fetch(

      `${API}/sellPlayer`,

      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({

          tournamentId,

          playerName:
          player.name,

          teamName:
          highestBidder,

          soldPrice:
          currentBid

        })

      }

    );

    alert(

      `${player.name}
       sold to
       ${highestBidder}`

    );

    socket.emit(
      "resetBid"
    );

  }

  catch(err){

    console.log(err);

  }

}

/* NEXT PLAYER */

function nextPlayer(){

  currentPlayerIndex++;

  socket.emit(

    "nextPlayer",

    {
      index:
      currentPlayerIndex
    }

  );

  socket.emit(
    "resetBid"
  );

}

/* EXPORT PDF */

async function exportPDF(){

  const { jsPDF } =
  window.jspdf;

  const doc =
  new jsPDF();

  /* FETCH TOURNAMENT */

  const res =
  await fetch(

    `${API}/getTournament/${tournamentId}`

  );

  const tournament =
  await res.json();

  const teams =
  tournament.teams || [];

  let y = 20;

  /* TITLE */

  doc.setFontSize(22);

  doc.text(
    "AUCTION RESULTS",
    65,
    y
  );

  y += 20;

  /* SOLD PLAYERS */

  doc.setFontSize(18);

  doc.text(
    "Sold Players",
    15,
    y
  );

  y += 10;

  doc.setFontSize(12);

  teams.forEach(team => {

    (team.players || []).forEach(player => {

      doc.text(

        `${player.name} → ${team.name} → ₹${player.soldPrice}`,

        15,

        y

      );

      y += 8;

      if(y > 270){

        doc.addPage();

        y = 20;

      }

    });

  });

  y += 10;

  /* TEAM SECTION */

  doc.setFontSize(18);

  doc.text(
    "Team Wise Players",
    15,
    y
  );

  y += 12;

  teams.forEach(team => {

    doc.setFontSize(15);

    doc.text(
      team.name,
      15,
      y
    );

    y += 8;

    doc.setFontSize(12);

    if(
      !team.players ||
      team.players.length === 0
    ){

      doc.text(
        "No Players Bought",
        20,
        y
      );

      y += 8;

    }

    else{

      team.players.forEach(player => {

        doc.text(

          `• ${player.name} - ₹${player.soldPrice}`,

          20,

          y

        );

        y += 8;

        if(y > 270){

          doc.addPage();

          y = 20;

        }

      });

    }

    y += 10;

  });

  /* SAVE */

  doc.save(
    "Auction_Results.pdf"
  );

}

/* TV MODE */

function toggleTVMode(){

  document.body.classList.toggle(
    "tv-active"
  );

}

/* AUCTIONEER MODE */

function toggleAuctioneerMode(){

  document.body.classList.toggle(
    "auctioneer-mode"
  );

}

/* INITIAL */

fetchPlayers();