/* =========================================================
   AsuransiKita — main.js
   Perilaku umum yang dipakai di semua halaman:
   - toggle menu navigasi (mobile)
   - helper toast notifikasi
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector(".nav-toggle");
  var navbar = document.querySelector(".navbar");

  if (navToggle && navbar) {
    navToggle.addEventListener("click", function () {
      navbar.classList.toggle("nav-open");
      var isOpen = navbar.classList.contains("nav-open");
      navToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });
  }

  // Tandai link nav aktif sesuai halaman saat ini
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[href]").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    }
  });

  // Tampilkan nama pengguna yang sedang login (jika ada) di navbar
  // halaman yang mengasumsikan pengguna sudah login.
  var userChip = document.querySelector(".user-chip");
  if (userChip && typeof getCurrentUser === "function") {
    var current = getCurrentUser();
    var displayName = current && current.nama ? current.nama : "Budi Santoso";
    var initials = typeof getInitials === "function" ? getInitials(displayName) : "BS";

    var avatarEl = userChip.querySelector(".avatar");
    var nameEl = userChip.querySelector(".name-text");
    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = displayName;
  }

  // Tombol "Keluar" — hapus sesi login lalu lanjut navigasi seperti biasa
  var logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (typeof clearCurrentUser === "function") clearCurrentUser();
    });
  }
});

/**
 * Menampilkan toast notifikasi sederhana di pojok kanan atas.
 * type: "success" | "error"
 */
function showToast(title, message, type) {
  var existing = document.querySelector(".toast");
  if (existing) existing.remove();

  var extraClass = "";
  var iconClass = "fa-solid fa-circle-check toast-icon";
  if (type === "error") {
    extraClass = " toast-error";
    iconClass = "fa-solid fa-circle-exclamation toast-icon";
  } else if (type === "warning") {
    extraClass = " toast-warning";
    iconClass = "fa-solid fa-clock toast-icon";
  }

  var toast = document.createElement("div");
  toast.className = "toast" + extraClass;

  toast.innerHTML =
    '<i class="' + iconClass + '"></i>' +
    '<div><div class="toast-title">' + title + '</div>' +
    '<div class="toast-msg">' + message + "</div></div>" +
    '<button class="toast-close" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>';

  document.body.appendChild(toast);

  // Trigger transisi masuk
  requestAnimationFrame(function () {
    toast.classList.add("show");
  });

  function close() {
    toast.classList.remove("show");
    setTimeout(function () {
      toast.remove();
    }, 300);
  }

  toast.querySelector(".toast-close").addEventListener("click", close);
  setTimeout(close, 4500);
}

/**
 * Placeholder untuk fitur yang baru akan tersedia di Pengumpulan Tahap 2
 * (halaman pembelian per jenis asuransi, checkout, histori pembelian, dll).
 */
function comingSoon(featureName) {
  showToast(
    "Segera Hadir",
    (featureName || "Fitur ini") + " akan tersedia pada Pengumpulan Tahap 2.",
    "warning"
  );
}
