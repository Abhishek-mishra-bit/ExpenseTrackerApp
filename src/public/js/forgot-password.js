const submit_btn = document.getElementById("submit-btn");

async function handleFormSubmit(event) {
  event.preventDefault();
  try {
    const email = document.getElementById("email").value;
    axios.post("http://localhost:3000/forgot/password", { email });

    alert("Password reset link sent to your email");
    window.location.href = "http://localhost:3000/user/login";
  } catch (err) {
    console.error("Error sending password reset link", err);
    alert("Error sending password reset link");
  }
}
