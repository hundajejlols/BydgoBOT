# 🌊 Wirtualna Bydgoszcz (BydgoBOT)

> **Twój osobisty przewodnik po Bydgoszczy napędzany sztuczną inteligencją.**

🚀 **Projekt stworzony specjalnie na Hackathon Bydgoszcz 2025.**

Aplikacja łączy historię miasta z najnowszą technologią AI (Google Gemini), otwartymi danymi (OpenStreetMap) oraz grywalizacją. To kompletny **Hub Turystyczny**, który pozwala odkrywać miasto na nowo – nowocześnie, interaktywnie i z pasją.

---

## 💡 O Projekcie

BydgoBOT to nie jest zwykła mapa. To narzędzie, które "ożywia" miasto.

* Chcesz porozmawiać z **Marianem Rejewskim** o Enigmie?
* Szukasz najlepszej **pizzy w okolicy** bez reklam?
* Chcesz sprawdzić swoją wiedzę w **Grze Miejskiej**?

Wszystko to znajdziesz w jednej, estetycznej aplikacji webowej.

---

## ✨ Kluczowe Funkcje

### 🏛️ 1. Czat AI z Legendami Miasta
Rozmawiaj z historycznymi postaciami i symbolami Bydgoszczy (m.in. Łuczniczka, Król Kazimierz Wielki, Pan Twardowski). Każda postać ma unikalną osobowość dzięki zaawansowanym promptom systemowym **Google Gemini**.

### 🗺️ 2. Gra Miejska "Zgadnij gdzie jesteś"
Interaktywna gra w stylu GeoGuessr. Aplikacja pokazuje losowe miejsce w Bydgoszczy (widok Street View), a Twoim zadaniem jest wskazanie go na mapie. Im bliżej, tym więcej punktów!

### 🍔 3. Gdzie zjeść? (Live Data)
Inteligentna wyszukiwarka gastronomii. Aplikacja pobiera dane **na żywo** z OpenStreetMap (Overpass API). Pokazuje tylko otwarte i istniejące lokale, sortowane według kategorii (Kawiarnie, Fast Food, Restauracje).

### 📜 4. Interaktywna Historia Miasta
Oś czasu przedstawiona w nowoczesnej formie. Przewijaj historię od założenia grodu aż po współczesność, z pięknymi ilustracjami i ciekawostkami.

### 🧭 5. Trasy Turystyczne
Gotowe scenariusze zwiedzania (np. Szlak Wody i Przemysłu, Secesja Bydgoska) z bezpośrednimi linkami do nawigacji Google Maps.

### 📸 6. Galeria i Quiz
Sprawdź swoją wiedzę o zabytkach w Quizie lub zrelaksuj się, przeglądając najpiękniejsze ujęcia miasta w Galerii.

---

## 🛠️ Technologie

Projekt zbudowany w nowoczesnym stacku technologicznym:

* **Frontend:** React 18 + Vite (Szybkość i responsywność)
* **Mapy:** React Leaflet + OpenStreetMap
* **AI:** Google Generative AI SDK (Model Gemini Flash)
* **Data:** Overpass API (Dynamiczne dane o miejscach)
* **Backend:** Node.js + Express (Proxy dla zapytań AI)
* **Styling:** CSS3 (Glassmorphism UI, RWD)

---

## 🚀 Jak uruchomić projekt?

Wymagane: Node.js zainstalowany na komputerze.

### 1. Klonowanie repozytorium

```bash
git clone [https://github.com/twoj-repo/bydgoszcz-hackathon.git](https://github.com/twoj-repo/bydgoszcz-hackathon.git)
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
