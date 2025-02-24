// expense.js
const formE1 = document.getElementById("expense-form");
const show_report = document.getElementById("show-report");
document.getElementById("downloadBtn").addEventListener("click", downloadCSV);

formE1.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(formE1);
  const expense = {};
  formData.forEach((value, key) => {
    expense[key] = value;
  });

  try {
    await axios.post("http://localhost:3000/userexpense/expenses", expense, {
      headers: { Authorization: localStorage.getItem("token") },
    });
    alert("Expense added successfully");
    loadItem();
    formE1.reset();
  } catch (err) {
    console.error("Error adding expense:", err);
    alert("Error adding expense");
  }
});

async function loadItem() {
  try {
    const response = await axios.get(
      "http://localhost:3000/userexpense/expenses/data",
      {
        headers: { Authorization: localStorage.getItem("token") },
      }
    );
    console.log("Expenses:", response.data);

    const expenseList = document.getElementById("expense-list");
    expenseList.innerHTML = ""; // Clear previous items

    response.data.forEach((item) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        ${item.expenseAmount} - ${item.description} - ${item.category}
        <button onclick="deleteItem(${item.id})" class="btn btn-danger">Delete</button>
      `;
      expenseList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading expenses:", error);
    alert("Failed to load expenses");
  }
}
function loadFullReport(expenses) {
  const expenseTableBody = document.getElementById("expense-table-body");
  expenseTableBody.innerHTML = ""; // Clear previous rows

  let index = 0;
  expenses.forEach((item) => {
    const dateObj = new Date(item.createdAt);
    const formattedDate = dateObj.toLocaleDateString("en-GB");

    const row = document.createElement("tr");
    index++;

    row.innerHTML = `
      <td>${index}</td>
      <td>${item.expenseAmount}</td>
      <td>${item.description}</td>
      <td>${item.category}</td>
      <td>${formattedDate}</td>
    `;

    expenseTableBody.appendChild(row);
  });
}

async function showReport(event) {
  event.preventDefault();

  try {
    const response = await axios.get(
      "http://localhost:3000/userexpense/expenses/data",
      {
        headers: { Authorization: localStorage.getItem("token") },
      }
    );

    console.log("Full report expenses:", response.data);

    // Call the function to display the report data in the table
    loadFullReport(response.data);
    // Show the modal
    const modal = new bootstrap.Modal(
      document.getElementById("expenseReportModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error loading full report:", error);
    alert("Failed to load full report: " + error);
  }
}

function downloadCSV() {
  const rows = [
    ["Index", "Amount", "Description", "Category", "Date"], // CSV headers
  ];
  const tableRows = document.querySelectorAll("#expense-table-body tr");

  tableRows.forEach((row, index) => {
    const cells = row.querySelectorAll("td");
    const rowData = [
      index + 1, // Index
      cells[1].textContent, // Amount
      cells[2].textContent, // Description
      cells[3].textContent, // Category
      cells[4].textContent, // Date
    ];
    rows.push(rowData);
  });

  const csvContent = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses_report.csv";
  a.click();
  window.URL.revokeObjectURL(url);
}

async function deleteItem(id) {
  try {
    await axios.delete(`http://localhost:3000/userexpense/expenses/${id}`, {
      headers: { Authorization: localStorage.getItem("token") },
    });
    alert("Expense deleted successfully");
    loadItem();
  } catch (err) {
    console.error("Error deleting expense:", err);
    alert("Failed to delete expense");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in to access this page.");
    window.location.href = "http://localhost:3000/user/login"; // Redirect to login page
    return;
  }
  loadItem();
});

async function download() {
  try {
    const response = await axios.get(
      "http://localhost:3000/userexpense/expenses/data",
      {
        headers: { Authorization: localStorage.getItem("token") },
      }
    );

    const csvData = response.data
      .map((item) => {
        return `${item.expenseAmount},${item.description},${item.category}`;
      })
      .join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    alert("Expenses downloaded successfully");
    window.URL.revokeObjectURL(url);
    loadItem();
  } catch (error) {
    console.error("Error downloading expenses:", error);
    alert("Failed to download expenses");
  }
}
