const formE1 = document.getElementById("login-form");
const forgot_btn = document.getElementById("forgot-password-btn");
const baseUrl = window.location.origin;

formE1.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  try {
    const formData = new FormData(formE1);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    
    const response = await axios.post(`${baseUrl}/user/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    // Show success message and redirect after a short delay
    await Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Login Successful!',
      text: 'Welcome back! Redirecting to your dashboard...',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });
    
    // Store token and redirect after the toast is shown
    localStorage.setItem("token", response.data.token);
    window.location.href = `${baseUrl}/userexpense/expenses/`;
    
  } catch (err) {
    console.error("Login error:", err);
    let errorMessage = "Login failed. Please check your credentials and try again.";
    
    // More specific error messages based on the error response
    if (err.response) {
      if (err.response.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.response.status === 404) {
        errorMessage = "User not found. Please check your email address.";
      } else if (err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
    }
    
    await Swal.fire({
      position: 'center',
      icon: 'error',
      title: 'Login Failed',
      text: errorMessage,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Try Again'
    });
  }
  
  formE1.reset();
});

// Forgot password button click handler
if (forgot_btn) {
  forgot_btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = `${baseUrl}/forgot/emailform`;
  });
}
