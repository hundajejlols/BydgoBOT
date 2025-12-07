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

// Ikony do gry (SVG - NIEZNISZCZALNE)
const gameUserIcon = L.icon({
    iconUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='45' viewBox='0 0 30 45'%3E%3Cpath fill='%23EF4444' stroke='%23991B1B' stroke-width='1' d='M15 0C6.7 0 0 6.7 0 15c0 8.3 15 30 15 30s15-21.7 15-30C30 6.7 23.3 0 15 0zm0 22c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z'/%3E%3C/svg%3E",
    shadowUrl: iconShadow,
    iconSize: [30, 45], 
    iconAnchor: [15, 45], 
    popupAnchor: [0, -40], 
    shadowSize: [41, 41]
});

const gameCorrectIcon = L.icon({
    iconUrl: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='45' viewBox='0 0 30 45'%3E%3Cpath fill='%2310B981' stroke='%23064E3B' stroke-width='1' d='M15 0C6.7 0 0 6.7 0 15c0 8.3 15 30 15 30s15-21.7 15-30C30 6.7 23.3 0 15 0zm0 22c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z'/%3E%3C/svg%3E",
    shadowUrl: iconShadow,
    iconSize: [30, 45], 
    iconAnchor: [15, 45], 
    popupAnchor: [0, -40], 
    shadowSize: [41, 41]
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
    { id: 1, name: "Stary Rynek", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.121884!2d18.001646!3f220!4f0!5f0.7820865974627469", lat: 53.121884, lng: 18.001646 },
    { id: 2, name: "Wyspa Młyńska", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcFBFOXlmUjZ4X0xZLV9EQWc!2m2!1d53.1238!2d17.9966!3f100!4f0!5f0.7820865974627469", lat: 53.1238, lng: 17.9966 },
    { id: 3, name: "Opera Nova", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.1227!2d18.0006!3f50!4f0!5f0.7820865974627469", lat: 53.1227, lng: 18.0006 },
    { id: 4, name: "Bazylika (Al. Ossolińskich)", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.1260!2d18.0120!3f180!4f0!5f0.7820865974627469", lat: 53.1260, lng: 18.0120 },
    { id: 5, name: "Wieża Ciśnień", embedUrl: "https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE5CZHZ4aU1xX0xZLV9EQWc!2m2!1d53.1206!2d17.9912!3f0!4f0!5f0.7820865974627469", lat: 53.1206, lng: 17.9912 }
];

const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

// Mapowanie numeru zdjęcia na nazwę (dla Galerii)
const GALLERY_IMAGE_NAMES = {
    1: "Barki i Przechodzący nad Brdą",
    2: "Budynek Poczty Głównej nad Brdą (jesień)",
    3: "Historyczny most zwodzony na Brdzie (czarno-białe)",
    4: "Wieczorny widok na Brdę i MBank (Ciemne)",
    5: "Defilada wojskowa w centrum (czarno-białe)",
    6: "Rzeźba Przechodzącego przez rzekę",
    7: "Widok na Operę Nova i Wyspę Młyńską",
    8: "Centrum Handlowe Focus Mall (ujęcie z drona)",
    9: "Świąteczne serca na moście (Noc)",
    10: "Śluza na Kanale Bydgoskim",
    11: "Budynek Poczty Głównej nad Brdą (wiosna)",
    12: "Kamienica narożna (akwarela)",
    13: "Widok na Brdę i spichrze (światło zimowe)",
    14: "Spichrze i barki nad Brdą (lato)",
    15: "Zabudowa Starego Rynku (kamienice)",
    16: "Budynek Poczty Głównej (ujęcie frontalne)",
    17: "Wnętrze Lotniska Bydgoszcz",
    18: "Katedra Św. Piotra i Pawła (czarno-białe)",
    19: "Houseboat na Brdzie (przyjęcie)",
    20: "Slackline Games na Brdzie",
    21: "Park trampolin Eltrox Jump",
    22: "Dworzec Bydgoszcz Główna (nowoczesny budynek)",
    23: "Fontanna Potop i Kościół pw. Św. Piotra i Pawła",
    24: "Spichrze w pełnym słońcu z kwiatami",
    25: "MBank i Dom Wycieczkowy PTTK nad Brdą",
    26: "Panorama miasta z drona (Młyny, Opera, Brda)",
    27: "Mapa Dzielnic Bydgoszczy",
    28: "Spichrze - Muzeum Bydgoszczy",
    29: "Pejzaż rzeki Brdy o zachodzie słońca",
    30: "Spichrze (zdjęcie historyczne - wojenne)"
};

// --- DANE TRAS TURYSTYCZNYCH Z LINKAMI MAPS ---
const TOURIST_ROUTES = [
    { 
        title: "Klasyczna Trasa Wodna i Stare Miasto", 
        icon: "🏛️", 
        desc: "Najważniejsze punkty: Stary Rynek, Bulwary, Spichrze, Wyspa Młyńska, Opera Nova.", 
        color: "#2563EB", 
        details: [
            "Początek: Stary Rynek (Pomnik Walki i Męczeństwa)",
            "Bulwary nad Brdą (rzeźba 'Przechodzący przez rzekę')",
            "Spichrze nad Brdą",
            "Wyspa Młyńska (zielona oaza)",
            "Opera Nova"
        ],
        mapLink: 'https://www.google.com/maps/dir/?api=1&origin=53.12199,18.00021&destination=53.1244,17.9975&waypoints=53.1235,18.0020|53.1222,17.9958&travelmode=walking'
    },
    { 
        title: "Szlak Wody, Przemysłu i Rzemiosła TeH2O", 
        icon: "⚙️", 
        desc: "Odkryj industrialne dziedzictwo miasta.", 
        color: "#EF4444", 
        details: [
            "Muzeum Wodociągów (Wieża Ciśnień)",
            "Exploseum (dawna fabryka prochu DAG)",
            "Kanał Bydgoski i zabytkowe śluzy (Okole/Czyżkówko)"
        ],
        mapLink: 'https://www.google.com/maps/dir/?api=1&origin=53.1194,17.9903&destination=53.0708,18.0739&travelmode=driving'
    },
    { 
        title: "Secesja w Bydgoskim Śródmieściu", 
        icon: "🖼️", 
        desc: "Podziwiaj bogato zdobione kamienice.", 
        color: "#FBBF24", 
        details: [
            "Początek: Plac Wolności (Fontanna Potop)",
            "Aleje Mickiewicza",
            "Ulice Śródmieścia, w tym Gdańska",
            "Detale architektoniczne i balkony"
        ],
        mapLink: 'https://www.google.com/maps/dir/?api=1&origin=53.1265,18.0080&destination=53.1311,18.0083&travelmode=walking'
    },
    { 
        title: "Trasa Wzdłuż Kanału Bydgoskiego", 
        icon: "🛶", 
        desc: "Dłuższy, spokojny spacer z dala od zgiełku.", 
        color: "#10B981", 
        details: [
            "Trasa: wzdłuż kanału od śluzy Okole w kierunku zachodnim.",
            "Charakterystyka: Płaska, łatwa, idealna na rekreację.",
            "Punkty: Starodrzewy i zabytkowe śluzy."
        ],
        mapLink: 'https://www.google.com/maps/dir/?api=1&origin=53.1364,17.9678&destination=53.1333,17.9511&travelmode=walking'
    },
    { 
        title: "Leśny Park Kultury i Wypoczynku Myślęcinek", 
        icon: "🌳", 
        desc: "Największy park miejski w Polsce.", 
        color: "#059669", 
        details: [
            "Atrakcje: Ogród Zoologiczny, Ogród Botaniczny, Park Linowy.",
            "Możliwość zaplanowania wycieczki na cały dzień."
        ],
        mapLink: 'https://www.google.com/maps/search/?api=1&query=Leśny+Park+Kultury+i+Wypoczynku+Myślęcinek+Bydgoszcz'
    },
];


// =========================================================================
// WIDOK: INTRO / TRAILER
// =========================================================================
function IntroView({ onFinish }) {
    return (
        <div 
            className="intro-container" 
            style={{ 
                backgroundImage: "url('/images/gallery/1.jpg')", 
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
                zIndex: 5000, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                backgroundSize: 'cover', backgroundPosition: 'center' 
            }}
        >
            <div 
                className="intro-overlay" 
                style={{
                    background: 'rgba(255, 255, 255, 0.1)', 
                    padding: '50px', 
                    borderRadius: '25px', 
                    textAlign: 'center', 
                    color: 'white', 
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                }}
            >
                <h1 
                    className="intro-title" 
                    style={{ 
                        fontSize: '96px', 
                        margin: 0, 
                        fontWeight: 900, 
                        background: 'linear-gradient(45deg, #ffffff, #fbbd24)', 
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 10px rgba(255, 255, 255, 1), 0 0 20px rgba(0,0,0,0.5)', 
                        animation: 'fadeInDown 1.5s ease-out'
                    }}
                >
                    Bydgoszcz
                </h1>
                <p className="intro-subtitle" style={{ fontSize: '24px', textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>Twój Inteligentny Przewodnik po Bydgoszczy</p>
                <button 
                    onClick={onFinish} 
                    className="btn-start-adventure"
                    style={{
                        padding: '15px 40px', 
                        background: '#FFC107', 
                        color: 'black', 
                        border: 'none', 
                        borderRadius: '30px', 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(255, 193, 7, 0.5)',
                        transition: 'transform 0.3s, box-shadow 0.3s, background 0.3s'
                    }}
                >
                    ROZPOCZNIJ PRZYGODĘ
                </button>
                <p style={{marginTop: '40px', fontSize: '12px', opacity: 0.8, animation: 'fadeInUp 2s ease-out'}}>
                    Projekt stworzony z miłości do miasta 🇵🇱
                </p>
            </div>
        </div>
    )
}

// =========================================================================
// KOMPONENT SZCZEGÓŁOWY HISTORII (Wysuwany panel boczny)
// =========================================================================
function HistoryDetailPanel({ item, onClose }) {
    const panelRef = useRef(null);

    useEffect(() => {
        if (panelRef.current) {
            if (item) {
                panelRef.current.classList.add('open');
            } else {
                panelRef.current.classList.remove('open');
            }
        }
    }, [item]);

    if (!item) return null;

    return (
        <div ref={panelRef} className="history-detail-panel">
            <div className="history-panel-content">
                {/* Header z obrazkiem i przyciskiem */}
                <div style={{ 
                    height: '250px', 
                    backgroundImage: `url(${item.img})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    position: 'relative',
                    flexShrink: 0
                }}>
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                    }}></div>
                    <button 
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '20px', left: '20px', zIndex: 10,
                            background: '#ef4444', color: 'white', border: 'none', 
                            borderRadius: '50%', width: '40px', height: '40px', 
                            fontSize: '20px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        ✕
                    </button>
                    <div style={{ position: 'absolute', bottom: '20px', left: '30px', color: 'white', zIndex: 5 }}>
                        <h1 style={{ margin: 0, fontSize: '48px', fontWeight: 900, color: item.color }}>{item.year}</h1>
                        <h2 style={{ margin: 0, fontSize: '30px' }}>{item.title}</h2>
                    </div>
                </div>
                
                {/* Scrollable Content */}
                <div style={{ padding: '30px', flexGrow: 1, backgroundColor: 'white' }}>
                    <h3 style={{color: '#333', marginTop: 0}}>{item.event}</h3>
                    <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#333' }}>{item.detail}</p>
                    <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                        *Ten opis został wygenerowany na podstawie danych historycznych dla celów edukacyjnych.
                    </p>
                </div>
            </div>
        </div>
    );
}


// =========================================================================
// WIDOK: GALERIA ZDJĘĆ
// =========================================================================
function GalleryView({ onBack }) {
    const imageKeys = Object.keys(GALLERY_IMAGE_NAMES).map(Number);
    const totalImages = imageKeys.length;
    
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

    const currentImageNum = imageKeys[currentIndex];
    const imagePath = `/images/gallery/${currentImageNum}.jpg`;
    const imageName = GALLERY_IMAGE_NAMES[currentImageNum] || `Zdjęcie nr ${currentImageNum}`;

    const navButtonStyle = {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        background: "rgba(255, 255, 255, 0.8)",
        color: "#2563EB",
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
            background: "rgba(255, 255, 255, 0.55)", 
            backdropFilter: "blur(20px)", 
            border: "1px solid rgba(255, 255, 255, 0.8)", 
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            borderRadius: "30px", 
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden"
        }}>
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
            
            <div style={{ 
                position: "absolute", top: "20px", right: "20px", zIndex: 20,
                color: "#333", background: "rgba(255,255,255,0.8)", 
                padding: "8px 15px", borderRadius: "20px", fontWeight: "bold",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
            }}>
                Zdjęcie {currentIndex + 1} / {totalImages}
            </div>

            <button 
                onClick={prevImage} 
                style={{ ...navButtonStyle, left: "20px" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; e.currentTarget.style.background = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(-50%) scale(1)"; e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)"; }}
            >
                ❮
            </button>

            {/* GŁÓWNA ZMIANA: Sztywny kontener na zdjęcie w galerii, aby każde było równe */}
            <div style={{ 
                width: "90%", // Szerokość kontenera
                height: "65vh", // Stała wysokość (procent ekranu)
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                marginTop: "20px"
            }}>
                <div style={{ 
                    width: "100%", 
                    height: "100%", 
                    borderRadius: "20px",
                    overflow: "hidden", // Przycinanie
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                    background: "rgba(0,0,0,0.05)" // Tło dla ładowania
                }}>
                    <img 
                        src={imagePath} 
                        alt={imageName} 
                        style={{ 
                            width: "100%", 
                            height: "100%", 
                            objectFit: "cover", // TO KLUCZ: Wypełnia cały kontener, przycinając nadmiar
                            transition: 'all 0.3s'
                        }} 
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src="https://via.placeholder.com/800x600?text=Brak+zdjęcia"
                            e.target.alt="Brak zdjęcia"
                        }}
                    />
                </div>
                <p style={{ 
                    marginTop: '20px', 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#333', 
                    textAlign: 'center',
                    textShadow: "0 1px 2px rgba(255,255,255,0.8)"
                }}>
                    {imageName}
                </p>
            </div>

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
        const map = mapInstanceRef.current;
        if (!map) return;

        if (gameState === 'RESULT') {
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
    }, [gameState, round, userGuess]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (gameState === 'GUESSING' && map) {
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
                        {/* FIX: Dodano transform: 'none' aby wyłączyć przesunięcie z CSS */}
                        <button 
                            className="btn-action btn-next" 
                            onClick={nextRound} 
                            style={{ position: 'static', width: '90%', transform: 'none' }}
                        >
                            Następna Runda
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// =========================================================================
// WIDOK: RESTAURACJE (Zmodernizowany Design)
// =========================================================================
function FoodView({ onBack }) {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    // Funkcja pomocnicza do kolorów i ikon na podstawie typu
    const getPlaceStyle = (type) => {
        switch (type) {
            case "Kawiarnia": return { bg: "#FEF3C7", icon: "☕", color: "#D97706" }; // Żółty/Pomarańczowy
            case "Fast Food": return { bg: "#FEE2E2", icon: "🍔", color: "#DC2626" }; // Czerwony
            case "Bar": return { bg: "#DBEAFE", icon: "🍺", color: "#2563EB" };       // Niebieski
            default: return { bg: "#FFEDD5", icon: "🍽️", color: "#EA580C" };        // Domyślny (Restauracja) - Pomarańczowy
        }
    };

    useEffect(() => {
        const fetchPlaces = async () => {
            setLoading(true);
            try {
                // Zapytanie do Overpass API (OpenStreetMap)
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
                        // Mapowanie typu
                        let type = "Restauracja";
                        if (el.tags.amenity === "cafe") type = "Kawiarnia";
                        else if (el.tags.amenity === "fast_food") type = "Fast Food";
                        else if (el.tags.amenity === "bar") type = "Bar";

                        // Symulacja oceny (bo OSM ich nie ma) - dla efektu wizualnego
                        const rating = (4.0 + Math.random() * 0.9).toFixed(1); // Ocena między 4.0 a 4.9
                        const reviews = Math.floor(Math.random() * 400) + 50;  // Liczba opinii 50-450

                        return {
                            id: el.id,
                            name: el.tags.name,
                            type: type,
                            lat: el.lat,
                            lng: el.lon,
                            address: el.tags["addr:street"] 
                                ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ''}` 
                                : "Centrum Bydgoszczy",
                            ...getPlaceStyle(type), // Rozpakowuje bg, icon, color
                            rating,
                            reviews
                        };
                    });

                // Mieszamy i bierzemy 50 wyników
                setPlaces(mappedPlaces.sort(() => 0.5 - Math.random()).slice(0, 50));
            } catch (error) { console.error(error); }
            setLoading(false);
        };
        fetchPlaces();
    }, []);

    const handleNavigate = (lat, lng) => {
        window.open(`http://googleusercontent.com/maps.google.com/?q=${lat},${lng}`, '_blank');
    };

    return (
        <div style={{ 
            width: "100%", maxWidth: "1000px", height: "85vh", 
            // Tło głównego kontenera - delikatne szkło
            background: "rgba(255,255,255,0.4)", 
            backdropFilter: "blur(20px)",
            borderRadius: "30px", 
            display: "flex", flexDirection: "column",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)"
        }}>
           {/* Nagłówek */}
           <div style={{ padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={onBack} style={{ border: "none", background: "white", width:"45px", height:"45px", borderRadius:"50%", fontSize: "22px", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>🏠</button>
              <h2 style={{ margin: 0, fontWeight: "800", color: "#333", fontSize: "24px" }}>Gdzie zjeść? 🍔</h2>
              <div style={{width: "45px"}}></div>
           </div>
           
           {/* Grid z kartami */}
           <div style={{ 
               flex: 1, 
               overflowY: "auto", 
               padding: "10px 30px 30px 30px", 
               display: "grid", 
               gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", // Responsywny grid
               gap: "20px" 
           }}>
                {loading ? (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#666" }}>
                        Pobieram najświeższe menu z okolicy... 🍲
                    </div>
                ) : places.map(place => (
                    <div key={place.id} style={{ 
                        background: "white", 
                        padding: "20px", 
                        borderRadius: "25px", 
                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "transform 0.2s",
                        border: "1px solid white"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        {/* Góra karty: Ikona + Nazwa */}
                        <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                            <div style={{ 
                                width: "60px", height: "60px", 
                                background: place.bg, 
                                borderRadius: "18px", 
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "30px",
                                flexShrink: 0
                            }}>
                                {place.icon}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "bold", color: "#1f2937", lineHeight: "1.2" }}>{place.name}</h3>
                                <span style={{ fontSize: "13px", color: "#9ca3af" }}>{place.type}</span>
                            </div>
                        </div>

                        {/* Środek: Ocena i Adres */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                                <span style={{ color: "#FBBF24", fontSize: "16px" }}>⭐</span>
                                <span style={{ fontWeight: "bold", color: "#1f2937", fontSize: "14px" }}>{place.rating}</span>
                                <span style={{ color: "#9ca3af", fontSize: "13px" }}>({place.reviews})</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "#EF4444", fontSize: "16px" }}>📍</span>
                                <span style={{ fontSize: "13px", color: "#4b5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>
                                    {place.address}
                                </span>
                            </div>
                        </div>

                        {/* Przycisk na dole */}
                        <button 
                            onClick={() => handleNavigate(place.lat, place.lng)} 
                            style={{ 
                                width: "100%", 
                                padding: "12px", 
                                background: "#58BC42", // Zielony kolor ze zdjęcia
                                color: "white", 
                                border: "none", 
                                borderRadius: "15px", 
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                boxShadow: "0 4px 12px rgba(88, 188, 66, 0.3)",
                                transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#4cae36"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#58BC42"}
                        >
                            🗺️ Trasa
                        </button>
                    </div>
                ))}
           </div>
        </div>
    );
}

// =========================================================================
// WIDOK: QUIZ (Wersja z Przewijaniem - FIX)
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
      <div style={{ width: "100%", maxWidth: "500px", padding: "40px", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", borderRadius: "30px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize: "60px", marginBottom: "15px" }}>🎉</div>
        <h2 style={{ fontSize: "28px", margin: "0 0 15px 0", color: "#333" }}>Koniec Quizu!</h2>
        <div style={{ fontSize: "18px", color: "#555", marginBottom: "5px" }}>Twój wynik:</div>
        <div style={{ fontSize: "48px", fontWeight: "900", color: "#2563EB", textShadow: "0 5px 15px rgba(37, 99, 235, 0.3)" }}>{score} / {questions.length}</div>
        <button onClick={onBack} style={{ marginTop: "30px", padding: "12px 30px", fontSize: "16px", fontWeight: "bold", background: "#2563EB", color: "white", border: "none", borderRadius: "50px", cursor: "pointer", boxShadow: "0 10px 20px rgba(37, 99, 235, 0.4)", transition: "transform 0.2s" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}>Wróć do Menu</button>
      </div>
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div style={{ 
        width: "100%", maxWidth: "650px", height: "85vh", maxHeight: "800px", 
        background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)",
        borderRadius: "30px", display: "flex", flexDirection: "column",
        boxShadow: "0 15px 35px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.6)",
        overflow: "hidden" // Przycinamy zawartość do zaokrąglonych rogów
    }}>
       {/* Nagłówek */}
       <div style={{ padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onBack} style={{ border: "none", background: "white", width:"40px", height:"40px", borderRadius:"50%", fontSize: "20px", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>🏠</button>
          <div style={{ fontSize: "16px", fontWeight: "bold", color: "#444" }}>Pytanie {currentQIndex + 1} z {questions.length}</div>
       </div>

       {/* Treść pytania (Przewijalna) */}
       <div style={{ 
           flex: 1, 
           overflow: "hidden", // ZMIANA: Zablokowanie scrollowania wewnątrz
           padding: "10px 30px 30px 30px", 
           display: "flex", 
           flexDirection: "column", 
           alignItems: "center",
           justifyContent: "space-between" // Rozłożenie elementów
        }}>
          <h2 style={{ fontSize: "24px", marginTop: "10px", marginBottom: "10px", color: "#1f2937", textAlign: "center", fontWeight: "800" }}>Co to za miejsce?</h2>
          
          {/* Obrazek - wysokość 280px (kompromis) */}
          <div style={{
              width: "100%", 
              height: "260px", // STAŁA WYSOKOŚĆ, aby Quiz nie skakał
              marginBottom: "20px",
              borderRadius: "20px", 
              overflow: "hidden", 
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              border: "3px solid white",
              flexShrink: 0 // Zapobiega zgniataniu obrazka
          }}>
            <img src={currentQ.target.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Siatka przycisków */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", width: "100%", paddingBottom: "10px" }}>
              {currentQ.options.map((opt) => {
                  let bgColor = "white";
                  let textColor = "#333";
                  let scale = "1";
                  let shadow = "0 4px 10px rgba(0,0,0,0.05)";

                  if (selectedOption) {
                      if (opt.id === currentQ.target.id) {
                          bgColor = "#22c55e"; 
                          textColor = "white";
                          shadow = "0 8px 15px rgba(34, 197, 94, 0.4)";
                          scale = "1.02";
                      } else if (opt.id === selectedOption.id && !isCorrect) {
                          bgColor = "#ef4444"; 
                          textColor = "white";
                          shadow = "0 8px 15px rgba(239, 68, 68, 0.4)";
                      } else {
                          bgColor = "rgba(255,255,255,0.5)"; 
                          textColor = "#999";
                      }
                  }

                  return (
                    <button 
                        key={opt.id} 
                        onClick={() => handleOptionClick(opt)} 
                        disabled={selectedOption !== null}
                        style={{
                            padding: "15px 10px",
                            minHeight: "60px", 
                            borderRadius: "15px", 
                            border: "none", 
                            cursor: selectedOption ? "default" : "pointer",
                            background: bgColor,
                            color: textColor,
                            fontSize: "15px", 
                            fontWeight: "600",
                            boxShadow: shadow,
                            transform: `scale(${scale})`,
                            transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            lineHeight: "1.2"
                        }}
                        onMouseEnter={(e) => {
                            if (!selectedOption) {
                                e.currentTarget.style.transform = "translateY(-3px)";
                                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!selectedOption) {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
                            }
                        }}
                    >
                        {opt.name}
                    </button>
                  );
              })}
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

  // --- ZMODYFIKOWANA FUNKCJA SPEAK (TYLKO KOBIECY GŁOS) ---
  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    
    // Szukamy głosów polskich
    const plVoices = voices.filter(v => v.lang.includes('pl') || v.lang.includes('PL'));
    
    // Wymuszamy głos kobiecy (Zosia, Paulina, Maja lub Google - który też jest kobiecy)
    let selectedVoice = plVoices.find(v => 
      v.name.includes('Zosia') || 
      v.name.includes('Paulina') || 
      v.name.includes('Maja') || 
      v.name.includes('Google') 
    );

    // Fallback: jakikolwiek polski (zazwyczaj pierwszy systemowy to ten sam co "Google" lub domyślny żeński)
    if (!selectedVoice && plVoices.length > 0) {
      selectedVoice = plVoices[0];
    }

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
      
      if (isAutoRead) speak(data.reply); // Usunięto drugi argument (płeć)

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
                        <h2 style={{ margin: "0" }}>{currentMonument.name}</h2>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {chatHistory.map((msg, index) => (
                      <div key={index} style={{ alignSelf: msg.sender === "Ty" ? "flex-end" : "flex-start", background: msg.sender === "Ty" ? "#2563EB" : "white", color: msg.sender === "Ty" ? "white" : "black", padding: "10px", borderRadius: "10px", maxWidth: "80%" }}>
                          {msg.text}
                          {/* Usunięto drugi argument z funkcji speak */}
                          {msg.sender !== "Ty" && !isAutoRead && <button onClick={() => speak(msg.text)} style={{ marginLeft: "10px", background: "none", border: "none", cursor: "pointer" }}>🔊</button>}
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

// =========================================================================
// WIDOK: HISTORIA MIASTA (HistoryView) - Zmodernizowana Oś Czasu (PIONOWA)
// =========================================================================
function HistoryView({ onBack }) {
    const historicalDates = [
        { year: 1238, title: "Pierwsza Wzmianka", event: "Pierwsza pisemna wzmianka o osadzie Bygdozcsa.", img: "/images/kazimierz.jpg", color: "#60A5FA", 
          detail: "Pierwsze historyczne zapisy o Bydgoszczy (wtedy Bytgozcsa) pochodzą z dokumentów księcia kujawskiego Kazimierza, syna Konrada Mazowieckiego. Wzmianka ta dotyczyła przekazania ziem i sugeruje istnienie już w tym czasie grodu obronnego na szlaku handlowym." },
        { year: 1346, title: "Prawa Miejskie", event: "Król Kazimierz Wielki nadaje Bydgoszczy prawa miejskie na prawie magdeburskim.", img: "/images/kazimierz.jpg", color: "#FBBF24",
          detail: "Akt nadania praw miejskich przez Króla Kazimierza Wielkiego był kluczowy dla rozwoju Bydgoszczy. Zapoczątkował on planową rozbudowę miasta, budowę zamku i murów obronnych, a także ustanowił samorząd miejski i przywileje handlowe. Król ten jest uważany za założyciela Bydgoszczy." },
        { year: 1547, title: "Potęga Handlowa", event: "Rozkwit Bydgoszczy jako centrum handlu zbożem i spławu Wisłą (Spichrze).", img: "/images/spichrze.jpg", color: "#34D399",
          detail: "W Złotym Wieku Polska stała się największym eksporterem zboża w Europie. Bydgoszcz, dzięki położeniu nad Brdą, stała się kluczowym punktem przeładunkowym. Okres ten charakteryzował się budową słynnych Spichrzy, które do dziś są symbolem prosperity handlowej miasta." },
        { year: 1772, title: "Okres Pruski", event: "Pierwszy rozbiór Polski. Miasto trafia pod panowanie pruskie.", img: "/images/wieza.jpg", color: "#9CA3AF",
          detail: "Po włączeniu do Królestwa Prus, Bydgoszcz (jako Bromberg) przeżyła okres intensywnej industrializacji i budowy infrastruktury. Powstał Kanał Bydgoski oraz nowoczesne wodociągi i Wieża Ciśnień, co zmieniło charakter miasta z handlowego na przemysłowy i administracyjny." },
        { year: 1919, title: "Powrót do Polski", event: "Po 147 latach zaborów Bydgoszcz wraca do wolnej Polski (Łuczniczka).", img: "/images/luczniczka.jpg", color: "#FB7185",
          detail: "Po odzyskaniu niepodległości przez Polskę, Bydgoszcz stała się ważnym ośrodkiem administracyjnym i kulturalnym. Pomnik Łuczniczki, odsłonięty wcześniej, stał się symbolem polskości i wolności miasta, pomimo wojennej historii." },
        { year: 1939, title: "Marian Rejewski", event: "Polscy matematycy, w tym rodowity Bydgoszczanin Marian Rejewski, łamią kod Enigmy.", img: "/images/rejewski.jpg", color: "#818CF8",
          detail: "Choć przełomowe złamanie kodu Enigmy nastąpiło przed wojną, ten fakt jest ściśle związany z bydgoskim geniuszem – Marianem Rejewskim. Jego praca była fundamentem dla Aliantów w czasie II wojny światowej i skróciła konflikt o lata, ratując miliony istnień. Jest to jeden z najistotniejszych wkładów Bydgoszczy w historię świata." },
        { year: 1945, title: "Odbudowa", event: "Zniszczenia wojenne i heroiczna powojenna odbudowa miasta.", img: "/images/potop.jpg", color: "#A78BFA",
          detail: "II wojna światowa przyniosła ogromne straty w infrastrukturze Bydgoszczy, w tym zniszczenie historycznych rzeźb i budynków (jak Fontanna Potop). Okres powojenny to czas intensywnej odbudowy i rekonstrukcji, która przywróciła miastu jego historyczny blask." },
        { year: 2007, title: "Fontanna Potop", event: "Ukończenie odbudowy Fontanny Potop, symbolu odrodzenia miasta.", img: "/images/potop.jpg", color: "#FCD34D",
          detail: "Odbudowa zniszczonej w czasie wojny Fontanny Potop była inicjatywą społeczną finansowaną ze składek mieszkańców. Jej powrót na plac stanowi symboliczny akt odrodzenia, jedności i triumfu kultury nad zniszczeniem." },
        { year: 2023, title: "Młyny Rothera", event: "Otwarcie zrewitalizowanych Młynów Rothera jako centrum kultury i nauki.", img: "/images/mlyny.jpg", color: "#60A5FA",
          detail: "Otwarcie odnowionego kompleksu Młynów Rothera przekształciło postindustrialną Wyspę Młyńską w tętniące życiem centrum kultury, sztuki i edukacji. Jest to symbol nowoczesnej Bydgoszczy, która szanuje swoją przeszłość, ale patrzy w przyszłość." },
    ];

    const [detailView, setDetailView] = useState(null);

    return (
        <div style={{
            width: "100%", 
            height: "100vh", 
            position: "fixed", 
            top: 0,
            left: 0,
            overflowY: "auto", // Scrollowanie dla całego widoku
            zIndex: 900, 
            background: "#f0f2f5", // Jasne tło
            scrollBehavior: "smooth"
        }}>
            {/* Tło statyczne (rozmyte zdjęcie) */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: "url('/images/spichrze.jpg')", 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(15px) opacity(0.3)', // Bardziej subtelne
                zIndex: -1
            }} />

            {/* Przycisk Powrotu */}
            <button 
                onClick={onBack} 
                style={{
                    position: "fixed", top: "20px", left: "20px", zIndex: 1100, 
                    background: "white", border: "none", borderRadius: "50%", 
                    width: "45px", height: "45px", fontSize: "22px", cursor: "pointer", 
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
                }}
            >
                🏠
            </button>

            {/* Kontener treści */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 20px', position: 'relative' }}>
                {/* NOWY WYGLĄD NAGŁÓWKA - CZYTELNY */}
                <h1 style={{
                    textAlign: 'center',
                    fontSize: '54px',
                    marginBottom: '70px',
                    fontWeight: '900',
                    // Zmiana na jednolity, ciemny kolor dla lepszego kontrastu
                    color: "#1f2937", // Ciemny szary/granat
                    // Subtelny biały cień pod spodem, żeby "odbić" napis od tła
                    textShadow: "0 2px 0px rgba(255,255,255,1), 0 4px 15px rgba(0,0,0,0.1)",
                    letterSpacing: '-1px'
                }}>
                    Historia Bydgoszczy
                </h1>
                
                {/* Linia czasu - PRZESUNIĘTA NIŻEJ (top: 240px) */}
                <div style={{ 
                    position: 'absolute', 
                    left: '50%', 
                    top: '240px', // ZMIANA: Było 180px, teraz 240px - zaczyna się pod napisem
                    bottom: '50px', 
                    width: '4px', 
                    background: '#cbd5e1', 
                    transform: 'translateX(-50%)',
                    borderRadius: '2px'
                }} />

                {historicalDates.map((item, index) => (
                    <div key={item.year} style={{ 
                        display: 'flex', 
                        justifyContent: index % 2 === 0 ? 'flex-end' : 'flex-start', 
                        marginBottom: '60px', 
                        position: 'relative',
                        width: '100%'
                    }}>
                        
                        {/* Kropka na osi */}
                        <div style={{ 
                            position: 'absolute', 
                            left: '50%', 
                            width: '20px', 
                            height: '20px', 
                            background: item.color, 
                            borderRadius: '50%', 
                            transform: 'translate(-50%, 10px)', 
                            zIndex: 10, 
                            border: '4px solid white',
                            boxShadow: '0 0 0 2px #cbd5e1'
                        }} />

                        {/* Karta */}
                        <div 
                            onClick={() => setDetailView(item)} 
                            style={{ 
                                width: '42%', // Zostawia miejsce na środek
                                background: 'rgba(255,255,255,0.95)', 
                                padding: '25px', 
                                borderRadius: '20px', 
                                cursor: 'pointer', 
                                transition: 'transform 0.2s', 
                                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <h2 style={{ color: item.color, margin: '0 0 5px 0', fontSize: '36px', fontWeight: '900' }}>{item.year}</h2>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#1f2937', fontWeight: '700' }}>{item.title}</h3>
                            <p style={{ color: '#4b5563', lineHeight: '1.5', fontSize: '15px', margin: 0 }}>{item.event}</p>
                            <div style={{ 
                                marginTop: '15px', 
                                fontSize: '13px', 
                                color: item.color, 
                                fontWeight: 'bold', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '5px' 
                            }}>
                                Czytaj więcej ➜
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Panel Szczegółów (Modal boczny) */}
            <HistoryDetailPanel item={detailView} onClose={() => setDetailView(null)} />
        </div>
    )
}

// =========================================================================
// WIDOK: TRASY TURYSTYCZNE (NOWY KOMPONENT)
// =========================================================================
function TouristRoutesView({ onBack }) {
    const routes = TOURIST_ROUTES;

    return (
        <div style={{ width: "100%", maxWidth: "1000px", height: "85vh", background: "rgba(255,255,255,0.7)", borderRadius: "30px", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}>
           <div style={{ padding: "15px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <button onClick={onBack} style={{ border: "none", background: "none", fontSize: "24px", cursor: "pointer" }}>🏠</button>
              <h2 style={{ margin: 0, fontWeight: "bold", background: "linear-gradient(45deg, #2563EB, #10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Trasy Turystyczne 🧭</h2>
              <span style={{width: '24px'}}></span>
           </div>
           
           <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                {routes.map((route, index) => (
                    <div key={index} style={{ 
                        background: "white", 
                        padding: "20px", 
                        borderRadius: "15px", 
                        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                        borderLeft: `5px solid ${route.color}`,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ fontSize: "30px", marginRight: "10px", flexShrink: 0 }}>{route.icon}</div>
                            <div>
                                <h3 style={{ margin: 0, color: '#333' }}>{route.title}</h3>
                                <p style={{ margin: '2px 0 0', fontSize: '14px', color: '#666' }}>{route.desc}</p>
                            </div>
                        </div>
                        
                        <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            <h4 style={{ margin: '5px 0 5px 0', fontSize: '14px', color: '#555' }}>Główne punkty trasy:</h4>
                            <ul style={{ listStyleType: 'disc', margin: 0, paddingLeft: '20px', fontSize: '14px', marginBottom: '15px' }}>
                                {route.details.map((detail, dIndex) => (
                                    <li key={dIndex} style={{ margin: '5px 0' }}>{detail}</li>
                                ))}
                            </ul>
                            <a 
                                href={route.mapLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ 
                                    padding: "8px 15px", 
                                    background: route.color, 
                                    color: "white", 
                                    border: "none", 
                                    borderRadius: "8px", 
                                    cursor: "pointer",
                                    fontWeight: 'bold',
                                    textDecoration: 'none',
                                    display: 'inline-block'
                                }}
                            >
                                Pobierz trasę (Google Maps) 🗺️
                            </a>
                        </div>
                        
                    </div>
                ))}
                <div style={{textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#888'}}>
                    <p>Wiele oficjalnych tras, w tym te poświęcone Staremu Miastu i Secesji, można pobrać jako mapy lub przewodniki ze strony Visit Bydgoszcz.</p>
                </div>
           </div>
        </div>
    );
}

// =========================================================================
// WIDOK 6: MENU GŁÓWNE
// =========================================================================
function MainMenu({ onStart }) {
  const cards = [
    { id: 'map', title: 'BydgoBOT', icon: '🏛️', desc: 'Rozmawiaj z zabytkami.', color: 'linear-gradient(135deg, #2563EB, #a18cd1)' },
    { id: 'tourist', title: 'Trasy Turystyczne', icon: '🧭', desc: 'Gotowe plany zwiedzania miasta.', color: 'linear-gradient(135deg, #4ADE80, #10B981)' },
    { id: 'quiz', title: 'Quiz Wiedzy', icon: '❓', desc: 'Co to za miejsce?', color: 'linear-gradient(135deg, #ff9966, #ff5e62)' },
    { id: 'game', title: 'Gra Miejska', icon: '🗺️', desc: 'Zgadnij gdzie jesteś!', color: 'linear-gradient(135deg, #8E2DE2, #4A00E0)' },
    { id: 'food', title: 'Gdzie zjeść?', icon: '🍔', desc: 'Gastronomia w okolicy.', color: 'linear-gradient(135deg, #DA4453, #89216B)' },
    { id: 'history', title: 'Historia Miasta', icon: '📜', desc: 'Najważniejsze daty i wydarzenia.', color: 'linear-gradient(135deg, #38bdf8, #818cf8)' },
    { id: 'gallery', title: 'Galeria', icon: '📸', desc: 'Zdjęcia miasta.', color: 'linear-gradient(135deg, #56ab2f, #a8e063)' }, 
  ];

  return (
    <div 
        className="menu-container" 
        style={{ 
            width: "100%", 
            maxWidth: "850px", 
            maxHeight: "90vh", 
            background: "rgba(255,255,255,0.7)", 
            borderRadius: "30px", 
            textAlign: "center", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
            position: 'relative', 
            overflow: 'hidden' 
        }}
    >
      <div style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          padding: '20px 30px', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
      }}>
          <div style={{fontSize:"40px",marginBottom:"5px"}}>🌊</div>
          <h1 style={{fontSize:"32px",margin:"0 0 5px 0",background:"linear-gradient(45deg, #2563EB, #a18cd1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Wirtualna Bydgoszcz</h1>
          <p style={{color:"#555",fontSize:"15px",maxWidth:"600px",marginBottom:"25px"}}>Odkryj miasto z AI. Wybierz aktywność:</p>
          
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center", maxWidth:"800px" }}>
            {cards.map(c => <div key={c.id} onClick={() => !c.disabled && onStart(c.id)} style={{ width: "200px", padding: "15px", borderRadius: "15px", background: "white", cursor: c.disabled?"not-allowed":"pointer", opacity:c.disabled?0.6:1, transition:"transform 0.2s", display:"flex", flexDirection:"column", alignItems:"center", boxShadow:"0 4px 10px rgba(0,0,0,0.05)" }} onMouseEnter={e=>!c.disabled&&(e.currentTarget.style.transform="translateY(-4px)")} onMouseLeave={e=>!c.disabled&&(e.currentTarget.style.transform="translateY(0)")}><div style={{fontSize:"32px",marginBottom:"8px"}}>{c.icon}</div><h3 style={{margin:"0 0 5px 0",color:"#333",fontSize:"18px"}}>{c.title}</h3><p style={{fontSize:"12px",color:"#666",marginBottom:"12px",minHeight:"30px",lineHeight:"1.2"}}>{c.desc}</p><button style={{padding:"6px 20px",borderRadius:"15px",border:"none",color:"white",fontWeight:"bold",fontSize:"13px",background:c.disabled?"#ccc":c.color,cursor:c.disabled?"not-allowed":"pointer"}}>{c.disabled?"Wkrótce":"Start"}</button></div>)}
          </div>
          
          <div style={{height: "40px", width: "100%", flexShrink: 0}}></div>
      </div>
    </div>
  );
}

// --- GŁÓWNY KOMPONENT APP ---
function App() {
  const [currentView, setCurrentView] = useState('intro');
  const [showCreators, setShowCreators] = useState(false);

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
      {currentView === 'history' && <HistoryView onBack={() => setCurrentView('menu')} />}
      {currentView === 'gallery' && <GalleryView onBack={() => setCurrentView('menu')} />}
      {currentView === 'tourist' && <TouristRoutesView onBack={() => setCurrentView('menu')} />}

      {/* MODAL Z TWÓRCAMI (Globalny) */}
      {showCreators && (
          <div style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              background: "rgba(0,0,0,0.4)", backdropFilter: "blur(5px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10000, animation: "fadeIn 0.3s"
          }} onClick={() => setShowCreators(false)}>
              <div style={{
                  background: "white", padding: "30px", borderRadius: "25px",
                  width: "90%", maxWidth: "320px", textAlign: "center",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                  transform: "scale(1)", animation: "zoomIn 0.3s"
              }} onClick={(e) => e.stopPropagation()}>
                  <div style={{fontSize: "40px", marginBottom: "10px"}}>👨‍💻</div>
                  <h2 style={{margin: "0 0 10px 0", color: "#333"}}>BydgoBOT Team</h2>
                  <p style={{color: "#666", fontSize: "14px", lineHeight: "1.6"}}>
                      Projekt stworzony na Hackathonie.<br/>Dziękujemy za korzystanie!
                  </p>
                  <div style={{margin: "20px 0", height: "1px", background: "#eee"}}></div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#444", fontSize: "15px", fontWeight: "500" }}>
                      <li style={{marginBottom: "5px"}}>🚀 SanokTeam</li>
                  </ul>
                  <button onClick={() => setShowCreators(false)} style={{
                      marginTop: "20px", padding: "10px 30px", background: "#2563EB", color: "white",
                      border: "none", borderRadius: "20px", cursor: "pointer", fontWeight: "bold",
                      boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)"
                  }}>Zamknij</button>
              </div>
          </div>
      )}

      {/* KLIKALNA PASTYLKA (Globalna, Fixed) */}
      <button 
          onClick={() => setShowCreators(true)}
          style={{
              position: "fixed",
              bottom: "20px",
              right: "20px", 
              background: "rgba(255, 255, 255, 0.9)",
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "12px",
              color: "#555",
              fontWeight: "bold",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              backdropFilter: "blur(5px)",
              cursor: "pointer", 
              border: "none",
              zIndex: 9999,
              transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
          © 2025 BydgoBOT Team
      </button>
    </>
  )
}

export default App