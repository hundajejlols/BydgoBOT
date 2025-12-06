import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap, Tooltip, Polyline } from 'react-leaflet'
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

// Ikony do gry
const gameUserIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const gameCorrectIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// --- DANE ZABYTKÓW (Czat, Quiz) ---
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

// --- LOKALIZACJE DO GRY MIEJSKIEJ ---
const GAME_LOCATIONS = [
    {
        id: 1,
        name: "Stary Rynek",
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.121884!2d18.001646!3f220!4f0!5f0.7820865974627469", 
        lat: 53.121884, 
        lng: 18.001646
    },
    {
        id: 2,
        name: "Wyspa Młyńska",
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcFBFOXlmUjZ4X0xZLV9EQWc!2m2!1d53.1238!2d17.9966!3f100!4f0!5f0.7820865974627469", 
        lat: 53.1238,
        lng: 17.9966
    },
    {
        id: 3,
        name: "Opera Nova",
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.1227!2d18.0006!3f50!4f0!5f0.7820865974627469", 
        lat: 53.1227,
        lng: 18.0006
    },
    {
        id: 4,
        name: "Bazylika (Al. Ossolińskich)",
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.1260!2d18.0120!3f180!4f0!5f0.7820865974627469", 
        lat: 53.1260,
        lng: 18.0120
    },
    {
        id: 5,
        name: "Wieża Ciśnień",
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.1206!2d17.9912!3f0!4f0!5f0.7820865974627469", 
        lat: 53.1206,
        lng: 17.9912
    }
];

const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

// =========================================================================
// WIDOK: GALERIA ZDJĘĆ (JASNY MOTYW GLASSMORPHISM)
// =========================================================================
function GalleryView({ onBack }) {
    // 30 zdjęć w folderze /public/images/gallery/
    const totalImages = 30;
    const imagesList = Array.from({ length: totalImages }, (_, i) => i + 1);
    
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
    }, [totalImages]);

    const prevImage = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    }, [totalImages]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') onBack();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextImage, prevImage, onBack]);

    const currentImageNum = imagesList[currentIndex];
    const imagePath = `/images/gallery/${currentImageNum}.jpg`;

    // ZMIANA: Style przycisków pasujące do jasnego tła
    const navButtonStyle = {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        background: "rgba(255, 255, 255, 0.8)", // Jasne tło
        color: "#2563EB", // Niebieska strzałka (kolor przewodni)
        border: "1px solid rgba(37, 99, 235, 0.2)",
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        fontSize: "24px",
        fontWeight: "bold",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(5px)",
        transition: "all 0.3s",
        zIndex: 10,
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
    };

    return (
        <div style={{ 
            width: "100%", maxWidth: "1100px", height: "85vh", 
            // ZMIANA: Tło spójne z resztą aplikacji (jasne szkło)
            background: "rgba(255, 255, 255, 0.55)", 
            backdropFilter: "blur(20px)",            
            border: "1px solid rgba(255, 255, 255, 0.8)", 
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            borderRadius: "30px", 
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden"
        }}>
            {/* Przycisk powrotu */}
            <button 
                onClick={onBack} 
                style={{ 
                    position: "absolute", top: "20px", left: "20px", zIndex: 20,
                    border: "none", background: "white", borderRadius: "50%", 
                    width: "40px", height: "40px", fontSize: "20px", cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                }}
            >
                🏠
            </button>
            
            {/* Licznik zdjęć */}
            <div style={{ 
                position: "absolute", top: "20px", right: "20px", zIndex: 20,
                color: "#333", background: "rgba(255,255,255,0.8)", 
                padding: "8px 15px", borderRadius: "20px", fontWeight: "bold",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
            }}>
                Zdjęcie {currentIndex + 1} / {totalImages}
            </div>

            {/* Przycisk Poprzedni */}
            <button 
                onClick={prevImage} 
                style={{ ...navButtonStyle, left: "20px" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; e.currentTarget.style.background = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)"; }}
            >
                ❮
            </button>

            {/* Główne zdjęcie */}
            <div style={{ width: "100%", height: "100%", padding: "60px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img 
                    src={imagePath} 
                    alt={`Galeria ${currentImageNum}`} 
                    style={{ 
                        maxWidth: "100%", 
                        maxHeight: "100%", 
                        objectFit: "contain", 
                        borderRadius: "20px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
                    }} 
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src="https://via.placeholder.com/800x600?text=Brak+zdjęcia"
                        e.target.alt="Brak zdjęcia"
                    }}
                />
            </div>

            {/* Przycisk Następny */}
            <button 
                onClick={nextImage} 
                style={{ ...navButtonStyle, right: "20px" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; e.currentTarget.style.background = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)"; }}
            >
                ❯
            </button>
        </div>
    );
}

// =========================================================================
// WIDOK: GRA MIEJSKA
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
        if (timeLeft <= 0) {
            handleGuess();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, gameState]);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current).setView([53.123, 18.000], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(map);

            map.on('click', (e) => {
                setUserGuess(e.latlng);
            });

            mapInstanceRef.current = map;
        }
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (gameState === 'GUESSING' && userGuess) {
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng(userGuess);
            } else {
                userMarkerRef.current = L.marker(userGuess, {icon: gameUserIcon}).addTo(map);
            }
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
                
                try {
                    const bounds = L.latLngBounds(userGuess, targetLatLng).pad(0.2);
                    map.flyToBounds(bounds, { duration: 1.0 });
                } catch(e) { console.log(e); }
            } else {
                map.flyTo(targetLatLng, 15);
            }
            setTimeout(() => map.invalidateSize(), 300);
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState === 'GUESSING' && mapInstanceRef.current) {
            const map = mapInstanceRef.current;
            if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
            if (correctMarkerRef.current) map.removeLayer(correctMarkerRef.current);
            if (lineRef.current) map.removeLayer(lineRef.current);
            
            userMarkerRef.current = null;
            correctMarkerRef.current = null;
            lineRef.current = null;
            setUserGuess(null);

            map.setView([53.123, 18.000], 13);
            map.invalidateSize();
        }
    }, [round, gameState]);

    const handleGuess = () => {
        if (gameState !== 'GUESSING') return;

        let points = 0;
        let dist = 0;
        const target = GAME_LOCATIONS[round];

        if (userGuess) {
            dist = mapInstanceRef.current.distance(userGuess, [target.lat, target.lng]);
            points = Math.round(5000 * Math.exp(-dist / 2000));
            if (dist < 50) points = 5000;
            if (dist > 10000) points = 0;
        }

        setRoundScore(points);
        setDistance(dist);
        setScore(s => s + points);
        setGameState('RESULT');
    };

    const nextRound = () => {
        if (round + 1 >= GAME_LOCATIONS.length) {
            setGameState('FINISHED');
        } else {
            setRound(r => r + 1);
            setTimeLeft(60);
            setGameState('GUESSING');
        }
    };

    if (gameState === 'FINISHED') {
        return (
            <div className="game-modal-overlay">
                <div style={{fontSize: "80px"}}>🏆</div>
                <h1 style={{color: "#333", margin: "10px"}}>KONIEC GRY</h1>
                <div className="game-stat" style={{fontSize: "24px", color: "#555"}}>
                    Twój wynik: <b style={{color: "#2563EB", fontSize: "32px"}}>{score}</b> pkt
                </div>
                <div style={{marginTop: "30px", display: "flex", gap: "10px"}}>
                     <button onClick={() => window.location.reload()} style={{padding: "12px 24px", borderRadius: "30px", border: "none", background: "#2563EB", color: "white", fontWeight: "bold", cursor: "pointer"}}>Jeszcze raz</button>
                     <button onClick={onBack} style={{padding: "12px 24px", borderRadius: "30px", border: "2px solid #2563EB", background: "white", color: "#2563EB", fontWeight: "bold", cursor: "pointer"}}>Wróć do menu</button>
                </div>
            </div>
        );
    }

    const currentPlace = GAME_LOCATIONS[round];
    
    return (
        <div style={{ 
            width: "100%", maxWidth: "1100px", height: "85vh", 
            background: "white", borderRadius: "30px", overflow: "hidden", position: "relative",
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)"
        }}>
            <button onClick={onBack} style={{position: "absolute", top: "70px", left: "20px", zIndex: 1900, background: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.2)", fontSize: "20px"}}>🏠</button>

            <div className="game-top-bar">
                <div className="game-stat">Runda: {round + 1} / {GAME_LOCATIONS.length}</div>
                <div className={`game-stat ${timeLeft < 10 ? 'timer-warning' : ''}`}>Czas: {timeLeft}s</div>
                <div className="game-stat" style={{color: '#d97706'}}>Wynik: {score}</div>
            </div>

            <div className="street-view-wrapper">
                 <iframe 
                    src={currentPlace.embedUrl}
                    width="100%" height="100%" 
                    style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    key={round} 
                ></iframe>
            </div>

            <div className={`guess-map-wrapper ${gameState === 'RESULT' ? 'result-mode' : ''}`}>
                <div ref={mapContainerRef} style={{width: '100%', height: '100%', borderRadius: '8px', cursor: 'crosshair'}}></div>
                
                {gameState === 'GUESSING' ? (
                    <button 
                        className="btn-action btn-guess"
                        style={{ opacity: userGuess ? 1 : 0.5, pointerEvents: userGuess ? 'auto' : 'none' }}
                        onClick={handleGuess}
                    >
                        {userGuess ? 'POTWIERDŹ LOKALIZACJĘ' : 'ZAZNACZ NA MAPIE'}
                    </button>
                ) : (
                    <div style={{position: 'absolute', bottom: '15px', width: '100%', textAlign: 'center', zIndex: 2000}}>
                        <div style={{background: 'rgba(0,0,0,0.8)', padding: '10px', marginBottom: '10px', borderRadius: '8px', color: "white"}}>
                            <div>Odległość: <b>{Math.round(distance)} m</b></div>
                            <div style={{color: '#fbbf24', fontWeight: "bold"}}>+ {roundScore} pkt</div>
                        </div>
                        <button className="btn-action btn-next" onClick={nextRound} style={{position:'static', width: '90%'}}>
                            Następna Runda
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// =========================================================================
// WIDOK: RESTAURACJE
// =========================================================================
function FoodView({ onBack }) {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaces = async () => {
            setLoading(true);
            try {
                const query = `
                    [out:json][timeout:25];
                    (
                      node["amenity"="restaurant"](53.115,17.980,53.135,18.020);
                      node["amenity"="cafe"](53.115,17.980,53.135,18.020);
                      node["amenity"="fast_food"](53.115,17.980,53.135,18.020);
                    );
                    out body;
                `;
                const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
                const response = await fetch(url);
                const data = await response.json();

                const mappedPlaces = data.elements.filter(el => el.tags && el.tags.name).map(el => ({
                    id: el.id,
                    name: el.tags.name,
                    type: el.tags.amenity === "cafe" ? "Kawiarnia" : "Restauracja",
                    lat: el.lat,
                    lng: el.lon,
                    address: el.tags["addr:street"] || "Centrum",
                    icon: el.tags.amenity === "cafe" ? "☕" : "🍽️"
                }));
                setPlaces(mappedPlaces.sort(() => 0.5 - Math.random()).slice(0, 30));
            } catch (error) { console.error(error); }
            setLoading(false);
        };
        fetchPlaces();
    }, []);

    const handleNavigate = (lat, lng) => {
        window.open(`https://www.openstreetmap.org/directions?engine=graphhopper_car&route=%3B${lat}%2C${lng}`, '_blank');
    };

    return (
        <div style={{ width: "100%", maxWidth: "900px", height: "85vh", background: "rgba(255,255,255,0.6)", borderRadius: "30px", display: "flex", flexDirection: "column" }}>
           <div style={{ padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
              <button onClick={onBack} style={{ border: "none", background: "none", fontSize: "24px", cursor: "pointer" }}>🏠</button>
              <div style={{ fontWeight: "bold" }}>Gastronomia</div>
           </div>
           <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
                {loading ? <div style={{textAlign: "center", padding: "20px"}}>Ładowanie...</div> : places.map(place => (
                    <div key={place.id} style={{ background: "white", padding: "15px", borderRadius: "15px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                        <div style={{ fontSize: "24px", marginBottom: "5px" }}>{place.icon}</div>
                        <b>{place.name}</b>
                        <div style={{ fontSize: "12px", color: "#666" }}>{place.type} • {place.address}</div>
                        <button onClick={() => handleNavigate(place.lat, place.lng)} style={{ marginTop: "10px", padding: "8px", width: "100%", background: "#2563EB", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Nawiguj</button>
                    </div>
                ))}
           </div>
        </div>
    );
}

// =========================================================================
// WIDOK: QUIZ
// =========================================================================
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
      <div style={{ width: "100%", maxWidth: "600px", padding: "40px", background: "rgba(255,255,255,0.7)", borderRadius: "30px", textAlign: "center" }}>
        <h2>Koniec Quizu!</h2>
        <div style={{ fontSize: "48px", color: "#2563EB" }}>{score} / {questions.length}</div>
        <button onClick={onBack} style={{ marginTop: "20px", padding: "10px 20px", background: "#2563EB", color: "white", border: "none", borderRadius: "20px", cursor: "pointer" }}>Menu</button>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div style={{ width: "100%", maxWidth: "900px", height: "85vh", background: "rgba(255,255,255,0.6)", borderRadius: "30px", display: "flex", flexDirection: "column" }}>
       <div style={{ padding: "15px", borderBottom: "1px solid rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>🏠</button>
          <b>Pytanie {currentQIndex + 1}/{questions.length}</b>
       </div>
       <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3>Co to za miejsce?</h3>
          <img src={currentQ.target.img} style={{ width: "100%", maxHeight: "250px", objectFit: "cover", borderRadius: "15px", marginBottom: "20px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
              {currentQ.options.map((opt) => (
                  <button key={opt.id} onClick={() => handleOptionClick(opt)} disabled={selectedOption !== null}
                    style={{
                        padding: "15px", borderRadius: "10px", border: "none", cursor: "pointer",
                        background: selectedOption && opt.id === currentQ.target.id ? "#22c55e" : selectedOption && opt.id === selectedOption.id && !isCorrect ? "#ef4444" : "white",
                        color: selectedOption && (opt.id === currentQ.target.id || opt.id === selectedOption.id) ? "white" : "black"
                    }}>
                      {opt.name}
                  </button>
              ))}
          </div>
       </div>
    </div>
  )
}

// =========================================================================
// WIDOK: MAPA Z CZATBOTEM (BydgoMap)
// =========================================================================
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
    useEffect(() => { if (position) map.flyTo(position, 16, { duration: 1.5 }); }, [position, map]);
    return null;
  }

  useEffect(() => {
    const loadVoices = () => {
      let v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
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
    const plVoices = voices.filter(v => v.lang.includes('pl'));
    let selectedVoice = gender === 'female' ? plVoices.find(v => v.name.includes('Zosia')) : plVoices.find(v => v.name.includes('Jakub'));
    if (selectedVoice) utterance.voice = selectedVoice;
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

    } catch (error) { alert("Błąd połączenia z serwerem!"); }
    setLoading(false);
  };

  return (
    <div style={{ width: "100%", maxWidth: "1100px", height: "85vh", background: "rgba(255,255,255,0.6)", borderRadius: "30px", overflow: "hidden", display: "flex", flexDirection: "row", position: "relative" }}>
      <button onClick={onBack} style={{ position: "absolute", top: "20px", left: "20px", zIndex: 1000, background: "white", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px" }}>🏠</button>

      <div style={{ flex: "1.2", position: "relative" }}>
        <MapContainer center={[53.123, 18.004]} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {monumentsData.map((m) => (
            <Marker key={m.id} position={m.position} eventHandlers={{ click: () => handleSelectMonument(m.id) }}>
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                <div style={{ textAlign: "center" }}><strong>{m.name}</strong></div>
              </Tooltip>
            </Marker>
          ))}
          {currentMonument && <FlyToMarker position={currentMonument.position} />}
        </MapContainer>
      </div>

      <div style={{ flex: "1", display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.3)" }}>
        {!currentMonument ? (
             <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#666" }}>
                <h2>Wybierz miejsce</h2>
                <p>Kliknij pinezkę na mapie</p>
             </div>
        ) : (
            <>
                <div style={{ height: "35%", width: "100%", backgroundImage: `url(${currentMonument.img})`, backgroundSize: "cover", position: "relative" }}>
                    <button onClick={() => setIsAutoRead(!isAutoRead)} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.5)", color: "white", border: "none", padding: "5px 10px", borderRadius: "20px", cursor: "pointer" }}>{isAutoRead ? "🔊 Lektor WŁ" : "🔇 Lektor WYŁ"}</button>
                    <div style={{ position: "absolute", bottom: "10px", left: "10px", color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                        <h2 style={{ margin: 0 }}>{currentMonument.name}</h2>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {chatHistory.map((msg, index) => (
                      <div key={index} style={{ alignSelf: msg.sender === "Ty" ? "flex-end" : "flex-start", background: msg.sender === "Ty" ? "#2563EB" : "white", color: msg.sender === "Ty" ? "white" : "black", padding: "10px", borderRadius: "10px", maxWidth: "80%" }}>
                          {msg.text}
                          {msg.sender !== "Ty" && !isAutoRead && <button onClick={() => speak(msg.text, currentMonument.gender)} style={{ marginLeft: "10px", background: "none", border: "none", cursor: "pointer" }}>🔊</button>}
                      </div>
                  ))}
                  {loading && <div style={{ fontSize: "12px", fontStyle: "italic" }}>Pisze...</div>}
                </div>
                <div style={{ padding: "10px", display: "flex", gap: "5px" }}>
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ccc" }} placeholder="Napisz coś..." />
                    <button onClick={sendMessage} style={{ padding: "10px", borderRadius: "50%", background: "#2563EB", color: "white", border: "none", cursor: "pointer" }}>➤</button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}

// --- WIDOK 5: MENU GŁÓWNE ---
function MainMenu({ onStart }) {
  const cards = [
    { id: 'map', title: 'BydgoBOT', icon: '🏛️', desc: 'Rozmawiaj z zabytkami.', color: 'linear-gradient(135deg, #2563EB, #a18cd1)' },
    { id: 'quiz', title: 'Quiz Wiedzy', icon: '❓', desc: 'Co to za miejsce?', color: 'linear-gradient(135deg, #ff9966, #ff5e62)' },
    { id: 'game', title: 'Gra Miejska', icon: '🗺️', desc: 'Zgadnij gdzie jesteś!', color: 'linear-gradient(135deg, #8E2DE2, #4A00E0)' },
    { id: 'food', title: 'Gdzie zjeść?', icon: '🍔', desc: 'Gastronomia w okolicy.', color: 'linear-gradient(135deg, #DA4453, #89216B)' },
    { id: 'events', title: 'Wydarzenia', icon: '📅', desc: 'Co się dzieje? (wkrótce).', color: 'linear-gradient(135deg, #F2994A, #F2C94C)', disabled: true },
    { id: 'gallery', title: 'Galeria', icon: '📸', desc: 'Zdjęcia miasta.', color: 'linear-gradient(135deg, #56ab2f, #a8e063)' }, // ODBLOKOWANE!
  ];

  return (
    <div style={{ width: "100%", maxWidth: "850px", padding: "40px", background: "rgba(255,255,255,0.6)", borderRadius: "30px", textAlign: "center" }}>
      <h1>🌊 Wirtualna Bydgoszcz</h1>
      <p>Odkryj miasto z AI. Wybierz aktywność:</p>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
        {cards.map(card => (
          <div key={card.id} onClick={() => !card.disabled && onStart(card.id)}
            style={{ width: "200px", padding: "20px", borderRadius: "15px", background: "white", cursor: card.disabled ? "not-allowed" : "pointer", opacity: card.disabled ? 0.6 : 1, transition: "transform 0.2s" }}
            onMouseEnter={(e) => !card.disabled && (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => !card.disabled && (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: "32px" }}>{card.icon}</div>
            <h3>{card.title}</h3>
            <p style={{ fontSize: "12px", color: "#666" }}>{card.desc}</p>
            <button style={{ padding: "5px 15px", borderRadius: "15px", border: "none", color: "white", background: card.disabled ? "#ccc" : card.color }}>{card.disabled ? "Wkrótce" : "Start"}</button>
          </div>
        ))}
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
      {currentView === 'food' && <FoodView onBack={() => setCurrentView('menu')} />}
      {currentView === 'game' && <CityGame onBack={() => setCurrentView('menu')} />}
      {currentView === 'gallery' && <GalleryView onBack={() => setCurrentView('menu')} />}
    </>
  )
}

export default App