## Why

Op onbetrouwbare WiFi-verbindingen kan de WebRTC SCTP-laag tot ~5 minuten nodig hebben om een verbroken verbinding te detecteren, waardoor beide spelers onbeperkt blijven wachten zonder enige feedback. De speler heeft geen zicht op de verbindingsstatus en kan het spel niet zelf afbreken.

## What Changes

- Voeg een heartbeat mechanisme toe aan de P2P verbinding (ping elke 10 seconden)
- Toon een melding wanneer de heartbeat uitblijft, inclusief hoe lang er al geen heartbeat is ontvangen
- Geef de speler de mogelijkheid het spel handmatig af te breken bij een verstoorde verbinding
- Herstel automatisch de spelstatus zodra de verbinding terugkeert (heartbeat hervatten)

## Capabilities

### New Capabilities

- `connection-health`: Heartbeat mechanisme dat de verbindingsgezondheid monitort en de speler informeert bij uitblijvende heartbeats, met mogelijkheid tot handmatig afbreken

### Modified Capabilities

- `p2p-connection`: De verbindingsstatus-weergave wordt uitgebreid: naast `connected`/`disconnected` komt er een tussenliggende toestand voor "heartbeat uitgebleven" met tijdsindicator

## Impact

- `src/composables/usePeerConnection.ts`: heartbeat logica toevoegen (ping/pong berichten)
- `src/game/types.ts`: nieuwe berichttypen `ping` en `pong` toevoegen
- `src/views/GameView.vue`: melding tonen bij uitblijvende heartbeat met afbreekknop
- `src/views/PlacementView.vue`: zelfde melding tijdens plaatsingsfase
