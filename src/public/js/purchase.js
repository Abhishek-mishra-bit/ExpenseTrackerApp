rzpButton.addEventListener("click", async () => {
  try {
    const response = await axios.post(
      `${baseUrl}/purchase/purchase-premium`,
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
            `${baseUrl}/purchase/update-transaction-status`,
            {
              success: true,
              orderId: res.razorpay_order_id,
              payment_id: res.razorpay_payment_id,
            },
            { headers: { Authorization: token } }
          );

          if (updateResponse.data.isPremiumUser) {
            alert("You are now a Premium user");
            // Optionally call a function to update UI, e.g., hide the premium button.
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
          `${baseUrl}/purchase/update-transaction-status`,
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
