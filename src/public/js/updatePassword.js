// Extract requestId from the URL
const pathParts = window.location.pathname.split("/");
const requestId = pathParts[pathParts.length - 1]; // Get the last part of the path (UUID)
async function handleFormSubmit(event) {
  event.preventDefault();
  const password = event.target.password.value;
  const confirmPassword = event.target.confirmPassword.value;

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }
  try {
    const response = axios.post("http://localhost:3000/forgot/resetPassword", {
      requestId: requestId,
      newPassword: password,
      headers: { "Content-Type": "application/json" },
    });

    alert("Password updated successfully");
    window.location.href = "http://localhost:3000/user/login";
  } catch (err) {
    console.error("Error updating password", err);
    alert("Error updating password");
  }
}
