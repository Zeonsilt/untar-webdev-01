/* =========================================================
   AsuransiKita — validation.js
   Simulasi proses Login & Sign Up murni di sisi client
   (tidak ada backend sungguhan — sesuai instruksi kuis).
   ========================================================= */

var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var NAME_REGEX = /^[A-Za-zÀ-ÿ' .]+$/; // huruf, spasi, titik, apostrof — tidak boleh angka
var PHONE_REGEX = /^08[0-9]{8,14}$/; // awalan 08, hanya angka, total 10-16 digit

// Akun demo yang dianggap valid untuk simulasi login
var DEMO_ACCOUNT = {
  email: "demo@asuransikita.id",
  password: "Demo1234",
};

function setFieldState(inputEl, errorEl, isValid, message) {
  if (!inputEl) return;
  if (isValid) {
    inputEl.classList.remove("is-invalid");
    inputEl.classList.add("is-valid");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("show");
    }
  } else {
    inputEl.classList.remove("is-valid");
    inputEl.classList.add("is-invalid");
    if (errorEl) {
      errorEl.textContent = message || "";
      errorEl.classList.add("show");
    }
  }
}

function showFormAlert(alertEl, message, type) {
  if (!alertEl) return;
  alertEl.className = "alert show " + (type === "error" ? "alert-error" : "alert-success");
  alertEl.innerHTML =
    '<i class="fa-solid ' +
    (type === "error" ? "fa-circle-exclamation" : "fa-circle-check") +
    '"></i><span>' +
    message +
    "</span>";
}

/* ---------------------------------------------------------
   LOGIN
   --------------------------------------------------------- */
function initLoginForm() {
  var form = document.getElementById("login-form");
  if (!form) return;

  var emailInput = document.getElementById("login-email");
  var passwordInput = document.getElementById("login-password");
  var emailError = document.getElementById("login-email-error");
  var passwordError = document.getElementById("login-password-error");
  var formAlert = document.getElementById("login-alert");
  var toggleBtn = document.getElementById("toggle-login-password");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      toggleBtn.innerHTML = isPassword
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var email = emailInput.value.trim();
    var password = passwordInput.value;
    var isValid = true;

    if (email === "") {
      setFieldState(emailInput, emailError, false, "Email wajib diisi.");
      isValid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setFieldState(emailInput, emailError, false, "Format email tidak valid.");
      isValid = false;
    } else {
      setFieldState(emailInput, emailError, true);
    }

    if (password === "") {
      setFieldState(passwordInput, passwordError, false, "Kata sandi wajib diisi.");
      isValid = false;
    } else {
      setFieldState(passwordInput, passwordError, true);
    }

    if (!isValid) {
      showFormAlert(formAlert, "Mohon periksa kembali data yang anda masukkan.", "error");
      return;
    }

    // Simulasi proses login menggunakan Javascript.
    // Cek ke akun demo bawaan, ATAU ke akun yang pernah didaftarkan lewat Sign Up.
    var matchedUser = null;

    if (email.toLowerCase() === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      matchedUser = { nama: "Budi Santoso", email: DEMO_ACCOUNT.email };
    } else {
      var registered = findUserByEmail(email);
      if (registered && registered.password === password) {
        matchedUser = { nama: registered.nama, email: registered.email };
      }
    }

    if (matchedUser) {
      setCurrentUser(matchedUser);
      showFormAlert(
        formAlert,
        "Login berhasil! Mengarahkan anda ke halaman utama&hellip;",
        "success"
      );
      form.querySelector('button[type="submit"]').disabled = true;
      setTimeout(function () {
        window.location.href = "index.html";
      }, 1200);
    } else {
      showFormAlert(
        formAlert,
        "Email atau kata sandi salah. Gunakan akun demo: demo@asuransikita.id / Demo1234, atau daftar akun baru terlebih dahulu.",
        "error"
      );
    }
  });

  // Bersihkan status error saat pengguna mulai mengetik ulang
  [emailInput, passwordInput].forEach(function (el) {
    el.addEventListener("input", function () {
      el.classList.remove("is-invalid", "is-valid");
    });
  });
}

/* ---------------------------------------------------------
   SIGN UP
   --------------------------------------------------------- */
function initSignupForm() {
  var form = document.getElementById("signup-form");
  if (!form) return;

  var fields = {
    fullName: document.getElementById("signup-fullname"),
    email: document.getElementById("signup-email"),
    phone: document.getElementById("signup-phone"),
    password: document.getElementById("signup-password"),
    confirmPassword: document.getElementById("signup-confirm-password"),
  };

  var errors = {
    fullName: document.getElementById("signup-fullname-error"),
    email: document.getElementById("signup-email-error"),
    phone: document.getElementById("signup-phone-error"),
    password: document.getElementById("signup-password-error"),
    confirmPassword: document.getElementById("signup-confirm-password-error"),
  };

  var formAlert = document.getElementById("signup-alert");

  document.querySelectorAll(".toggle-visibility").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-target");
      var input = document.getElementById(targetId);
      if (!input) return;
      var isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.innerHTML = isPassword
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
    });
  });

  function validateFullName() {
    var v = fields.fullName.value.trim();
    if (v === "") {
      setFieldState(fields.fullName, errors.fullName, false, "Nama lengkap wajib diisi.");
      return false;
    }
    if (v.length < 3 || v.length > 32) {
      setFieldState(
        fields.fullName,
        errors.fullName,
        false,
        "Nama lengkap harus 3-32 karakter."
      );
      return false;
    }
    if (!NAME_REGEX.test(v)) {
      setFieldState(
        fields.fullName,
        errors.fullName,
        false,
        "Nama lengkap tidak boleh mengandung angka atau simbol."
      );
      return false;
    }
    setFieldState(fields.fullName, errors.fullName, true);
    return true;
  }

  function validateEmail() {
    var v = fields.email.value.trim();
    if (v === "") {
      setFieldState(fields.email, errors.email, false, "Email wajib diisi.");
      return false;
    }
    if (!EMAIL_REGEX.test(v)) {
      setFieldState(fields.email, errors.email, false, "Format email tidak valid.");
      return false;
    }
    setFieldState(fields.email, errors.email, true);
    return true;
  }

  function validatePhone() {
    var v = fields.phone.value.trim();
    if (v === "") {
      setFieldState(fields.phone, errors.phone, false, "Nomor handphone wajib diisi.");
      return false;
    }
    if (!/^[0-9]+$/.test(v)) {
      setFieldState(fields.phone, errors.phone, false, "Nomor handphone hanya boleh berisi angka.");
      return false;
    }
    if (!PHONE_REGEX.test(v)) {
      setFieldState(
        fields.phone,
        errors.phone,
        false,
        "Nomor harus diawali 08 dan berjumlah 10-16 digit."
      );
      return false;
    }
    setFieldState(fields.phone, errors.phone, true);
    return true;
  }

  function validatePassword() {
    var v = fields.password.value;
    if (v === "") {
      setFieldState(fields.password, errors.password, false, "Kata sandi wajib diisi.");
      return false;
    }
    if (v.length < 8) {
      setFieldState(
        fields.password,
        errors.password,
        false,
        "Kata sandi minimal 8 karakter."
      );
      return false;
    }
    setFieldState(fields.password, errors.password, true);
    return true;
  }

  function validateConfirmPassword() {
    var v = fields.confirmPassword.value;
    if (v === "") {
      setFieldState(
        fields.confirmPassword,
        errors.confirmPassword,
        false,
        "Konfirmasi kata sandi wajib diisi."
      );
      return false;
    }
    if (v !== fields.password.value) {
      setFieldState(
        fields.confirmPassword,
        errors.confirmPassword,
        false,
        "Konfirmasi kata sandi tidak sesuai."
      );
      return false;
    }
    setFieldState(fields.confirmPassword, errors.confirmPassword, true);
    return true;
  }

  // Validasi realtime saat pengguna keluar dari field (blur)
  fields.fullName.addEventListener("blur", validateFullName);
  fields.email.addEventListener("blur", validateEmail);
  fields.phone.addEventListener("blur", validatePhone);
  fields.password.addEventListener("blur", validatePassword);
  fields.confirmPassword.addEventListener("blur", validateConfirmPassword);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var validName = validateFullName();
    var validEmail = validateEmail();
    var validPhone = validatePhone();
    var validPassword = validatePassword();
    var validConfirm = validateConfirmPassword();

    var isValid = validName && validEmail && validPhone && validPassword && validConfirm;

    // Cek email sudah terdaftar atau belum (termasuk akun demo bawaan)
    var emailValue = fields.email.value.trim();
    if (isValid) {
      var isDemoEmail = emailValue.toLowerCase() === DEMO_ACCOUNT.email;
      var isDuplicate = isDemoEmail || !!findUserByEmail(emailValue);
      if (isDuplicate) {
        setFieldState(
          fields.email,
          errors.email,
          false,
          "Email ini sudah terdaftar. Silakan login."
        );
        isValid = false;
      }
    }

    if (!isValid) {
      showFormAlert(formAlert, "Mohon lengkapi dan perbaiki data yang belum sesuai.", "error");
      return;
    }

    // Simulasi proses sign up menggunakan Javascript — akun baru disimpan
    // di localStorage supaya bisa langsung dipakai untuk Login.
    addUser({
      nama: fields.fullName.value.trim(),
      email: emailValue,
      phone: fields.phone.value.trim(),
      password: fields.password.value,
    });

    showFormAlert(
      formAlert,
      "Pendaftaran berhasil! Silakan login menggunakan akun anda&hellip;",
      "success"
    );
    form.querySelector('button[type="submit"]').disabled = true;
    setTimeout(function () {
      window.location.href = "login.html";
    }, 1400);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initLoginForm();
  initSignupForm();
});
