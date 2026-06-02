## 1. Project Setup

- [x] 1.1 Initialiseer Vue 3 + TypeScript + Vite project via `npm create vue@latest`
- [x] 1.2 Voeg PeerJS toe als dependency (`npm install peerjs`)
- [x] 1.3 Configureer Vite voor static hosting (base path voor GitHub Pages)
- [x] 1.4 Verwijder boilerplate componenten en reset App.vue naar leeg startpunt
- [x] 1.5 Configureer GitHub Actions workflow voor automatische deploy naar GitHub Pages

## 2. TypeScript Types en Spelmodel

- [x] 2.1 Definieer types: `Cell`, `CellState`, `Ship`, `ShipType`, `Orientation`, `Board`
- [x] 2.2 Definieer `GamePhase` type (connecting, placement, playing, gameover)
- [x] 2.3 Definieer `GameMessage` discriminated union voor alle PeerJS berichten
- [x] 2.4 Implementeer pure spellogica functies: `createBoard`, `placeShip`, `isValidPlacement`
- [x] 2.5 Implementeer `fireShot(board, x, y)` en `checkWin(board)` functies

## 3. PeerJS Verbinding

- [x] 3.1 Maak `usePeerConnection` composable die PeerJS initialiseert
- [x] 3.2 Implementeer host-flow: genereer peer-ID, wacht op verbinding, toon game-code
- [x] 3.3 Implementeer guest-flow: verbind met peer-ID van host
- [x] 3.4 Implementeer `sendMessage` en `onMessage` handlers met getypte `GameMessage`
- [x] 3.5 Implementeer verbindingsverlies detectie en foutmelding

## 4. Startscherm

- [x] 4.1 Maak `HomeView` component met knoppen "Nieuw spel" en "Verbinden"
- [x] 4.2 Implementeer host-pad: toon game-code met kopieer-knop en wacht-status
- [x] 4.3 Implementeer guest-pad: invoerveld voor game-code en verbinden knop
- [x] 4.4 Navigeer automatisch naar plaatsingsfase zodra beide spelers verbonden zijn

## 5. Spelbord Component

- [x] 5.1 Maak `GameBoard` component die een 10×10 grid rendert met kolom/rij labels
- [x] 5.2 Implementeer cel-rendering met visuele states (water, schip, raak, mis)
- [x] 5.3 Voeg hover-preview toe: toon schip-overlay op cellen bij plaatsing
- [x] 5.4 Kleur overlay rood bij ongeldige positie, groen/blauw bij geldige positie
- [x] 5.5 Maak het bord klikbaar configureerbaar (prop) voor schiet- vs plaatsingsfase

## 6. Plaatsingsfase

- [x] 6.1 Maak `PlacementView` component met eigen bord en schepen-lijst
- [x] 6.2 Render schepen-lijst met naam, grootte en geplaatst/ongeplaatst status
- [x] 6.3 Implementeer schip-selectie via klik op lijst
- [x] 6.4 Implementeer rotatie via R-toets en roteer-knop
- [x] 6.5 Implementeer schip plaatsen op bord bij klik op geldige cel
- [x] 6.6 Toon "Klaar" knop zodra alle 5 schepen geplaatst zijn
- [x] 6.7 Stuur `ready` bericht naar tegenstander na klikken op "Klaar"
- [x] 6.8 Wacht op `ready` van tegenstander voor overgang naar schietfase

## 7. Schietfase

- [x] 7.1 Maak `GameView` component met eigen bord en tegenstander-bord naast elkaar
- [x] 7.2 Toon beurt-indicatie: "Jouw beurt" of "Tegenstander is aan de beurt"
- [x] 7.3 Implementeer schieten: klik op tegenstander-bord verstuurt `shot` bericht (host valideert)
- [x] 7.4 Host verwerkt inkomend `shot`, berekent resultaat, stuurt `shot-result` terug
- [x] 7.5 Verwerk `shot-result`: update borden en wissel beurt (of behoud bij raak)
- [x] 7.6 Toon melding bij gezonken schip
- [x] 7.7 Stuur `game-over` bericht zodra alle schepen van een speler gezonken zijn

## 8. Eindscherm en Responsive Layout

- [x] 8.1 Maak `GameOverView` component met winnaar-tekst en "Opnieuw spelen" knop
- [x] 8.2 Implementeer "Opnieuw spelen": reset state en navigeer terug naar startscherm
- [x] 8.3 Voeg responsive CSS toe: borden gestapeld op schermen smaller dan 768px
- [x] 8.4 Test bediening op touchpad, muis en mobiel touch
