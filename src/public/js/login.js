const formE1 = document.getElementById("login-form");
const forgot_btn = document.getElementById("forgot-password-btn");

const baseUrl = window.location.origin;

formE1.addEventListener("submit", async (e) => {
  e.preventDefault();
  try{
  const formData = new FormData(formE1);
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  
  const response =  await axios
    .post(`${baseUrl}/user/login`, data, {
      headers: {
        // Correct header key
        "Content-Type": "application/json",
      },
    })
    
    
    
      alert("User login Successfully");

      // Store token in localStorage
      localStorage.setItem("token", response.data.token);

      // Redirect to expenses page
      window.location.href = `${baseUrl}/userexpense/expenses/`;
    }
    catch(err)  {
      console.log("User login failed", err);
      alert("User login failed");
    }

  formE1.reset();
  });


forgot_btn.addEventListener("click", () => {
  window.location.href = `${baseUrl}/forgot/emailform`;
});
