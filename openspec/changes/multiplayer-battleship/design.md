## Context

Nieuw project: een multiplayer Battleship webapplicatie die volledig statisch gehost kan worden. Twee spelers verbinden direct via PeerJS (WebRTC). De stack is Vue 3 + TypeScript + Vite. Het project is primair een leerproject en dient als referentie-implementatie voor toekomstige vergelijkingen met andere stacks (Rust/Leptos/WASM).

## Goals / Non-Goals

**Goals:**
- Werkende 2-speler Battleship implementatie in de browser
- P2P verbinding via PeerJS (geen beheerde backend)
- Statisch te hosten (GitHub Pages of Netlify)
- Goed bruikbaar op muis, touchpad en mobiel (klik-gebaseerd)
- Leesbare, goed gestructureerde codebase als vergelijkingsbasis

**Non-Goals:**
- Accounts, authenticatie of persistentie
- Meer dan 2 spelers
- Spectator modus
- AI tegenstander
- Animaties of geavanceerde graphics
- Ondersteuning voor custom spelregels

## Decisions

### D1: PeerJS voor P2P verbinding

**Keuze:** PeerJS met hun publieke signaling server.

**Rationale:** PeerJS abstraheert WebRTC signaling (SDP offer/answer uitwisseling) naar een simpel peer-ID model. Speler A deelt een code, speler B verbindt — daarna gaat alle communicatie direct P2P. Geen eigen server nodig.

**Alternatieven overwogen:**
- Handmatige WebRTC signaling via copy-paste: werkt, maar slechte UX
- Eigen signaling server: meer controle, maar vereist beheerde infrastructuur
- Firebase/Supabase: eenvoudiger, maar alle data via hun servers (geen P2P)

**Trade-off:** Afhankelijk van de gratis PeerJS public server voor initiële verbinding. Na verbinding volledig P2P.

### D2: Vue 3 Composition API + TypeScript

**Keuze:** Vue 3 met `<script setup>` Composition API syntax en TypeScript.

**Rationale:** Composition API groepeert gerelateerde logica (bijv. alles over het bord in één composable), wat leesbaarder is dan Options API voor complexere state. TypeScript helpt bij het modelleren van de spelstate (grid, schepen, beurten).

**Alternatieven overwogen:**
- Options API: vertrouwder voor Vue 2 gebruikers, maar minder geschikt voor herbruikbare logica
- Vanilla JS: minder boilerplate, maar handmatige DOM sync bij state changes

### D3: Spelstate alleen in de host

**Keuze:** De speler die de lobby aanmaakt (host) is authoritative voor de spelstate. De guest stuurt alleen acties (schoten), de host valideert en stuurt updates terug.

**Rationale:** Vermijdt conflicten bij gelijktijdige acties, simpeler te implementeren dan gedistribueerde state.

**Alternatieven overwogen:**
- Beide peers houden eigen state bij: risico op desync, complexere reconciliatie
- Volledig symmetrisch: beide peers valideren — overkill voor een turn-based spel

### D4: Spelberichten als getypte JSON over PeerJS DataChannel

**Keuze:** Berichten zijn getypte TypeScript union types, geserialiseerd als JSON.

```
type GameMessage =
  | { type: 'ready' }
  | { type: 'shot', x: number, y: number }
  | { type: 'shot-result', x: number, y: number, hit: boolean, sunk?: ShipType }
  | { type: 'game-over', winner: 'host' | 'guest' }
```

**Rationale:** Eenvoudig te debuggen, TypeScript discriminated unions geven type-safety op berichten.

### D5: Klik-gebaseerde plaatsing met hover-preview

**Keuze:** Schip selecteren uit lijst → klik op bord om te plaatsen → R-toets of knop om te roteren.

**Rationale:** Werkt goed op muis, touchpad én mobiel touch. Slepen is onbetrouwbaar op touchpad en mobiel.

## Risks / Trade-offs

- **PeerJS public server onbetrouwbaar** → Mitigatie: duidelijke foutmelding tonen, eventueel fallback naar eigen PeerJS server (self-hosted is triviaal)
- **NAT traversal mislukt** → Mitigatie: PeerJS gebruikt STUN/TURN; werkt in de meeste gevallen, maar kan falen achter strenge firewalls. Buiten scope voor dit project.
- **Geen reconnect logica** → Als verbinding wegvalt, is het spel voorbij. Acceptabel voor leerproject.
- **Spelstate in host** → Als host tabblad sluit, verliest guest ook de state. Acceptabel.
