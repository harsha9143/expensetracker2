const ipadd = "13.233.234.203";

const premium = document.getElementById("premium");

premium.setAttribute("href", `http://${ipadd}/payments`);

window.addEventListener("DOMContentLoaded", () => initialize());

document
  .getElementById("limit")
  .addEventListener("change", () =>
    initialize(1, document.getElementById("limit").value)
  );

async function initialize(page = 1, limit = 5) {
  document.getElementById("main-content").style.display = "none";
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    window.location.href = `http://${ipadd}/auth/login`;
    return;
  }

  const res = await fetch(`http://${ipadd}/verify-token`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (res.status !== 200) {
    alert("session expired");
    localStorage.removeItem("token");
    window.location.href = `http://${ipadd}/auth/login`;
    return;
  }

  document.getElementById("main-content").style.display = "block";

  const table = document.getElementById("expenses-list");

  const expenses = await fetch(
    `http://${ipadd}/expenses/items?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const expensesData = await expenses.json();

  const allExpenses = expensesData.expenses;
  const paginationData = expensesData.pagination;

  table.innerHTML = "";
  for (let i = 0; i < allExpenses.length; i++) {
    display(table, allExpenses[i], page, limit);
  }

  showPagination(paginationData);

  const user = await fetch(`http://${ipadd}/expenses/user-type`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const userData = await user.json();

  const welcome = document.getElementById("welcome");
  welcome.textContent = `Welcome ${userData.name}`;
  welcome.style.color = "blue";

  const link = document.getElementById("premium");
  const leaderBtn = document.getElementById("leader-btn");
  if (userData.isPremiumUser === "YES") {
    link.style.display = "none";
    leaderBtn.style.display = "inline";
    leaderBtn.addEventListener("click", () => getLeaderBoard(token));
  } else {
    leaderBtn.style.display = "none";
    link.style.display = "inline";
  }
}

async function handleOnSubmit(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");

  const price = e.target.price.value;
  const description = e.target.description.value;

  const addItem = await fetch(`http://${ipadd}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ price, description }),
  });

  const data = await addItem.json();
  const addMsg = document.getElementById("add-message");
  addMsg.textContent = data.message;

  if (addItem.status === 201) {
    addMsg.style.color = "green";
    location.reload();
  } else {
    addMsg.style.color = "red";
  }
}

function display(table, item, page, limit) {
  const tr = document.createElement("tr");

  tr.innerHTML = `<td>${new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
          <td>${item.price}</td>
          <td>${item.description}</td>
          <td>${item.category}</td>`;

  const del = document.createElement("button");
  del.textContent = "Delete";

  const td = document.createElement("td");
  td.appendChild(del);

  tr.appendChild(td);
  table.appendChild(tr);

  del.addEventListener("click", () =>
    removeItem(tr, item.id, page, limit, table)
  );
}

async function getLeaderBoard(token) {
  const leader_board = document.getElementById("leaderboard-card");
  leader_board.style.display = "";

  const userwiseExpenses = await fetch(
    `http://${ipadd}/expenses/user-wise-expenses`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const usersData = await userwiseExpenses.json();

  const leaderBoard = document.getElementById("leader-board");
  leaderBoard.innerHTML = "";
  for (let i = 0; i < usersData.length; i++) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i + 1}</td>
    <td>${usersData[i].name}</td>
    <td>${usersData[i].totalExpenses}</td>`;
    leaderBoard.appendChild(tr);
  }
}

async function removeItem(tr, id, page, limit, table) {
  const token = localStorage.getItem("token");
  const delItem = await fetch(`http://${ipadd}/expenses/remove-expense`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ id }),
  });

  tr.remove();

  const remainingRows = table.querySelectorAll("tr").length;

  if (remainingRows === 0 && page > 1) {
    page = page - 1;
  }

  initialize(page, limit);

  const data = await delItem.json();

  const msg = document.getElementById("delete-message");
  msg.textContent = data.message;
  msg.style.color = "orangered";
  setInterval(() => {
    msg.style.display = "none";
  }, 1000);
}

function showPagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  lastPage,
}) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  if (hasPreviousPage) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "prev";
    prevBtn.addEventListener("click", () =>
      initialize(previousPage, document.getElementById("limit").value)
    );
    pagination.appendChild(prevBtn);
  }

  const pageInfo = document.createElement("span");
  pageInfo.textContent = `page ${currentPage} of ${lastPage}`;
  pageInfo.style.margin = "0px 10px";
  pagination.append(pageInfo);

  if (hasNextPage) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "next";
    nextBtn.addEventListener("click", () =>
      initialize(nextPage, document.getElementById("limit").value)
    );
    pagination.appendChild(nextBtn);
  }
}

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = `http://${ipadd}/auth/login`;
});

document.getElementById("download-btn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const downloadURL = await fetch(`http://${ipadd}/expenses/download`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const url = await downloadURL.json();
  if (url.success) {
    window.open(url.url, "_blank");
  } else {
    window.open(`http://${ipadd}/error`, "_blank");
  }
});
