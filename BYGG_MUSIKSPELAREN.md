# Bygg musikspelaren steg för steg

I den här övningen bygger ni en enkel klient till den färdiga musikservern. Målet är inte att skriva allt från minnet. Målet är att kunna följa kedjan, prova en del i taget och förklara vad ni ser.

Ni kommer att använda:

- **HTML** för det som syns och går att klicka på.
- **JavaScript** för beteendet i webbläsaren.
- **GET** för att hämta musikbiblioteket från servern.
- **`localStorage`** för att spara ett id och den senast spelade låten i webbläsaren.
- **POST** för att skicka ett `play`-event till servern.
- **DevTools** för att kontrollera vad som faktiskt händer.

Ni får gärna klistra in koden. Stanna efter varje steg, testa och försök beskriva vad varje del åstadkommer innan ni går vidare.

## Så hänger delarna ihop

```text
Användaren klickar
        ↓
JavaScript läser handlingen
        ↓
Klienten hämtar eller skickar data med fetch()
        ↓
Servern svarar
        ↓
JavaScript uppdaterar HTML-sidan
```

Detta fortsätter det ni gjorde förra veckan. Då undersökte ni **klient, server, request och response**. Nu använder ni samma kedja för att bygga något själva. Samtidigt kopplar ni arbetet till veckans begrepp: **storage, identifiering och tracking-events**.

---

## Innan ni börjar

1. Öppna projektmappen i Visual Studio Code eller Codespaces.
2. Öppna terminalen i projektmappen.
3. Starta servern:

   ```bash
   npm start
   ```

   Om PowerShell i Windows inte accepterar kommandot kan ni använda:

   ```powershell
   npm.cmd start
   ```

4. Öppna `http://localhost:3000/api/health` i webbläsaren.
5. Öppna sedan `http://localhost:3000/api/tracks`.

Om servern fungerar får ni JSON som svar. `/api/tracks` kan vara tom om ingen MP3-fil finns i biblioteket. Lägg då en MP3-fil i mappen `music/` och ladda om sidan.

I Codespaces använder ni adressen som hör till port 3000. Resten av adresserna fungerar på samma sätt.

### Stanna upp

- Vad observerar ni i webbläsaren?
- Är detta en HTML-sida eller data i JSON-format?
- Vilken del svarar: klienten eller servern?

---

## Steg 1: bygg sidans HTML

Skapa mappen `public` om den saknas. Skapa sedan filen `public/index.html` och klistra in:

```html
<!doctype html>
<html lang="sv">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vår musikspelare</title>
    <script src="app.js" defer></script>
  </head>

  <body>
    <header>
      <h1>Vår musikspelare</h1>
      <p>Musik från vårt eget bibliotek</p>
    </header>

    <main>
      <p id="status">Klienten har startat.</p>

      <section>
        <h2>Låtar</h2>
        <div id="track-list"></div>
      </section>

      <section>
        <h2>Nu spelas</h2>
        <p id="now-playing">Ingen låt vald</p>
        <audio id="audio-player" controls></audio>
      </section>
    </main>
  </body>
</html>
```

Skapa även en tom fil som heter `public/app.js`. Öppna `http://localhost:3000/`.

### Vad uppnår vi?

HTML beskriver sidans **struktur**. Elementen `<h1>`, `<p>`, `<div>` och `<audio>` får olika uppgifter. Attributet `id` ger vissa element namn som JavaScript kan använda senare.

`defer` gör att webbläsaren väntar med att köra `app.js` tills HTML-strukturen har lästs in.

### Undersök

1. Öppna DevTools och välj **Elements**.
2. Leta upp elementet med `id="track-list"`.
3. Jämför koden i VS Code med det webbläsaren visar i Elements.

Det ni ser i Elements är webbläsarens **DOM**, alltså webbläsarens representation av HTML-dokumentet.

---

## Steg 2: låt JavaScript hitta HTML-elementen

Klistra in detta i `public/app.js`:

```js
const statusText = document.querySelector('#status');
const trackList = document.querySelector('#track-list');
const nowPlaying = document.querySelector('#now-playing');
const audioPlayer = document.querySelector('#audio-player');

statusText.textContent = 'JavaScript har hittat HTML-elementen.';

console.log('Klienten är igång');
```

Ladda om sidan.

### Vad sker?

`document.querySelector()` söker i DOM:en. Variablerna ger oss referenser till de HTML-element som JavaScript senare ska ändra.

Raden med `textContent` ändrar texten i ett befintligt HTML-element. `console.log()` skriver i DevTools under **Console**, inte på själva sidan.

### Stanna upp

- Vilken text ändrades?
- Var syns meddelandet från `console.log()`?
- Vad händer om ni ändrar `#status` till ett id som inte finns?

Om `querySelector()` inte hittar elementet blir resultatet `null`. Ett senare försök att använda elementet kan då skapa ett fel i Console.

---

## Steg 3: hämta låtar med GET

Lägg detta **under den befintliga koden** i `app.js`:

```js
let tracks = [];

async function loadTracks() {
  statusText.textContent = 'Hämtar låtar från servern...';

  const response = await fetch('/api/tracks');
  tracks = await response.json();

  console.log('Svar från GET /api/tracks:', tracks);
  renderTracks();

  statusText.textContent = `${tracks.length} låtar hämtades.`;
}

function renderTracks() {
  trackList.innerHTML = '';

  for (const track of tracks) {
    const row = document.createElement('div');
    const title = document.createElement('span');

    title.textContent = `${track.title} – ${track.artist}`;
    row.append(title);
    trackList.append(row);
  }
}

loadTracks();
```

Ladda om sidan. Nu ska låtarna från servern visas i HTML-sidan.

### Vad sker?

`fetch('/api/tracks')` skapar en HTTP-request. Eftersom vi inte anger någon annan metod blir det en **GET**.

```text
Klient:  GET /api/tracks
Server:  200 OK + en lista med låtar som JSON
Klient:  gör om JSON till JavaScript-värden
Klient:  skapar nya HTML-element i DOM:en
```

`await` betyder att funktionen väntar på svaret innan den fortsätter. `response.json()` tolkar svarets JSON. Variabeln `tracks` innehåller sedan en array med objekt.

Varje låtobjekt innehåller bland annat:

```js
{
  id: 'ett-unikt-id',
  title: 'Låtens titel',
  artist: 'Musikbiblioteket',
  audioUrl: '/api/tracks/ett-unikt-id/audio'
}
```

### Undersök GET-anropet

1. Öppna DevTools och välj **Network**.
2. Ladda om sidan.
3. Klicka på anropet som heter `tracks`.
4. Leta efter:
   - **Request Method:** GET
   - **Status Code:** 200
   - **Response:** listan med låtar

Här kan ni skilja mellan observation och tolkning:

- **Observation:** Network visar en GET-request till `/api/tracks` och status 200.
- **Tolkning:** Servern tog emot requesten och skickade tillbaka musikbiblioteket.

---

## Steg 4: skapa en knapp och spela en låt

Ersätt funktionen `renderTracks()` med denna version:

```js
function renderTracks() {
  trackList.innerHTML = '';

  for (const track of tracks) {
    const row = document.createElement('div');
    const title = document.createElement('span');
    const playButton = document.createElement('button');

    title.textContent = `${track.title} – ${track.artist}`;
    playButton.textContent = 'Spela';

    playButton.addEventListener('click', function () {
      playTrack(track);
    });

    row.append(title, playButton);
    trackList.append(row);
  }
}
```

Lägg sedan till denna funktion under `renderTracks()`:

```js
async function playTrack(track) {
  audioPlayer.src = track.audioUrl;
  nowPlaying.textContent = `${track.title} – ${track.artist}`;

  await audioPlayer.play();
  statusText.textContent = `Spelar ${track.title}`;
}
```

Ladda om och tryck på **Spela**.

### Vad sker?

Varje knapp får en **event listener**. Den väntar på händelsen `click`. När klicket sker körs funktionen och det valda låtobjektet skickas till `playTrack()`.

`audioPlayer.src` pekar ut adressen till ljudfilen. Webbläsarens `<audio>`-element hämtar och spelar sedan filen.

Detta är samma mönster som i förra veckans JavaScript-labb:

```text
handling → event listener → funktion → förändring i gränssnittet
```

### Undersök

- Ser ni en ny request i Network när musiken startar?
- Vilken adress hämtas?
- Vilket HTML-element innehåller kontrollerna för ljudet?

Servern skickar ljudfilen. Det är webbläsaren och datorns valda ljudutgång som spelar upp den.

---

## Steg 5: skapa och hämta ett id från localStorage

Lägg följande kod **före** `loadTracks()` längst ned i filen:

```js
function getVisitorId() {
  let visitorId = localStorage.getItem('visitorId');

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('visitorId', visitorId);
  }

  return visitorId;
}

const visitorId = getVisitorId();
console.log('Webbläsarens visitorId:', visitorId);
```

Ladda om sidan flera gånger.

### Vad sker?

`localStorage.getItem('visitorId')` försöker **hämta** ett värde från webbläsarens lagring.

- Om värdet finns används samma id igen.
- Om värdet saknas skapas ett nytt id.
- `localStorage.setItem()` sparar det nya värdet.

Detta är kopplingen till **storage och identifiering**. Servern har inte automatiskt tillgång till `localStorage`. JavaScript måste läsa värdet och välja att skicka det.

### Undersök storage

1. Öppna DevTools.
2. Välj **Application**.
3. Öppna **Local Storage** och välj sidans adress.
4. Leta efter nyckeln `visitorId`.
5. Ladda om sidan och kontrollera om värdet är detsamma.
6. Radera värdet och ladda om igen.

### Vad kan vi säga?

Ett `visitorId` kan hjälpa systemet att koppla samman händelser från samma webbläsarlagring. Det bevisar inte vilken fysisk person som använde datorn. Två personer kan dela samma dator, och samma person kan använda flera enheter eller radera lagringen.

---

## Steg 6: skicka ett play-event med POST

Lägg till denna funktion i `app.js`:

```js
async function sendPlayEvent(track) {
  const eventData = {
    type: 'play',
    trackId: track.id,
    visitorId: visitorId
  };

  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  });

  const result = await response.json();
  console.log('Svar från POST /api/events:', result);
}
```

Lägg till följande rad sist i funktionen `playTrack()`:

```js
await sendPlayEvent(track);
```

Funktionen ska nu se ut så här:

```js
async function playTrack(track) {
  audioPlayer.src = track.audioUrl;
  nowPlaying.textContent = `${track.title} – ${track.artist}`;

  await audioPlayer.play();
  statusText.textContent = `Spelar ${track.title}`;

  await sendPlayEvent(track);
}
```

Ladda om sidan och spela en låt.

### Vad sker?

GET-anropet tidigare bad servern att lämna ut data. POST-anropet skickar data till servern.

```text
Klick på Spela
      ↓
JavaScript bygger ett eventobjekt
      ↓
visitorId läses från webbläsarens storage
      ↓
POST /api/events skickar objektet som JSON
      ↓
Servern kontrollerar och sparar eventet
      ↓
Servern svarar med 201 Created
```

`JSON.stringify()` gör om JavaScript-objektet till JSON-text som kan skickas i requestens body.

### Undersök POST-anropet

1. Öppna **Network** och spela en låt.
2. Klicka på requesten `events`.
3. Leta efter:
   - **Request Method:** POST
   - **Status Code:** 201
   - **Payload/Request:** `type`, `trackId` och `visitorId`
   - **Response:** serverns kvittens
4. Öppna `http://localhost:3000/api/events` och jämför med det ni skickade.

Här ser ni ett enkelt **tracking-event**. Händelsen i gränssnittet och posten på servern är inte samma sak:

- Klicket och uppspelningen sker i klienten.
- JavaScript skapar en beskrivning av händelsen.
- Eventet skickas med en separat request.
- Serverns kvittens visar att eventet togs emot.

Musiken kan alltså fungera även om tracking-requesten misslyckas. På samma sätt kan ett köp lyckas även om ett `purchase`-event försvinner.

---

## Steg 7: spara senast spelad låt

Lägg till denna rad i `playTrack()` efter att musiken har startat:

```js
localStorage.setItem('lastTrackId', track.id);
```

Lägg sedan till detta i slutet av `loadTracks()`, direkt efter `renderTracks()`:

```js
const lastTrackId = localStorage.getItem('lastTrackId');
const lastTrack = tracks.find(function (track) {
  return track.id === lastTrackId;
});

if (lastTrack) {
  nowPlaying.textContent = `Senast spelad: ${lastTrack.title}`;
}
```

Spela en låt och ladda om sidan.

### Vad uppnår vi?

Webbläsaren kommer ihåg vilket låt-id som senast valdes. Efter omladdningen hämtar JavaScript id:t från `localStorage` och letar upp motsvarande låt i serverns aktuella låtlista.

Detta visar att två lagringsplatser samverkar:

- **Servern** har musikbiblioteket.
- **Webbläsaren** har `lastTrackId` och `visitorId`.

Ett sparat `lastTrackId` innehåller inte själva MP3-filen. Det är bara en identifierare som behöver kopplas till data från servern.

---

## Minsta fungerande resultat

Ni har en fungerande första version när ni kan visa följande:

- Sidan öppnas från `http://localhost:3000/` eller Codespaces-adressen.
- Klienten hämtar låtar med `GET /api/tracks`.
- Låtarna visas i HTML-sidan.
- En knapp startar uppspelning.
- Ett `visitorId` sparas och hämtas från `localStorage`.
- Ett play-event skickas med `POST /api/events`.
- Ni kan visa GET, POST och ljudhämtningen i Network.

Ni behöver också kunna förklara kedjan med egna ord. Använd gärna följande frågor:

1. Vad gjorde användaren?
2. Vad gjorde JavaScript?
3. Vad lästes från webbläsarens storage?
4. Vilken request skickades?
5. Vad svarade servern?
6. Vad vet vi utifrån observationen?
7. Vad kan vi inte avgöra?

---

## Om något inte fungerar

Kontrollera ett led i taget:

1. Kör servern fortfarande i terminalen?
2. Fungerar `/api/health`?
3. Returnerar `/api/tracks` minst en låt?
4. Finns fel i Console?
5. Skickas requesten i Network?
6. Vilken statuskod får requesten?
7. Stämmer elementens `id` i HTML med `querySelector()` i JavaScript?

Ändra en sak i taget och testa igen. Dokumentera först vad ni observerar. Förklara orsaken när ni har tillräckligt med stöd.

---

## När grundversionen fungerar

Nu får ni utforma er egen lösning. Några möjliga fortsättningar är:

- Skapa egen design med CSS.
- Lägg till sökning eller filtrering.
- Lägg till paus, nästa och föregående låt.
- Visa speltid och en progressindikator.
- Lägg till en filväljare och använd `POST /api/tracks` för MP3-uppladdning.
- Visa serverns senaste events i gränssnittet.
- Undersök vad som händer om storage raderas eller servern startas om.

Serverns samtliga adresser och exempel finns i [SERVER_API.md](SERVER_API.md).
