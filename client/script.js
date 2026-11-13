
const { t, translateServerError } = window.MyListI18n;

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
            showMessage(loginMessage, translateServerError(data.message, "auth.loginFailed"));
            return;
        }

        showMessage(
            loginMessage,
            t("auth.welcome", { username: data.user.username }),
            true
        );

        loginForm.reset();
        window.location.href = "/dashboard.html?category=anime";

    } catch (error) {
        showMessage(loginMessage, t("auth.noServer"));
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
        showMessage(registerMessage, t("auth.passwordMismatch"));
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
            showMessage(registerMessage, translateServerError(data.message, "auth.registerFailed"));
            return;
        }

        registerForm.reset();
        showSection("login");

        loginForm.elements.email.value = email;

        showMessage(
            loginMessage,
            t("auth.created"),
            true
        );

    } catch (error) {
        showMessage(registerMessage, t("auth.noServer"));
        console.error(error);
    }
});
