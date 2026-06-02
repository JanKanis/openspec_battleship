## 1. Protocol uitbreiden

- [x] 1.1 Voeg alleen `ping` berichttype toe aan de `GameMessage` discriminated union in `src/game/types.ts` (geen `pong` — symmetrisch protocol)

## 2. Heartbeat in usePeerConnection

- [x] 2.1 Voeg `heartbeatLost` (boolean ref) en `secondsSinceLastHeartbeat` (number ref) toe als reactieve state in `usePeerConnection.ts`
- [x] 2.2 Implementeer `startHeartbeat()`: beide kanten sturen elke 10 seconden een `ping`, en houden bij wanneer het laatste bericht ontvangen is
- [x] 2.3 Implementeer `stopHeartbeat()`: wist de interval timer
- [x] 2.4 Verwerk inkomende `ping` berichten: reset de `lastReceived` timestamp (geen pong terugsturen)
- [x] 2.5 Start een secondeteller die `secondsSinceLastHeartbeat` bijhoudt en `heartbeatLost` op `true` zet na 15 seconden zonder bericht
- [x] 2.6 Reset de heartbeat timer bij elk ontvangen bericht (ping én spelberichten)
- [x] 2.7 Exporteer `heartbeatLost` en `secondsSinceLastHeartbeat` als readonly vanuit de composable
- [x] 2.8 Roep `startHeartbeat()` aan in `onConnected` en `stopHeartbeat()` aan in `destroy()`

## 3. UI — verbindingsmelding component

- [x] 3.1 Maak een herbruikbaar component `ConnectionWarning.vue` dat toont: melding met tijdsindicator en knop "Spel afbreken"
- [x] 3.2 Het component is alleen zichtbaar als `heartbeatLost === true`
- [x] 3.3 De "Spel afbreken" knop roept `destroy()` aan en navigeert naar het startscherm

## 4. UI — integratie in views

- [x] 4.1 Voeg `ConnectionWarning` toe aan `GameView.vue`
- [x] 4.2 Voeg `ConnectionWarning` toe aan `PlacementView.vue`

## 5. Verificatie

- [x] 5.1 Test: op slecht netwerk verschijnt de melding binnen ~15 seconden
- [x] 5.2 Test: melding verdwijnt automatisch als verbinding herstelt
- [x] 5.3 Test: "Spel afbreken" navigeert terug naar startscherm
