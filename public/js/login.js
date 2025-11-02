const ipadd = "13.233.234.203";

const forgotPass = document.getElementById("forgot-pass-link");

forgotPass.setAttribute("href", `http://${ipadd}/auth/forgot-password`);

const signup = document.getElementById("signup-link");

signup.setAttribute("href", `http://${ipadd}/auth/sign-up`);

async function handleOnSubmit(event) {
  event.preventDefault();

  const email = event.target.email.value;
  const password = event.target.password.value;

  const login = await fetch(`http://${ipadd}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await login.json();

  const msg = document.getElementById("message");
  msg.textContent = data.message;

  if (login.status === 200) {
    msg.style.color = "green";
    localStorage.setItem("token", data.token);
    setTimeout(() => {
      window.location.href = `http://${ipadd}/expenses`;
    }, 1500);
  } else {
    msg.style.color = "red";
  }
}
