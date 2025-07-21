//params
function getParam(variabel) {
  const params = new URLSearchParams(window.location.search);
  const nilai = params.get(variabel);
  return nilai ? nilai.replace(/_/g, ' ') : null;
}

// variabel global
const namaTamu = getParam("to");
const SCRIPT_BASE_URL = "https://script.google.com/macros/s/AKfycbwZ_spsPzVJ_VC4y_mgYjUvFHYAagYjMseFTODgZUG1QXQZtKdlAxiuaVVXQ4HjaMN8rw/exec";
const DATABASE_NAME = "kryon_preview-undangan-pernikahan"; 
let data_update;
let data;

async function init() {
  // Pengecekan elemen penting
  let missing = false;
  if (!document.querySelector('.data-nama')) {
    console.error('Element dengan class .data-nama tidak ditemukan di HTML. Fitur greeting tidak akan berjalan.');
    missing = true;
  }
  if (!document.getElementById('rsvpContainer')) {
    console.error('Element dengan id #rsvpContainer tidak ditemukan di HTML. Fitur RSVP tidak akan berjalan.');
    missing = true;
  }
  if (!document.getElementById('weddingGiftForm')) {
    console.error('Element dengan id #weddingGiftForm tidak ditemukan di HTML. Fitur kado tidak akan berjalan.');
    missing = true;
  } else {
    const form = document.getElementById('weddingGiftForm');
    if (!form.querySelector('[name="account_name"]')) {
      console.error('Input dengan name="account_name" tidak ditemukan di #weddingGiftForm.');
      missing = true;
    }
    if (!form.querySelector('[name="message"]')) {
      console.error('Input dengan name="message" tidak ditemukan di #weddingGiftForm.');
      missing = true;
    }
    if (!form.querySelector('[name="amount"]')) {
      console.error('Input dengan name="amount" tidak ditemukan di #weddingGiftForm.');
      missing = true;
    }
  }
  if (!document.getElementById('weddingWishForm')) {
    console.error('Element dengan id #weddingWishForm tidak ditemukan di HTML. Fitur komentar tidak akan berjalan.');
    missing = true;
  } else {
    const form = document.getElementById('weddingWishForm');
    if (!form.querySelector('textarea[name="comment"]')) {
      console.error('Textarea dengan name="comment" tidak ditemukan di #weddingWishForm.');
      missing = true;
    }
  }
  if (!document.getElementById('comment-container')) {
    console.error('Element dengan id #comment-container tidak ditemukan di HTML. Fitur komentar tidak akan berjalan.');
    missing = true;
  }
  const alertBox = document.getElementById('alert');
  if (!alertBox) {
    console.error('Element dengan id #alert tidak ditemukan di HTML. Fitur alert tidak akan berjalan.');
    missing = true;
  } else {
    if (!alertBox.querySelector('.alert-text')) {
      console.error('Element dengan class .alert-text tidak ditemukan di #alert.');
      missing = true;
    }
    if (!alertBox.querySelector('.alert-close')) {
      console.error('Element dengan class .alert-close tidak ditemukan di #alert.');
      missing = true;
    }
  }

  data = await getData('preview-undangan-pernikahan');
  data_update = data.updated;
  if (data && Array.isArray(data.tamu)) {
    gantiIsiClass("nama", namaTamu);
    buatKomentarDariData();
    document.body.classList.remove("imp-hidden");
    tampilkanRSVP();
    initGiftFormHandler();
    initCommentFormHandler();
  }
}

async function getData(namaFile) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`/assets/data/${namaFile}.json?t=${timestamp}`);
    if (!response.ok) throw new Error("Gagal mengambil data");
    return await response.json();
  } catch (err) {
    console.error("Error:", err.message);
    return {};
  }
}

async function updateData() {
  try {
    const isLocalhost = location.hostname === "localhost";
    if (isLocalhost) {
      console.log("[updateData] Lewatkan update karena sedang berjalan di localhost.");
      return;
    }

    // Pengulangan ambil data terus-menerus
    const polling = async () => {
      const dataBaru = await getData('preview-undangan-pernikahan');

      if (dataBaru.updated && dataBaru.updated != data_update) {
        showAlert("Perubahan data terdeteksi. Memuat ulang halaman...", "info");
        window.location.reload();
      } else {
        setTimeout(polling, 5000);
      }
    };

    polling(); // Mulai polling
  } catch (err) {
    console.error("Gagal memeriksa pembaruan data:", err.message);
  }
}




function gantiIsiClass(className, nilaiBaru) {
  const elemenList = document.querySelectorAll('.data-' + className);

  if (elemenList.length === 0) {
    console.warn(`Tidak ditemukan elemen dengan class '${className}'`);
    return;
  }

  elemenList.forEach(el => {
  if (typeof nilaiBaru === 'string' || typeof nilaiBaru === 'number') {
    el.textContent = String(nilaiBaru);
  } else {
    console.warn('Nilai harus berupa string atau angka.');
  }
  });

}


// rsvp ---------------------------------------
function buatFormRSVP() {
  return `
    <form  method="POST" id="RSVPForm">
      <!-- Status -->
      <div class="rsvp-status-wrap">
        <div class="rsvp-status-head" data-aos="fade-up" data-aos-duration="1200">
          <p class="rsvp-status-caption">Apakah kamu datang?</p>
        </div>
        <div class="rsvp-status-body">
          <div class="rsvp-confirm-wrap">
            <label data-aos="fade-up" data-aos-duration="1200">
              <input type="radio" name="rsvp_status" value="Hadir">
              <div class="rsvp-confirm-btn going">Hadir</div>
            </label>
            <label data-aos="fade-up" data-aos-duration="1200">
              <input type="radio" name="rsvp_status" value="Tidak_Hadir">
              <div class="rsvp-confirm-btn not-going">Tidak Hadir</div>
            </label>
          </div>
        </div>
      </div>

      <!-- Session -->
        <div class="rsvp-session-wrap" id="rsvp-session">
          <div class="session-caption-wrap">
            <p class="caption" data-aos="fade-up" data-aos-duration="1200">Acara mana yang akan Anda hadiri?</p>
          </div>
          <div class="session-btn-wrap">
            <label data-aos="fade-up" data-aos-duration="1200">
              <input type="checkbox" name="selected_event[]" value="Akad_Nikah">
              <div class="rsvp-session-btn">Akad Nikah</div>
            </label>
            <label data-aos="fade-up" data-aos-duration="1200">
              <input type="checkbox" name="selected_event[]" value="Resepsi">
              <div class="rsvp-session-btn">Resepsi</div>
            </label>
          </div>
        </div>

      <!-- Submit -->
      <div class="rsvp-confirm-wrap" data-aos="fade-up" data-aos-duration="1200">
        <button type="submit" class="rsvp-confirm-btn confirm submit">Konfirmasi</button>
      </div>
    </form>
  `;
}

function buatPesanHadir() {
  return `
    <div class="rsvp-message-wrap going" data-aos="fade-up" data-aos-duration="1200">
      <div class="rsvp-message-content">
        <h4 class="rsvp-message-title">Hadir</h4>
        <p class="rsvp-message-caption">Yeyy, terimakasiih sudah mau datang... <br> Sampai jumpa disana ;)</p>
      </div>
    </div>
    <div class="rsvp-change-wrap" data-aos="fade-up" data-aos-duration="1200">
      <div class="rsvp-confirm-wrap">
        <button class="rsvp-confirm-btn confirm" id="changeRSVP">Ubah</button>
      </div>
    </div>
  `;
}

function buatPesanTidakHadir() {
  return `
    <div class="rsvp-message-wrap not-going" data-aos="fade-up" data-aos-duration="1200">
      <div class="rsvp-message-content">
        <h4 class="rsvp-message-title">Tidak Hadir</h4>
        <p class="rsvp-message-caption">Terima kasih atas konfirmasinya. Semoga kita bisa bertemu di lain kesempatan 😊</p>
      </div>
    </div>
    <div class="rsvp-change-wrap" data-aos="fade-up" data-aos-duration="1200">
      <div class="rsvp-confirm-wrap">
        <button class="rsvp-confirm-btn confirm" id="changeRSVP">Ubah</button>
      </div>
    </div>
  `;
}

async function tampilkanRSVP() {
  const container = document.getElementById("rsvpContainer");

  if (!namaTamu || !data.tamu || !container) return;

  const tamu = data.tamu.find(item => item.nama == namaTamu);
  if (!tamu) {
    container.innerHTML = buatFormRSVP();
    initRSVPFormHandler();
    return;
  }

  if (tamu.kehadiran === "Hadir") {
    container.innerHTML = buatPesanHadir();
  } else if (tamu.kehadiran === "Tidak Hadir") {
    container.innerHTML = buatPesanTidakHadir();
  } else {
    container.innerHTML = buatFormRSVP();
    initRSVPFormHandler();
  }
  
  container.addEventListener("click", function (e) {
  if (e.target && e.target.id === "changeRSVP") {
    container.innerHTML = buatFormRSVP();
    initRSVPFormHandler();
  }
  });
}

function initRSVPFormHandler() {
  const form = document.getElementById("RSVPForm");
    if (!form) {
    console.error("Form #RSVPForm tidak ditemukan");
    return;
  }

  form.addEventListener("submit", handleFormRSVP);
  initAttendanceToggle();
}

async function handleFormRSVP(event) {
  event.preventDefault();
  const kehadiran = getAttendanceStatus();
  if (!kehadiran){ return showAlert("Silakan pilih status kehadiran.", "error")};

  const acara = getSelectedEvents();

  try {
    const url = buildUrlRsvp(kehadiran, acara);
    const response = await fetch(url);
    const result = await response.json();
  
  if (result.status){
    showAlert("RSVP berhasil dikirim!", "success");
    updateData(); 
  }else{
    showAlert(result.error, "error");
  }
  } catch (err) {
    console.error("Gagal mengirim RSVP:", err);
  showAlert("Gagal mengirim data. Silakan coba lagi.", "error");
  }
}

function getAttendanceStatus() {
  const selected = document.querySelector('input[name="rsvp_status"]:checked');
  return selected ? selected.value : null;
}

function initAttendanceToggle() {
  const radios = document.querySelectorAll('input[name="rsvp_status"]');
  const acara = document.getElementById('rsvp-session');

  if (!acara || radios.length === 0) return;

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === "Tidak_Hadir" && radio.checked) {
        acara.style.display = "none";
      } else if (radio.value === "Hadir" && radio.checked) {
        acara.style.display = "";
      }
    });
  });
}


function getSelectedEvents() {
  const eventCheckboxes = document.querySelectorAll('input[name="selected_event[]"]:checked');
  const values = Array.from(eventCheckboxes).map(cb => cb.value);
  return values.length > 0 ? encodeCustom(values.join(", ")) : "Tidak_memilih_acara";
}


function buildUrlRsvp(kehadiran, acara) {
  const query = `UPDATE tamu SET kehadiran=${encodeURIComponent(kehadiran)},acara=${encodeURIComponent(acara)} WHERE nama=${encodeCustom(namaTamu)}`;
  return `${SCRIPT_BASE_URL}?conn=DATABASE=${DATABASE_NAME}&data=${query}`;
}
// kado ---------------------------------------
function initGiftFormHandler() {
  const form = document.getElementById("weddingGiftForm");
    if (!form) {
    console.error("Form #weddingGiftForm tidak ditemukan");
    return;
  }

  form.addEventListener("submit", handleFormGift);
}

async function handleFormGift(event) {
  event.preventDefault();
  const form = document.getElementById("weddingGiftForm");
  const akun = encodeCustom(form.querySelector('[name="account_name"]').value);
  const pesan = encodeCustom(form.querySelector('[name="message"]').value);
  const nominal = encodeCustom(form.querySelector('[name="amount"]').value);
  if (!akun || !pesan || !nominal) return alert("Silakan lengkapi data kado");

  try {
    const url = buildUrlGift(akun,pesan,nominal);
    const response = await fetch(url);
    const result = await response.json();
  if (result.status){
    showAlert("Konfirmasi kado berhasil dikirim!", "success");
    updateData(); 
  }else{
    showAlert(result.error, "error");
  }
  } catch (err) {
    console.error("Gagal mengirim konfirmasi kado:", err);
    showAlert("Gagal mengirim data. Silakan coba lagi.", "error");
  }
}
function buildUrlGift(akun,pesan,nominal) {
  const query = `UPDATE kado SET akun=${encodeURIComponent(akun)},pesan=${encodeURIComponent(pesan)},nominal=${encodeURIComponent(nominal)} WHERE nama=${encodeCustom(namaTamu)}`;
  return `${SCRIPT_BASE_URL}?conn=DATABASE=${DATABASE_NAME}&data=${query}`;
}
// komentar -----------------------------------
function initCommentFormHandler() {
  const form = document.getElementById("weddingWishForm");
    if (!form) {
    console.error("Form #weddingWishForm tidak ditemukan");
    return;
  }

  form.addEventListener("submit", handleFormComment);
}

async function handleFormComment(event) {
  event.preventDefault();
  const komentar = getComment();
  if (!komentar) return alert("Silakan isi pesan anda.");

  try {
    const url = buildUrlComment(komentar);
    const response = await fetch(url);
    const result = await response.json();

  if (result.status){
    showAlert("Pesan berhasil dikirim!", "success");
    updateData(); 
  }else{
    showAlert(result.error, "error");
  }
  } catch (err) {
    console.error("Gagal mengirim Pesan:", err);
  showAlert("Gagal mengirim data. Silakan coba lagi.", "error");
  }
}

function getComment() {
  const komentar = document.querySelector('textarea[name="comment"]');
  if (!komentar) return null;

  return encodeCustom(komentar.value);
}


function buildUrlComment(komentar) {
  const now = new Date();
  const waktu = [
    String(now.getDate()).padStart(2, '0'),
    String(now.getMonth() + 1).padStart(2, '0'),
    now.getFullYear()
  ].join('/') + '_' +
  [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0')
  ].join(':');
  const query = `UPDATE tamu SET waktu=${encodeURIComponent(waktu)},pesan=${encodeURIComponent(komentar)} WHERE nama=${encodeCustom(namaTamu)}`;
  return `${SCRIPT_BASE_URL}?conn=DATABASE=${DATABASE_NAME}&data=${query}`;
}

async function buatKomentarDariData() {
  if (!data || !Array.isArray(data.tamu)) return;

  const komentarContainer = document.getElementById("comment-container");
  if (!komentarContainer) {
    console.warn("Elemen container komentar tidak ditemukan.");
    return;
  }

  // Filter hanya tamu yang punya pesan dan urutkan dari index terbesar
  const komentarList = data.tamu
    .map((tamu, idx) => ({...tamu, _idx: idx}))
    .filter(tamu => tamu.pesan && tamu.pesan.trim() !== "")
    .reverse();
  let loadedCount = 0;
  const batchSize = 5;

  // Clear container
  komentarContainer.innerHTML = "";

  // Hapus tombol jika ada
  const existingBtn = document.getElementById("moreComment");
  if (existingBtn) existingBtn.remove();

  function renderBatch() {
    const end = Math.min(loadedCount + batchSize, komentarList.length);
    for (let i = loadedCount; i < end; i++) {
      const tamu = komentarList[i];
      const item = document.createElement("div");
      item.className = "comment-item aos-init aos-animate";
      item.id = `comment${tamu.id || i}`;
      item.setAttribute("data-aos", "fade-up");
      item.setAttribute("data-aos-duration", "1200");
      item.style.opacity = "1";
      item.style.transitionDuration = "1200ms";

      const nama = tamu.nama || "Tamu";
      const tanggal = formatTanggal(tamu["waktu"]);
      const pesan = tamu.pesan;

      item.innerHTML = `
        <div class="comment-head">
          <h3 class="comment-name">${escapeHtml(nama)}</h3>
          <small class="comment-date">${tanggal}</small>
        </div>
        <div class="comment-body">
          <p class="comment-caption">${escapeHtml(pesan)}</p>
        </div>
      `;

      komentarContainer.appendChild(item);
    }
    loadedCount = end;

    // Tampilkan tombol jika masih ada sisa
    if (loadedCount < komentarList.length) {
      let btn = document.getElementById("moreComment");
      if (!btn) {
        btn = document.createElement("button");
        btn.id = "moreComment";
        btn.className = "comment-loadmore-btn";
        btn.textContent = "Tampilkan lebih banyak";
        komentarContainer.parentNode.appendChild(btn);
        btn.addEventListener("click", function() {
          renderBatch();
          // Scroll ke bawah jika perlu
          btn.scrollIntoView({behavior: "smooth", block: "end"});
        });
      }
      btn.style.display = "block";
    } else {
      const btn = document.getElementById("moreComment");
      if (btn) btn.style.display = "none";
    }
  }

  renderBatch();
}
// Format ISO date ke "dd MMM yyyy, HH:mm"
function formatTanggal(isoString) {
  if (!isoString) return "-";
  const tanggal = new Date(isoString);
  return tanggal.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).replace(",", "");
}

// Escape HTML untuk keamanan
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
// alert
function showAlert(pesan, status) {
  const alertBox = document.getElementById("alert");
  const alertText = alertBox.querySelector(".alert-text");
  const alertClose = alertBox.querySelector(".alert-close");

  // Reset dulu
  alertBox.className = `alert show ${status}`;
  alertText.textContent = pesan;

  // Hapus sebelumnya kalau ada
  if (alertBox._timeoutId) clearTimeout(alertBox._timeoutId);

  // Tutup otomatis setelah 5 detik
  alertBox._timeoutId = setTimeout(() => {
    closeAlert();
  }, 5000);

  // Klik tombol X untuk menutup
  alertClose.onclick = () => {
    closeAlert();
  };
}

function closeAlert() {
  const alertBox = document.getElementById("alert");
  alertBox.className = "alert hide";
  if (alertBox._timeoutId) {
    clearTimeout(alertBox._timeoutId);
    alertBox._timeoutId = null;
  }
}

// tools
function encodeCustom(text) {
  return text
    .replace(/ /g, "_")
    .replace(/,/g, "--koma--");
}


init();
