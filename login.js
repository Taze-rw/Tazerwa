document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  // Simulated login (replace with your API)
  console.log("Logging in:", { email, password });

  alert("Login successful (demo)");
});
