# 🌊 Wirtualna Bydgoszcz (BydgoBOT)

> **Interaktywny przewodnik po mieście napędzany sztuczną inteligencją.**

Projekt stworzony na Hackathon, łączący historię Bydgoszczy z nowoczesną technologią Google Gemini, danymi na żywo z OpenStreetMap oraz grywalizacją.

## 💡 O Projekcie

Aplikacja pozwala "ożywić" miasto. Zamiast czytać nudne tablice, użytkownik może **porozmawiać** z Marianem Rejewskim, zapytać Łuczniczkę o pogodę lub dowiedzieć się od Króla Kazimierza Wielkiego, jak zakładał miasto.

To kompletny **Hub Turystyczny**, który nie tylko uczy, ale też pomaga znaleźć restaurację w pobliżu (bez użycia płatnych API) i informuje o wydarzeniach w mieście.

## ✨ Kluczowe Funkcje

* **🤖 Czat AI z Zabytkami:** Integracja z **Google Gemini 1.5 Pro**. Każdy zabytek ma unikalną osobowość (System Prompt) i wiedzę historyczną.
* **🗣️ Synteza Mowy (TTS):** Aplikacja czyta odpowiedzi na głos, automatycznie dobierając ton męski lub żeński w zależności od postaci.
* **🗺️ Mapa Interaktywna:** Wykorzystanie **Leaflet** i niestandardowych map kafelkowych.
* **🍔 Gdzie zjeść? (Live Data):** Pobieranie listy restauracji w czasie rzeczywistym z **OpenStreetMap (Overpass API)**. Dane są zawsze aktualne i darmowe.
* **🚗 Darmowa Nawigacja:** Integracja linków nawigacyjnych z OpenStreetMap.
* **❓ Quiz Wiedzy:** Gra edukacyjna z systemem punktacji, testująca wiedzę o zabytkach.
* **📰 Aktualności:** Pobieranie najnowszych wydarzeń z RSS portalu *Bydgoszcz Informuje*.
* **🎨 Nowoczesny UI:** Interfejs w stylu "Glassmorphism" (efekt szkła), w pełni responsywny (RWD).

## 🛠️ Technologie

**Frontend:**
* React 18 + Vite
* React Leaflet (Mapy)
* CSS Modules + Flexbox/Grid

**Backend:**
* Node.js + Express
* Google Generative AI SDK (Gemini)

**Dane i API:**
* Overpass API (OpenStreetMap Data)
* RSS2JSON (News integration)

---

## 🚀 Jak uruchomić projekt?

Postępuj zgodnie z instrukcją, aby uruchomić aplikację lokalnie.

### 1. Klonowanie repozytorium

``` bash
git clone https://github.com/hundajejlols/bydgoszcz-hackathon.git
cd bydgoszcz-hackathon
```

------------------------------------------------------------------------

## 🔧 Backend

``` bash
cd backend
npm install
```

Utwórz plik `.env`:

    GEMINI_API_KEY=TWOJ_TAJNY_KLUCZ_API

Uruchom serwer:

``` bash
node server.js
```

------------------------------------------------------------------------

## 🎨 Frontend

Otwórz nowy terminal:

``` bash
cd frontend
npm install
npm run dev
```

Aplikacja dostępna będzie pod adresem:\
👉 **http://localhost:5173**

------------------------------------------------------------------------

## ❤️ Autorzy

© 2025 **BydgoBOT Team**\
Stworzono z miłości do Bydgoszczy i nowych technologii.
