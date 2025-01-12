const formEl = document.querySelector("#signup-form");

formEl.addEventListener("submit", (e) => {
  e.preventDefault();

  // Create a FormData object to capture form input
  const formData = new FormData(formEl);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  // Send POST request with form data as JSON
  axios
    .post("http://localhost:3000/user/signup", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log("User signed up successfully", response);
    })
    .catch((error) => {
      console.error("Error during signup", error);
    });
});
