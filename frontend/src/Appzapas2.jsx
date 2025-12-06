// PLIK: frontend/src/App.jsx
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- PEŁNA LISTA 11 MIEJSC ---
const monumentsData = [
  { id: "rejewski", name: "Marian Rejewski", position: [53.1256, 18.0053], img: "/images/rejewski.jpg", shortBio: "Genialny matematyk, pogromca Enigmy." },
  { id: "luczniczka", name: "Łuczniczka", position: [53.1245, 18.0105], img: "/images/luczniczka.jpg", shortBio: "Ikona i najstarszy symbol Bydgoszczy." },
  { id: "przechodzacy", name: "Przechodzący przez rzekę", position: [53.1230, 18.0035], img: "/images/przechodzacy.jpg", shortBio: "Balansująca rzeźba nad rzeką Brdą." },
  { id: "potop", name: "Fontanna Potop", position: [53.1265, 18.0080], img: "/images/potop.jpg", shortBio: "Zjawiskowa fontanna, odbudowana przez mieszkańców." },
  { id: "kazimierz", name: "Król Kazimierz Wielki", position: [53.1215, 17.9985], img: "/images/kazimierz.jpg", shortBio: "Założyciel miasta, nadał prawa w 1346 r." },
  { id: "spichrze", name: "Spichrze nad Brdą", position: [53.1235, 18.0020], img: "/images/spichrze.jpg", shortBio: "Zabytkowe magazyny, symbol handlu." },
  { id: "mlyny", name: "Młyny Rothera", position: [53.1238, 17.9966], img: "/images/mlyny.jpg", shortBio: "Centrum kultury na Wyspie Młyńskiej." },
  { id: "opera", name: "Opera Nova", position: [53.1227, 18.0006], img: "/images/opera.jpg", shortBio: "Bydgoska scena operowa w trzech kręgach." },
  { id: "wieza", name: "Wieża Ciśnień", position: [53.1206, 17.9912], img: "/images/wieza.jpg", shortBio: "Muzeum Wodociągów i punkt widokowy." },
  { id: "rynek", name: "Pomnik Walki i Męczeństwa", position: [53.1224, 18.0033], img: "/images/rynek.jpg", shortBio: "Upamiętnia ofiary Krwawej Niedzieli." },
  { id: "szwalbe", name: "Andrzej Szwalbe", position: [53.1248, 18.0075], img: "/images/szwalbe.jpg", shortBio: "Wizjoner, twórca Filharmonii Pomorskiej." }
];

function FlyToMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16, { duration: 1.5 });
  }, [position, map]);
  return null;
}

function App() {
  const [showModal, setShowModal] = useState(true);
  const [monumentId, setMonumentId] = useState(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentMonument = monumentsData.find(m => m.id === monumentId);

  const handleSelectMonument = (id) => {
    if (id === monumentId) return;
    setMonumentId(id);
    setChatHistory([]);
  };

  // 👇 1. NOWA FUNKCJA: Mowa (Text-to-Speech)
  const speak = (text) => {
    // Anuluj poprzednie gadanie (żeby się nie nakładało)
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL'; // Język polski
    utterance.rate = 1.0;     // Prędkość mówienia
    utterance.pitch = 1.0;    // Ton głosu
    
    window.speechSynthesis.speak(utterance);
  };
  // ---------------------------------------------

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
      
      // Opcjonalnie: Automatyczne czytanie odpowiedzi (jeśli chcesz, odkomentuj linię niżej)
      // speak(data.reply); 

    } catch (error) {
      alert("Błąd połączenia z serwerem!");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="background-blob blob-1"></div>
      <div className="background-blob blob-2"></div>
      <div className="background-blob blob-3"></div>

      <div style={{ 
        width: "100%", maxWidth: "1100px", height: "85vh", 
        background: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(20px)",            
        border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        borderRadius: "30px", overflow: "hidden", display: "flex", flexDirection: "row", position: "relative"
      }}>
        
        {showModal && (
          <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              background: "rgba(0,0,0,0.3)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(5px)"
          }}>
              <div style={{
                  background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(20px)",
                  padding: "40px", borderRadius: "30px", width: "500px", textAlign: "center", position: "relative",
                  border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
              }}>
                  <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", opacity: 0.6 }}>✕</button>
                  <div style={{fontSize: "60px", marginBottom: "10px"}}>🏛️</div>
                  <h1 style={{margin: "0 0 10px 0", background: "linear-gradient(45deg, #2563EB, #a18cd1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "36px"}}>Głosy Bydgoszczy</h1>
                  <p style={{color: "#555", fontSize: "16px"}}>Interaktywny przewodnik z AI. <br/>Kliknij pinezkę i odkryj historię.</p>
                  <button onClick={() => setShowModal(false)} style={{ marginTop: "20px", padding: "12px 30px", background: "linear-gradient(90deg, #2563EB, #a18cd1)", color: "white", border: "none", borderRadius: "30px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)" }}>Rozpocznij przygodę</button>
              </div>
          </div>
        )}

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
                              borderBottomRightRadius: msg.sender === "Ty" ? "4px" : "18px",
                              borderBottomLeftRadius: msg.sender !== "Ty" ? "4px" : "18px",
                              fontSize: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                              // Dla bota dodajemy flex, żeby ikonka była obok tekstu
                              display: msg.sender !== "Ty" ? "flex" : "block",
                              alignItems: "center",
                              gap: "10px"
                          }}>
                              <span>{msg.text}</span>
                              
                              {/* 👇 2. IKONKA GŁOŚNIKA TYLKO DLA BOTA 👇 */}
                              {msg.sender !== "Ty" && (
                                <button 
                                  onClick={() => speak(msg.text)}
                                  style={{
                                    background: "rgba(0,0,0,0.1)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "24px",
                                    height: "24px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "12px",
                                    flexShrink: 0 // Żeby się nie zgniatało
                                  }}
                                  title="Przeczytaj na głos"
                                >
                                  🔊
                                </button>
                              )}
                              {/* ------------------------------------- */}
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

      <div style={{
          position: "fixed", bottom: "10px", right: "10px", padding: "5px 12px",
          borderRadius: "15px", background: "rgba(255, 255, 255, 0.3)", backdropFilter: "blur(3px)",
          fontSize: "11px", color: "#666", zIndex: 10, border: "1px solid rgba(255,255,255,0.4)"
      }}>
          © 2025 <b>BydgoBOT</b> | Made by <b>SanokTeam</b>
      </div>
    </>
  )
}

export default App