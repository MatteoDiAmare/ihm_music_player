# ihm_music_player

Musikspelare för kursen Teknik för digitala plattformar. Servern är klar; grupperna bygger gränssnittet och JavaScript-klienten.

## Börja i Codespaces

1. Kör `npm start` i terminalen.
2. Öppna port **3000** i Codespaces.
3. Lägg en MP3-fil i `music/` och öppna `/api/tracks` för att se biblioteket.
4. Läs [SERVER_API.md](SERVER_API.md) för alla anrop och exempel.
5. Bygg klienten i `public/` så att samma server kan visa sidan på `/`.

Ljudfiler som laddas upp via API:t sparas i `data/uploads/`. Den mappen följer inte med Git. Lägg bara musik du har rätt att dela i den publika `music/`-mappen.

Labb 4–6 ger byggstenarna för att spara ett val i webbläsaren, förstå ett `visitorId` och följa ett `play`-event från klient till server. På torsdag visas lösningarna i Teams.
