import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// --- KONFIGURACJA IKON LEAFLET ---
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- DANE ZABYTKÓW ---
const monumentsData = [
  { id: "rejewski", gender: "male", name: "Marian Rejewski", position: [53.1256, 18.0053], img: "/images/rejewski.jpg", shortBio: "Genialny matematyk, pogromca Enigmy." },
  { id: "luczniczka", gender: "female", name: "Łuczniczka", position: [53.1245, 18.0105], img: "/images/luczniczka.jpg", shortBio: "Ikona i najstarszy symbol Bydgoszczy." },
  { id: "przechodzacy", gender: "male", name: "Przechodzący przez rzekę", position: [53.1230, 18.0035], img: "/images/przechodzacy.jpg", shortBio: "Balansująca rzeźba nad rzeką Brdą." },
  { id: "potop", gender: "female", name: "Fontanna Potop", position: [53.1265, 18.0080], img: "/images/potop.jpg", shortBio: "Zjawiskowa fontanna, odbudowana przez mieszkańców." },
  { id: "kazimierz", gender: "male", name: "Król Kazimierz Wielki", position: [53.1215, 17.9985], img: "/images/kazimierz.jpg", shortBio: "Założyciel miasta, nadał prawa w 1346 r." },
  { id: "spichrze", gender: "male", name: "Spichrze nad Brdą", position: [53.1235, 18.0020], img: "/images/spichrze.jpg", shortBio: "Zabytkowe magazyny, symbol handlu." },
  { id: "mlyny", gender: "male", name: "Młyny Rothera", position: [53.1238, 17.9966], img: "/images/mlyny.jpg", shortBio: "Centrum kultury na Wyspie Młyńskiej." },
  { id: "opera", gender: "female", name: "Opera Nova", position: [53.1227, 18.0006], img: "/images/opera.jpg", shortBio: "Bydgoska scena operowa w trzech kręgach." },
  { id: "wieza", gender: "female", name: "Wieża Ciśnień", position: [53.1206, 17.9912], img: "/images/wieza.jpg", shortBio: "Muzeum Wodociągów i punkt widokowy." },
  { id: "rynek", gender: "male", name: "Pomnik Walki i Męczeństwa", position: [53.1224, 18.0033], img: "/images/rynek.jpg", shortBio: "Upamiętnia ofiary Krwawej Niedzieli." },
  { id: "szwalbe", gender: "male", name: "Andrzej Szwalbe", position: [53.1248, 18.0075], img: "/images/szwalbe.jpg", shortBio: "Wizjoner, twórca Filharmonii Pomorskiej." }
];

// --- KOMPONENT 1: MAPA Z CZATEM (TWOJA STARA APLIKACJA) ---
function BydgoMap({ onBack }) {
  const [monumentId, setMonumentId] = useState(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAutoRead, setIsAutoRead] = useState(false);
  const [voices, setVoices] = useState([]);

  const currentMonument = monumentsData.find(m => m.id === monumentId);

  function FlyToMarker({ position }) {
    const map = useMap();
    useEffect(() => {
      if (position) map.flyTo(position, 16, { duration: 1.5 });
    }, [position, map]);
    return null;
  }

  // Ładowanie głosów (FIX)
  useEffect(() => {
    const loadVoices = () => {
      let availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) setVoices(availableVoices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    setTimeout(loadVoices, 500);
  }, []);

  const handleSelectMonument = (id) => {
    if (id === monumentId) return;
    setMonumentId(id);
    setChatHistory([]);
    window.speechSynthesis.cancel();
  };

  // Mówienie (FIX MĘSKI GŁOS)
  const speak = (text, gender = 'male') => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    const plVoices = voices.filter(v => v.lang.includes('pl') || v.lang.includes('PL'));
    
    let selectedVoice = null;
    if (gender === 'female') {
      selectedVoice = plVoices.find(v => v.name.includes('Zosia') || v.name.includes('Paulina') || v.name.includes('Google'));
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.pitch = 1.1; 
    } else {
      selectedVoice = plVoices.find(v => v.name.includes('Adam') || v.name.includes('Krzysztof'));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.pitch = 1.0;
      } else {
        if (plVoices.length > 0) utterance.voice = plVoices[0];
        utterance.pitch = 0.6; // Hack na niski głos
        utterance.rate = 0.9;
      }
    }
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!message || !currentMonument) return;
    const textToSend = message; 
    setMessage(""); 
    
    const userMsg = { sender: "Ty", text: textToSend };
    setChatHistory((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monumentId: monumentId, message: textToSend })
      });
      const data = await response.json();
      const botMsg = { sender: currentMonument.name, text: data.reply };
      setChatHistory((prev) => [...prev, botMsg]);
      
      if (isAutoRead) speak(data.reply, currentMonument.gender);

    } catch (error) {
      alert("Błąd połączenia z serwerem!");
    }
    setLoading(false);
  };

  return (
    <div style={{ 
        width: "100%", maxWidth: "1100px", height: "85vh", 
        background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(20px)",            
        border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        borderRadius: "30px", overflow: "hidden", display: "flex", flexDirection: "row", position: "relative"
    }}>
      {/* PRZYCISK POWROTU DO MENU */}
      <button 
        onClick={onBack}
        style={{
            position: "absolute", top: "20px", left: "20px", zIndex: 1000,
            background: "white", border: "none", borderRadius: "50%",
            width: "40px", height: "40px", cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)", fontSize: "20px"
        }}
        title="Wróć do menu"
      >
        🏠
      </button>

      <div style={{ flex: "1.2", position: "relative", borderRight: "1px solid rgba(255,255,255,0.3)" }}>
        <MapContainer center={[53.123, 18.004]} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {monumentsData.map((m) => (
            <Marker key={m.id} position={m.position} eventHandlers={{ click: () => handleSelectMonument(m.id) }}>
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                <div style={{ textAlign: "center", padding: "5px" }}><strong>{m.name}</strong></div>
              </Tooltip>
            </Marker>
          ))}
          {currentMonument && <FlyToMarker position={currentMonument.position} />}
        </MapContainer>
      </div>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.3)" }}>
        {!currentMonument ? (
             <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", color: "#666", textAlign: "center" }}>
                <div style={{ fontSize: "60px", marginBottom: "20px", opacity: 0.7, filter: "grayscale(100%)" }}>👈</div>
                <h2 style={{ margin: "0", color: "#333" }}>Wybierz miejsce</h2>
                <p>Kliknij pinezkę na mapie</p>
             </div>
        ) : (
            <>
                <div style={{ 
                    height: "35%", width: "100%",
                    backgroundImage: `url(${currentMonument.img})`, backgroundSize: "cover", backgroundPosition: "center",
                    position: "relative", display: "flex", alignItems: "flex-end",
                    boxShadow: "0 5px 20px rgba(0,0,0,0.1)"
                }}>
                    <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "70%", background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}></div>
                    <div style={{ position: "absolute", top: "15px", right: "15px", zIndex: 20 }}>
                      <button 
                        onClick={() => setIsAutoRead(!isAutoRead)}
                        style={{
                          background: isAutoRead ? "#2563EB" : "rgba(255,255,255,0.2)",
                          backdropFilter: "blur(10px)", color: "white",
                          border: "1px solid rgba(255,255,255,0.5)", borderRadius: "30px",
                          padding: "8px 15px", cursor: "pointer", fontSize: "13px", fontWeight: "bold"
                        }}
                      >
                        {isAutoRead ? "🔊 Lektor WŁ" : "🔇 Lektor WYŁ"}
                      </button>
                    </div>
                    <div style={{ position: "relative", zIndex: 10, padding: "20px", color: "white" }}>
                        <h2 style={{ margin: "0", fontSize: "26px", fontWeight: "600" }}>{currentMonument.name}</h2>
                        <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.9 }}>{currentMonument.shortBio}</p>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {chatHistory.map((msg, index) => (
                      <div key={index} style={{ alignSelf: msg.sender === "Ty" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                        <div style={{ 
                            background: msg.sender === "Ty" ? "linear-gradient(135deg, #2563EB, #a18cd1)" : "rgba(255,255,255,0.7)", 
                            color: msg.sender === "Ty" ? "white" : "#333",
                            backdropFilter: "blur(5px)",
                            padding: "12px 18px", borderRadius: "18px",
                            fontSize: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            display: msg.sender !== "Ty" ? "flex" : "block", alignItems: "center", gap: "10px"
                        }}>
                            <span>{msg.text}</span>
                            {msg.sender !== "Ty" && !isAutoRead && (
                              <button 
                                onClick={() => speak(msg.text, currentMonument.gender)}
                                style={{ background: "rgba(0,0,0,0.1)", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}
                              >
                                🔊
                              </button>
                            )}
                        </div>
                      </div>
                  ))}
                  {loading && <div style={{fontSize: "12px", color: "#666", marginLeft: "15px", fontStyle: "italic"}}>Pisze...</div>}
                </div>

                <div style={{ padding: "20px", display: "flex", gap: "10px", borderTop: "1px solid rgba(255,255,255,0.5)" }}>
                <input 
                    type="text" value={message} onChange={(e) => setMessage(e.target.value)} 
                    placeholder={`Napisz do: ${currentMonument.name}...`}
                    style={{ 
                        flex: 1, padding: "15px 20px", borderRadius: "30px", outline: "none", fontSize: "14px",
                        background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.8)", color: "#333"
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} style={{ 
                    width: "50px", height: "50px", borderRadius: "50%", border: "none", cursor: "pointer", 
                    background: "linear-gradient(135deg, #2563EB, #a18cd1)", color: "white", fontSize: "20px",
                    boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)"
                }}>➤</button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}

// --- KOMPONENT 2: MENU GŁÓWNE ---
function MainMenu({ onStart }) {
  const cards = [
    { id: 'map', title: 'BydgoBOT', icon: '🏛️', desc: 'Rozmawiaj z zabytkami i poznaj historię.', color: 'linear-gradient(135deg, #2563EB, #a18cd1)' },
    { id: 'quiz', title: 'Quiz Wiedzy', icon: '❓', desc: 'Sprawdź, co wiesz o mieście (wkrótce).', color: 'linear-gradient(135deg, #ff9966, #ff5e62)', disabled: true },
    { id: 'gallery', title: 'Galeria', icon: '📸', desc: 'Najpiękniejsze zdjęcia Bydgoszczy (wkrótce).', color: 'linear-gradient(135deg, #56ab2f, #a8e063)', disabled: true }
  ];

  return (
    <div style={{ 
      width: "100%", maxWidth: "900px", padding: "40px",
      background: "rgba(255, 255, 255, 0.55)", backdropFilter: "blur(20px)",            
      border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      borderRadius: "30px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center"
    }}>
      <div style={{ fontSize: "60px", marginBottom: "10px" }}>🌊</div>
      <h1 style={{ 
        fontSize: "42px", margin: "0 0 10px 0", 
        background: "linear-gradient(45deg, #2563EB, #a18cd1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" 
      }}>
        Wirtualna Bydgoszcz
      </h1>
      <p style={{ color: "#555", fontSize: "18px", maxWidth: "600px", marginBottom: "40px" }}>
        Wybierz aktywność i odkryj miasto na nowo dzięki sztucznej inteligencji.
      </p>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        {cards.map(card => (
          <div key={card.id} 
            onClick={() => !card.disabled && onStart(card.id)}
            style={{
              width: "250px", padding: "30px 20px", borderRadius: "20px",
              background: "rgba(255,255,255,0.6)", border: "1px solid white",
              cursor: card.disabled ? "not-allowed" : "pointer",
              transition: "transform 0.3s, box-shadow 0.3s",
              opacity: card.disabled ? 0.6 : 1,
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={(e) => !card.disabled && (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => !card.disabled && (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: "50px", marginBottom: "15px" }}>{card.icon}</div>
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{card.title}</h3>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px", minHeight: "40px" }}>{card.desc}</p>
            <button style={{
              padding: "10px 25px", borderRadius: "20px", border: "none", color: "white", fontWeight: "bold",
              background: card.disabled ? "#ccc" : card.color, cursor: card.disabled ? "not-allowed" : "pointer"
            }}>
              {card.disabled ? "Wkrótce" : "Start"}
            </button>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: "40px", fontSize: "12px", color: "#888" }}>
        © 2025 BydgoBOT Team
      </div>
    </div>
  );
}

// --- GŁÓWNY KOMPONENT APP ---
function App() {
  // Stan widoku: 'menu' | 'map' | 'quiz' itd.
  const [currentView, setCurrentView] = useState('menu');

  return (
    <>
      <div className="background-blob blob-1"></div>
      <div className="background-blob blob-2"></div>
      <div className="background-blob blob-3"></div>

      {currentView === 'menu' && <MainMenu onStart={setCurrentView} />}
      {currentView === 'map' && <BydgoMap onBack={() => setCurrentView('menu')} />}
    </>
  )
}

export default App