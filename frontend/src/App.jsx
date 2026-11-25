import React, { useState, useMemo } from 'react';
import './App.css';
import logoImg from './assets/logo.png';
import {
  Brain,
  Sparkles,
  BookOpen,
  Users,
  Moon,
  Dumbbell,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Activity,
  HeartPulse,
  Info,
  Clock,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Check
} from 'lucide-react';

// Pemetaan nilai tengah (midpoint) sesuai model machine learning Mentalease
const SLEEP_OPTIONS = [
  { label: 'Kurang dari 5 jam', value: 4.5, desc: '< 5 jam (Sangat minim)' },
  { label: '5 sampai 6 jam', value: 5.5, desc: '5 - 6 jam (Kurang)' },
  { label: '7 sampai 8 jam', value: 7.5, desc: '7 - 8 jam (Ideal/Cukup)' },
  { label: 'Lebih dari 8 jam', value: 8.5, desc: '> 8 jam (Sangat cukup)' },
];

const GPA_OPTIONS = [
  { label: '< 2,50', value: 2.35, desc: 'Perlu peningkatan' },
  { label: '2,50 - 2,99', value: 2.75, desc: 'Memuaskan' },
  { label: '3,00 - 3,49', value: 3.25, desc: 'Sangat Memuaskan' },
  { label: '3,50 - 4,00', value: 3.75, desc: 'Dengan Pujian (Cumlaude)' },
];

// Profil simulasi untuk kemudahan demo cepat saat praktikum
const PRESETS = [
  {
    name: 'Santai & Seimbang',
    desc: 'Beban ringan & istirahat cukup (Rendah)',
    data: { study: 2, extra: 2, sleep: '7 sampai 8 jam', physical: 3, gpa: '3,00 - 3,49' }
  },
  {
    name: 'Akademik Standar',
    desc: 'Jadwal kuliah & kegiatan biasa (Sedang)',
    data: { study: 3.5, extra: 2, sleep: '5 sampai 6 jam', physical: 1, gpa: '3,00 - 3,49' }
  },
  {
    name: 'Padat & Berisiko Stres',
    desc: 'Beban padat & kurang tidur (Tinggi)',
    data: { study: 4, extra: 4, sleep: 'Kurang dari 5 jam', physical: 0, gpa: '2,50 - 2,99' }
  }
];

function App() {
  // State form input Mentalease
  const [studyHours, setStudyHours] = useState('4');
  const [extraHours, setExtraHours] = useState('2');
  const [sleepOption, setSleepOption] = useState('7 sampai 8 jam');
  const [physicalHours, setPhysicalHours] = useState('1');
  const [gpaOption, setGpaOption] = useState('3,50 - 4,00');

  // State response dan status UI
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  // URL API Flask Backend
  const apiUrl = 'http://127.0.0.1:5000';

  // Perhitungan akumulasi jam harian secara real-time
  const sleepValue = useMemo(() => {
    const sleepObj = SLEEP_OPTIONS.find(opt => opt.label === sleepOption);
    return sleepObj ? sleepObj.value : 0;
  }, [sleepOption]);

  const dailyTotal = useMemo(() => {
    const study = parseFloat(studyHours) || 0;
    const extra = parseFloat(extraHours) || 0;
    const physical = parseFloat(physicalHours) || 0;
    return +(study + extra + physical + sleepValue).toFixed(1);
  }, [studyHours, extraHours, physicalHours, sleepValue]);

  const freeTime = useMemo(() => {
    return Math.max(0, +(24 - dailyTotal).toFixed(1));
  }, [dailyTotal]);

  const isExceeded = dailyTotal > 24.0;

  // Eksekusi pemanggilan API prediksi
  const executePredict = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Terjadi kesalahan saat memproses prediksi.');
      }

      setPrediction(data);
    } catch (err) {
      setError(err.message || 'Gagal terhubung ke server backend Flask. Pastikan app.py sudah berjalan di port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // Handler pengiriman request prediksi manual dari tombol
  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (studyHours === '' || extraHours === '' || !sleepOption || physicalHours === '' || !gpaOption) {
      setError('Mohon lengkapi seluruh parameter gaya hidup dan akademik terlebih dahulu.');
      return;
    }

    if (isExceeded) {
      setError(`Total alokasi waktu (${dailyTotal} jam) melebihi batas 24 jam sehari. Mohon kurangi jam belajar atau organisasi.`);
      return;
    }

    executePredict({
      study_hours: parseFloat(studyHours),
      extracurricular_hours: parseFloat(extraHours),
      sleep_option: sleepOption,
      physical_activity_hours: parseFloat(physicalHours),
      gpa_option: gpaOption
    });
  };

  // Handler reset
  const handleReset = () => {
    setStudyHours('4');
    setExtraHours('2');
    setSleepOption('7 sampai 8 jam');
    setPhysicalHours('1');
    setGpaOption('3,50 - 4,00');
    setPrediction(null);
    setError(null);
    setActivePreset(null);
  };

  // Handler preset dengan eksekusi prediksi otomatis langsung
  const handleApplyPreset = (preset) => {
    setStudyHours(String(preset.data.study));
    setExtraHours(String(preset.data.extra));
    setSleepOption(preset.data.sleep);
    setPhysicalHours(String(preset.data.physical));
    setGpaOption(preset.data.gpa);
    setError(null);
    setActivePreset(preset.name);

    // Langsung jalankan prediksi otomatis agar hasil berubah seketika
    executePredict({
      study_hours: preset.data.study,
      extracurricular_hours: preset.data.extra,
      sleep_option: preset.data.sleep,
      physical_activity_hours: preset.data.physical,
      gpa_option: preset.data.gpa
    });
  };

  // Helper styling kartu status
  const getBadgeStyle = (level) => {
    switch (level) {
      case 'Low':
        return {
          bg: '#ecfdf5',
          border: '#6ee7b7',
          text: '#047857',
          barColor: '#10b981',
          label: 'Rendah (Aman)',
          summary: 'Keseimbangan waktu dan pola hidup Anda sangat optimal.',
          icon: <CheckCircle2 size={32} color="#059669" />
        };
      case 'Moderate':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#b45309',
          barColor: '#f59e0b',
          label: 'Sedang (Perlu Perhatian)',
          summary: 'Beban aktivitas mulai menekan waktu istirahat dan relaksasi.',
          icon: <Info size={32} color="#d97706" />
        };
      case 'High':
      default:
        return {
          bg: '#fef2f2',
          border: '#fca5a5',
          text: '#b91c1c',
          barColor: '#ef4444',
          label: 'Tinggi (Berisiko Burnout)',
          summary: 'Tingkat stres tinggi dengan risiko kelelahan fisik & mental berat.',
          icon: <AlertTriangle size={32} color="#dc2626" />
        };
    }
  };

  return (
    <div className="desktop-app-wrapper">
      {/* Top Navbar Desktop */}
      <header className="desktop-navbar">
        <div className="navbar-content">
          <div className="brand-group">
            <div className="brand-icon-box">
              <img src={logoImg} alt="Logo Mentalease" className="brand-logo-img" />
            </div>
            <div className="brand-text">
              <div className="brand-title-row">
                <h1>Mentalease</h1>
              </div>
              <p className="brand-tagline">Sistem Prediksi & Manajemen Beban Stres Mahasiswa</p>
            </div>
          </div>

          <div className="navbar-meta">
            <div className="status-pill-online">
              <span className="status-dot"></span>
              <span>Sistem Aktif</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="dashboard-container">
        {/* Banner Simulasi Preset */}
        <section className="preset-banner">
          <div className="preset-banner-title">
            <Sparkles size={16} />
            <span>Pilih Simulasi Profil Cepat:</span>
          </div>
          <div className="preset-button-row">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`preset-chip ${activePreset === p.name ? 'active' : ''}`}
                onClick={() => handleApplyPreset(p)}
                title={p.desc}
              >
                <strong>{p.name}</strong>
                <span className="preset-chip-desc">{p.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 2-Column Desktop Grid Layout */}
        <div className="desktop-grid">
          {/* KOLOM KIRI: FORM & PARAMETER MAHASISWA */}
          <div className="grid-column-form">
            <div className="dashboard-card">
              <div className="card-header-row">
                <div className="card-header-title">
                  <Sliders size={20} className="card-icon" />
                  <h2>Parameter Gaya Hidup & Akademik</h2>
                </div>
                <span className="card-header-badge">5 Fitur Model</span>
              </div>

              <form onSubmit={handlePredict} className="form-content">
                {/* 1. Jam Belajar */}
                <div className="form-item">
                  <div className="form-label-row">
                    <label htmlFor="studyInput">
                      <BookOpen size={16} className="item-icon" />
                      <span>Jam Belajar Harian (Study Hours)</span>
                    </label>
                    <span className="val-badge green">{studyHours} jam / hari</span>
                  </div>
                  <div className="input-range-combo">
                    <input
                      id="studyInput"
                      type="number"
                      min="0"
                      max="16"
                      step="0.5"
                      value={studyHours}
                      onChange={(e) => {
                        setStudyHours(e.target.value);
                        setActivePreset(null);
                      }}
                      className="input-number"
                      required
                    />
                    <input
                      type="range"
                      min="0"
                      max="16"
                      step="0.5"
                      value={studyHours || 0}
                      onChange={(e) => {
                        setStudyHours(e.target.value);
                        setActivePreset(null);
                      }}
                      className="range-input"
                    />
                  </div>
                </div>

                {/* 2. Jam Organisasi */}
                <div className="form-item">
                  <div className="form-label-row">
                    <label htmlFor="extraInput">
                      <Users size={16} className="item-icon" />
                      <span>Kegiatan Ekstrakurikuler / Organisasi</span>
                    </label>
                    <span className="val-badge green">{extraHours} jam / hari</span>
                  </div>
                  <div className="input-range-combo">
                    <input
                      id="extraInput"
                      type="number"
                      min="0"
                      max="12"
                      step="0.5"
                      value={extraHours}
                      onChange={(e) => {
                        setExtraHours(e.target.value);
                        setActivePreset(null);
                      }}
                      className="input-number"
                      required
                    />
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="0.5"
                      value={extraHours || 0}
                      onChange={(e) => {
                        setExtraHours(e.target.value);
                        setActivePreset(null);
                      }}
                      className="range-input"
                    />
                  </div>
                </div>

                {/* 3. Durasi Tidur */}
                <div className="form-item">
                  <div className="form-label-row">
                    <label>
                      <Moon size={16} className="item-icon" />
                      <span>Durasi Tidur Harian (Sleep Duration)</span>
                    </label>
                    <span className="val-badge neutral">{sleepOption}</span>
                  </div>
                  <div className="option-button-grid">
                    {SLEEP_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.label}
                        className={`opt-box ${sleepOption === opt.label ? 'selected' : ''}`}
                        onClick={() => {
                          setSleepOption(opt.label);
                          setActivePreset(null);
                        }}
                      >
                        <div className="opt-box-head">
                          <span className="opt-box-title">{opt.label}</span>
                          {sleepOption === opt.label && <Check size={14} className="check-icon" />}
                        </div>
                        <span className="opt-box-sub">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Aktivitas Fisik */}
                <div className="form-item">
                  <div className="form-label-row">
                    <label htmlFor="physicalInput">
                      <Dumbbell size={16} className="item-icon" />
                      <span>Aktivitas Fisik / Olahraga</span>
                    </label>
                    <span className="val-badge green">{physicalHours} jam / hari</span>
                  </div>
                  <div className="input-range-combo">
                    <input
                      id="physicalInput"
                      type="number"
                      min="0"
                      max="8"
                      step="0.5"
                      value={physicalHours}
                      onChange={(e) => {
                        setPhysicalHours(e.target.value);
                        setActivePreset(null);
                      }}
                      className="input-number"
                      required
                    />
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="0.5"
                      value={physicalHours || 0}
                      onChange={(e) => {
                        setPhysicalHours(e.target.value);
                        setActivePreset(null);
                      }}
                      className="range-input"
                    />
                  </div>
                </div>

                {/* 5. IPK Terakhir */}
                <div className="form-item">
                  <div className="form-label-row">
                    <label>
                      <GraduationCap size={16} className="item-icon" />
                      <span>Indeks Prestasi Kumulatif (IPK Terakhir)</span>
                    </label>
                    <span className="val-badge neutral">IPK {gpaOption}</span>
                  </div>
                  <div className="option-button-grid">
                    {GPA_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt.label}
                        className={`opt-box ${gpaOption === opt.label ? 'selected' : ''}`}
                        onClick={() => {
                          setGpaOption(opt.label);
                          setActivePreset(null);
                        }}
                      >
                        <div className="opt-box-head">
                          <span className="opt-box-title">IPK {opt.label}</span>
                          {gpaOption === opt.label && <Check size={14} className="check-icon" />}
                        </div>
                        <span className="opt-box-sub">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracker Keseimbangan 24 Jam */}
                <div className={`balance-tracker ${isExceeded ? 'danger' : ''}`}>
                  <div className="tracker-header">
                    <div className="tracker-title">
                      <Clock size={16} />
                      <span>Alokasi Jam Harian:</span>
                    </div>
                    <div className="tracker-numeric">
                      <span className="current-hours">{dailyTotal}</span>
                      <span className="max-hours">/ 24.0 jam</span>
                    </div>
                  </div>

                  <div className="tracker-bar-track">
                    <div
                      className="tracker-bar-fill"
                      style={{
                        width: `${Math.min((dailyTotal / 24) * 100, 100)}%`,
                        backgroundColor: isExceeded ? '#ef4444' : dailyTotal > 20 ? '#f59e0b' : '#10b981'
                      }}
                    />
                  </div>

                  <div className="tracker-footer">
                    <span className="time-stat">
                      Belajar: <strong>{studyHours}j</strong> • Ekskul: <strong>{extraHours}j</strong> • Tidur: <strong>{sleepValue}j</strong> • Olahraga: <strong>{physicalHours}j</strong>
                    </span>
                    <span className="free-time-stat">
                      Sisa waktu santai: <strong>{freeTime} jam</strong>
                    </span>
                  </div>

                  {isExceeded && (
                    <div className="exceeded-alert">
                      <AlertTriangle size={15} />
                      <span>Total alokasi aktivitas melebihi 24 jam sehari! Mohon sesuaikan kembali.</span>
                    </div>
                  )}
                </div>

                {/* Pesan Error */}
                {error && (
                  <div className="error-box">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Tombol Aksi */}
                <div className="action-buttons-row">
                  <button
                    type="submit"
                    disabled={loading || isExceeded}
                    className="btn-main-predict"
                  >
                    {loading ? (
                      <>
                        <div className="desktop-spinner" />
                        <span>Menganalisis Pola Stres...</span>
                      </>
                    ) : (
                      <>
                        <Activity size={19} />
                        <span>Prediksi Tingkat Stres</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-main-reset"
                    title="Reset seluruh parameter form"
                  >
                    <RotateCcw size={16} />
                    <span>Reset</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* KOLOM KANAN: HASIL DIAGNOSIS & REKOMENDASI (STICKY) */}
          <div className="grid-column-result">
            <div className="dashboard-card sticky-card">
              <div className="card-header-row">
                <div className="card-header-title">
                  <TrendingUp size={20} className="card-icon" />
                  <h2>Diagnosis & Rekomendasi</h2>
                </div>
                <span className="card-header-badge">Analisis Prediktif</span>
              </div>

              {!prediction ? (
                /* Tampilan Belum Prediksi (State Siap Analisis) */
                <div className="empty-state-card">
                  <div className="empty-icon-box">
                    <img src={logoImg} alt="Logo Mentalease" className="empty-state-logo-img" />
                  </div>
                  <h3>Siap Melakukan Analisis</h3>
                  <p>
                    Silakan atur parameter gaya hidup mahasiswa di panel sebelah kiri, lalu tekan tombol <strong>Prediksi Tingkat Stres</strong> untuk memproses diagnosis machine learning.
                  </p>

                  <div className="info-stats-grid">
                    <div className="stat-card">
                      <ShieldCheck size={20} className="stat-icon" />
                      <div className="stat-info">
                        <span className="stat-label">Model Algoritma</span>
                        <span className="stat-val">Random Forest</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <Sparkles size={20} className="stat-icon" />
                      <div className="stat-info">
                        <span className="stat-label">Tingkat Akurasi</span>
                        <span className="stat-val">88.5% (Terbaik)</span>
                      </div>
                    </div>
                  </div>

                  <div className="live-preview-box">
                    <span className="preview-label">Ringkasan Parameter Saat Ini:</span>
                    <div className="preview-pills">
                      <span className="pill">Belajar {studyHours} jam</span>
                      <span className="pill">Organisasi {extraHours} jam</span>
                      <span className="pill">Tidur {sleepOption}</span>
                      <span className="pill">Olahraga {physicalHours} jam</span>
                      <span className="pill">IPK {gpaOption}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Tampilan Hasil Analisis Lengkap */
                <div className="result-display-content">
                  {/* Status Badge */}
                  {(() => {
                    const badge = getBadgeStyle(prediction.prediction);
                    return (
                      <div
                        className="status-banner"
                        style={{
                          backgroundColor: badge.bg,
                          borderColor: badge.border,
                          color: badge.text
                        }}
                      >
                        <div className="status-banner-icon">{badge.icon}</div>
                        <div className="status-banner-info">
                          <span className="status-banner-pre">Hasil Diagnosis Mentalease:</span>
                          <span className="status-banner-name">{badge.label}</span>
                          <p className="status-banner-desc">{badge.summary}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Ringkasan Input Profil */}
                  {prediction.input_summary && (
                    <div className="summary-chips-row">
                      <div className="chip-item">
                        <span className="c-label">Belajar</span>
                        <span className="c-val">{prediction.input_summary.study_hours}j</span>
                      </div>
                      <div className="chip-item">
                        <span className="c-label">Organisasi</span>
                        <span className="c-val">{prediction.input_summary.extracurricular_hours}j</span>
                      </div>
                      <div className="chip-item">
                        <span className="c-label">Tidur</span>
                        <span className="c-val">{prediction.input_summary.sleep_hours}j</span>
                      </div>
                      <div className="chip-item">
                        <span className="c-label">Olahraga</span>
                        <span className="c-val">{prediction.input_summary.physical_activity_hours}j</span>
                      </div>
                      <div className="chip-item">
                        <span className="c-label">IPK</span>
                        <span className="c-val">{prediction.input_summary.gpa}</span>
                      </div>
                    </div>
                  )}

                  {/* Distribusi Probabilitas Model */}
                  {prediction.probabilities && prediction.probabilities.length > 0 && (
                    <div className="probability-section">
                      <div className="sec-header">
                        <Activity size={16} />
                        <span>Keyakinan Prediksi Model (Random Forest):</span>
                      </div>
                      <div className="proba-list-wrap">
                        {prediction.probabilities.map((item, idx) => {
                          const badge = getBadgeStyle(item.class);
                          return (
                            <div key={idx} className="proba-item">
                              <div className="proba-label-row">
                                <span className="proba-class-name">
                                  {item.label} <small>({item.class})</small>
                                </span>
                                <span className="proba-percentage" style={{ color: badge.text }}>
                                  {item.percentage}%
                                </span>
                              </div>
                              <div className="proba-bar-track">
                                <div
                                  className="proba-bar-fill"
                                  style={{
                                    width: `${item.percentage}%`,
                                    backgroundColor: badge.barColor
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Rekomendasi Solusi & Preventif */}
                  {prediction.recommendations && prediction.recommendations.length > 0 && (
                    <div className="recommendations-box">
                      <div className="rec-box-title">
                        <Sparkles size={16} />
                        <span>Rekomendasi Tindakan Personal:</span>
                      </div>
                      <ul className="rec-checklist">
                        {prediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="rec-checklist-item">
                            <ChevronRight size={16} className="rec-bullet-icon" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Desktop */}
      <footer className="desktop-footer">
        <div className="footer-content">
          <p>
            <strong>Mentalease</strong> • Sistem Prediksi & Manajemen Stres Mahasiswa Berbasis Machine Learning.
          </p>
          <p className="sub-footer">
            Praktikum Machine Learning 2026 • Kelompok 5 • Dikembangkan dengan Flask & React Vite
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
