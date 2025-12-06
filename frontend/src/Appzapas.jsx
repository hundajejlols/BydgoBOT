// PLIK: frontend/src/App.jsx
import { useState } from 'react'

function App() {
  const [monument, setMonument] = useState("rejewski"); // Domyślny pomnik
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

const sendMessage = async () => {
    // 1. Jeśli puste, nie wysyłaj
    if (!message) return;

    // 2. ZAPISZ tekst do "pudełka" (zmiennej pomocniczej)
    const textToSend = message; 

    // 3. WYCZYŚĆ pole natychmiast! (Nie czekamy na serwer)
    setMessage(""); 

    // 4. Pokaż wiadomość na ekranie (używamy textToSend)
    const userMsg = { sender: "Ty", text: textToSend };
    setChatHistory((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // 5. Wyślij do serwera (WAŻNE: wysyłamy textToSend, bo message jest już puste!)
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            monumentId: monument, 
            message: textToSend // <--- Tu zmiana
        })
      });

      const data = await response.json();
      
      // Słownik imion
      const names = {
        "rejewski": "Marian Rejewski",
        "luczniczka": "Łuczniczka",
        "Arek": "Arek"
      };
      const botName = names[monument] || "Bot";
      const botMsg = { sender: botName, text: data.reply };
      
      setChatHistory((prev) => [...prev, botMsg]);

    } catch (error) {
      alert("Błąd połączenia z serwerem!");
    }

    setLoading(false);
  };

  return (
    <div style={{ 
      width: "100%",
      maxWidth: "450px",       /* Szerokość typowego smartfona */
      height: "85vh",          /* Wysokość: 85% ekranu */
      background: "white",     /* Białe tło karty */
      borderRadius: "25px",    /* Zaokrąglone rogi */
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)", /* Efekt 3D (cień) */
      padding: "20px",
      fontFamily: "sans-serif",
      display: "flex",
      flexDirection: "column",  /* Układ pionowy */
      overflow: "hidden"        /* Żeby nic nie wystawało */
    }}>
      <h1>🏛️ Bydgoszcz Chat</h1>
      
      {/* Wybór pomnika */}
      {/* Wybór pomnika - ZMODYFIKOWANY */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>Rozmawiasz z: </label>
        
        <select 
          value={monument} 
          onChange={(e) => {
            setMonument(e.target.value); // 1. Zmień postać
            setChatHistory([]);          // 2. Wyczyść historię (TO JEST NOWOŚĆ)
          }} 
          style={{ 
            padding: "10px", 
            width: "100%", 
            borderRadius: "10px", 
            border: "1px solid #ddd",
            backgroundColor: "#f0f0f0"
          }}
        >
          <option value="rejewski">Marian Rejewski</option>
          <option value="luczniczka">Łuczniczka</option>
          <option value="Arek">Arek</option>
        </select>
      </div>
      {/* Okno czatu */}
      <div style={{ border: "1px solid #ccc", height: "400px", overflowY: "scroll", padding: "10px", borderRadius: "10px", background: "#f9f9f9" }}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "Ty" ? "right" : "left", margin: "10px 0" }}>
            <span style={{ 
              background: msg.sender === "Ty" ? "#007bff" : "#e0e0e0", 
              color: msg.sender === "Ty" ? "white" : "black",
              padding: "8px 15px", 
              borderRadius: "15px",
              display: "inline-block"
            }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </span>
          </div>
        ))}
        {loading && <p>Thinking...</p>}
      </div>

      {/* Pole wpisywania */}
      <div style={{ marginTop: "20px", display: "flex" }}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Zapytaj o historię..." 
          style={{ flex: 1, padding: "10px" }}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} style={{ padding: "10px 20px", background: "green", color: "white", border: "none", cursor: "pointer" }}>
          Wyślij
        </button>
      </div>
    </div>
  )
}

export default App