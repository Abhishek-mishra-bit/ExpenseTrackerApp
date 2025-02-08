const formE1 = document.getElementById("expense-form");
const rzpButton = document.getElementById("rzp-button");

rzpButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(
      "http://localhost:3000/purchase/purchase-premium",
      {},
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const options = {
      key: response.data.key_id, // Use key_id from backend response
      amount: response.data.amount,
      currency: "INR",
      name: "Abhishek Corp",
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: response.data.orderId,
      handler: async function (res) {
        try {
          await axios.post(
            "http://localhost:3000/purchase/update-transaction-status",
            {
              success: true,
              orderId: res.razorpay_order_id,
              payment_id: res.razorpay_payment_id,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          );
          alert("You are a Premium user");
        } catch (error) {
          console.error("Error updating transaction status:", error);
          alert("Error updating transaction status");
        }
      },
      theme: {
        color: "#3399cc",
      },
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
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );
        alert(response.error.description);
      } catch (error) {
        console.error("Error updating transaction status:", error);
        alert("Error updating transaction status");
      }
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    alert("Error creating Razorpay order");
  }
});

formE1.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(formE1);
  const expense = {};
  formData.forEach((value, key) => {
    expense[key] = value;
  });
  axios
    .post("http://localhost:3000/userexpense/expenses", expense, {
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
    })
    .then((result) => {
      console.log("Expense added successfully");
      alert("Expense added successfully");
      loadItem();
    })
    .catch((err) => {
      console.error("Error adding expense", err);
      alert("Error adding expense");
    });

  formE1.reset();
});

async function loadItem() {
  try {
    const responese = await axios.get(
      "http://localhost:3000/userexpense/expenses/data",
      {
        headers: {
          Authorization: localStorage.getItem("token"), // Use localStorage token
        },
      }
    );

    const data = responese.data;
    console.log(data);

    const expenseList = document.getElementById("expense-list");
    expenseList.innerHTML = "";
    data.forEach((item) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `${item.expenseAmount} - ${item.description} - ${item.category}
            <button onclick="deleteItem(${item.id})" class="btn btn-danger">Delete</button>`;
      expenseList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading expenses:", error.message);
    alert("Error loading expenses");
  }
}

async function deleteItem(id) {
  try {
    const result = await axios.delete(
      `http://localhost:3000/userexpense/expenses/${id}`,
      {
        headers: {
          Authorization: localStorage.getItem("token"), // Use localStorage token
        },
      }
    );
    console.log("Expense deleted successfully");
    alert("Expense deleted successfully");
    loadItem(); // Reload items after deleting an expense
  } catch (err) {
    console.error("Error deleting expense", err);
    alert("Error deleting expense");
  }
}

loadItem();

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "http://localhost:3000/user/login";
  }
});
