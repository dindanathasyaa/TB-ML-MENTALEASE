"""
Script Pengujian Black-Box API Backend Mentalease (QA Verification)
Memverifikasi endpoint GET / dan POST /predict sesuai matriks uji Laporan Progres 2:
- UK-0: Health check status online dan model termuat
- UK-1: Skenario Santai -> Low (Rendah) dengan total probabilitas 100%
- UK-2: Skenario Realistis -> Moderate (Sedang) dengan total probabilitas 100%
- UK-3: Skenario Beban Berat -> High (Tinggi) dengan total probabilitas 100%
- UK-4: Anomali total waktu > 24 jam -> ditolak HTTP 400
- UK-5: Input bernilai negatif -> ditolak HTTP 400
- UK-6: Missing field -> ditolak HTTP 400
"""
import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import app  # noqa: E402


def assert_valid_prediction(client, name, payload, expected_class):
    """Memverifikasi prediksi kelas target dan konsistensi jumlah probabilitas 100%."""
    res = client.post('/predict', json=payload)
    assert res.status_code == 200, f"[{name}] Gagal HTTP {res.status_code}: {res.get_json()}"
    data = res.get_json()
    assert data.get('success') is True, f"[{name}] success bukan True"
    assert data.get('prediction') == expected_class, (
        f"[{name}] Harapannya {expected_class}, didapat {data.get('prediction')}"
    )
    total_pct = round(sum(p['percentage'] for p in data['probabilities']), 1)
    assert abs(total_pct - 100.0) <= 0.2, f"[{name}] Total probabilitas {total_pct}% != 100%"
    print(f"[PASS] {name}: {data['prediction']} ({data['prediction_label']}) | Sum={total_pct}%")


def assert_rejected_400(client, name, payload):
    """Memverifikasi input tidak valid ditolak dengan kode status HTTP 400."""
    res = client.post('/predict', json=payload)
    assert res.status_code == 400, f"[{name}] Harapannya HTTP 400, didapat {res.status_code}"
    data = res.get_json()
    assert data.get('success') is False, f"[{name}] success seharusnya False"
    print(f"[PASS] {name}: Ditolak HTTP 400 -> {data.get('error')}")


def main():
    client = app.test_client()

    # UK-0: Health Check
    res_health = client.get('/')
    assert res_health.status_code == 200
    health = res_health.get_json()
    assert health.get('status') == 'online'
    assert health.get('model_loaded') is True
    print("[PASS] UK-0 Health Check: online & model_loaded=True")

    # UK-1 s.d. UK-3: Validasi 3 kelas prediksi
    assert_valid_prediction(
        client,
        'UK-1 Skenario Santai',
        {'study_hours': 2, 'extracurricular_hours': 1, 'sleep_hours': 8, 'physical_activity_hours': 2, 'gpa': 3.75},
        'Low',
    )
    assert_valid_prediction(
        client,
        'UK-2 Skenario Realistis',
        {'study_hours': 4, 'extracurricular_hours': 2, 'sleep_hours': 7, 'physical_activity_hours': 1, 'gpa': 3.25},
        'Moderate',
    )
    assert_valid_prediction(
        client,
        'UK-3 Skenario Beban Berat',
        {'study_hours': 7, 'extracurricular_hours': 4, 'sleep_hours': 4, 'physical_activity_hours': 0, 'gpa': 2.35},
        'High',
    )

    # UK-4 s.d. UK-6: Validasi batas anomali
    assert_rejected_400(
        client,
        'UK-4 Anomali > 24 Jam',
        {'study_hours': 12, 'extracurricular_hours': 5, 'sleep_hours': 7, 'physical_activity_hours': 1, 'gpa': 3.2},
    )
    assert_rejected_400(
        client,
        'UK-5 Nilai Negatif',
        {'study_hours': 2, 'extracurricular_hours': 1, 'sleep_hours': -2, 'physical_activity_hours': 1, 'gpa': 3.2},
    )
    assert_rejected_400(
        client,
        'UK-6 Missing Field',
        {'study_hours': 2, 'sleep_hours': 8},
    )

    print("\nSemua 7 pengujian Black-Box LULUS 100%!")


if __name__ == '__main__':
    main()
