/* =========================================================
   AsuransiKita — purchase.js
   Logika untuk 3 formulir pembelian (mobil, kesehatan, jiwa):
   validasi input, kalkulasi premi realtime, dan menyiapkan
   pending order sebelum diarahkan ke halaman checkout.
   ========================================================= */

function markInvalid(el, errorEl, message) {
  if (!el) return;
  el.classList.add("is-invalid");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("show");
  }
}

function clearInvalid(el, errorEl) {
  if (!el) return;
  el.classList.remove("is-invalid");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("show");
  }
}

function showAlert(alertEl, message, type) {
  if (!alertEl) return;
  alertEl.className = "alert show " + (type === "error" ? "alert-error" : "alert-success");
  alertEl.innerHTML =
    '<i class="fa-solid ' +
    (type === "error" ? "fa-circle-exclamation" : "fa-circle-check") +
    '"></i><span>' +
    message +
    "</span>";
}

/* Format input harga mobil dengan pemisah ribuan saat mengetik */
function attachThousandSeparator(input) {
  if (!input) return;
  input.addEventListener("input", function () {
    var raw = input.value.replace(/[^0-9]/g, "");
    input.value = raw === "" ? "" : Number(raw).toLocaleString("id-ID");
  });
}

function parseFormattedNumber(str) {
  return Number(String(str || "").replace(/[^0-9]/g, "")) || 0;
}

/* Toggle class "selected" pada radio-pill / radio-card saat dipilih */
function attachRadioSelectStyle(containerSelector, itemSelector) {
  document.querySelectorAll(containerSelector).forEach(function (group) {
    group.querySelectorAll(itemSelector).forEach(function (label) {
      var input = label.querySelector("input[type=radio]");
      if (!input) return;
      input.addEventListener("change", function () {
        group.querySelectorAll(itemSelector).forEach(function (l) {
          l.classList.remove("selected");
        });
        if (input.checked) label.classList.add("selected");
      });
    });
  });
}

/* =========================================================
   FORM: BELI MOBIL
   ========================================================= */
function initBeliMobilForm() {
  var form = document.getElementById("form-beli-mobil");
  if (!form) return;

  var merk = document.getElementById("mobil-merk");
  var jenis = document.getElementById("mobil-jenis");
  var tahun = document.getElementById("mobil-tahun");
  var harga = document.getElementById("mobil-harga");
  var plat = document.getElementById("mobil-plat");
  var pemilik = document.getElementById("mobil-pemilik");
  var mesin = document.getElementById("mobil-mesin");
  var rangka = document.getElementById("mobil-rangka");
  var alertEl = document.getElementById("mobil-alert");
  var fotoError = document.getElementById("mobil-foto-error");

  attachThousandSeparator(harga);

  // File drop UI: tampilkan nama file & tandai sudah terisi
  document.querySelectorAll("#mobil-foto-grid input[type=file]").forEach(function (input) {
    input.addEventListener("change", function () {
      var label = input.closest(".file-drop");
      var nameEl = label.querySelector(".file-drop-name");
      if (input.files && input.files[0]) {
        nameEl.textContent = input.files[0].name;
        label.classList.add("has-file");
        label.classList.remove("is-invalid");
      } else {
        nameEl.textContent = "Klik untuk unggah";
        label.classList.remove("has-file");
      }
    });
  });

  function updateEstimate() {
    var h = parseFormattedNumber(harga.value);
    var t = Number(tahun.value);
    if (!h || !t || t < 1900) {
      document.getElementById("est-mobil-umur").textContent = "—";
      document.getElementById("est-mobil-tarif").textContent = "—";
      document.getElementById("est-mobil-total").textContent = "Rp0";
      return;
    }
    var result = calcMobilPremium(h, t);
    document.getElementById("est-mobil-umur").textContent = result.age + " tahun";
    document.getElementById("est-mobil-tarif").textContent = result.rateLabel + " / tahun";
    document.getElementById("est-mobil-total").textContent = formatRupiah(result.premiPerTahun);
  }

  [tahun, harga].forEach(function (el) {
    el.addEventListener("input", updateEstimate);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var isValid = true;

    function req(el, errEl, msg) {
      if (!el.value || String(el.value).trim() === "") {
        markInvalid(el, errEl, msg);
        isValid = false;
      } else {
        clearInvalid(el, errEl);
      }
    }

    req(merk, document.getElementById("mobil-merk-error"), "Merk mobil wajib diisi.");
    req(jenis, document.getElementById("mobil-jenis-error"), "Jenis mobil wajib dipilih.");
    req(tahun, document.getElementById("mobil-tahun-error"), "Tahun pembuatan wajib diisi.");

    if (!harga.value || parseFormattedNumber(harga.value) <= 0) {
      markInvalid(harga, document.getElementById("mobil-harga-error"), "Harga mobil wajib diisi dengan angka yang valid.");
      isValid = false;
    } else {
      clearInvalid(harga, document.getElementById("mobil-harga-error"));
    }

    req(plat, document.getElementById("mobil-plat-error"), "Nomor plat wajib diisi.");
    req(pemilik, document.getElementById("mobil-pemilik-error"), "Nama pemilik wajib diisi.");
    req(mesin, document.getElementById("mobil-mesin-error"), "Nomor mesin wajib diisi.");
    req(rangka, document.getElementById("mobil-rangka-error"), "Nomor rangka wajib diisi.");

    var fotoInputs = document.querySelectorAll("#mobil-foto-grid input[type=file]");
    var allFotoFilled = true;
    fotoInputs.forEach(function (input) {
      var label = input.closest(".file-drop");
      if (!input.files || !input.files[0]) {
        label.classList.add("is-invalid");
        allFotoFilled = false;
      } else {
        label.classList.remove("is-invalid");
      }
    });
    if (!allFotoFilled) {
      fotoError.textContent = "Seluruh 6 foto kendaraan wajib diunggah.";
      fotoError.classList.add("show");
      isValid = false;
    } else {
      fotoError.textContent = "";
      fotoError.classList.remove("show");
    }

    if (!isValid) {
      showAlert(alertEl, "Mohon lengkapi seluruh data yang wajib diisi.", "error");
      return;
    }

    var result = calcMobilPremium(parseFormattedNumber(harga.value), tahun.value);
    showAlert(alertEl, "Data valid! Mengarahkan anda ke halaman checkout&hellip;", "success");

    setPendingOrder({
      jenis: "Asuransi Mobil",
      namaProduk: merk.value.trim() + " " + jenis.value + " (" + tahun.value + ")",
      premi: result.premiPerTahun,
      premiPeriode: "per tahun",
      detail: {
        merk: merk.value.trim(),
        jenis: jenis.value,
        tahun: tahun.value,
        harga: parseFormattedNumber(harga.value),
        plat: plat.value.trim(),
        pemilik: pemilik.value.trim(),
      },
    });

    setTimeout(function () {
      window.location.href = "checkout.html";
    }, 900);
  });
}

/* =========================================================
   FORM: BELI KESEHATAN
   ========================================================= */
function initBeliKesehatanForm() {
  var form = document.getElementById("form-beli-kesehatan");
  if (!form) return;

  var nama = document.getElementById("kesehatan-nama");
  var tglLahir = document.getElementById("kesehatan-tgl-lahir");
  var pekerjaan = document.getElementById("kesehatan-pekerjaan");
  var alertEl = document.getElementById("kesehatan-alert");

  attachRadioSelectStyle('[data-toggle-group="merokok"]', ".radio-pill");
  attachRadioSelectStyle('[data-toggle-group="hipertensi"]', ".radio-pill");
  attachRadioSelectStyle('[data-toggle-group="diabetes"]', ".radio-pill");

  function getRadioValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : null;
  }

  function updateEstimate() {
    var age = tglLahir.value ? calcAge(tglLahir.value) : null;
    if (age === null) {
      document.getElementById("est-kesehatan-usia").textContent = "—";
      document.getElementById("est-kesehatan-m").textContent = "—";
      document.getElementById("est-kesehatan-total").textContent = "Rp0";
      return;
    }
    var merokok = getRadioValue("merokok") === "1";
    var hipertensi = getRadioValue("hipertensi") === "1";
    var diabetes = getRadioValue("diabetes") === "1";
    var result = calcKesehatanPremium(tglLahir.value, merokok, hipertensi, diabetes);

    document.getElementById("est-kesehatan-usia").textContent = result.age + " tahun";
    document.getElementById("est-kesehatan-m").textContent = "x" + result.m;
    document.getElementById("est-kesehatan-total").textContent = formatRupiah(result.premiPerTahun);
  }

  tglLahir.addEventListener("input", updateEstimate);
  form.addEventListener("change", function (e) {
    if (e.target.matches('input[type=radio]')) updateEstimate();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var isValid = true;

    if (!nama.value.trim()) {
      markInvalid(nama, document.getElementById("kesehatan-nama-error"), "Nama lengkap wajib diisi.");
      isValid = false;
    } else {
      clearInvalid(nama, document.getElementById("kesehatan-nama-error"));
    }

    if (!tglLahir.value) {
      markInvalid(tglLahir, document.getElementById("kesehatan-tgl-lahir-error"), "Tanggal lahir wajib diisi.");
      isValid = false;
    } else {
      clearInvalid(tglLahir, document.getElementById("kesehatan-tgl-lahir-error"));
    }

    if (!pekerjaan.value.trim()) {
      markInvalid(pekerjaan, document.getElementById("kesehatan-pekerjaan-error"), "Pekerjaan wajib diisi.");
      isValid = false;
    } else {
      clearInvalid(pekerjaan, document.getElementById("kesehatan-pekerjaan-error"));
    }

    ["merokok", "hipertensi", "diabetes"].forEach(function (name) {
      var errEl = document.getElementById("kesehatan-" + name + "-error");
      if (getRadioValue(name) === null) {
        errEl.textContent = "Wajib dipilih salah satu.";
        errEl.classList.add("show");
        isValid = false;
      } else {
        errEl.textContent = "";
        errEl.classList.remove("show");
      }
    });

    if (!isValid) {
      showAlert(alertEl, "Mohon lengkapi seluruh data yang wajib diisi.", "error");
      return;
    }

    var merokok = getRadioValue("merokok") === "1";
    var hipertensi = getRadioValue("hipertensi") === "1";
    var diabetes = getRadioValue("diabetes") === "1";
    var result = calcKesehatanPremium(tglLahir.value, merokok, hipertensi, diabetes);

    showAlert(alertEl, "Data valid! Mengarahkan anda ke halaman checkout&hellip;", "success");

    setPendingOrder({
      jenis: "Asuransi Kesehatan",
      namaProduk: "Asuransi Kesehatan a.n. " + nama.value.trim(),
      premi: result.premiPerTahun,
      premiPeriode: "per tahun",
      detail: {
        nama: nama.value.trim(),
        tglLahir: tglLahir.value,
        pekerjaan: pekerjaan.value.trim(),
        merokok: merokok,
        hipertensi: hipertensi,
        diabetes: diabetes,
      },
    });

    setTimeout(function () {
      window.location.href = "checkout.html";
    }, 900);
  });
}

/* =========================================================
   FORM: BELI JIWA
   ========================================================= */
function initBeliJiwaForm() {
  var form = document.getElementById("form-beli-jiwa");
  if (!form) return;

  var nama = document.getElementById("jiwa-nama");
  var tglLahir = document.getElementById("jiwa-tgl-lahir");
  var alertEl = document.getElementById("jiwa-alert");

  attachRadioSelectStyle("#jiwa-pertanggungan-group", ".radio-card");

  function getPertanggungan() {
    var checked = form.querySelector('input[name="pertanggungan"]:checked');
    return checked ? Number(checked.value) : null;
  }

  function updateEstimate() {
    var t = getPertanggungan();
    if (!tglLahir.value || !t) {
      document.getElementById("est-jiwa-usia").textContent = "—";
      document.getElementById("est-jiwa-m").textContent = "—";
      document.getElementById("est-jiwa-up").textContent = "—";
      document.getElementById("est-jiwa-total").textContent = "Rp0";
      return;
    }
    var result = calcJiwaPremium(tglLahir.value, t);
    document.getElementById("est-jiwa-usia").textContent = result.age + " tahun";
    document.getElementById("est-jiwa-m").textContent = result.mLabel;
    document.getElementById("est-jiwa-up").textContent = formatRupiah(result.uangPertanggungan);
    document.getElementById("est-jiwa-total").textContent = formatRupiah(result.premiPerBulan);
  }

  tglLahir.addEventListener("input", updateEstimate);
  form.addEventListener("change", function (e) {
    if (e.target.matches('input[name="pertanggungan"]')) updateEstimate();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var isValid = true;

    if (!nama.value.trim()) {
      markInvalid(nama, document.getElementById("jiwa-nama-error"), "Nama lengkap wajib diisi.");
      isValid = false;
    } else {
      clearInvalid(nama, document.getElementById("jiwa-nama-error"));
    }

    if (!tglLahir.value) {
      markInvalid(tglLahir, document.getElementById("jiwa-tgl-lahir-error"), "Tanggal lahir wajib diisi.");
      isValid = false;
    } else {
      clearInvalid(tglLahir, document.getElementById("jiwa-tgl-lahir-error"));
    }

    var pertanggunganErr = document.getElementById("jiwa-pertanggungan-error");
    var t = getPertanggungan();
    if (!t) {
      pertanggunganErr.textContent = "Besaran pertanggungan wajib dipilih.";
      pertanggunganErr.classList.add("show");
      isValid = false;
    } else {
      pertanggunganErr.textContent = "";
      pertanggunganErr.classList.remove("show");
    }

    if (!isValid) {
      showAlert(alertEl, "Mohon lengkapi seluruh data yang wajib diisi.", "error");
      return;
    }

    var result = calcJiwaPremium(tglLahir.value, t);
    showAlert(alertEl, "Data valid! Mengarahkan anda ke halaman checkout&hellip;", "success");

    setPendingOrder({
      jenis: "Asuransi Jiwa",
      namaProduk: "Asuransi Jiwa a.n. " + nama.value.trim(),
      premi: result.premiPerBulan,
      premiPeriode: "per bulan",
      detail: {
        nama: nama.value.trim(),
        tglLahir: tglLahir.value,
        pertanggungan: t,
      },
    });

    setTimeout(function () {
      window.location.href = "checkout.html";
    }, 900);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initBeliMobilForm();
  initBeliKesehatanForm();
  initBeliJiwaForm();
});
