# TESTING CHECKLIST - AFTER SUPABASE RESET

## Prerequisites
- [ ] Supabase database sudah di-reset (jalankan supabase-reset.sql)
- [ ] Dev server running (`npm run dev` - berjalan di http://localhost:5173/)
- [ ] Browser open dengan fresh cache (Ctrl+Shift+R untuk reload cache)

---

## 1. LOGIN PAGE TEST
**URL:** http://localhost:5173/

- [ ] Landing page muncul dengan baik
- [ ] Klik "Masuk" atau navigate ke `/admin`
- [ ] Login form muncul dengan fields: Username, Password
- [ ] Try invalid credentials (user: test, pass: test123)
  - [ ] Error message muncul: "Invalid username or password"
- [ ] Try valid credentials (user: **admin**, pass: **admin123**)
  - [ ] Berhasil login, redirect ke Dashboard
  - [ ] No JavaScript errors di console

---

## 2. DASHBOARD PAGE TEST
**URL:** http://localhost:5173/admin

- [ ] Dashboard load dengan baik
- [ ] Top cards (KPI) muncul:
  - [ ] Paket Masuk: 0
  - [ ] Paket Keluar: 0
  - [ ] Total Paket: 0
  - [ ] Member Aktif: 0
- [ ] Search bar responsif
- [ ] Tabel paket kosong (no data yet)
- [ ] Top navigation menu muncul (Dashboard, Tracking, Reports, dll)
- [ ] Tombol "Tambah Paket" berfungsi
- [ ] No console errors

---

## 3. ADD PACKAGE TEST
**Action:** Klik "Tambah Paket" di Dashboard

- [ ] Modal tambah paket terbuka
- [ ] Form fields muncul:
  - [ ] Nomor Resi/AWB
  - [ ] Nama Penerima
  - [ ] No. Telepon
  - [ ] Unit/Blok
  - [ ] Kurir (dropdown)
  - [ ] Ukuran (S/M/L)
  - [ ] Lokasi (dropdown)
- [ ] Fill form dengan data:
  - AWB: TEST001
  - Nama: John Doe
  - HP: 081234567890
  - Unit: A101
  - Kurir: JNE
  - Size: M
  - Lokasi: Demo Location
- [ ] Klik "Simpan Paket"
- [ ] Success dialog muncul: "✅ Paket Berhasil Disimpan!"
- [ ] Auto-close 3 detik
- [ ] Pilihan "Input Paket Lagi" atau "Kembali ke Home"
- [ ] Paket muncul di tabel Dashboard
- [ ] Paket count di KPI update ke 1
- [ ] No errors

---

## 4. SEARCH & TRACKING TEST
**Action:** Cari paket di Dashboard atau halaman Tracking

- [ ] Tabel auto-refresh setiap 5 detik (cek console)
- [ ] Search box muncul di top
- [ ] Cari "TEST001" atau nama penerima "John"
- [ ] Hasil muncul di tabel dengan status "TERSIMPAN" (hijau)
- [ ] Klik row untuk lihat detail paket
- [ ] Detail popup muncul:
  - [ ] Nomor AWB
  - [ ] Nama penerima
  - [ ] Status
  - [ ] Tanggal tiba
  - [ ] Biaya
- [ ] Klik X untuk close detail
- [ ] Paket PICKED juga muncul di tabel (jika ada)

---

## 5. PAYMENT LINK TEST
**Action:** Generate payment link untuk paket

- [ ] Checkbox paket di tabel
- [ ] Pilih paket "TEST001"
- [ ] Tombol "Kirim Link Bayar" (hijau) aktif
- [ ] Klik "Kirim Link Bayar"
- [ ] Link auto-copy ke clipboard: `/payment?ids=pkg_xxx`
- [ ] Alert muncul dengan link dan instruksi "Kirim link ini ke penerima"

**Buka Link Payment:**
- [ ] Buka link payment di tab/device baru: http://localhost:5173/payment?ids=pkg_xxx
- [ ] Payment page load dengan:
  - [ ] Header: Pembayaran Paket
  - [ ] Info penerima: Nama, No HP, Lokasi
  - [ ] List paket dengan AWB, nama, size, lokasi, biaya
  - [ ] Total biaya besar di bawah
  - [ ] Instruksi pembayaran
  - [ ] Kontak admin
- [ ] Pilih metode QRIS
- [ ] Klik "Bayar Sekarang"
- [ ] QR modal muncul dengan dummy QR code
- [ ] Klik "Simulasi Bayar (Demo)"
- [ ] Loading 2 detik
- [ ] Success page: ✅ Pembayaran Berhasil!
- [ ] Auto-close 3 detik atau window close
- [ ] Di Dashboard, paket status berubah ke "SUDAH DIBAYAR" (biru)

---

## 6. BULK PAYMENT TEST
**Action:** Test payment untuk multiple paket sekaligus

- [ ] Add 2-3 paket lagi (TEST002, TEST003)
- [ ] Select 3 paket di Dashboard
- [ ] Klik "Kirim Link Bayar (3)"
- [ ] Copy link: `/payment?ids=pkg_1,pkg_2,pkg_3`
- [ ] Buka payment page
- [ ] List 3 paket muncul dengan total semua
- [ ] Bayar dengan QRIS
- [ ] Success muncul
- [ ] Di Dashboard, semua 3 paket status update ke PAID

---

## 7. PICKUP PACKAGE TEST
**Action:** Mark paket as PICKED

- [ ] Di Dashboard, paket dengan status "TERSIMPAN" bisa di-pickup
- [ ] Klik tombol "Ambil" (hijau) di tabel atau row detail
- [ ] Status paket berubah menjadi "DIAMBIL" (biru)
- [ ] Tanggal "Diambil" update dengan timestamp saat ini
- [ ] Paket PICKED tetap muncul di search hasil

---

## 8. TRACKING PAGE TEST (PUBLIC)
**URL:** http://localhost:5173/tracking

- [ ] Halaman load tanpa login (public)
- [ ] Search box untuk masukkan AWB
- [ ] Masukkan "TEST001"
- [ ] Paket detail muncul dengan:
  - [ ] Nomor AWB
  - [ ] Nama penerima
  - [ ] Status
  - [ ] Lokasi
  - [ ] Biaya
  - [ ] Button lihat QR code
- [ ] Klik "Lihat QR" - QR code muncul
- [ ] Tutup tracking detail

---

## 9. MOBILE STAFF APP TEST (OPTIONAL)
**URL:** http://localhost:5173/mobile

- [ ] Login page muncul (staff only)
- [ ] Login dengan admin account (not staff)
- [ ] Alert muncul: "⚠️ Anda hanya dapat menginput data dari lokasi yang ditentukan"
- [ ] Redirect kembali ke login

---

## 10. ENVIRONMENT & CONSOLE CHECK
**Developer Tools (F12):**

- [ ] No red errors di console
- [ ] No TypeScript warnings
- [ ] Network tab: semua request succeed (200/204)
- [ ] localStorage: `pp_session` ada dengan auth data
- [ ] Supabase connection: check di Network atau Console logs

---

## 11. AUTO-REFRESH TEST
**Test auto-refresh setiap 5 detik:**

- [ ] Di Dashboard, add paket di tab/window lain
- [ ] Tunggu 5 detik di tab pertama
- [ ] Paket baru auto-appear tanpa refresh manual
- [ ] Di Tracking, search paket
- [ ] Di Management paket lain, ubah status ke PICKED
- [ ] Kembali ke Tracking tab
- [ ] Tunggu 5 detik, status update otomatis

---

## 12. RESPONSIVENESS TEST
**Test di berbagai ukuran:**

- [ ] Desktop (1920x1080): semua layout OK
- [ ] Tablet (768px): responsive OK
- [ ] Mobile (375px): mobile-friendly OK
- [ ] No horizontal scroll
- [ ] Buttons/inputs accessible

---

## SUMMARY

**PASS Criteria:**
- ✅ Login berfungsi dengan default credentials
- ✅ Dashboard load tanpa error
- ✅ Tambah paket sukses
- ✅ Search & tracking berfungsi
- ✅ Payment page buka dan simulasi pembayaran
- ✅ Bulk payment support multiple paket
- ✅ Pickup package update status
- ✅ Auto-refresh setiap 5 detik
- ✅ No console errors
- ✅ Responsive design

**FAIL Criteria:**
- ❌ Login gagal
- ❌ Dashboard blank/error
- ❌ Supabase connection error
- ❌ Console errors (red)
- ❌ Payment link tidak berfungsi
- ❌ Form submit error

---

**Test Date:** [DATE]  
**Tester:** [NAME]  
**Status:** [PASS/FAIL]  

---

Dokumentasikan hasil testing di atas. Jika ada FAIL, dokumentasikan error details dan lanjut ke debugging.
