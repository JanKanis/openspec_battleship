## Context

De Battleship app gebruikt WebRTC via PeerJS voor P2P communicatie. De SCTP-laag onder WebRTC detecteert verbindingsverlies pas na ~5 minuten (heartbeat interval × max retransmissions). Op NAT-routers die verbindingen agressief sluiten, kan het `close` event zelfs helemaal uitblijven. Spelers zitten dan onbeperkt vast zonder feedback of uitweg.

De huidige `usePeerConnection.ts` composable beheert de verbindingsstatus maar heeft geen applicatie-niveau heartbeat. De spelstatus (`myTurn`) wordt lokaal bijgehouden — bij verbindingsverlies raken beide kanten gesynchroniseerd.

## Goals / Non-Goals

**Goals:**
- Verbindingsproblemen detecteren binnen ~15 seconden (1,5× heartbeat interval)
- Speler informeren met een tijdsindicator ("Geen verbinding sinds X seconden")
- Speler de keuze geven het spel handmatig af te breken
- Automatisch herstellen als de verbinding terugkeert

**Non-Goals:**
- Automatisch het spel afbreken bij verbindingsverlies (speler beslist zelf)
- Spelstate synchroniseren na reconnect (te complex, buiten scope)
- TURN server of relay toevoegen voor betere NAT-doorbooring

## Decisions

### Beslissing 1: Heartbeat via applicatieberichten, niet via WebRTC API

**Keuze:** Nieuwe berichttypen `ping` en `pong` toevoegen aan `GameMessage`.

**Alternatief overwogen:** WebRTC's ingebouwde SCTP heartbeat configureren. Dit is niet beschikbaar via de browser WebRTC API — er is geen publieke instelling voor heartbeat interval of timeout.

**Reden:** Applicatie-niveau heartbeat is de enige betrouwbare optie. Bijkomend voordeel: werkt ook als indicator dat de remote applicatie nog draait (niet alleen de netwerklaag).

---

### Beslissing 2: Beide kanten pingen onafhankelijk — geen pong

**Keuze:** Beide kanten sturen onafhankelijk van elkaar elke 10 seconden een `ping`. Er is geen `pong` antwoord. Elk ontvangen bericht (ping of spelbericht) reset de eigen timer.

**Alternatief overwogen:** Host stuurt ping, guest antwoordt met pong. Asymmetrisch: vereist onderscheid tussen rollen in de heartbeat-logica, twee berichttypen, en een request/response-koppeling.

**Reden:** Symmetrisch protocol — beide kanten zijn gelijkwaardig en detecteren verbindingsverlies onafhankelijk. Past beter bij het al symmetrisch gemaakte schietprotocol. `pong` berichttype is overbodig.

**Nuance:** Het `pong` berichttype vervalt. Alleen `ping` wordt toegevoegd aan de `GameMessage` union.

---

### Beslissing 3: Geen automatische disconnect — speler beslist

**Keuze:** Bij uitblijvende heartbeat: toon een melding met tijdsteller. De speler kan kiezen om te wachten of het spel af te breken.

**Alternatief overwogen:** Na X seconden automatisch terug naar home. Eenvoudiger, maar frustreert spelers bij tijdelijke onderbrekingen (WiFi die even knippert).

**Reden:** De gebruiker weet het beste hoe lang hij wil wachten. Een tijdsteller geeft transparantie zonder te forceren.

---

### Beslissing 4: Heartbeat in `usePeerConnection` composable

**Keuze:** Heartbeat logica (start, stop, reset) leeft in de bestaande composable, niet in de views.

**Reden:** De composable beheert al de verbindingsstatus. Heartbeat is een verbindingszorg, geen spelzorg. Views consumeren alleen een reactieve `heartbeatLost` staat en een `secondsSinceLastHeartbeat` teller.

## Risks / Trade-offs

- **Browser-tab op achtergrond** → Browsers throttlen timers voor achtergrondtabs. `setInterval` van 10s wordt mogelijk 60s+. Mitigatie: gebruik `visibilitychange` event om heartbeat te resetten bij terugkeer naar foreground. Of accepteer dit als edge case.
- **Ping/pong berichten verwarren met spel** → Mitigatie: discriminated union in `GameMessage` zorgt dat handlers ping/pong correct filteren.
- **Beide kanten tonen melding tegelijk** → Als verbinding wegvalt, tonen beide spelers de melding. Dat is correct gedrag.

## Open Questions

- Moet de melding ook tijdens de plaatsingsfase verschijnen? (Aanname: ja, ook dan kan verbinding wegvallen)
- Wat gebeurt er als de speler "afbreken" kiest terwijl de tegenstander net terugkomt? (Aanname: spel is afgebroken, tegenstander ziet een foutmelding)
