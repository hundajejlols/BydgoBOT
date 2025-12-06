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

const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

// --- KOMPONENT 3: QUIZ ---
function QuizView({ onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const shuffledMonuments = shuffleArray(monumentsData);
    const selectedQuestions = shuffledMonuments.slice(0, 5).map(correctMonument => {
      const others = monumentsData.filter(m => m.id !== correctMonument.id);
      const shuffledOthers = shuffleArray(others).slice(0, 3);
      const options = shuffleArray([correctMonument, ...shuffledOthers]);
      return { target: correctMonument, options: options };
    });
    setQuestions(selectedQuestions);
  }, []);

  const handleOptionClick = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const correct = option.id === questions[currentQIndex].target.id;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
    setTimeout(() => {
      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex(currentQIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  if (questions.length === 0) return <div>Ładowanie...</div>;

  if (quizFinished) {
    return (
      <div style={{ 
        width: "100%", maxWidth: "600px", padding: "40px",
        background: "rgba(255, 255, 255, 0.65)", backdropFilter: "blur(20px)",            
        borderRadius: "30px", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}>
        <div style={{ fontSize: "80px", marginBottom: "10px" }}>{score === questions.length ? "🏆" : "🎉"}</div>
        <h2 style={{ fontSize: "32px", color: "#333", margin: "10px 0" }}>Koniec Quizu!</h2>
        <div style={{ fontSize: "48px", fontWeight: "bold", color: "#2563EB", margin: "20px 0" }}>{score} / {questions.length}</div>
        <button onClick={onBack} style={{ padding: "12px 30px", background: "linear-gradient(90deg, #2563EB, #a18cd1)", color: "white", border: "none", borderRadius: "30px", cursor: "pointer" }}>Wróć do menu</button>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div style={{ 
        width: "100%", maxWidth: "900px", height: "85vh", 
        background: "rgba(255, 255, 255, 0.55)", backdropFilter: "blur(20px)",            
        border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        borderRadius: "30px", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative"
    }}>
       <div style={{ padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.5)", flexShrink: 0 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>🏠</button>
          <div style={{ fontWeight: "bold", color: "#444" }}>Pytanie {currentQIndex + 1} / {questions.length}</div>
          <div style={{ fontWeight: "bold", color: "#2563EB" }}>Punkty: {score}</div>
       </div>

       <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "15px 25px", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ textAlign: "center", margin: "0 0 10px 0", color: "#333", fontSize: "20px", flexShrink: 0 }}>Co to za miejsce?</h2>
          <div style={{ 
              flex: "1 1 auto", width: "100%", maxWidth: "600px", minHeight: "150px", maxHeight: "40vh",
              borderRadius: "20px", overflow: "hidden", boxShadow: "0 5px 20px rgba(0,0,0,0.1)", marginBottom: "15px", position: "relative"
          }}>
              <img src={currentQ.target.img} alt="Zgadnij" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {selectedOption && (
                 <div style={{
                     position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                     background: isCorrect ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.8)",
                     color: "white", fontSize: "40px", fontWeight: "bold", backdropFilter: "blur(4px)"
                 }}>{isCorrect ? "DOBRZE! ✅" : "ŹLE ❌"}</div>
              )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%", maxWidth: "600px", flexShrink: 0 }}>
              {currentQ.options.map((opt) => {
                  let bgColor = "rgba(255,255,255,0.7)";
                  let textColor = "#333";
                  if (selectedOption) {
                      if (opt.id === currentQ.target.id) { bgColor = "#22c55e"; textColor = "white"; }
                      else if (opt.id === selectedOption.id && !isCorrect) { bgColor = "#ef4444"; textColor = "white"; }
                      else { bgColor = "rgba(255,255,255,0.3)"; textColor = "#999"; }
                  }
                  return (
                      <button 
                        key={opt.id} onClick={() => handleOptionClick(opt)} disabled={selectedOption !== null}
                        style={{
                            padding: "15px 10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.5)",
                            background: bgColor, color: textColor, fontSize: "14px", fontWeight: "600",
                            cursor: selectedOption ? "default" : "pointer", transition: "all 0.2s", boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                        }}
                      >
                          {opt.name}
                      </button>
                  )
              })}
          </div>
       </div>
    </div>
  )
}

// --- KOMPONENT 1: MAPA Z CZATEM ---
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

  useEffect(() => {
    const loadVoices = () => {
      let availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) setVoices(availableVoices);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = loadVoices;
    setTimeout(loadVoices, 500);
  }, []);

  const handleSelectMonument = (id) => {
    if (id === monumentId) return;
    setMonumentId(id);
    setChatHistory([]);
    window.speechSynthesis.cancel();
  };

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
        utterance.pitch = 0.6; 
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

// --- KOMPONENT 2: MENU GŁÓWNE (ODCHUDZONE 2x3) ---
function MainMenu({ onStart }) {
  const cards = [
    { id: 'map', title: 'BydgoBOT', icon: '🏛️', desc: 'Rozmawiaj z zabytkami.', color: 'linear-gradient(135deg, #2563EB, #a18cd1)' },
    { id: 'quiz', title: 'Quiz Wiedzy', icon: '❓', desc: 'Co to za miejsce?', color: 'linear-gradient(135deg, #ff9966, #ff5e62)' },
    { id: 'gallery', title: 'Galeria', icon: '📸', desc: 'Zdjęcia miasta (wkrótce).', color: 'linear-gradient(135deg, #56ab2f, #a8e063)', disabled: true },
    { id: 'game', title: 'Gra Miejska', icon: '🗺️', desc: 'Szukaj skarbów (wkrótce).', color: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', disabled: true },
    { id: 'events', title: 'Wydarzenia', icon: '📅', desc: 'Co się dzieje? (wkrótce).', color: 'linear-gradient(135deg, #F2994A, #F2C94C)', disabled: true },
    { id: 'food', title: 'Gdzie zjeść?', icon: '🍔', desc: 'Kuchnia regionu (wkrótce).', color: 'linear-gradient(135deg, #DA4453, #89216B)', disabled: true }
  ];

  return (
    <div style={{ 
      width: "100%", maxWidth: "850px", maxHeight: "90vh", // Ograniczenie wysokości
      padding: "20px 30px", // Mniejsze paddingi
      background: "rgba(255, 255, 255, 0.55)", backdropFilter: "blur(20px)",            
      border: "1px solid rgba(255, 255, 255, 0.8)", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
      borderRadius: "30px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center",
      overflowY: "auto" // W razie gdyby ekran był super mały
    }}>
      {/* HEADER (Mniejszy) */}
      <div style={{ fontSize: "40px", marginBottom: "5px" }}>🌊</div>
      <h1 style={{ 
        fontSize: "32px", margin: "0 0 5px 0", 
        background: "linear-gradient(45deg, #2563EB, #a18cd1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" 
      }}>
        Wirtualna Bydgoszcz
      </h1>
      <p style={{ color: "#555", fontSize: "15px", maxWidth: "600px", marginBottom: "25px" }}>
        Odkryj miasto z AI. Wybierz aktywność:
      </p>

      {/* KAFELKI (Grid) */}
      <div style={{ 
        display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center",
        maxWidth: "700px" // Trzyma kafelki w ryzach
      }}>
        {cards.map(card => (
          <div key={card.id} 
            onClick={() => !card.disabled && onStart(card.id)}
            style={{
              width: "200px", padding: "15px", // Mniejsze wymiary
              borderRadius: "15px",
              background: "rgba(255,255,255,0.6)", border: "1px solid white",
              cursor: card.disabled ? "not-allowed" : "pointer",
              transition: "transform 0.3s, box-shadow 0.3s",
              opacity: card.disabled ? 0.6 : 1,
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              display: "flex", flexDirection: "column", alignItems: "center"
            }}
            onMouseEnter={(e) => !card.disabled && (e.currentTarget.style.transform = "translateY(-4px)")}
            onMouseLeave={(e) => !card.disabled && (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{card.icon}</div>
            <h3 style={{ margin: "0 0 5px 0", color: "#333", fontSize: "18px" }}>{card.title}</h3>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px", minHeight: "30px", lineHeight: "1.2" }}>{card.desc}</p>
            <button style={{
              padding: "6px 20px", borderRadius: "15px", border: "none", color: "white", 
              fontWeight: "bold", fontSize: "13px",
              background: card.disabled ? "#ccc" : card.color, cursor: card.disabled ? "not-allowed" : "pointer"
            }}>
              {card.disabled ? "Wkrótce" : "Start"}
            </button>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: "20px", fontSize: "11px", color: "#888", opacity: 0.8 }}>
        © 2025 BydgoBOT Team
      </div>
    </div>
  );
}

// --- GŁÓWNY KOMPONENT APP ---
function App() {
  const [currentView, setCurrentView] = useState('menu');

  return (
    <>
      <div className="background-blob blob-1"></div>
      <div className="background-blob blob-2"></div>
      <div className="background-blob blob-3"></div>

      {currentView === 'menu' && <MainMenu onStart={setCurrentView} />}
      {currentView === 'map' && <BydgoMap onBack={() => setCurrentView('menu')} />}
      {currentView === 'quiz' && <QuizView onBack={() => setCurrentView('menu')} />}
    </>
  )
}

export default App