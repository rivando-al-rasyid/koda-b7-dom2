const SESSION_KEY = "session";
const REMEMBER_KEY = "Example_remember_email";

const REGISTERED_USERS = [
  { email: "test@example.com", password: "test123" },
  { email: "user@Example.com", password: "movie123" },
];

const AuthUtils = {
  isValidEmail: (e) => /\S+@\S+\.\S+/.test(e),
  toggleError: (id, msg = "", show = false) => {
    const el = document.querySelector(`#${id}`);
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("hidden", !show);
  },
  clearErrors: (...ids) => ids.forEach((id) => AuthUtils.toggleError(id)),
};

const Session = {
  get: () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } },
  save: (user) => localStorage.setItem(SESSION_KEY, JSON.stringify({ email: user.email, loggedAt: Date.now() })),
  clear: () => { localStorage.removeItem(SESSION_KEY); window.location.href = "minitask4.html"; },
};

const getInitials = (email = "") => {
  const local = email.split("@")[0] || "";
  const parts = local.split(/[.\-_]+/).filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : local.slice(0, 2).toUpperCase();
};

const session = Session.get();
const isLoginPage = !!document.querySelector("#login-email");

if (session) {
  if (isLoginPage) {
    window.location.href = "home.html";
  } else {
    // Populate avatar
    const avatarBtn = document.getElementById("avatar-btn");
    const dropdown = document.getElementById("avatar-dropdown");
    const dropEmail = document.getElementById("dropdown-email");
    const logoutBtn = document.getElementById("logout-btn");

    avatarBtn.textContent = getInitials(session.email);
    dropEmail.textContent = session.email;

    // Toggle dropdown
    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      dropdown.classList.toggle("open", !isOpen);
      avatarBtn.setAttribute("aria-expanded", String(!isOpen));
    });

    // Close on outside click
    document.addEventListener("click", () => {
      dropdown.classList.remove("open");
      avatarBtn.setAttribute("aria-expanded", "false");
    });

    // Logout
    logoutBtn.addEventListener("click", Session.clear);
  }
} else {
  if (isLoginPage) {
    // Setup login
    const emailInp = document.querySelector("#login-email");
    const passInp = document.querySelector("#login-password");
    const loginBtn = document.querySelector(".btn-login");
    const rememberChk = document.querySelector("#remember-me");
    const ERROR_IDS = ["login-email-error", "login-password-error", "login-general-error"];

    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved && emailInp) { emailInp.value = saved; if (rememberChk) rememberChk.checked = true; }

    const handleLogin = async () => {
      AuthUtils.clearErrors(...ERROR_IDS);
      const email = emailInp.value.trim().toLowerCase();
      const password = passInp.value;

      if (!AuthUtils.isValidEmail(email))
        return AuthUtils.toggleError("login-email-error", "// enter a valid email address", true);
      if (!password)
        return AuthUtils.toggleError("login-password-error", "// password is required", true);

      loginBtn.disabled = true;
      loginBtn.textContent = "Signing in...";

      await new Promise((r) => setTimeout(r, 700));

      const user = REGISTERED_USERS.find((u) => u.email === email && u.password === password);

      if (user) {
        rememberChk?.checked
          ? localStorage.setItem(REMEMBER_KEY, email)
          : localStorage.removeItem(REMEMBER_KEY);
        Session.save(user);
        loginBtn.textContent = "Success! Redirecting...";
        setTimeout(() => (window.location.href = "home.html"), 600);
      } else {
        AuthUtils.toggleError("login-general-error", "// invalid email or password", true);
        loginBtn.disabled = false;
        loginBtn.textContent = "Sign In";
      }
    };

    loginBtn?.addEventListener("click", handleLogin);
    [emailInp, passInp].forEach((inp) =>
      inp?.addEventListener("keydown", (e) => e.key === "Enter" && handleLogin())
    );
  } else {
    window.location.href = "minitask4.html";
  }
}
