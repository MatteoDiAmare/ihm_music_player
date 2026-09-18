# ihm_music_player

Ett musikspelarprojekt för **Teknik för digitala plattformar**. Här finns en färdig server med ett musikbibliotek och ett API. Ni bygger gränssnittet och får det att fungera med HTML, CSS och JavaScript.

## Arbeta lokalt med GitHub Desktop och Visual Studio Code

Ni behöver GitHub Desktop, Visual Studio Code och Node.js 20 eller senare på datorn.

1. Öppna [ihm_music_player på GitHub](https://github.com/MatteoDiAmare/ihm_music_player).
2. Klicka **Code → Open with GitHub Desktop**. I GitHub Desktop väljer ni var projektmappen ska ligga på datorn och klickar **Clone**.
   - Det går också att välja **File → Clone repository → URL** i GitHub Desktop och klistra in `https://github.com/MatteoDiAmare/ihm_music_player`.
3. Öppna projektet i Visual Studio Code via **Repository → Open in Visual Studio Code** i GitHub Desktop. Öppna mappen `ihm_music_player`, inte en enskild fil.
4. Öppna terminalen i VS Code (**Terminal → New Terminal**). Kör `node --version` för att se att Node.js finns och sedan `npm start`.
5. Öppna `http://localhost:3000/api/health` i webbläsaren. Om ni får ett JSON-svar kör servern. `/api/tracks` visar låtarna, även om listan är tom från början.
6. Lägg en MP3-fil i `music/` och ladda om `http://localhost:3000/api/tracks`. Nu ska låten finnas i listan.
7. Bygg era klientfiler i `public/`. När ni har skapat `public/index.html` öppnar ni `http://localhost:3000/` för att se sidan.

**Observera:** Det finns ännu ingen färdig startsida på `/`. Det är gränssnittet ni ska bygga. Börja med att kontrollera API:t i steg 5.

### Clone, fork och template: vad är skillnaden?

| Väg | Vad händer? | När är den användbar? |
| --- | --- | --- |
| **Clone** | Ni hämtar ett befintligt repo till er dator. Kopian har kvar kopplingen till GitHub-repot. | För att arbeta lokalt i GitHub Desktop och VS Code. Clone ger inte automatiskt rätt att pusha till någon annans repo. |
| **Fork** | Ni skapar ett eget repo på GitHub som kopplas till originalet. Sedan kan ni klona er fork till datorn och pusha till den. | Ni har redan provat fork. Använd det om ni vill ha en egen GitHub-kopia av musikspelaren med koppling till originalet. |
| **Template** | Ni skapar ett nytt, fristående repo från en mall. Det blir ert eget projekt utan fork-koppling till mallen. | Så skapade ni era projekt från starter-repot tidigare. |

**Prova skillnaden:** Titta i GitHub Desktop under **Repository → Repository settings → Remote**. Vilket GitHub-repo är er lokala mapp kopplad till? Om ni klonade kursens original kan ni utveckla och testa lokalt, men för att pusha till ett eget repo behöver ni en fork eller skrivrättighet till originalet. Skapa inte flera kopior av misstag: bestäm vilket repo ni vill fortsätta arbeta i.

## Arbeta i Codespaces

Det här spåret är för er som använder Codespaces i övningen. Det är samma repo och samma server, men VS Code och terminalen öppnas i webbläsaren.

1. Öppna repot på GitHub och välj **Code → Codespaces → Create codespace on main**. Om ni vill pusha egna ändringar, skapa först en fork och öppna en Codespace från den.
2. Kör `npm start` i terminalen.
3. Öppna fliken **Ports** och välj port **3000**. Öppna den vidarebefordrade adressen i webbläsaren. Testa `/api/health` och `/api/tracks` på den adressen.
4. Lägg en MP3-fil i `music/` och ladda om `/api/tracks`. Bygg sedan klienten i `public/`.

I Codespaces ersätts `http://localhost:3000` av adressen till er vidarebefordrade port när ni öppnar sidan utanför Codespaces. API-adresser som `fetch('/api/tracks')` fungerar i båda miljöerna när klienten visas av samma server.

## Musik och lagring

Serverns anrop finns i [SERVER_API.md](SERVER_API.md). Ni kan lägga MP3-filer i `music/` eller senare bygga en uppladdningsknapp som skickar en MP3 till `POST /api/tracks`. Uppladdningar sparas i `data/uploads/`, som inte följer med Git. Låtar i `music/` kan däremot följa med ett commit. Lägg bara musik ni har rätt att dela i ett offentligt repo.

Labb 4–6 hjälper er att undersöka vad som sparas i **webbläsarens** `localStorage`, vad ett `visitorId` betyder och hur ett `play`-event når servern. Serverns filer och webbläsarens lagring är två olika saker. På torsdag visar grupperna sina lösningar i Teams.
