import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './App.css'

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

// Ikony do gry (SVG - niezawodne)
const gameUserIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const gameCorrectIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #22c55e; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

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

// --- LOKALIZACJE GRY ---
const GAME_LOCATIONS = [
    { id: 1, name: "Stary Rynek", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.121884!2d18.001646!3f220!4f0!5f0.7820865974627469", lat: 53.121884, lng: 18.001646 },
    { id: 2, name: "Wyspa Młyńska", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcFBFOXlmUjZ4X0xZLV9EQWc!2m2!1d53.1238!2d17.9966!3f100!4f0!5f0.7820865974627469", lat: 53.1238, lng: 17.9966 },
    { id: 3, name: "Opera Nova", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.1227!2d18.0006!3f50!4f0!5f0.7820865974627469", lat: 53.1227, lng: 18.0006 },
    { id: 4, name: "Bazylika", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.1260!2d18.0120!3f180!4f0!5f0.7820865974627469", lat: 53.1260, lng: 18.0120 },
    { id: 5, name: "Wieża Ciśnień", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.1206!2d17.9912!3f0!4f0!5f0.7820865974627469", lat: 53.1206, lng: 17.9912 }
];

const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

// =========================================================================
// KOMPONENT 0: INTRO / TRAILER
// =========================================================================
function IntroView({ onFinish }) {
  return (
    <div className="intro-container" style={{backgroundImage: "url('/images/rynek.jpg')"}}>
       <div className="intro-overlay">
          <h1 className="intro-title">Bydgoszcz</h1>
          <p className="intro-subtitle">Miasto, które opowiada historie</p>
          <button className="btn-start-adventure" onClick={onFinish}>ROZPOCZNIJ PRZYGODĘ</button>
       </div>
    </div>
  )
}

// =========================================================================
// POZOSTAŁE KOMPONENTY
// =========================================================================

function CityGame({ onBack }) {
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [gameState, setGameState] = useState('GUESSING');
    const [userGuess, setUserGuess] = useState(null);
    const [roundScore, setRoundScore] = useState(0);
    const [distance, setDistance] = useState(0);
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const userMarkerRef = useRef(null);
    const correctMarkerRef = useRef(null);
    const lineRef = useRef(null);

    useEffect(() => {
        if (gameState !== 'GUESSING') return;
        if (timeLeft <= 0) { handleGuess(); return; }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, gameState]);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([53.123, 18.000], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap' }).addTo(map);
            map.on('click', (e) => { setUserGuess(e.latlng); });
            mapInstanceRef.current = map;
        }
        return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;
        if (gameState === 'GUESSING' && userGuess) {
            if (userMarkerRef.current) userMarkerRef.current.setLatLng(userGuess);
            else userMarkerRef.current = L.marker(userGuess, {icon: gameUserIcon}).addTo(map);
        }
    }, [userGuess, gameState]);

    useEffect(() => {
        if (gameState === 'RESULT') {
            const map = mapInstanceRef.current;
            if (!map) return;
            const target = GAME_LOCATIONS[round];
            const targetLatLng = [target.lat, target.lng];
            if (correctMarkerRef.current) map.removeLayer(correctMarkerRef.current);
            correctMarkerRef.current = L.marker(targetLatLng, {icon: gameCorrectIcon}).addTo(map).bindPopup(target.name).openPopup();
            if (userGuess) {
                if (lineRef.current) map.removeLayer(lineRef.current);
                lineRef.current = L.polyline([userGuess, targetLatLng], {color: 'red', weight: 4, dashArray: '10, 10'}).addTo(map);
                try { map.flyToBounds(L.latLngBounds(userGuess, targetLatLng).pad(0.2), { duration: 1.0 }); } catch(e) {}
            } else { map.flyTo(targetLatLng, 15); }
            setTimeout(() => map.invalidateSize(), 300);
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'GUESSING' && mapInstanceRef.current) {
            const map = mapInstanceRef.current;
            if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
            if (correctMarkerRef.current) map.removeLayer(correctMarkerRef.current);
            if (lineRef.current) map.removeLayer(lineRef.current);
            userMarkerRef.current = null; correctMarkerRef.current = null; lineRef.current = null; setUserGuess(null);
            map.setView([53.123, 18.000], 13); map.invalidateSize();
        }
    }, [round, gameState]);

    const handleGuess = () => {
        if (gameState !== 'GUESSING') return;
        let points = 0, dist = 0;
        const target = GAME_LOCATIONS[round];
        if (userGuess) {
            dist = mapInstanceRef.current.distance(userGuess, [target.lat, target.lng]);
            points = Math.round(5000 * Math.exp(-dist / 2000));
            if (dist < 50) points = 5000;
            if (dist > 10000) points = 0;
        }
        setRoundScore(points); setDistance(dist); setScore(s => s + points); setGameState('RESULT');
    };

    const nextRound = () => {
        if (round + 1 >= GAME_LOCATIONS.length) setGameState('FINISHED');
        else { setRound(r => r + 1); setTimeLeft(60); setGameState('GUESSING'); }
    };

    if (gameState === 'FINISHED') {
        return (
            <div className="game-modal-overlay">
                <div style={{fontSize: "80px"}}>🏆</div>
                <h1 style={{color: "#333", margin: "10px"}}>KONIEC GRY</h1>
                <div className="game-stat" style={{fontSize: "24px", color: "#555"}}>Twój wynik: <b style={{color: "#2563EB", fontSize: "32px"}}>{score}</b> pkt</div>
                <div style={{marginTop: "30px", display: "flex", gap: "10px"}}>
                     <button onClick={() => window.location.reload()} style={{padding: "12px 24px", borderRadius: "30px", border: "none", background: "#2563EB", color: "white", fontWeight: "bold", cursor: "pointer"}}>Jeszcze raz</button>
                     <button onClick={onBack} style={{padding: "12px 24px", borderRadius: "30px", border: "2px solid #2563EB", background: "white", color: "#2563EB", fontWeight: "bold", cursor: "pointer"}}>Wróć do menu</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: "100%", maxWidth: "1100px", height: "85vh", background: "white", borderRadius: "30px", overflow: "hidden", position: "relative", boxShadow: "0 20px 50px rgba(0,0,0,0.15)" }}>
            <button onClick={onBack} style={{position: "absolute", top: "70px", left: "20px", zIndex: 1900, background: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", fontSize: "20px"}}>🏠</button>
            <div className="game-top-bar">
                <div className="game-stat">Runda: {round + 1} / {GAME_LOCATIONS.length}</div>
                <div className={`game-stat ${timeLeft < 10 ? 'timer-warning' : ''}`}>Czas: {timeLeft}s</div>
                <div className="game-stat" style={{color: '#d97706'}}>Wynik: {score}</div>
            </div>
            <div className="street-view-wrapper">
                 <iframe src={GAME_LOCATIONS[round].embedUrl} width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" key={round} ></iframe>
            </div>
            <div className={`guess-map-wrapper ${gameState === 'RESULT' ? 'result-mode' : ''}`}>
                <div ref={mapContainerRef} style={{width: '100%', height: '100%', borderRadius: '8px', cursor: 'crosshair'}}></div>
                {gameState === 'GUESSING' ? (
                    <button className="btn-action btn-guess" style={{ opacity: userGuess ? 1 : 0.5, pointerEvents: userGuess ? 'auto' : 'none' }} onClick={handleGuess}>
                        {userGuess ? 'POTWIERDŹ' : 'ZAZNACZ'}
                    </button>
                ) : (
                    <div style={{position: 'absolute', bottom: '15px', width: '100%', textAlign: 'center', zIndex: 2000}}>
                        <div style={{background: 'rgba(0,0,0,0.8)', padding: '10px', marginBottom: '10px', borderRadius: '8px', color: "white"}}>
                            <div>Odległość: <b>{Math.round(distance)} m</b></div>
                            <div style={{color: '#fbbf24', fontWeight: "bold"}}>+ {roundScore} pkt</div>
                        </div>
                        <button className="btn-action btn-next" onClick={nextRound} style={{ position: 'relative', width: '100%', left: '0', transform: 'none',display: 'flex',             /* Wymusza Flexbox */justifyContent: 'center',    /* Centruje w poziomie */alignItems: 'center'         /* Centruje w pionie */}}
>DALEJ
</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// =========================================================================
// WIDOK 2: RESTAURACJE (FoodView) - Stylizowany na "image_29acf1.png"
// =========================================================================
function FoodView({ onBack }) {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaces = async () => {
            setLoading(true);
            try {
                // Zapytanie Overpass API
                const query = `
                    [out:json][timeout:25];
                    (
                      node["amenity"="restaurant"](53.115,17.980,53.135,18.020);
                      node["amenity"="cafe"](53.115,17.980,53.135,18.020);
                      node["amenity"="fast_food"](53.115,17.980,53.135,18.020);
                      node["amenity"="bar"](53.115,17.980,53.135,18.020);
                    );
                    out body;
                `;
                
                const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
                const response = await fetch(url);
                const data = await response.json();

                const mappedPlaces = data.elements
                    .filter(el => el.tags && el.tags.name)
                    .map(el => {
                        let type = "Restauracja";
                        let icon = "🍽️";
                        // Kolory tła dla ikon (pastelowe, jak na screenie)
                        let iconBg = "#fcd34d"; // domyślny żółty

                        if (el.tags.amenity === "cafe") { 
                            type = "Kawiarnia"; 
                            icon = "☕"; 
                            iconBg = "#fde68a"; // jaśniejszy żółty
                        } else if (el.tags.amenity === "fast_food") { 
                            type = "Fast Food"; 
                            icon = "🍔"; 
                            iconBg = "#fca5a5"; // czerwony
                        } else if (el.tags.amenity === "bar") { 
                            type = "Bar / Pub"; 
                            icon = "🍺"; 
                            iconBg = "#d8b4fe"; // fiolet
                        }
                        
                        if (el.tags.cuisine) {
                            if (el.tags.cuisine.includes("pizza")) { 
                                type = "Pizzeria"; 
                                icon = "🍕"; 
                                iconBg = "#fda4af"; // różowy
                            }
                            if (el.tags.cuisine.includes("asian") || el.tags.cuisine.includes("chinese") || el.tags.cuisine.includes("sushi")) { 
                                type = "Azjatycka"; 
                                icon = "🥢"; 
                                iconBg = "#fdba74"; // pomarańczowy
                            }
                        }

                        // Generowanie losowej oceny (4.0 - 5.0) i liczby opinii
                        const randomRating = (Math.random() * (5.0 - 3.8) + 3.8).toFixed(1);
                        const randomReviews = Math.floor(Math.random() * 800) + 50;

                        return {
                            id: el.id,
                            name: el.tags.name,
                            type: type,
                            address: el.tags["addr:street"] 
                                ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ""}` 
                                : "Centrum Bydgoszczy",
                            icon: icon,
                            iconBg: iconBg,
                            rating: randomRating,
                            reviews: randomReviews,
                            lat: el.lat,
                            lng: el.lon
                        };
                    });

                setPlaces(mappedPlaces.sort(() => 0.5 - Math.random()).slice(0, 50));
            } catch (error) {
                console.error("Błąd pobierania:", error);
            }
            setLoading(false);
        };

        fetchPlaces();
    }, []);

    const handleNavigate = (lat, lng) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    return (
        <div style={{ 
            width: "100%", maxWidth: "1000px", height: "85vh", 
            background: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(20px)",            
            borderRadius: "30px", display: "flex", flexDirection: "column", overflow: "hidden", 
            position: "relative", border: "1px solid rgba(255,255,255,0.6)"
        }}>
           {/* Nagłówek */}
           <div style={{ padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.3)" }}>
              <button onClick={onBack} style={{ background: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", fontSize: "20px", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>🏠</button>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#333" }}>Gdzie zjeść? 🍔</div>
              <div style={{ width: "40px" }}></div> {/* Placeholder do wyśrodkowania */}
           </div>

           {/* Lista kart */}
           <div style={{ flex: 1, overflowY: "auto", padding: "30px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", alignContent: "start" }}>
                {loading && <div style={{ textAlign: "center", width: "100%", padding: "40px", color: "#666", gridColumn: "1 / -1" }}>⏳ Szukam najlepszych miejsc...</div>}

                {!loading && places.map(place => (
                    <div key={place.id} style={{
                        background: "white", 
                        borderRadius: "20px", 
                        padding: "20px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)", 
                        border: "1px solid rgba(0,0,0,0.02)",
                        display: "flex", flexDirection: "column", gap: "12px", 
                        transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.05)"; }}
                    >
                        {/* Górna sekcja: Ikona + Tekst */}
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            {/* Ikona w kolorowym kwadracie */}
                            <div style={{ 
                                width: "60px", height: "60px", borderRadius: "18px", 
                                background: place.iconBg, display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "28px", boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)", flexShrink: 0
                            }}>
                                {place.icon}
                            </div>
                            
                            {/* Nazwa i typ */}
                            <div style={{ overflow: "hidden" }}>
                                <h3 style={{ margin: "0 0 4px 0", fontSize: "17px", fontWeight: "800", color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={place.name}>
                                    {place.name}
                                </h3>
                                <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>{place.type}</div>
                            </div>
                        </div>

                        {/* Ocena */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", color: "#fbbf24" }}>
                            ⭐ {place.rating} 
                            <span style={{ color: "#9ca3af", fontWeight: "400", fontSize: "13px" }}>({place.reviews})</span>
                        </div>
                        
                        {/* Adres */}
                        <div style={{ fontSize: "13px", color: "#4b5563", display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                            <span style={{color: "#ef4444"}}>📍</span> {place.address}
                        </div>

                        {/* Przycisk Trasa */}
                        <button 
                            onClick={() => handleNavigate(place.lat, place.lng)}
                            style={{
                                marginTop: "auto", padding: "12px", borderRadius: "12px", border: "none",
                                background: "linear-gradient(90deg, #65a30d, #84cc16)", // Soczysta zieleń jak na screenie
                                color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                boxShadow: "0 4px 12px rgba(101, 163, 13, 0.3)",
                                transition: "filter 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                            onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                        >
                            <span>🗺️</span> Trasa
                        </button>
                    </div>
                ))}
           </div>
        </div>
    );
}

function QuizView({ onBack }) {
  const [q, setQ] = useState([]); const [idx, setIdx] = useState(0); const [s, setS] = useState(0); const [fin, setFin] = useState(false); const [sel, setSel] = useState(null); const [ok, setOk] = useState(null);
  useEffect(() => {
    const shuf = shuffleArray(monumentsData);
    setQ(shuf.slice(0, 5).map(c => ({ target: c, options: shuffleArray([c, ...shuffleArray(monumentsData.filter(m => m.id !== c.id)).slice(0, 3)]) })));
  }, []);
  const click = (opt) => { if (sel) return; setSel(opt); const isOk = opt.id === q[idx].target.id; setOk(isOk); if(isOk) setS(s+1); setTimeout(() => { if(idx+1<q.length) { setIdx(idx+1); setSel(null); setOk(null); } else setFin(true); }, 1500); };
  if(q.length===0) return <div>...</div>;
  if(fin) return <div style={{width:"100%",maxWidth:"600px",padding:"40px",background:"rgba(255,255,255,0.7)",borderRadius:"30px",textAlign:"center"}}><h2>Koniec!</h2><div style={{fontSize:"48px",color:"#2563EB"}}>{s}/{q.length}</div><button onClick={onBack} style={{marginTop:"20px",padding:"10px 20px",background:"#2563EB",color:"white",border:"none",borderRadius:"20px",cursor:"pointer"}}>Menu</button></div>;
  const curr = q[idx];
  return (
    <div style={{width:"100%",maxWidth:"900px",height:"85vh",background:"rgba(255,255,255,0.6)",borderRadius:"30px",display:"flex",flexDirection:"column"}}>
       <div style={{padding:"15px",borderBottom:"1px solid rgba(0,0,0,0.1)",display:"flex",justifyContent:"space-between"}}><button onClick={onBack} style={{border:"none",background:"none",fontSize:"20px",cursor:"pointer"}}>🏠</button><b>Pytanie {idx+1}/{q.length}</b></div>
       <div style={{padding:"20px",flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
          <h3>Co to za miejsce?</h3><img src={curr.target.img} style={{width:"100%",maxHeight:"250px",objectFit:"cover",borderRadius:"15px",marginBottom:"20px"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",width:"100%"}}>
              {curr.options.map(o=><button key={o.id} onClick={()=>click(o)} disabled={sel!==null} style={{padding:"15px",borderRadius:"10px",border:"none",cursor:"pointer",background:sel && o.id===curr.target.id?"#22c55e":sel&&o.id===sel.id&&!ok?"#ef4444":"white",color:sel&&(o.id===curr.target.id||o.id===sel.id)?"white":"black"}}>{o.name}</button>)}
          </div>
       </div>
    </div>
  )
}

function BydgoMap({ onBack }) {
  const [mid, setMid] = useState(null); const [msg, setMsg] = useState(""); const [hist, setHist] = useState([]); const [load, setLoad] = useState(false); const [read, setRead] = useState(false); const [v, setV] = useState([]);
  const curr = monumentsData.find(m => m.id === mid);
  function Fly({ pos }) { const map = useMap(); useEffect(() => { if (pos) map.flyTo(pos, 16, { duration: 1.5 }); }, [pos, map]); return null; }
  useEffect(() => { const l = () => { let vs = window.speechSynthesis.getVoices(); if (vs.length > 0) setV(vs); }; l(); if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = l; setTimeout(l, 500); }, []);
  const speak = (txt, gen='male') => { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang='pl-PL'; const pl = v.filter(x=>x.lang.includes('pl')); let sv = gen==='female'?pl.find(x=>x.name.includes('Zosia')):pl.find(x=>x.name.includes('Jakub')); if(sv) u.voice=sv; window.speechSynthesis.speak(u); };
  const send = async () => { if (!msg || !curr) return; const t = msg; setMsg(""); setHist(p => [...p, { sender: "Ty", text: t }]); setLoad(true); try { const r = await fetch('http://localhost:3000/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ monumentId: mid, message: t }) }); const d = await r.json(); setHist(p => [...p, { sender: curr.name, text: d.reply }]); if (read) speak(d.reply, curr.gender); } catch (e) {} setLoad(false); };
  return (
    <div style={{width:"100%",maxWidth:"1100px",height:"85vh",background:"rgba(255,255,255,0.6)",borderRadius:"30px",overflow:"hidden",display:"flex",flexDirection:"row",position:"relative"}}>
      <button onClick={onBack} style={{position:"absolute",top:"20px",left:"20px",zIndex:1000,background:"white",border:"none",borderRadius:"50%",width:"40px",height:"40px",cursor:"pointer",fontSize:"20px"}}>🏠</button>
      <div style={{flex:"1.2",position:"relative"}}><MapContainer center={[53.123, 18.004]} zoom={14} style={{height:"100%",width:"100%"}} zoomControl={false}><TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{monumentsData.map(m=><Marker key={m.id} position={m.position} eventHandlers={{click:()=>{if(m.id!==mid){setMid(m.id);setHist([]);window.speechSynthesis.cancel();}}}}><Tooltip direction="top" offset={[0,-20]} opacity={1}><div style={{textAlign:"center"}}><strong>{m.name}</strong></div></Tooltip></Marker>)}{curr && <Fly pos={curr.position} />}</MapContainer></div>
      <div style={{flex:"1",display:"flex",flexDirection:"column",background:"rgba(255,255,255,0.3)"}}>{!curr ? <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#666"}}><h2>Wybierz miejsce</h2><p>Kliknij pinezkę na mapie</p></div> : <><div style={{height:"35%",width:"100%",backgroundImage:`url(${curr.img})`,backgroundSize:"cover",position:"relative"}}><button onClick={()=>setRead(!read)} style={{position:"absolute",top:"10px",right:"10px",background:"rgba(0,0,0,0.5)",color:"white",border:"none",padding:"5px 10px",borderRadius:"20px",cursor:"pointer"}}>{read?"🔊 WŁ":"🔇 WYŁ"}</button><div style={{position:"absolute",bottom:"10px",left:"10px",color:"white",textShadow:"0 2px 4px rgba(0,0,0,0.8)"}}><h2 style={{margin:0}}>{curr.name}</h2></div></div><div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"10px"}}>{hist.map((m,i)=><div key={i} style={{alignSelf:m.sender==="Ty"?"flex-end":"flex-start",background:m.sender==="Ty"?"#2563EB":"white",color:m.sender==="Ty"?"white":"black",padding:"10px",borderRadius:"10px",maxWidth:"80%"}}>{m.text}{m.sender!=="Ty"&&!read&&<button onClick={()=>speak(m.text,curr.gender)} style={{marginLeft:"10px",background:"none",border:"none",cursor:"pointer"}}>🔊</button>}</div>)}{load&&<div style={{fontSize:"12px"}}>Pisze...</div>}</div><div style={{padding:"10px",display:"flex",gap:"5px"}}><input type="text" value={msg} onChange={e=>setMsg(e.target.value)} onKeyPress={e=>e.key==='Enter'&&send()} style={{flex:1,padding:"10px",borderRadius:"20px",border:"1px solid #ccc"}} placeholder="Napisz..." /><button onClick={send} style={{padding:"10px",borderRadius:"50%",background:"#2563EB",color:"white",border:"none",cursor:"pointer"}}>➤</button></div></>}</div>
    </div>
  );
}

function MainMenu({ onStart }) {
  const cards = [
    { id: 'map', title: 'BydgoBOT', icon: '🏛️', desc: 'Rozmawiaj z zabytkami.', color: 'linear-gradient(135deg, #2563EB, #a18cd1)' },
    { id: 'quiz', title: 'Quiz Wiedzy', icon: '❓', desc: 'Co to za miejsce?', color: 'linear-gradient(135deg, #ff9966, #ff5e62)' },
    { id: 'game', title: 'Gra Miejska', icon: '🗺️', desc: 'Zgadnij gdzie jesteś!', color: 'linear-gradient(135deg, #8E2DE2, #4A00E0)' },
    { id: 'food', title: 'Gdzie zjeść?', icon: '🍔', desc: 'Gastronomia w okolicy.', color: 'linear-gradient(135deg, #DA4453, #89216B)' },
    { id: 'events', title: 'Wydarzenia', icon: '📅', desc: 'Co się dzieje? (wkrótce).', color: 'linear-gradient(135deg, #F2994A, #F2C94C)', disabled: true },
    { id: 'gallery', title: 'Galeria', icon: '📸', desc: 'Zdjęcia miasta (wkrótce).', color: 'linear-gradient(135deg, #56ab2f, #a8e063)', disabled: true },
  ];
  return (
    <div 
        className="menu-container" 
        style={{ width: "100%", maxWidth: "850px", maxHeight: "90vh", padding: "20px 30px", paddingRight: "15px", background: "rgba(255,255,255,0.6)", borderRadius: "30px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto" }}
    >
      <div style={{fontSize:"40px",marginBottom:"5px"}}>🌊</div>
      <h1 style={{fontSize:"32px",margin:"0 0 5px 0",background:"linear-gradient(45deg, #2563EB, #a18cd1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Wirtualna Bydgoszcz</h1>
      <p style={{color:"#555",fontSize:"15px",maxWidth:"600px",marginBottom:"25px"}}>Odkryj miasto z AI. Wybierz aktywność:</p>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center", maxWidth:"700px" }}>
        {cards.map(c => <div key={c.id} onClick={() => !c.disabled && onStart(c.id)} style={{ width: "200px", padding: "15px", borderRadius: "15px", background: "white", cursor: c.disabled?"not-allowed":"pointer", opacity:c.disabled?0.6:1, transition:"transform 0.2s", display:"flex", flexDirection:"column", alignItems:"center", boxShadow:"0 4px 10px rgba(0,0,0,0.05)" }} onMouseEnter={e=>!c.disabled&&(e.currentTarget.style.transform="translateY(-4px)")} onMouseLeave={e=>!c.disabled&&(e.currentTarget.style.transform="translateY(0)")}><div style={{fontSize:"32px",marginBottom:"8px"}}>{c.icon}</div><h3 style={{margin:"0 0 5px 0",color:"#333",fontSize:"18px"}}>{c.title}</h3><p style={{fontSize:"12px",color:"#666",marginBottom:"12px",minHeight:"30px",lineHeight:"1.2"}}>{c.desc}</p><button style={{padding:"6px 20px",borderRadius:"15px",border:"none",color:"white",fontWeight:"bold",fontSize:"13px",background:c.disabled?"#ccc":c.color,cursor:c.disabled?"not-allowed":"pointer"}}>{c.disabled?"Wkrótce":"Start"}</button></div>)}
      </div>
      <div style={{marginTop:"20px",fontSize:"11px",color:"#888",opacity:0.8}}>© 2025 BydgoBOT Team</div>
    </div>
  );
}

// --- GŁÓWNY KOMPONENT APP ---
function App() {
  const [currentView, setCurrentView] = useState('intro');

  return (
    <>
      <div className="background-blob blob-1"></div>
      <div className="background-blob blob-2"></div>
      <div className="background-blob blob-3"></div>

      {currentView === 'intro' && <IntroView onFinish={() => setCurrentView('menu')} />}
      {currentView === 'menu' && <MainMenu onStart={setCurrentView} />}
      {currentView === 'map' && <BydgoMap onBack={() => setCurrentView('menu')} />}
      {currentView === 'quiz' && <QuizView onBack={() => setCurrentView('menu')} />}
      {currentView === 'food' && <FoodView onBack={() => setCurrentView('menu')} />}
      {currentView === 'game' && <CityGame onBack={() => setCurrentView('menu')} />}
    </>
  )
}

export default App