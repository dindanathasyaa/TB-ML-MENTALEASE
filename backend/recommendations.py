"""
Modul Rekomendasi Preventif Kesehatan Mental Mentalease
Menyediakan saran tindak lanjut terstruktur untuk kategori tingkat stres Low, Moderate, dan High.
"""

RECOMMENDATIONS_BY_LEVEL = {
    'Low': [
        "Pola hidup dan manajemen waktu Anda saat ini sudah sangat baik dan seimbang.",
        "Pertahankan konsistensi istirahat tidur yang cukup (7-8 jam) dan aktivitas fisik teratur.",
        "Tetap pantau beban tugas akademik mingguan agar tidak terjadi lonjakan stres mendadak.",
    ],
    'Moderate': [
        "Tingkat stres Anda berada di batas wajar namun memerlukan perhatian agar tidak meningkat.",
        "Evaluasi kembali pembagian waktu antara belajar dan organisasi/kegiatan luar kampus.",
        "Terapkan teknik Pomodoro (25 menit fokus, 5 menit jeda) saat belajar untuk menghindari burnout.",
        "Luangkan waktu minimal 30 menit sehari untuk olahraga ringan atau relaksasi.",
    ],
    'High': [
        "Tingkat stres Anda tergolong tinggi. Sangat disarankan untuk segera mengambil jeda istirahat pemulihan.",
        "Prioritaskan durasi tidur harian yang cukup dan hindari begadang demi mengerjakan tugas secara mendadak.",
        "Kurangi atau delegasikan aktivitas ekstrakurikuler yang tidak mendesak untuk sementara waktu.",
        "Jangan ragu untuk berdiskusi dengan teman terpercaya, dosen pembimbing akademik, atau konselor kampus.",
    ],
}

DEFAULT_RECOMMENDATION = [
    "Jaga keseimbangan antara waktu istirahat, belajar, dan aktivitas sosial sehari-hari."
]


def get_recommendations(stress_level: str) -> list[str]:
    """Mengembalikan daftar rekomendasi preventif berdasarkan tingkat stres mahasiswa."""
    return RECOMMENDATIONS_BY_LEVEL.get(stress_level, DEFAULT_RECOMMENDATION)
