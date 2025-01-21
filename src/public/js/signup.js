console.log("testing");

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
    // await axios.post("http://localhost:3000/user/signup", data);

    window.location.href = "http://localhost:3000/user/login";
  } catch (error) {
    // Create a FormData object to capture form input

    console.error("Error during signup", error);
  }
}
