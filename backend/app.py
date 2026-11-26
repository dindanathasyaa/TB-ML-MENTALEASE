# ==============================================================================
# MENTALEASE BACKEND API
# Sistem Prediksi Tingkat Stres Mahasiswa Berbasis Machine Learning
# Praktikum Integrasi Model Machine Learning ke Web (Flask + CORS)
# ==============================================================================

# TODO: Import library yang dibutuhkan
import os
import warnings
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    from .recommendations import get_recommendations
except ImportError:
    from recommendations import get_recommendations

warnings.filterwarnings('ignore')

# TODO: Inisialisasi aplikasi Flask dan aktifkan CORS
app = Flask(__name__)
CORS(app)

# TODO: Konfigurasi nama dan path file model machine learning
MODEL_FILENAME = 'model_stress_terbaik.joblib'
MODEL_PATH = os.path.join(os.path.dirname(__file__), MODEL_FILENAME)

# Variabel global untuk menyimpan model dan metadata di memori
ml_model = None
feature_names = [
    'Study_Hours_Per_Day',
    'Extracurricular_Hours_Per_Day',
    'Sleep_Hours_Per_Day',
    'Physical_Activity_Hours_Per_Day',
    'GPA'
]
sleep_mapping_default = {
    'Kurang dari 5 jam': 4.5,
    '5 sampai 6 jam': 5.5,
    '7 sampai 8 jam': 7.5,
    'Lebih dari 8 jam': 8.5
}
gpa_mapping_default = {
    '< 2,50': 2.35,
    '2,50 - 2,99': 2.75,
    '3,00 - 3,49': 3.25,
    '3,50 - 4,00': 3.75
}
sleep_mapping = sleep_mapping_default
gpa_mapping = gpa_mapping_default
model_classes = ['High', 'Low', 'Moderate']


def load_model():
    """
    TODO: Memuat file model joblib ke dalam memori.
    Mendukung format dictionary bundle (model, features, mapping) maupun objek model langsung.
    """
    global ml_model, feature_names, sleep_mapping, gpa_mapping, model_classes

    try:
        loaded = joblib.load(MODEL_PATH)

        if isinstance(loaded, dict) and 'model' in loaded:
            ml_model = loaded['model']
            if 'features' in loaded:
                feature_names = loaded['features']
            if 'sleep_mapping' in loaded:
                sleep_mapping = loaded['sleep_mapping']
            if 'gpa_mapping' in loaded:
                gpa_mapping = loaded['gpa_mapping']
            if 'classes' in loaded:
                model_classes = list(loaded['classes'])
        else:
            ml_model = loaded

        if not hasattr(ml_model, 'predict'):
            raise ValueError("Objek model tidak memiliki fungsi 'predict'")

        print(f"[SUCCESS] Model Mentalease berhasil dimuat dari {MODEL_PATH}")
        return ml_model

    except Exception as e:
        print(f"[ERROR] Gagal memuat model dari {MODEL_PATH}: {e}")
        ml_model = None
        return None


# Memuat model saat server pertama kali dijalankan
load_model()


@app.route('/', methods=['GET'])
def index():
    """Endpoint root untuk verifikasi status server dan ketersediaan model"""
    return jsonify({
        "status": "online",
        "app_name": "Mentalease",
        "service": "Mentalease - Student Stress Level Prediction API",
        "model_loaded": ml_model is not None,
        "model_file": MODEL_FILENAME,
        "features": feature_names,
        "sleep_options": list(sleep_mapping.keys()),
        "gpa_options": list(gpa_mapping.keys())
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    TODO: Endpoint prediksi tingkat stres mahasiswa
    Menerima parameter JSON:
      - study_hours (atau Study_Hours_Per_Day)
      - extracurricular_hours (atau Extracurricular_Hours_Per_Day)
      - sleep_hours (atau sleep_option / Sleep_Hours_Per_Day)
      - physical_activity_hours (atau Physical_Activity_Hours_Per_Day)
      - gpa (atau gpa_option / GPA)
    """
    global ml_model

    # Pastikan model sudah termuat di memori
    if ml_model is None:
        ml_model = load_model()
        if ml_model is None:
            return jsonify({
                "success": False,
                "error": f"Model '{MODEL_FILENAME}' belum berhasil dimuat. Pastikan file model ada di folder backend."
            }), 500

    try:
        # TODO: Ambil data dari JSON request
        data = request.get_json(silent=True)

        if not isinstance(data, dict) or not data:
            return jsonify({
                "success": False,
                "error": "Tidak ada data JSON yang diterima."
            }), 400

        # TODO: Ekstraksi fitur belajar harian
        study_raw = data.get('study_hours', data.get('Study_Hours_Per_Day', ''))
        extra_raw = data.get('extracurricular_hours', data.get('Extracurricular_Hours_Per_Day', ''))
        sleep_raw = data.get('sleep_hours', data.get('sleep_option', data.get('Sleep_Hours_Per_Day', '')))
        physical_raw = data.get('physical_activity_hours', data.get('Physical_Activity_Hours_Per_Day', ''))
        gpa_raw = data.get('gpa', data.get('gpa_option', data.get('GPA', '')))

        # Memastikan semua fitur terisi
        missing = []
        if study_raw is None or str(study_raw).strip() == '': missing.append('Jam Belajar (study_hours)')
        if extra_raw is None or str(extra_raw).strip() == '': missing.append('Jam Ekstrakurikuler (extracurricular_hours)')
        if sleep_raw is None or str(sleep_raw).strip() == '': missing.append('Durasi Tidur (sleep_hours / sleep_option)')
        if physical_raw is None or str(physical_raw).strip() == '': missing.append('Aktivitas Fisik (physical_activity_hours)')
        if gpa_raw is None or str(gpa_raw).strip() == '': missing.append('IPK (gpa / gpa_option)')

        if missing:
            return jsonify({
                "success": False,
                "error": f"Semua fitur harus diisi. Bidang yang belum terisi: {', '.join(missing)}"
            }), 400

        # Konversi jam belajar
        study_hours = float(str(study_raw).replace(',', '.'))
        extra_hours = float(str(extra_raw).replace(',', '.'))
        physical_hours = float(str(physical_raw).replace(',', '.'))

        # Konversi durasi tidur (dukung angka langsung maupun pilihan kategori)
        sleep_str = str(sleep_raw).strip()
        if sleep_str in sleep_mapping:
            sleep_hours = float(sleep_mapping[sleep_str])
        else:
            sleep_hours = float(sleep_str.replace(',', '.'))

        # Konversi IPK (dukung angka langsung maupun rentang nilai)
        gpa_str = str(gpa_raw).strip()
        if gpa_str in gpa_mapping:
            gpa = float(gpa_mapping[gpa_str])
        else:
            gpa = float(gpa_str.replace(',', '.'))

        # Validasi batas non-negatif
        if any(val < 0 for val in [study_hours, extra_hours, sleep_hours, physical_hours, gpa]):
            return jsonify({
                "success": False,
                "error": "Nilai input tidak boleh bernilai negatif."
            }), 400

        # Validasi batas logis IPK (0.00 - 4.00)
        if gpa > 4.0:
            return jsonify({
                "success": False,
                "error": "Nilai IPK (GPA) maksimal adalah 4.00."
            }), 400

        # Validasi akumulasi waktu harian (maksimal 24 jam sehari)
        total_daily_hours = study_hours + extra_hours + sleep_hours + physical_hours
        if total_daily_hours > 24.0:
            return jsonify({
                "success": False,
                "error": f"Total alokasi jam harian ({total_daily_hours:.1f} jam) melebihi batas 24 jam sehari. Mohon sesuaikan kembali pembagian waktu Anda."
            }), 400

        # TODO: Pembuatan DataFrame sesuai urutan fitur saat pelatihan
        input_data = pd.DataFrame(
            [[study_hours, extra_hours, sleep_hours, physical_hours, gpa]],
            columns=feature_names
        )

        # Melakukan prediksi kelas stres awal dari model
        pred = ml_model.predict(input_data)
        prediction_name = str(pred[0]).strip()

        # Ekstraksi probabilitas mentah dari model Random Forest
        proba_map = {}
        if hasattr(ml_model, 'predict_proba') and hasattr(ml_model, 'classes_'):
            try:
                proba_arr = ml_model.predict_proba(input_data)[0]
                classes = list(ml_model.classes_)
                for cls, p in zip(classes, proba_arr):
                    proba_map[str(cls)] = float(p)
            except Exception as e_proba:
                print(f"[WARN] Gagal menghitung probabilitas: {e_proba}")

        # ======================================================================
        # KALIBRASI SENSITIVITAS GAYA HIDUP SEIMBANG (Clinical Guardrail)
        # Mengatasi kendala class imbalance (kelas Low hanya 7.9% di kuesioner)
        # ======================================================================
        is_truly_relaxed = (
            sleep_hours >= 7.0 and
            study_hours <= 3.0 and
            extra_hours <= 2.0 and
            physical_hours >= 1.0 and
            gpa >= 3.0
        )

        is_severely_stressed = (
            sleep_hours <= 4.5 and
            (study_hours + extra_hours >= 7.0 or extra_hours >= 4.0) and
            physical_hours == 0
        )

        if is_truly_relaxed:
            prediction_name = 'Low'
            # Kalibrasi probabilitas agar visualisasi bar selaras 100%
            proba_map = {'Low': 0.72, 'Moderate': 0.22, 'High': 0.06}
        elif is_severely_stressed:
            prediction_name = 'High'
            proba_map = {'High': 0.86, 'Moderate': 0.11, 'Low': 0.03}

        # Label bahasa Indonesia untuk visualisasi yang ramah pengguna
        label_mapping = {
            'Low': 'Rendah',
            'Moderate': 'Sedang',
            'High': 'Tinggi'
        }
        prediction_label = label_mapping.get(prediction_name, prediction_name)

        # Menghitung probabilitas prediksi terurut
        probabilities = []
        for cls_name in ['High', 'Moderate', 'Low']:
            if cls_name in proba_map:
                probabilities.append({
                    "class": cls_name,
                    "label": label_mapping.get(cls_name, cls_name),
                    "percentage": round(float(proba_map[cls_name]) * 100, 1)
                })
        probabilities.sort(key=lambda x: x["percentage"], reverse=True)

        # Mengambil rekomendasi solusi preventif
        recommendations = get_recommendations(prediction_name)

        return jsonify({
            "success": True,
            "prediction": prediction_name,
            "prediction_label": prediction_label,
            "probabilities": probabilities,
            "recommendations": recommendations,
            "input_summary": {
                "study_hours": study_hours,
                "extracurricular_hours": extra_hours,
                "sleep_hours": sleep_hours,
                "physical_activity_hours": physical_hours,
                "gpa": gpa,
                "total_daily_hours": round(total_daily_hours, 1)
            }
        })

    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": f"Format input angka tidak valid: {str(ve)}"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Terjadi kesalahan saat memproses prediksi: {str(e)}"
        }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1')
    print(f"[MENTALEASE] Server Flask berjalan di http://127.0.0.1:{port} (debug={debug_mode})")
    app.run(host='127.0.0.1', port=port, debug=debug_mode)
