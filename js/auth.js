const PIN = "1234"; // Replace with your secure PIN

// Check if the user is logged in
function checkLogin() {
  const storedPin = localStorage.getItem("userPin");
  if (storedPin !== PIN) {
    // Redirect to login page if the stored PIN is not valid
    window.location.href = "login.html";
  }
}

// Validate the entered PIN
function validatePin() {
  const inputPin = document.getElementById("pin-input").value;
  if (inputPin === PIN) {
    localStorage.setItem("userPin", PIN);
    window.location.href = "index.html"; // Redirect to home page after login
  } else {
    document.getElementById("error-message").textContent = "Incorrect PIN. Please try again.";
  }
}

// Logout function to clear PIN
function logout() {
  localStorage.removeItem("userPin");
  window.location.href = "login.html";
}
