const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");

function showLogin(){
  loginModal.style.display = "flex";
}

function showSignup(){
  signupModal.style.display = "flex";
}

function closeModal(){
  loginModal.style.display = "none";
  signupModal.style.display = "none";
}

/* SIGNUP */

async function signup(){

  const username =
  document.getElementById("signupUser").value;

  const password =
  document.getElementById("signupPass").value;

  const res = await fetch(
    "http://localhost:5000/signup",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        username,
        password
      })
    }
  );

  const data = await res.json();

  if(data.success){
    alert("Signup Successful");
    closeModal();
  }

}

/* LOGIN */

async function login(){

  const username =
  document.getElementById("loginUser").value;

  const password =
  document.getElementById("loginPass").value;

  const res = await fetch(
    "http://localhost:5000/login",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        username,
        password
      })
    }
  );

  const data = await res.json();

  if(data.success){

    localStorage.setItem(
      "admin",
      JSON.stringify(data.user)
    );

    window.location.href = "admin.html";

  }else{
    alert("Login Failed");
  }

}