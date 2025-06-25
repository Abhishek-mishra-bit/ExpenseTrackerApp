
const baseUrl = window.location.origin;
const sign_in = document.getElementById("sign_in");
sign_in.addEventListener("click",()=>{
  window.location.href = `${baseUrl}/user/login`;
})
async function handleSubmit(event) {
  event.preventDefault();
  try {
    const data = {
      name: event.target.name.value,
      email: event.target.email.value,
      password: event.target.password.value,
    };    

    // Send POST request with form data as JSON
    await axios.post(`${baseUrl}/user/signup`, data);

    await Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Signup successful!',
      text: 'Redirecting to your login page...',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });

    window.location.href = `${baseUrl}/user/login`;

  } catch (error) {
    // Create a FormData object to capture form input

    console.error("Error during signup", error);
    let errorMessage = "Signup failed. Please check your credentials and try again.";
    
    // More specific error messages based on the error response
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.response.status === 404) {
        errorMessage = "User not found. Please check your email address.";
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    await Swal.fire({
      position: 'center',
      icon: 'error',
      title: 'Signup Failed',
      text: errorMessage,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Try Again'
    });
  }
}
