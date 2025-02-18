// expense.js
const formE1 = document.getElementById("expense-form");

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
  loadItem();
});
