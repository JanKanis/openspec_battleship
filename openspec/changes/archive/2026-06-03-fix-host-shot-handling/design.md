## Context

De `GameView.vue` heeft een `onMessage` handler met een guard `if (gameState.role !== 'host') return` voor inkomende `shot` berichten. De intent was dat de host "authoritative" zou zijn, maar dit is verkeerd doorgevoerd: de host heeft geen toegang tot de scheepsposities van de guest, dus de host kan schoten op het guest-bord niet zelf verwerken. De guest moet dat doen en het resultaat terugsturen — maar dat gebeurt niet.

Het correcte protocol is symmetrisch: beide kanten verwerken inkomende schoten op hun eigen bord en sturen het resultaat terug.

## Goals / Non-Goals

**Goals:**
- Host kan schieten en krijgt een `shot-result` terug
- Beide kanten verwerken inkomende `shot` berichten op hun eigen bord
- Het beurtenwisseling werkt correct voor zowel host als guest

**Non-Goals:**
- Wijzigingen aan de plaatsingsfase
- Wijzigingen aan het winnaar-/game-over mechanisme

## Decisions

### Beslissing: Symmetrisch schietprotocol

**Keuze:** Verwijder de `role !== 'host'` guard. Beide kanten verwerken inkomende `shot` berichten identiek: sla het schot op op `myBoard`, stuur `shot-result` terug, stuur `game-over` als alle eigen schepen gezonken zijn.

**Gevolg:** De aparte `'host-attacking'` tak in `processShot` vervalt. Er is nog maar één pad: schot klikken → `shot` sturen → ontvanger verwerkt op eigen bord → `shot-result` terug.

Dit vereenvoudigt de code aanzienlijk.

## Risks / Trade-offs

- Geen noemenswaardige risico's — dit is een rechttoe-rechtaan bugfix die het protocol in lijn brengt met de bestaande spec (`game-session`: "het systeem registreert het schot en stuurt het resultaat naar beide spelers").
