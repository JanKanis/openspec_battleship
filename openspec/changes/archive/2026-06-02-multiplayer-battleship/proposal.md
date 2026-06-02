## Why

Een leerproject om multiplayer browser-gebaseerde spelontwikkeling te verkennen met Vue 3 + TypeScript en PeerJS voor P2P networking. Het project dient als vergelijkingsbasis voor toekomstige implementaties in andere talen/frameworks (bijv. Rust/Leptos/WASM).

## What Changes

- Nieuw project: een volledig speelbare multiplayer Battleship webapplicatie
- Statisch gehost (GitHub Pages of vergelijkbaar), geen beheerde server
- P2P verbinding via PeerJS (WebRTC) tussen twee spelers
- Vue 3 + TypeScript + Vite als frontend stack
- Klik-gebaseerde UI die goed werkt op muis, touchpad en mobiel

## Capabilities

### New Capabilities

- `game-board`: 10×10 speelbord rendering met visuele states (water, schip, raak, mis) en hover-preview bij plaatsing
- `ship-placement`: Schepen selecteren en via klikken plaatsen op het bord, met rotatie (horizontaal/verticaal)
- `p2p-connection`: PeerJS-gebaseerde verbinding tussen twee spelers via gedeelde peer-ID of code
- `game-session`: Spelverloop beheren — plaatsingsfase, beurtenwisseling, schietfase, winconditie
- `game-ui`: Lobby/verbindingsscherm, spelstatus, beurt-indicatie en eindscherm

### Modified Capabilities

## Impact

- Nieuw project, geen bestaande code geraakt
- Afhankelijkheden: Vue 3, TypeScript, Vite, PeerJS
- Hosting: statische bestanden (geen server-side runtime)
