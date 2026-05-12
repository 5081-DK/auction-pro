/* API */

const API =
"https://auction-pro-api.onrender.com";

/* SOCKET */

const socket =
io(API);

/* TOURNAMENT ID */

let tournamentId =
localStorage.getItem(
  "tournamentId"
) || "";

/* VARIABLES */

let players = [];

let currentPlayerIndex = 0;

let currentBid = 0;

let highestBidder = "";

let loggedInTeam = "";

let loggedInPurse = 0;

let isAdmin = false;

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

      return;

    }

    loadPlayer();

  }

  catch(err){

    console.log(err);

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

  /* TV MODE */

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

  const enteredTournamentId =
  document.getElementById(
    "loginTournamentId"
  ).value;

  const teamName =
  document.getElementById(
    "loginTeamName"
  ).value;

  const password =
  document.getElementById(
    "loginTeamPassword"
  ).value;

  if(
    enteredTournamentId === "" ||
    teamName === "" ||
    password === ""
  ){

    alert(
      "Fill all fields"
    );

    return;

  }

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

          tournamentId:
          enteredTournamentId,

          teamName,

          password

        })

      }

    );

    const data =
    await res.json();

    if(data.success){

      tournamentId =
      data.tournamentId;

      localStorage.setItem(

        "tournamentId",

        tournamentId

      );

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

      await fetchPlayers();

      await fetchLeaderboard();

      await fetchSoldPlayers();

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

/* FETCH LEADERBOARD */

async function fetchLeaderboard(){

  try{

    const res =
    await fetch(

      `${API}/getTournament/${tournamentId}`

    );

    const tournament =
    await res.json();

    const teams =
    tournament.teams || [];

    const leaderboardDiv =
    document.getElementById(
      "leaderboardContent"
    );

    leaderboardDiv.innerHTML = "";

    teams.forEach(team => {

      leaderboardDiv.innerHTML += `

        <div class="leaderboard-card">

          <h3>${team.name}</h3>

          <p>
            Purse:
            ₹${team.purse}
          </p>

        </div>

      `;

    });

  }

  catch(err){

    console.log(err);

  }

}

/* FETCH SOLD PLAYERS */

async function fetchSoldPlayers(){

  try{

    const res =
    await fetch(

      `${API}/getTournament/${tournamentId}`

    );

    const tournament =
    await res.json();

    const teams =
    tournament.teams || [];

    const table =
    document.getElementById(
      "soldTableBody"
    );

    table.innerHTML = "";

    teams.forEach(team => {

      (team.players || []).forEach(player => {

        table.innerHTML += `

          <tr>

            <td>${player.name}</td>

            <td>${team.name}</td>

            <td>₹${player.soldPrice}</td>

          </tr>

        `;

      });

    });

  }

  catch(err){

    console.log(err);

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

    fetchLeaderboard();

  }
);

/* NEXT PLAYER SOCKET */

socket.on(
  "playerChanged",
  data => {

    currentPlayerIndex =
    data.index;

    loadPlayer();

  }
);

/* RESET BID SOCKET */

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

    await fetchLeaderboard();

    await fetchSoldPlayers();

    await fetchLatestPurse();

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

  const tournamentName =
  tournament.name || "AUCTION PRO";

  /* COVER PAGE */

  doc.setFillColor(
    5,
    15,
    45
  );

  doc.rect(
    0,
    0,
    210,
    297,
    "F"
  );

  doc.setTextColor(
    0,
    255,
    200
  );

  doc.setFontSize(30);

  doc.text(
    tournamentName,
    40,
    50
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFontSize(24);

  doc.text(
    "🏏 AUCTION RESULTS",
    45,
    90
  );

  doc.setFontSize(16);

  doc.text(
    `Generated:
     ${new Date().toLocaleString()}`,
    45,
    120
  );

  doc.setDrawColor(
    0,
    255,
    200
  );

  doc.line(
    30,
    140,
    180,
    140
  );

  /* SOLD PLAYERS PAGE */

  doc.addPage();

  doc.setFillColor(
    25,
    25,
    112
  );

  doc.rect(
    0,
    0,
    210,
    297,
    "F"
  );

  doc.setTextColor(
    255,
    215,
    0
  );

  doc.setFontSize(24);

  doc.text(
    "💰 SOLD PLAYERS LIST",
    40,
    25
  );

  let y = 45;

  teams.forEach(team => {

    (team.players || []).forEach(player => {

      /* PLAYER CARD */

      doc.setFillColor(
        35,
        35,
        120
      );

      doc.roundedRect(
        15,
        y - 8,
        180,
        15,
        3,
        3,
        "F"
      );

      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFontSize(13);

      doc.text(
        `${player.name}`,
        20,
        y
      );

      doc.setTextColor(
        0,
        255,
        200
      );

      doc.text(
        `${team.name}`,
        90,
        y
      );

      doc.setTextColor(
        255,
        215,
        0
      );

      doc.text(
        `₹${player.soldPrice}`,
        155,
        y
      );

      y += 20;

      if(y > 260){

        doc.addPage();

        doc.setFillColor(
          25,
          25,
          112
        );

        doc.rect(
          0,
          0,
          210,
          297,
          "F"
        );

        y = 30;

      }

    });

  });

  /* TEAM WISE SECTION */

  teams.forEach(team => {

    doc.addPage();

    doc.setFillColor(
      10,
      10,
      60
    );

    doc.rect(
      0,
      0,
      210,
      297,
      "F"
    );

    /* TEAM HEADING */

    doc.setTextColor(
      0,
      255,
      200
    );

    doc.setFontSize(26);

    doc.text(
      `🏏 ${team.name}`,
      20,
      25
    );

    /* PURSE */

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFontSize(16);

    doc.text(
      `Remaining Purse:
       ₹${team.purse}`,
      20,
      45
    );

    /* PLAYERS TITLE */

    doc.setTextColor(
      255,
      215,
      0
    );

    doc.setFontSize(18);

    doc.text(
      "Players Bought",
      20,
      70
    );

    let teamY = 90;

    if(
      !team.players ||
      team.players.length === 0
    ){

      doc.setTextColor(
        255,
        100,
        100
      );

      doc.text(
        "No Players Bought",
        20,
        teamY
      );

    }

    else{

      team.players.forEach(player => {

        doc.setFillColor(
          30,
          30,
          90
        );

        doc.roundedRect(
          15,
          teamY - 8,
          180,
          15,
          3,
          3,
          "F"
        );

        doc.setTextColor(
          255,
          255,
          255
        );

        doc.setFontSize(13);

        doc.text(
          `${player.name}`,
          20,
          teamY
        );

        doc.setTextColor(
          255,
          215,
          0
        );

        doc.text(
          `₹${player.soldPrice}`,
          150,
          teamY
        );

        teamY += 20;

        if(teamY > 260){

          doc.addPage();

          doc.setFillColor(
            10,
            10,
            60
          );

          doc.rect(
            0,
            0,
            210,
            297,
            "F"
          );

          teamY = 30;

        }

      });

    }

  });

  /* FINAL PAGE */

  doc.addPage();

  doc.setFillColor(
    0,
    0,
    0
  );

  doc.rect(
    0,
    0,
    210,
    297,
    "F"
  );

  doc.setTextColor(
    0,
    255,
    200
  );

  doc.setFontSize(32);

  doc.text(
    "THANK YOU",
    60,
    120
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFontSize(18);

  doc.text(
    tournamentName,
    55,
    150
  );

  doc.text(
    "Auction Pro - IPL Style Auction System",
    18,
    180
  );

  /* SAVE PDF */

  doc.save(
    `${tournamentName}_Auction_Results.pdf`
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

if(tournamentId !== ""){

  fetchPlayers();

  fetchLeaderboard();

  fetchSoldPlayers();

}