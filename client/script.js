
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginMessage = document.getElementById("login-message");
const registerMessage = document.getElementById("register-message");

// SWITCH BETWEEN LOGIN AND REGISTER

function showSection(section) {
    loginSection.hidden = section !== "login";
    registerSection.hidden = section !== "register";

    loginMessage.textContent = "";
    registerMessage.textContent = "";
}

document.getElementById("show-register").addEventListener("click", () => {
    showSection("register");
});

document.getElementById("show-login").addEventListener("click", () => {
    showSection("login");
});

// DISPLAY MESSAGES

function showMessage(element, message, success = false) {
    element.textContent = message;
    element.style.color = success ? "#FFFFF6" : "#FFE0E0";
}

// LOGIN

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);

    const email = formData.get("email");
    const password = formData.get("password");

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(loginMessage, data.message || "Login failed");
            return;
        }

        showMessage(
            loginMessage,
            `Welcome, ${data.user.username}!`,
            true
        );

        loginForm.reset();
        window.location.href = "/dashboard.html?category=anime";

    } catch (error) {
        showMessage(loginMessage, "Cannot connect to server.");
        console.error(error);
    }
});

// REGISTER

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(registerForm);

    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
        showMessage(registerMessage, "Passwords do not match!");
        return;
    }

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(registerMessage, data.message || "Registration failed");
            return;
        }

        registerForm.reset();
        showSection("login");

        loginForm.elements.email.value = email;

        showMessage(
            loginMessage,
            "Account created! You can now log in.",
            true
        );

    } catch (error) {
        showMessage(registerMessage, "Cannot connect to server.");
        console.error(error);
    }
});
