# MENTALEASE — Sistem Prediksi Tingkat Stres Mahasiswa

> **Tugas Besar Praktikum Machine Learning — Kelompok 5**  
> Program Studi Sistem Informasi, Fakultas Teknologi Informasi, Universitas Andalas (FTI UNAND)

---

## Tentang Mentalease

**Mentalease** adalah aplikasi web berbasis *Machine Learning* untuk memprediksi tingkat stres mahasiswa berdasarkan pola aktivitas harian. Sistem ini menghubungkan kebiasaan harian (waktu belajar mandiri, kegiatan ekstrakurikuler/organisasi, durasi tidur, aktivitas fisik, dan IPK) dengan kategori stres **Perceived Stress Scale (PSS-10)** yang diperoleh dari 305 data responden mahasiswa.

### Fitur Utama
1. **Dashboard Input 2 Kolom**: Input 5 parameter aktivitas harian mahasiswa dengan tampilan responsif 2 kolom dan panel hasil *sticky*.
2. **Simulasi Profil Cepat (Preset)**: 3 tombol preset otomatis untuk pengujian cepat:
   - **Santai & Seimbang** → Prediksi: **Rendah (Low)**
   - **Akademik Standar** → Prediksi: **Sedang (Moderate)**
   - **Padat & Berisiko Stres** → Prediksi: **Tinggi (High)**
3. **Distribusi Probabilitas**: Visualisasi persentase keyakinan prediksi 3 kelas stres (total 100%).
4. **Rekomendasi Tindakan Personal**: Daftar saran tindak lanjut sesuai tingkat stres (manajemen waktu, pola tidur, aktivitas fisik, dan rujukan konseling).
5. **Validasi Batas Harian (24 Jam)**: Pencegahan otomatis apabila total alokasi waktu harian melebihi 24 jam atau bernilai negatif.

---

## Model Machine Learning

* **Algoritma**: `RandomForestClassifier` (Tuned + *Balanced Lifestyle Enrichment*)
* **Hyperparameter**: `n_estimators=150`, `max_depth=6`, `min_samples_split=2`, `class_weight='balanced'`, `random_state=42`
* **Evaluasi Performa**:
  * **Akurasi Pelatihan**: **78.10%**
  * **Macro F1-Score**: **0.740**
  * **Recall Kelas Low**: **94.1%** *(menangani ketidakseimbangan kelas dari baseline 40.0%)*
  * **Recall Kelas High**: **87.9%**
  * **Recall Kelas Moderate**: **73.1%**

---

## Struktur Proyek

```text
TB ML - MENTALEASE/
├── backend/
│   ├── app.py                         # REST API Server (Flask)
│   ├── recommendations.py             # Modul Rekomendasi Preventif
│   ├── model_stress_terbaik.joblib    # Model Random Forest Terserialisasi
│   ├── retrain_model.py               # Script Pelatihan Ulang Model
│   └── requirements.txt               # Dependensi Python
├── data/
│   └── data_siap_testing_305.csv      # Dataset Primer Bersih (305 Responden)
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Komponen Utama Dashboard React
│   │   ├── App.css                    # Styling Responsif Mentalease
│   │   └── assets/logo.png            # Logo Mentalease
│   ├── public/logo.png                # Favicon Browser
│   ├── package.json                   # Dependensi Frontend
│   └── vite.config.js                 # Konfigurasi Vite
├── tests/
│   └── test_blackbox.py               # Pengujian Otomatis Black-Box API
├── Model_Prediksi_Tingkat_Stres_Mahasiswa.ipynb  # Notebook Eksperimen
└── README.md                          # Dokumentasi Proyek
```

---

## Panduan Menjalankan Sistem

### Prasyarat
* Python 3.10+
* Node.js 18+

### 1. Menjalankan Backend (Flask)
```bash
cd backend
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt
.\venv\Scripts\python.exe app.py
```
Server API berjalan pada **`http://127.0.0.1:5000`**.

### 2. Menjalankan Frontend (React + Vite)
Buka terminal baru:
```bash
cd frontend
npm install
npm run dev
```
Buka browser ke **`http://localhost:5173`**.

### 3. Menjalankan Pengujian Otomatis (Opsional)
```bash
.\backend\venv\Scripts\python.exe tests\test_blackbox.py
```

---

## Dokumentasi REST API

### `GET /`
Mengecek status server dan kesiapan model di memori.
```json
{
  "status": "online",
  "app_name": "Mentalease",
  "service": "Mentalease - Student Stress Level Prediction API",
  "model_loaded": true
}
```

### `POST /predict`
Headers: `Content-Type: application/json`

Contoh Payload:
```json
{
  "study_hours": 2,
  "extracurricular_hours": 1,
  "sleep_hours": 8,
  "physical_activity_hours": 2,
  "gpa": 3.75
}
```

Contoh Respons (`200 OK`):
```json
{
  "success": true,
  "prediction": "Low",
  "prediction_label": "Rendah",
  "probabilities": [
    {"class": "Low", "label": "Rendah", "percentage": 72.0},
    {"class": "Moderate", "label": "Sedang", "percentage": 22.0},
    {"class": "High", "label": "Tinggi", "percentage": 6.0}
  ],
  "recommendations": [...]
}
```

---

## Tim Pengembang (Kelompok 5)

| No | Nama Mahasiswa | NIM | Peran Utama |
| :---: | :--- | :---: | :--- |
| 1 | **Tasya Putri Wandari** | `2411523027` | Spesialis Model & Backend Engineering |
| 2 | **Dinda Nathasya Putri** | `2411523032` | Pengembang Antarmuka Web (Frontend & UI/UX) |
| 3 | **Zizi Salsabila** | `2411523034` | Spesialis Data & QA / Dokumentasi |

---
*Tugas Besar Praktikum Machine Learning 2026.*
