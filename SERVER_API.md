# Music API

Servern är färdig för er att använda. Ni bygger själva gränssnittet och koden i webbläsaren. Servern använder bara Node.js, utan `npm install`.

## Starta i Codespaces eller lokalt

Kör `npm start` och öppna port **3000**. Om porten öppnas i Codespaces använder ni den vidarebefordrade adressen till **er egen** server. Lägg klientens filer i `public/` så att samma server visar sidan och levererar API:t.

Servern kan starta med ett tomt bibliotek. Lägg en egen `.mp3` i `music/` och ladda om låtlistan. Servern läser mappen vid varje förfrågan. En låtfil som ni lägger i `music/` kan senare följa med ett Git-commit. Ladda bara upp musik ni har rätt att dela i ett offentligt repo.

Alternativt kan klienten ladda upp en MP3 med `POST /api/tracks`. Uppladdningar sparas i `data/uploads/` och syns i biblioteket direkt. `data/` är ignorerad av Git: filerna finns kvar i arbetsytan, men följer inte med om ni skapar en ny Codespace eller klonar repot på en annan dator.

## Kontrakt för klienten

| Metod och adress | Vad ni får eller skickar |
| --- | --- |
| `GET /api/health` | `{ "status": "ok", "tracks": 2 }` |
| `GET /api/tracks` | En lista med `{ id, title, artist, audioUrl, source }` |
| `GET /api/tracks/:id/audio` | MP3-ljudfil som kan sättas som `<audio src>` |
| `POST /api/tracks` | MP3 som rå body, med `X-Filename: exempel.mp3`. Högst 20 MB. Returnerar låten som JSON. |
| `POST /api/events` | JSON: `{ "type": "play", "trackId": "...", "visitorId": "..." }` |
| `GET /api/events` | Senaste 30 spelningar, sparade i serverns `data/events.jsonl` |

Exempel på upphämtning:

```js
const response = await fetch('/api/tracks');
const tracks = await response.json();
console.log(tracks);
```

Exempel på uppladdning med ett `<input type="file">` där användaren valt en fil:

```js
const file = fileInput.files[0];
const response = await fetch('/api/tracks', {
  method: 'POST',
  headers: { 'X-Filename': file.name },
  body: file
});
const addedTrack = await response.json();
```

En MP3 som spelar i klientens `<audio>` går via klientens och operativsystemets ljudutgång. Servern skickar filen, men spelar inte själv upp musiken.

## Frågor att utforska under labbarna

- Vad ligger i serverns filsystem efter en uppladdning? Vad ligger i webbläsarens `localStorage` om ni sparar den senast valda låten där?
- Vad händer efter omladdning av sidan? Vad händer efter omstart av servern?
- Vad skickar klienten när någon trycker Play? Vad visar Network-fliken och `/api/events`?
- Om `visitorId` saknas, vad kan servern veta om vem som spelade låten?

För uppgiftens första fungerande version räcker det att hämta låtlistan, visa låttitlarna och spela en vald låt. Uppladdning och event är steg att bygga vidare med.
