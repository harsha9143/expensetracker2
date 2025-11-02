const ipadd = "13.233.234.203";

const loginLink = document.getElementById("login-link");
loginLink.setAttribute("href", `http://${ipadd}/auth/login`);

async function handleOnSubmit(e) {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const password = e.target.password.value;
  const confirmPassword = e.target.confirmPassword.value;

  const createUser = await fetch(`http://${ipadd}/auth/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });

  const data = await createUser.json();

  const msg = document.getElementById("message");
  msg.textContent = data.message;

  if (createUser.status === 201) {
    msg.style.color = "green";
    setTimeout(() => {
      window.location.href = `http://${ipadd}/auth/login`;
    }, 1000);
  } else {
    msg.style.color = "red";
  }
}
