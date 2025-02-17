const formE1 = document.getElementById("expense-form");
const rzpButton = document.getElementById("rzp-button");
const leaderboardButton = document.getElementById("leaderboard-button");
const leaderboardSection = document.getElementById("leaderboard-section");
const leaderboardBody = document.getElementById("leaderboard-list");

const token = localStorage.getItem("token");

leaderboardButton.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    if (leaderboardSection.style.display === "block") {
      leaderboardSection.style.display = "none";
      leaderboardButton.textContent = "Show leaderboard";
    } else {
      // Fetch leaderboard data using GET request
      const response = await axios.get(
        "http://localhost:3000/premium/leaderboard",
        {
          headers: { Authorization: token },
        }
      );

      // Clear previous leaderboard data
      leaderboardBody.innerHTML = "";

      // Generate table rows dynamically
      leaderboardBody.innerHTML = response.data
        .map((user) => {
          const total = user.total_cost ? user.total_cost : 0;
          return `<tr><td>${user.name} - </td><td>${total}</td></tr><br/>`;
        })
        .join("");

      // Toggle leaderboard visibility
      leaderboardSection.style.display = "block";
      leaderboardButton.textContent = "Hide leaderboard";
    }
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    alert("Error fetching leaderboard");
  }
});

async function hideOrNot() {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      "http://localhost:3000/purchase/ispremium",
      { headers: { Authorization: token } }
    );
    console.log("response:" + response);

    if (response.data.isPremiumUser) {
      rzpButton.style.display = "none";
      const premiumText = document.getElementById("premiumText");
      premiumText.textContent = "Thanks for being a premium user!";
      premiumText.style.fontWeight = "bold !important";
    }
  } catch (err) {
    console.error("Error checking premium status:", err);
  }
}

rzpButton.addEventListener("click", async () => {
  try {
    const response = await axios.post(
      "http://localhost:3000/purchase/purchase-premium",
      {},
      { headers: { Authorization: token } }
    );

    const options = {
      key: response.data.key_id,
      amount: response.data.amount,
      currency: "INR",
      name: "Abhishek Corp",
      description: "Test Transaction",
      image:
        "https://www.creativefabrica.com/wp-content/uploads/2019/02/Money-dollar-payment-logo-vector-by-Mansel-Brist.jpg",
      order_id: response.data.orderId,
      handler: async function (res) {
        try {
          const updateResponse = await axios.post(
            "http://localhost:3000/purchase/update-transaction-status",
            {
              success: true,
              orderId: res.razorpay_order_id,
              payment_id: res.razorpay_payment_id,
            },
            { headers: { Authorization: token } }
          );

          if (updateResponse.data.isPremiumUser) {
            // ✅ Use updateResponse correctly
            alert("You are now a Premium user");
            hideOrNot(); // Refresh UI
          }
        } catch (error) {
          console.error("Error updating transaction:", error);
          alert("Transaction update failed");
        }
      },
      theme: { color: "#3399cc" },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();

    rzp1.on("payment.failed", async function (response) {
      try {
        await axios.post(
          "http://localhost:3000/purchase/update-transaction-status",
          {
            success: false,
            order_id: response.error.metadata.order_id,
            payment_id: response.error.metadata.payment_id,
          },
          { headers: { Authorization: token } }
        );
        alert(response.error.description);
      } catch (error) {
        console.error("Error updating transaction:", error);
        alert("Transaction update failed");
      }
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    alert("Failed to create Razorpay order");
  }
});

formE1.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(formE1);
  const expense = {};
  formData.forEach((value, key) => {
    expense[key] = value;
  });

  try {
    await axios.post("http://localhost:3000/userexpense/expenses", expense, {
      headers: { Authorization: token },
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
      { headers: { Authorization: token } }
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
      headers: { Authorization: token },
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
  hideOrNot();
  if (!token) {
    window.location.href = "http://localhost:3000/user/login";
  }
});
