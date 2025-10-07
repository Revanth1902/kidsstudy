let isLogin = true;

window.onload = function () {
  const token = localStorage.getItem("authToken");
  if (token) {
    window.location.href = "dashboard.html";
  }
};

// Toggle between login and register
function toggleForm() {
  isLogin = !isLogin;

  document.getElementById("form-title").textContent = isLogin
    ? "Login"
    : "Register";
  document.getElementById("submit-btn").textContent = isLogin
    ? "Login"
    : "Register";
  document.getElementById("toggle-msg").innerHTML = isLogin
    ? `Don't have an account? <a href="#" onclick="toggleForm()">Register</a>`
    : `Already have an account? <a href="#" onclick="toggleForm()">Login</a>`;

  const registerFields = document.getElementById("register-fields");
  registerFields.classList.toggle("hidden", isLogin);
  registerFields.classList.toggle("visible", !isLogin);
  document.getElementById("auth-error").textContent = "";
}

// Preview avatar
document.getElementById("avatar").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const preview = document.getElementById("avatar-preview");
  const container = document.getElementById("avatar-preview-container");

  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      container.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "#";
    container.style.display = "none";
  }
});

// Convert file to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

// Handle form submit
document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("auth-error");
  const submitBtn = document.getElementById("submit-btn");
  const loader = document.getElementById("loader");

  if (!email || !password) {
    errorBox.textContent = "Email and password are required.";
    return;
  }

  let bodyData = { email, password };

  if (!isLogin) {
    const name = document.getElementById("name").value.trim();
    const age = parseInt(document.getElementById("age").value.trim());
    const cls = document.getElementById("class").value.trim();
    const avatarFile = document.getElementById("avatar").files[0];

    if (!name || !age || !cls) {
      errorBox.textContent = "Please fill in all registration fields.";
      return;
    }

    let avatarBase64 = "";
    if (avatarFile) {
      avatarBase64 = await toBase64(avatarFile);
    }

    bodyData = {
      name,
      age,
      class: cls,
      email,
      password,
      avatar: avatarBase64,
    };
  }

  submitBtn.style.display = "none";
  loader.style.display = "block";
  errorBox.textContent = "";

  const endpoint = isLogin
    ? "https://kidsappbackend.onrender.com/api/auth/login"
    : "https://kidsappbackend.onrender.com/api/auth/register";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.message || "Something went wrong!", true);
      submitBtn.style.display = "block";
      loader.style.display = "none";
      return;
    }

    if (isLogin) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user || data));
      showToast("Login successful!");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } else {
      showToast("Registered successfully! Now login.");
      toggleForm();
    }
  } catch (err) {
    console.error(err);
    showToast("Network error. Please try again.", true);
  }

  submitBtn.style.display = "block";
  loader.style.display = "none";
});

// Toast message
function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.style.backgroundColor = isError ? "#e53935" : "#4caf50";
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}
