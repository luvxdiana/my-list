// Translations

(function () {
  "use strict";

  const STORAGE_KEY = "mylist-language";
  const DEFAULT_LANGUAGE = "uk";
  const translations = {
    uk: {
      "language.label": "Мова інтерфейсу",
      "auth.pageTitle": "My List | Вхід",
      "auth.loginTitle": "УВІЙТИ",
      "auth.registerTitle": "РЕЄСТРАЦІЯ",
      "auth.email": "Електронна пошта",
      "auth.username": "Ім’я користувача",
      "auth.password": "Пароль",
      "auth.confirmPassword": "Підтвердіть пароль",
      "auth.loginButton": "УВІЙТИ",
      "auth.registerButton": "ЗАРЕЄСТРУВАТИСЯ",
      "auth.noAccount": "Немає облікового запису?",
      "auth.haveAccount": "Уже маєте обліковий запис?",
      "auth.registerLink": "Реєстрація",
      "auth.loginLink": "Увійти",
      "auth.loginFailed": "Не вдалося увійти.",
      "auth.registerFailed": "Не вдалося зареєструватися.",
      "auth.noServer": "Не вдалося з’єднатися із сервером.",
      "auth.passwordMismatch": "Паролі не збігаються!",
      "auth.welcome": "Вітаємо, {username}!",
      "auth.created": "Обліковий запис створено! Тепер можна увійти.",
      "auth.invalidCredentials": "Неправильна електронна пошта або пароль.",
      "auth.emailExists": "Ця електронна пошта вже використовується.",
    },
    en: {
      "language.label": "Interface language",
      "auth.pageTitle": "My List | Login",
      "auth.loginTitle": "LOG IN",
      "auth.registerTitle": "REGISTER",
      "auth.email": "E-mail",
      "auth.username": "Username",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm password",
      "auth.loginButton": "LOGIN",
      "auth.registerButton": "REGISTER",
      "auth.noAccount": "Don't have an account?",
      "auth.haveAccount": "Already have an account?",
      "auth.registerLink": "Register",
      "auth.loginLink": "Log in",
      "auth.loginFailed": "Login failed.",
      "auth.registerFailed": "Registration failed.",
      "auth.noServer": "Cannot connect to server.",
      "auth.passwordMismatch": "Passwords do not match!",
      "auth.welcome": "Welcome, {username}!",
      "auth.created": "Account created! You can now log in.",
      "auth.invalidCredentials": "Incorrect email or password.",
      "auth.emailExists": "This email is already in use.",
    },
  };

  function readLanguage() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return translations[value] ? value : DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  }

  let currentLanguage = readLanguage();

  function t(key, parameters = {}) {
    const template =
      translations[currentLanguage][key] ??
      translations[DEFAULT_LANGUAGE][key] ??
      key;
    return template.replace(/\{(\w+)\}/g, (_, name) =>
      String(parameters[name] ?? ""),
    );
  }

  function applyTranslations(root = document) {
    const attrs = {
      "data-i18n": "textContent",
      "data-i18n-placeholder": "placeholder",
      "data-i18n-aria-label": "aria-label",
      "data-i18n-title": "title",
    };

    Object.entries(attrs).forEach(([attr, property]) => {
      root.querySelectorAll(`[${attr}]`).forEach((element) => {
        const translation = t(element.getAttribute(attr));
        if (property === "aria-label") {
          element.setAttribute("aria-label", translation);
        } else {
          element[property] = translation;
        }
      });
    });

    document.documentElement.lang = currentLanguage;

    document
      .querySelectorAll(".language-button[data-lang]")
      .forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.lang === currentLanguage),
        );
      });
  }

  function setLanguage(nextLanguage) {
    if (!translations[nextLanguage]) return;
    currentLanguage = nextLanguage;
    try {
      localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
      // Local storage can be unavailable in privacy-restricted browsing.
    }
    applyTranslations();
    document.dispatchEvent(
      new CustomEvent("mylist:languagechange", {
        detail: { language: currentLanguage },
      }),
    );
  }

  function translateServerError(message, fallbackKey) {
    const value = String(message ?? "").trim();
    if (
      /invalid credentials|incorrect (email|password)|invalid email or password|wrong password/i.test(
        value,
      )
    ) {
      return t("auth.invalidCredentials");
    }
    if (
      /email already (exists|registered|in use)|email is already/i.test(value)
    ) {
      return t("auth.emailExists");
    }
    // Preserve unknown server validation messages rather than hiding useful details.
    return value || t(fallbackKey);
  }

  window.MyListI18n = {
    t,
    setLanguage,
    getLanguage: () => currentLanguage,
    applyTranslations,
    translateServerError,
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
    document
      .querySelectorAll(".language-button[data-lang]")
      .forEach((button) => {
        button.addEventListener("click", () =>
          setLanguage(button.dataset.lang),
        );
      });
  });
})();
