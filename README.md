# 🌿 MENTALEASE — Sistem Prediksi Tingkat Stres Mahasiswa

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-black.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React_19_%2B_Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-Academic_Use-green.svg)]()

> **Tugas Besar Praktikum Machine Learning — Kelompok 5**  
> Program Studi Sistem Informasi, Fakultas Teknologi Informasi, Universitas Andalas (FTI UNAND)

---

## 📌 Tentang Mentalease

**Mentalease** adalah aplikasi web berbasis *Machine Learning* yang dirancang untuk memprediksi tingkat stres mahasiswa secara personal berdasarkan pola aktivitas harian. Sistem ini menghubungkan kebiasaan harian (durasi tidur, waktu belajar mandiri, organisasi/ekstrakurikuler, aktivitas fisik, dan IPK) dengan skor klinis **Perceived Stress Scale (PSS-10)** yang dikumpulkan dari 305 responden mahasiswa lokal.

### 🌟 Fitur Utama
1. **Interactive Lifestyle Dashboard**: Input interaktif 5 parameter aktivitas harian mahasiswa dengan tampilan responsif 2 kolom (*emerald mental-health aesthetic*).
2. **Instant Preset Scenarios**: 3 Tombol preset otomatis untuk pengujian cepat:
   - 🏖️ **Skenario Santai** $\rightarrow$ Prediksi: **Rendah (Low)**
   - ⚖️ **Skenario Realistis** $\rightarrow$ Prediksi: **Sedang (Moderate)**
   - ⚡ **Skenario Beban Berat** $\rightarrow$ Prediksi: **Tinggi (High)**
3. **Live Probability Spectrum**: Visualisasi persentase probabilitas 3 kelas stres yang selalu proporsional (total 100%).
4. **Actionable Recommendations**: Rekomendasi solusi terpersonalisasi (manajemen waktu, *sleep hygiene*, aktivitas fisik, dan konseling).
5. **Clinical Guardrail & Validation**: Validasi cerdas yang menolak input tidak wajar (misal: total alokasi jam harian $>24$ jam atau nilai negatif).

---

## 🧠 Model Machine Learning

* **Algoritma**: `RandomForestClassifier` (Tuned + *Balanced Lifestyle Enrichment*)
* **Hyperparameter**: `n_estimators=150`, `max_depth=6`, `min_samples_split=2`, `class_weight='balanced'`, `random_state=42`
* **Evaluasi Performa**:
  * **Akurasi Pelatihan**: **78.10%**
  * **Macro F1-Score**: **0.740**
  * **Recall Kelas Low**: **94.1%** *(mengatasi masalah class imbalance dari baseline 40.0%)*
  * **Recall Kelas High**: **87.9%**
  * **Recall Kelas Moderate**: **73.1%**

---

## 🏗️ Arsitektur Proyek

```text
TB ML - MENTALEASE/
├── backend/
│   ├── app.py                         # REST API Server (Flask)
│   ├── recommendations.py             # Modul Rekomendasi Preventif Klinis
│   ├── model_stress_terbaik.joblib    # Serialisasi Model Random Forest
│   ├── retrain_model.py               # Script Pelatihan Mandiri
│   └── requirements.txt               # Dependensi Python
├── data/
│   └── data_siap_testing_305.csv      # Dataset Primer Bersih (305 Responden)
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Komponen Utama Dashboard React
│   │   ├── App.css                    # Desain Responsif & Tema Mentalease
│   │   └── assets/logo.png            # Identitas Visual Logo Transparan
│   ├── public/logo.png                # Favicon Browser
│   ├── package.json                   # Konfigurasi Dependensi Frontend
│   └── vite.config.js                 # Konfigurasi Vite Bundler
├── tests/
│   └── test_blackbox.py               # Script Pengujian Otomatis Black-Box
├── Model_Prediksi_Tingkat_Stres_Mahasiswa.ipynb  # Notebook Eksperimen Lengkap
└── README.md                          # Dokumentasi Repositori
```

---

## 🚀 Panduan Menjalankan Sistem

### 1. Prasyarat Sistem
* Python 3.10 atau lebih baru
* Node.js 18 atau lebih baru (dengan npm)

### 2. Menjalankan Backend (Flask)
Buka terminal baru di VS Code:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate       # Windows PowerShell
pip install -r requirements.txt
python app.py
```
> Server API akan aktif pada: **`http://127.0.0.1:5000`**

### 3. Menjalankan Frontend (React + Vite)
Buka tab terminal kedua:
```bash
cd frontend
npm install
npm run dev
```
> Antarmuka web akan aktif pada: **`http://localhost:5173`**

Buka peramban (browser) dan akses **`http://localhost:5173`**.

---

## 📡 Dokumentasi REST API

### `GET /`
* **Deskripsi**: Health-check status server dan konfirmasi model aktif.
* **Respons**:
  ```json
  {
    "status": "online",
    "service": "Mentalease Stress Prediction API",
    "model_loaded": true,
    "classes": ["High", "Low", "Moderate"]
  }
  ```

### `POST /predict`
* **Headers**: `Content-Type: application/json`
* **Payload Contoh**:
  ```json
  {
    "study_hours": 2,
    "extracurricular_hours": 1,
    "sleep_hours": 8,
    "physical_activity_hours": 2,
    "gpa": 3.75
  }
  ```
* **Respons Berhasil (200 OK)**:
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

## 👥 Tim Pengembang (Kelompok 5)

| No | Nama Mahasiswa | NIM | Peran Utama |
| :---: | :--- | :---: | :--- |
| **1** | **Tasya Putri Wandari** | `2411523027` | Spesialis Model & Backend Engineering |
| **2** | **Dinda Nathasya Putri** | `2411523032` | Pengembang Antarmuka Web (Frontend & UI/UX) |
| **3** | **Zizi Salsabila** | `2411523034` | Spesialis Data & Penata Laporan (QA & Docs) |

---
*Dibuat untuk memenuhi Tugas Besar Mata Kuliah Praktikum Machine Learning 2026.*
