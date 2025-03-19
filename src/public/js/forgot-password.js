const message = document.getElementById("message");
const baseUrl = window.location.origin;

async function handleFormSubmit(event) {
  event.preventDefault();
  try {
    const email = event.target.email.value;
    const response = await axios.post(`${baseUrl}/forgot/password`, {
      email,
    });

    alert("Password reset link sent to your email");
    message.innerHTML =
      "Password reset link sent to your email<br /> you can reset your password form there";
  } catch (err) {
    console.error("Error sending password reset link", err.message);
    alert("Error sending password reset link");
  }
}
