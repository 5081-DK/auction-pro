require("dotenv").config();

const express =
require("express");

const mongoose =
require("mongoose");

const cors =
require("cors");

const http =
require("http");

const path =
require("path");

const { Server } =
require("socket.io");

/* APP */

const app =
express();

/* HTTP SERVER */

const server =
http.createServer(app);

/* SOCKET */

const io =
new Server(server,{

  cors:{
    origin:"*",
    methods:[
      "GET",
      "POST"
    ]
  }

});

/* ROUTES */

const tournamentRoutes =
require("./routes/tournament");

const authRoutes =
require("./routes/auth");

/* MIDDLEWARE */

app.use(cors());

app.use(express.json());

/* STATIC FRONTEND */

app.use(

  express.static(

    path.join(
      __dirname,
      "../client"
    )

  )

);

/* DATABASE */

mongoose.connect(

  process.env.MONGO_URI

)

.then(()=>{

  console.log(
    "MongoDB Connected"
  );

})

.catch(err=>{

  console.log(err);

});

/* API ROUTES */

app.use(
  "/",
  tournamentRoutes
);

app.use(
  "/",
  authRoutes
);

/* SOCKET CONNECTION */

io.on(
  "connection",
  socket => {

    console.log(
      "User Connected"
    );

    /* LIVE BID */

    socket.on(
      "placeBid",
      data => {

        io.emit(
          "bidUpdate",
          data
        );

      }
    );

    /* NEXT PLAYER */

    socket.on(
      "nextPlayer",
      data => {

        io.emit(
          "playerChanged",
          data
        );

      }
    );

    /* RESET BID */

    socket.on(
      "resetBid",
      () => {

        io.emit(
          "bidReset"
        );

      }
    );

    /* DISCONNECT */

    socket.on(
      "disconnect",
      () => {

        console.log(
          "User Disconnected"
        );

      }
    );

  }
);

/* HOME ROUTE */

app.get(
  "/",
  (req,res)=>{

    res.sendFile(

      path.join(
        __dirname,
        "../client/index.html"
      )

    );

  }
);

/* START SERVER */

const PORT =
process.env.PORT || 5000;

server.listen(

  PORT,

  "0.0.0.0",

  () => {

    console.log(

      `Server Running On Port ${PORT}`

    );

  }

);