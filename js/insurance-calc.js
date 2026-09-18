/* =========================================================
   AsuransiKita — insurance-calc.js
   Kalkulator premi untuk Asuransi Mobil, Kesehatan, dan Jiwa
   sesuai rumus pada dokumen kuis. Semua nilai dihitung
   dinamis di sisi client (tidak ada backend).
   ========================================================= */

function formatRupiah(number) {
  var n = Math.round(Number(number) || 0);
  return "Rp" + n.toLocaleString("id-ID");
}

/**
 * Menghitung umur (dalam tahun penuh) dari tanggal lahir hingga hari ini.
 * birthDateStr: string format "YYYY-MM-DD" (dari <input type="date">)
 */
function calcAge(birthDateStr) {
  if (!birthDateStr) return 0;
  var birth = new Date(birthDateStr);
  var today = new Date();
  var age = today.getFullYear() - birth.getFullYear();
  var monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Menghitung umur kendaraan (dalam tahun penuh) dari tahun pembuatan.
 */
function calcVehicleAge(yearBuilt) {
  var currentYear = new Date().getFullYear();
  var age = currentYear - Number(yearBuilt);
  return age < 0 ? 0 : age;
}

/* ---------------------------------------------------------
   ASURANSI MOBIL
   Premi = rate x harga mobil, rate tergantung umur kendaraan
   --------------------------------------------------------- */
function calcMobilPremium(harga, tahunPembuatan) {
  var x = Number(harga) || 0;
  var age = calcVehicleAge(tahunPembuatan);
  var rate;
  var rateLabel;

  if (age <= 3) {
    rate = 0.025;
    rateLabel = "2,5%";
  } else if (age <= 5) {
    if (x < 200000000) {
      rate = 0.04;
      rateLabel = "4%";
    } else {
      rate = 0.03;
      rateLabel = "3%";
    }
  } else {
    rate = 0.05;
    rateLabel = "5%";
  }

  return {
    age: age,
    rate: rate,
    rateLabel: rateLabel,
    premiPerTahun: x * rate,
  };
}

/* ---------------------------------------------------------
   ASURANSI KESEHATAN
   P + (m*P) + (k1*0.5P) + (k2*0.4P) + (k3*0.5P)
   --------------------------------------------------------- */
function calcKesehatanPremium(tanggalLahir, merokok, hipertensi, diabetes) {
  var P = 2000000;
  var u = calcAge(tanggalLahir);
  var m;

  if (u <= 20) m = 0.1;
  else if (u <= 35) m = 0.2;
  else if (u <= 50) m = 0.25;
  else m = 0.4;

  var k1 = merokok ? 1 : 0;
  var k2 = hipertensi ? 1 : 0;
  var k3 = diabetes ? 1 : 0;

  var premi = P + m * P + k1 * 0.5 * P + k2 * 0.4 * P + k3 * 0.5 * P;

  return {
    age: u,
    m: m,
    basePremium: P,
    premiPerTahun: premi,
  };
}

/* ---------------------------------------------------------
   ASURANSI JIWA
   Premi per bulan = tarif (m) x uang pertanggungan (t)
   --------------------------------------------------------- */
function calcJiwaPremium(tanggalLahir, pertanggungan) {
  var u = calcAge(tanggalLahir);
  var t = Number(pertanggungan) || 0;
  var m;
  var mLabel;

  if (u <= 30) {
    m = 0.002;
    mLabel = "0,2%";
  } else if (u <= 50) {
    m = 0.004;
    mLabel = "0,4%";
  } else {
    m = 0.01;
    mLabel = "1%";
  }

  return {
    age: u,
    m: m,
    mLabel: mLabel,
    uangPertanggungan: t,
    premiPerBulan: m * t,
  };
}

/* ---------------------------------------------------------
   HISTORI PEMBELIAN (localStorage) — simulasi database
   --------------------------------------------------------- */
var PURCHASE_HISTORY_KEY = "asuransikita_purchase_history";
var PENDING_ORDER_KEY = "asuransikita_pending_order";

function getPurchaseHistory() {
  try {
    var raw = localStorage.getItem(PURCHASE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function addPurchaseHistory(entry) {
  var history = getPurchaseHistory();
  history.unshift(entry); // pembelian terbaru di atas
  try {
    localStorage.setItem(PURCHASE_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    /* localStorage tidak tersedia — abaikan secara diam-diam */
  }
}

function setPendingOrder(order) {
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
  } catch (e) {
    /* abaikan */
  }
}

function getPendingOrder() {
  try {
    var raw = sessionStorage.getItem(PENDING_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearPendingOrder() {
  try {
    sessionStorage.removeItem(PENDING_ORDER_KEY);
  } catch (e) {
    /* abaikan */
  }
}

/* ---------------------------------------------------------
   AKUN PENGGUNA & SESI LOGIN (localStorage + sessionStorage)
   Simulasi "database" pengguna di sisi client — akun yang
   didaftarkan lewat Sign Up bisa langsung dipakai untuk Login.
   --------------------------------------------------------- */
var USERS_KEY = "asuransikita_users";
var CURRENT_USER_KEY = "asuransikita_current_user";

function getUsers() {
  try {
    var raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function findUserByEmail(email) {
  var normalized = String(email || "").trim().toLowerCase();
  var users = getUsers();
  for (var i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === normalized) return users[i];
  }
  return null;
}

function addUser(user) {
  var users = getUsers();
  users.push(user);
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    /* abaikan */
  }
}

function setCurrentUser(user) {
  try {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    /* abaikan */
  }
}

function getCurrentUser() {
  try {
    var raw = sessionStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearCurrentUser() {
  try {
    sessionStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {
    /* abaikan */
  }
}

function getInitials(name) {
  var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTanggalIndonesia(date) {
  var bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  var d = date instanceof Date ? date : new Date(date);
  return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
}
