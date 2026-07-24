# PRD 3 --- AI Admin UMKM Indonesia

## Product Requirements Document (Lengkap)

## 1. Ringkasan Produk

**Nama:** AI Admin UMKM Indonesia

**Tagline:** AI Karyawan Administrasi untuk UMKM Indonesia.

AI Admin membantu pemilik usaha membuat dokumen bisnis, mengelola stok,
menghitung HPP, mencatat pembelian, produksi, penjualan, serta
memberikan analisis bisnis melalui percakapan alami.

------------------------------------------------------------------------

# 2. Tujuan Produk

-   Mengurangi pekerjaan administrasi manual.
-   Menghubungkan seluruh operasional dalam satu sistem.
-   Menjadi asisten administrasi berbasis AI.
-   Menyediakan data bisnis real-time.

------------------------------------------------------------------------

# 3. Target Pengguna

-   Toko roti
-   UMKM makanan
-   Minuman
-   Konveksi
-   Furniture
-   Percetakan
-   Distributor
-   Home industry

------------------------------------------------------------------------

# 4. Modul

1.  Dashboard
2.  Produk
3.  Bahan Baku
4.  Supplier
5.  Customer
6.  Pembelian
7.  Stock Manager
8.  BOM (Resep)
9.  Produksi
10. Kalkulator HPP
11. Penjualan
12. Invoice
13. Laporan
14. AI Admin
15. Workspace & Tim
16. Pengaturan

------------------------------------------------------------------------

# 5. Dashboard

Menampilkan: - Omzet - Laba - Pembelian - Produksi - Penjualan - Produk
terlaris - Stock hampir habis - Nilai persediaan - Ringkasan AI

------------------------------------------------------------------------

# 6. Master Data

## Produk

-   SKU
-   Barcode
-   Nama
-   Kategori
-   Jenis (Dagang / Produksi)
-   Harga jual
-   HPP
-   Status

## Bahan Baku

-   Nama
-   Satuan
-   Harga rata-rata
-   Minimum stok

## Supplier

-   Nama
-   Kontak
-   Alamat

## Customer

-   Nama
-   Kontak
-   Alamat

------------------------------------------------------------------------

# 7. Stock Manager

Formula:

Stock Akhir = Stock Awal + Pembelian + Produksi - Penjualan - Rusak -
Expired - Penyesuaian

Fitur: - Mutasi stok - Riwayat stok - Stock opname - Penyesuaian

------------------------------------------------------------------------

# 8. Pembelian

Input: - Supplier - Barang - Qty - Harga - Pajak - Diskon

Output: - Stock bertambah - Harga rata-rata diperbarui

------------------------------------------------------------------------

# 9. BOM (Bill of Materials)

Setiap produk produksi memiliki resep.

Contoh:

Donat

-   Terigu 1000 g
-   Gula 120 g
-   Mentega 80 g
-   Air 650 g
-   Ragi 12 g

Output: 40 pcs

------------------------------------------------------------------------

# 10. Produksi

Input: - Produk - Qty - Operator - Catatan

Saat produksi: - Mengurangi stok bahan - Menambah stok produk jadi -
Menghitung HPP aktual

------------------------------------------------------------------------

# 11. Kalkulator HPP

Komponen: - Bahan - Kemasan - Gas - Listrik - Tenaga kerja - Overhead

Metode: - Weighted Average - Standard Cost

Output: - HPP total - HPP per unit - Margin - Rekomendasi harga jual

------------------------------------------------------------------------

# 12. Penjualan

Input: - Customer - Produk - Qty - Harga - Diskon

Output: - Invoice - Pengurangan stok - Laporan - Laba kotor

------------------------------------------------------------------------

# 13. AI Admin

Contoh:

"Beli 10 sak terigu @240 ribu."

"Produksi 300 donat."

"Jual 20 donat."

"Berapa laba bulan ini?"

"Bahan apa yang hampir habis?"

AI mengubah percakapan menjadi transaksi.

------------------------------------------------------------------------

# 14. Workspace & Team

## Owner (Admin)

Hak: - Kelola perusahaan - Kelola paket - Kelola anggota - Semua modul -
Audit log - Pengaturan

Jumlah: 1 Owner

## Manager

Hak: - Produk - Stock - Pembelian - Produksi - Penjualan - Dashboard -
Laporan

Tidak dapat: - Mengubah langganan - Menghapus workspace - Mengganti
owner

------------------------------------------------------------------------

# 15. Paket Langganan

## Free

-   1 Owner
-   Tanpa Manager

## Basic

-   1 Owner
-   1 Manager

## Pro

-   1 Owner
-   5 Manager

## Business

-   1 Owner
-   Manager sesuai paket

------------------------------------------------------------------------

# 16. Undangan Manager

Flow:

Pengaturan → Tim → Undang → Email → Manager menerima → Join Workspace

Status: - Pending - Active - Suspended - Removed

------------------------------------------------------------------------

# 17. Hak Akses

  Modul        Owner   Manager
  ----------- ------- ---------
  Dashboard      ✓        ✓
  Produk         ✓        ✓
  Supplier       ✓        ✓
  Customer       ✓        ✓
  Pembelian      ✓        ✓
  Produksi       ✓        ✓
  Penjualan      ✓        ✓
  Laporan        ✓        ✓
  Billing        ✓        ✗
  Workspace      ✓        ✗

------------------------------------------------------------------------

# 18. Audit Log

Mencatat: - Login - Tambah produk - Edit stok - Produksi - Penjualan -
Penghapusan - Perubahan harga

------------------------------------------------------------------------

# 19. Non-Fungsional

-   Responsive
-   Multi-tenant
-   Role Based Access Control
-   Backup otomatis
-   Audit log
-   API Ready
-   AI Ready

------------------------------------------------------------------------

# 20. Roadmap

## MVP

-   Produk
-   Supplier
-   Customer
-   Pembelian
-   Produksi
-   Penjualan
-   Stock
-   HPP
-   Dashboard
-   AI Chat

## V2

-   Invoice AI
-   Quotation
-   Proposal
-   Approval
-   WhatsApp
-   Email

## V3

-   Prediksi stok
-   Prediksi penjualan
-   Multi cabang
-   Integrasi akuntansi
-   Integrasi marketplace
-   AI Business Advisor
