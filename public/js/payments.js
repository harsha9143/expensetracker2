const ipadd = "13.204.63.156";

const cashfree = Cashfree({
  mode: "sandbox",
});

const token = localStorage.getItem("token");

document.getElementById("renderBtn").addEventListener("click", async () => {
  const makePayment = await fetch(`http://${ipadd}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  const data = await makePayment.json();

  const paymentSessionId = data.paymentSessionId;

  let checkoutOptions = {
    paymentSessionId: paymentSessionId,
    redirectTarget: "_self",
  };
  await cashfree.checkout(checkoutOptions);
});
