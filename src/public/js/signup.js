
const baseUrl = window.location.origin;
async function handleSubmit(event) {
  event.preventDefault();
  try {
    const data = {
      name: event.target.name.value,
      email: event.target.email.value,
      password: event.target.password.value,
    };
    
    console.log(data);

    // Send POST request with form data as JSON
    await axios.post(`${baseUrl}/user/signup`, data);

    alert("User sign in successfully");

    window.location.href = `${baseUrl}/user/login`;
    alert(baseUrl)

  } catch (error) {
    // Create a FormData object to capture form input

    console.error("Error during signup", error);
  }
}
