/* =========================================================
   AsuransiKita — checkout.js
   Menampilkan ringkasan pending order & mensimulasikan
   proses pembayaran, lalu menyimpannya ke histori pembelian.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  var order = getPendingOrder();
  var emptyState = document.getElementById("checkout-empty");
  var content = document.getElementById("checkout-content");

  if (!order) {
    emptyState.hidden = false;
    content.hidden = true;
    return;
  }

  emptyState.hidden = true;
  content.hidden = false;

  document.getElementById("co-produk").textContent = order.namaProduk;
  document.getElementById("co-jenis").textContent = order.jenis;
  document.getElementById("co-premi").textContent = formatRupiah(order.premi) + " " + order.premiPeriode;
  document.getElementById("co-side-premi").textContent = formatRupiah(order.premi);
  document.getElementById("co-total").textContent = formatRupiah(order.premi);

  document.querySelectorAll("#payment-method-group .radio-card").forEach(function (label) {
    var input = label.querySelector("input");
    if (input.checked) label.classList.add("selected");
    input.addEventListener("change", function () {
      document.querySelectorAll("#payment-method-group .radio-card").forEach(function (l) {
        l.classList.remove("selected");
      });
      label.classList.add("selected");
    });
  });

  document.getElementById("btn-bayar").addEventListener("click", function () {
    var btn = this;
    var metode = document.querySelector('input[name="metode-bayar"]:checked').value;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses pembayaran&hellip;';

    setTimeout(function () {
      addPurchaseHistory({
        namaProduk: order.namaProduk,
        jenis: order.jenis,
        tanggal: new Date().toISOString(),
        harga: order.premi,
        metode: metode,
        status: "Lunas",
      });

      clearPendingOrder();
      showToast("Pembayaran Berhasil", "Polis anda sedang diaktifkan. Mengarahkan ke riwayat pembelian&hellip;", "success");

      setTimeout(function () {
        window.location.href = "histori.html";
      }, 1000);
    }, 1200);
  });
});
