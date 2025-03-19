const formE1 = document.getElementById("login-form");
const forgot_btn = document.getElementById("forgot-password-btn");

formE1.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(formE1);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  
  axios
    .post("http://13.233.118.229:3000/user/login", data, {
      headers: {
        // Correct header key
        "Content-Type": "application/json",
      },
    })
    console.log("response");
    
    .then((result) => {
      alert("User login Successfully");

      // Store token in localStorage
      localStorage.setItem("token", result.data.token);

      // Redirect to expenses page
      window.location.href = "http://13.233.118.229:3000/userexpense/expenses/";
    })
    .catch((err) => {
      console.log("User login failed", err);
      alert("User login failed");
    });

  formE1.reset();
});

forgot_btn.addEventListener("click", () => {
  window.location.href = "http://13.233.118.229:3000/forgot/emailform";
});
