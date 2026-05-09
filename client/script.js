const API =
"https://auction-pro-api.onrender.com";

/* MODALS */

const loginModal =
document.getElementById("loginModal");

const signupModal =
document.getElementById("signupModal");

/* SHOW LOGIN */

function showLogin(){

  loginModal.style.display =
  "flex";

}

/* SHOW SIGNUP */

function showSignup(){

  signupModal.style.display =
  "flex";

}

/* CLOSE MODAL */

function closeModal(){

  loginModal.style.display =
  "none";

  signupModal.style.display =
  "none";

}

/* SIGNUP */

async function signup(){

  try{

    const username =
    document.getElementById(
      "signupUser"
    ).value;

    const password =
    document.getElementById(
      "signupPass"
    ).value;

    const res =
    await fetch(

      `${API}/signup`,

      {
        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({
          username,
          password
        })

      }

    );

    const data =
    await res.json();

    if(data.success){

      alert(
        "Signup Successful"
      );

      closeModal();

    }else{

      alert(
        data.message ||
        "Signup Failed"
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

/* LOGIN */

async function login(){

  try{

    const username =
    document.getElementById(
      "loginUser"
    ).value;

    const password =
    document.getElementById(
      "loginPass"
    ).value;

    const res =
    await fetch(

      `${API}/login`,

      {
        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },

        body:JSON.stringify({
          username,
          password
        })

      }

    );

    const data =
    await res.json();

    if(data.success){

      localStorage.setItem(

        "admin",

        JSON.stringify(
          data.user
        )

      );

      alert(
        "Login Successful"
      );

      window.location.href =
      "admin.html";

    }

    else{

      alert(
        data.message ||
        "Login Failed"
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