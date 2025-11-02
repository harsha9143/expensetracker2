const ipadd = "13.233.234.203";

const loginLink = document.getElementById("login-link");

loginLink.setAttribute("href", `http://${ipadd}/auth/login`);

async function handleOnSubmit(e) {
  e.preventDefault();

  const email = e.target.email.value;

  const resetPassword = await fetch(`http://${ipadd}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await resetPassword.json();

  const message = document.getElementById("message");
  message.textContent = data.message;

  if (resetPassword.status === 200) {
    message.style.color = "green";
  }
}
