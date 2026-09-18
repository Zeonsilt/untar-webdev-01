/* =========================================================
   AsuransiKita — history.js
   Menampilkan daftar histori pembelian dari localStorage.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  var history = getPurchaseHistory();
  var emptyState = document.getElementById("history-empty");
  var content = document.getElementById("history-content");
  var tbody = document.getElementById("history-tbody");

  if (!history.length) {
    emptyState.hidden = false;
    content.hidden = true;
    return;
  }

  emptyState.hidden = true;
  content.hidden = false;

  history.forEach(function (item) {
    var tr = document.createElement("tr");

    var statusClass = item.status === "Lunas" ? "lunas" : "belum";
    var statusIcon = item.status === "Lunas" ? "fa-circle-check" : "fa-clock";

    tr.innerHTML =
      "<td>" + item.namaProduk + "</td>" +
      "<td>" + item.jenis + "</td>" +
      "<td>" + formatTanggalIndonesia(item.tanggal) + "</td>" +
      "<td>" + formatRupiah(item.harga) + "</td>" +
      '<td><span class="status-pill ' + statusClass + '"><i class="fa-solid ' + statusIcon + '"></i> ' + item.status + "</span></td>";

    tbody.appendChild(tr);
  });
});
