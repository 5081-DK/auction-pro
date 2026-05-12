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

  const res =
  await fetch(

    `${API}/getTournament/${tournamentId}`

  );

  const tournament =
  await res.json();

  const teams =
  tournament.teams || [];

  let y = 20;

  doc.setFontSize(22);

  doc.text(
    "AUCTION RESULTS",
    65,
    y
  );

  y += 20;

  teams.forEach(team => {

    (team.players || []).forEach(player => {

      doc.text(

        `${player.name} → ${team.name} → ₹${player.soldPrice}`,

        15,

        y

      );

      y += 10;

    });

  });

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

if(tournamentId !== ""){

  fetchPlayers();

  fetchLeaderboard();

  fetchSoldPlayers();

}