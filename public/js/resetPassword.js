const ipadd = "13.233.234.203";

async function handleOnSubmit(e) {
  e.preventDefault();

  const password = e.target.password.value;
  const confirmPassword = e.target.confirmPassword.value;

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const uuid = urlParams.get("uuid");

  const setPassword = await fetch(`http://${ipadd}/auth/set-new-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password, confirmPassword, uuid }),
  });

  const data = await setPassword.json();

  const message = document.getElementById("message");
  message.textContent = data.message;

  if (setPassword.status === 200) {
    message.style.color = "green";
    setTimeout(() => {
      window.location.href = `http://${ipadd}/auth/login`;
    }, 1000);
  } else {
    message.style.color = "red";
  }
}
