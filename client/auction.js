/* SOCKET CONNECTION */

const socket =
io("http://192.168.137.1:5000");

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

    const res = await fetch(

      `http://192.168.137.1:5000/getPlayers/${tournamentId}`

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

  }catch(err){

    console.log(err);

  }

}

/* LOAD PLAYER */

function loadPlayer(){

  const player =
  players[currentPlayerIndex];

  document.getElementById(
    "playerName"
  ).innerText = player.name;

  document.getElementById(
    "playerImage"
  ).src = player.photo;

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

  document.getElementById(
    "tvPlayerImage"
  ).src = player.photo;

  document.getElementById(
    "tvPlayerName"
  ).innerText = player.name;

  document.getElementById(
    "tvPlayerStats"
  ).innerText =

  `Matches:
   ${player.matches}
   | Runs:
   ${player.runs}
   | Wickets:
   ${player.wickets}`;

  document.getElementById(
    "tvCurrentBid"
  ).innerText =
  currentBid;

  document.getElementById(
    "tvHighestBidder"
  ).innerText =
  "No Bids Yet";

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

  }else{

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

    const res = await fetch(

      "http://192.168.137.1:5000/teamLogin",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
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

    }else{

      alert(
        "Invalid Credentials"
      );

    }

  }catch(err){

    console.log(err);

  }

}

/* FETCH LATEST PURSE */

async function fetchLatestPurse(){

  try{

    const res = await fetch(

      "http://192.168.137.1:5000/getTeamPurse",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
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

  }catch(err){

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

/* SOCKET BID UPDATE */

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

    document.getElementById(
      "tvCurrentBid"
    ).innerText =
    currentBid;

    document.getElementById(
      "tvHighestBidder"
    ).innerText =

    `Highest Bidder:
     ${highestBidder}`;

});

/* PLAYER CHANGED */

socket.on(
  "playerChanged",
  data => {

    currentPlayerIndex =
    data.index;

    loadPlayer();

});

/* BID RESET */

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

    document.getElementById(
      "bidAmount"
    ).value = "";

    document.getElementById(
      "tvCurrentBid"
    ).innerText = "0";

    document.getElementById(
      "tvHighestBidder"
    ).innerText =
    "No Bids Yet";

});

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

      "http://192.168.137.1:5000/sellPlayer",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
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

    await fetchLatestPurse();

    let soldPlayers =

    JSON.parse(
      localStorage.getItem(
        "soldPlayers"
      )
    ) || [];

    soldPlayers.push({

      player:player.name,

      team:highestBidder,

      price:currentBid

    });

    localStorage.setItem(

      "soldPlayers",

      JSON.stringify(
        soldPlayers
      )

    );

    if(
      !leaderboard[
        highestBidder
      ]
    ){

      leaderboard[
        highestBidder
      ] = {

        spent:0,

        players:[]

      };

    }

    leaderboard[
      highestBidder
    ].spent += currentBid;

    leaderboard[
      highestBidder
    ].players.push({

      name:player.name,

      price:currentBid

    });

    updateSoldTable();

    updateLeaderboard();

    alert(

      `${player.name}
       sold to
       ${highestBidder}
       for ₹${currentBid}`

    );

    socket.emit(
      "resetBid"
    );

  }catch(err){

    console.log(err);

  }

}

/* NEXT PLAYER */

function nextPlayer(){

  if(!isAdmin){

    alert(
      "Admin Required"
    );

    return;

  }

  currentPlayerIndex++;

  if(
    currentPlayerIndex >=
    players.length
  ){

    alert(
      "Auction Finished"
    );

    return;

  }

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

/* SOLD TABLE */

function updateSoldTable(){

  const soldPlayers =

  JSON.parse(
    localStorage.getItem(
      "soldPlayers"
    )
  ) || [];

  const tbody =
  document.getElementById(
    "soldTableBody"
  );

  tbody.innerHTML = "";

  soldPlayers.forEach(
    player => {

      tbody.innerHTML += `

      <tr>

        <td>${player.player}</td>

        <td>${player.team}</td>

        <td>₹${player.price}</td>

      </tr>

      `;

  });

}

/* LEADERBOARD */

function updateLeaderboard(){

  const content =
  document.getElementById(
    "leaderboardContent"
  );

  content.innerHTML = "";

  for(let team in leaderboard){

    content.innerHTML += `

    <div class="team-card">

      <div>

        <h3>${team}</h3>

        <p>
          Players Bought:
          ${leaderboard[team].players.length}
        </p>

      </div>

      <div class="team-stats">

        <p>
          Total Spent:
          ₹${leaderboard[team].spent}
        </p>

      </div>

    </div>

    `;

  }

}

/* EXPORT PDF */

function exportPDF(){

  const { jsPDF } =
  window.jspdf;

  const doc =
  new jsPDF();

  const soldPlayers =

  JSON.parse(
    localStorage.getItem(
      "soldPlayers"
    )
  ) || [];

  doc.setFontSize(24);

  doc.text(
    "🏏 AUCTION PRO RESULTS",
    45,
    20
  );

  doc.setFontSize(12);

  doc.text(

    `Generated:
     ${new Date().toLocaleString()}`,

    10,
    35

  );

  let y = 50;

  doc.setFontSize(18);

  doc.text(
    "SOLD PLAYERS",
    10,
    y
  );

  y += 15;

  doc.setFontSize(14);

  doc.text(
    "PLAYER",
    10,
    y
  );

  doc.text(
    "TEAM",
    90,
    y
  );

  doc.text(
    "PRICE",
    160,
    y
  );

  y += 5;

  doc.line(
    10,
    y,
    200,
    y
  );

  y += 10;

  soldPlayers.forEach(player => {

    doc.setFontSize(12);

    doc.text(
      player.player,
      10,
      y
    );

    doc.text(
      player.team,
      90,
      y
    );

    doc.text(
      `₹${player.price}`,
      160,
      y
    );

    y += 12;

  });

  y += 20;

  doc.setFontSize(20);

  doc.text(
    "TEAM PURCHASES",
    10,
    y
  );

  y += 20;

  const teamWise = {};

  soldPlayers.forEach(player => {

    if(!teamWise[player.team]){

      teamWise[player.team] = [];

    }

    teamWise[player.team].push(player);

  });

  for(let team in teamWise){

    doc.setFontSize(16);

    doc.text(
      `Team:
       ${team}`,
      10,
      y
    );

    y += 10;

    doc.setFontSize(12);

    teamWise[team].forEach(player => {

      doc.text(

        `${player.player}
         - ₹${player.price}`,

        20,
        y

      );

      y += 10;

    });

    y += 10;

  }

  doc.save(
    "Auction_Results.pdf"
  );

}

/* AUCTIONEER MODE */

function toggleAuctioneerMode(){

  document.body.classList.toggle(
    "auctioneer-mode"
  );

}

/* TV MODE */

function toggleTVMode(){

  document.body.classList.toggle(
    "tv-active"
  );

  if(
    !document.fullscreenElement
  ){

    document.documentElement
    .requestFullscreen();

  }else{

    document.exitFullscreen();

  }

}

/* INITIAL */

fetchPlayers();

updateSoldTable();