async function handleOnSubmit(event) {
  event.preventDefault();

  const email = event.target.email.value;
  const password = event.target.password.value;

  const login = await fetch("http://localhost:4000/auth/login", {
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
      window.location.href = "http://localhost:4000/expenses";
    }, 1500);
  } else {
    msg.style.color = "red";
  }
}
