let isLogin = true;

// On page load: if already logged in, go to dashboard
window.onload = function () {
  const token = localStorage.getItem("authToken");
  if (token) {
    window.location.href = "dashboard.html";
  }
};

function toggleForm() {
  isLogin = !isLogin;
  document.getElementById("form-title").innerText = isLogin
    ? "Login"
    : "Register";
  document.getElementById("submit-btn").innerText = isLogin
    ? "Login"
    : "Register";
  document.getElementById("toggle-msg").innerHTML = isLogin
    ? `Don't have an account? <a href="#" onclick="toggleForm()">Register</a>`
    : `Already have an account? <a href="#" onclick="toggleForm()">Login</a>`;
  document.getElementById("auth-error").innerText = "";
}

document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("auth-error");
  const submitBtn = document.getElementById("submit-btn");
  const loader = document.getElementById("loader");

  if (!email || !password) {
    errorBox.innerText = "Both fields are required.";
    return;
  }

  // Disable button and show loader
  submitBtn.style.display = "none";
  loader.style.display = "block";
  errorBox.innerText = "";

  const endpoint = isLogin
    ? "https://kidsappbackend.onrender.com/api/auth/login"
    : "https://kidsappbackend.onrender.com/api/auth/register";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorBox.innerText = data.message || "Something went wrong!";
      submitBtn.style.display = "block";
      loader.style.display = "none";
      return;
    }

    if (isLogin) {
      localStorage.setItem("authToken", data.token);
      window.location.href = "dashboard.html";
    } else {
      alert("Registration successful! Now please login.");
      toggleForm();
    }
  } catch (err) {
    errorBox.innerText = "Network error. Please try again.";
    console.error(err);
  }

  // Re-enable button in case of error or register success
  submitBtn.style.display = "block";
  loader.style.display = "none";
});
