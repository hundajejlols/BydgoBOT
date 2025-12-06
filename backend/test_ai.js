// PLIK: backend/sprawdz_modele.js
require('dotenv').config();

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log("🔍 Pytam Google o dostępne modele...");

async function check() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ Błąd klucza:", data.error.message);
        } else {
            console.log("✅ SUKCES! Twój klucz widzi te modele:");
            console.log("------------------------------------------------");
            // Filtrujemy tylko te, które generują tekst (generateContent)
            const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
            
            chatModels.forEach(m => {
                // Wypisujemy czystą nazwę do skopiowania
                console.log(`👉 ${m.name.replace("models/", "")}`);
            });
            console.log("------------------------------------------------");
            console.log("SKOPIUJ JEDNĄ Z POWYŻSZYCH NAZW DO PLIKU SERVER.JS!");
        }
    } catch (e) {
        console.error("Błąd połączenia:", e);
    }
}

check();