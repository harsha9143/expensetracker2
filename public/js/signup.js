async function handleOnSubmit(e) {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const password = e.target.password.value;
  const confirmPassword = e.target.confirmPassword.value;

  const createUser = await fetch("http://localhost:4000/auth/sign-up", {
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
      window.location.href = "http://localhost:4000/auth/login";
    }, 1000);
  } else {
    msg.style.color = "red";
  }
}
