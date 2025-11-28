import { useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("upload"); // upload veya download
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const [downloadName, setDownloadName] = useState("");
  const [downloadKey, setDownloadKey] = useState("");

  // Backend Adresi (Python terminalinde yazan adres)
  const API_URL = "http://127.0.0.1:5000";

  // DOSYA YÜKLEME FONKSİYONU
  const handleUpload = async () => {
    if (!file) return alert("Lütfen bir dosya seçin!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Backend'e istek atıyoruz
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setUploadResult(data); // Gelen Key'i ekrana basmak için kaydediyoruz
      } else {
        alert("Hata: " + data.error);
      }
    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      alert("Backend ile iletişim kurulamadı! Python açık mı?");
    }
  };

  // DOSYA İNDİRME FONKSİYONU
  const handleDownload = async () => {
    if (!downloadName || !downloadKey)
      return alert("Dosya adı ve Key gerekli!");

    try {
      const response = await fetch(`${API_URL}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: downloadName, key: downloadKey }),
      });

      if (response.ok) {
        // Gelen dosyayı (blob) tarayıcıda indirme linkine çeviriyoruz
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = downloadName; // İndirilecek dosya adı
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const data = await response.json();
        alert("Hata: " + (data.error || "İndirme başarısız"));
      }
    } catch (error) {
      alert("Backend ile iletişim kurulamadı!");
    }
  };

  return (
    <div className="container">
      <h1>🔐 Güvenli Dosya Paylaşımı</h1>

      {/* Sekmeler */}
      <div className="tabs">
        <button
          className={activeTab === "upload" ? "active" : ""}
          onClick={() => setActiveTab("upload")}
        >
          Dosya Yükle
        </button>
        <button
          className={activeTab === "download" ? "active" : ""}
          onClick={() => setActiveTab("download")}
        >
          Dosya İndir
        </button>
      </div>

      {/* YÜKLEME EKRANI */}
      {activeTab === "upload" && (
        <div className="card">
          <h2>Dosya Yükle & Şifrele</h2>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button className="action-btn" onClick={handleUpload}>
            Yükle
          </button>

          {uploadResult && (
            <div className="success-box">
              <p>
                ✅ <strong>Dosya Şifrelendi!</strong>
              </p>
              <p>Dosya Adı: {uploadResult.filename}</p>
              <p>
                Anahtar (Sakla):{" "}
                <code className="key-display">{uploadResult.key}</code>
              </p>
            </div>
          )}
        </div>
      )}

      {/* İNDİRME EKRANI */}
      {activeTab === "download" && (
        <div className="card">
          <h2>Dosya İndir & Çöz</h2>
          <input
            type="text"
            placeholder="Dosya Adı (Örn: notlar.txt)"
            value={downloadName}
            onChange={(e) => setDownloadName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Anahtar (Key)"
            value={downloadKey}
            onChange={(e) => setDownloadKey(e.target.value)}
          />
          <button className="action-btn" onClick={handleDownload}>
            İndir
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
