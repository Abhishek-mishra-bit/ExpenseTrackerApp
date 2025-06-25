const formEl = document.getElementById("login-form");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const registerLink = document.getElementById("register-link");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const baseUrl = window.location.origin;

// Toggle password visibility
togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.classList.toggle("bi-eye");
  togglePassword.classList.toggle("bi-eye-slash");
});

// Form submission handler
formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = formEl.querySelector("#submit");
  
  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing in...';
    
    const formData = new FormData(formEl);
    const data = Object.fromEntries(formData.entries());
    
    const response = await axios.post(`${baseUrl}/user/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    await Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Login Successful!',
      text: 'Redirecting to your dashboard...',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      willClose: () => {
        localStorage.setItem("token", response.data.token);
        window.location.href = `${baseUrl}/userexpense/expenses/`;
      }
    });
    
  } catch (err) {
    console.error("Login error:", err);
    let errorMessage = "Login failed. Please try again.";
    
    if (err.response) {
      if (err.response.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.response.status === 404) {
        errorMessage = "Account not found. Please check your email or register.";
      } else if (err.response.data?.message) {
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
    
    // Highlight problematic fields
    if (err.response?.data?.field) {
      const field = document.querySelector(`[name="${err.response.data.field}"]`);
      if (field) {
        field.focus();
        field.classList.add("is-invalid");
        setTimeout(() => field.classList.remove("is-invalid"), 3000);
      }
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});

// Forgot password handler
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = `${baseUrl}/forgot/emailform`;
});

// Register link handler
registerLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = `${baseUrl}/user/signup`;
});