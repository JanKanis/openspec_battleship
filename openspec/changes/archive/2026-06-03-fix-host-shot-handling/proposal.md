## Why

De guest negeert binnenkomende `shot` berichten van de host, waardoor de host nooit een `shot-result` terugkrijgt na zijn schot. Het gevolg is dat `myTurn` bij de host op `false` blijft staan en het spel na de eerste beurt van de host volledig vastloopt.

## What Changes

- De guest verwerkt binnenkomende `shot` berichten van de host op zijn eigen bord en stuurt een `shot-result` terug
- De overbodige `processShot('host-attacking')` omweg via een `shot` bericht wordt verwijderd: de host verwerkt zijn eigen schot direct op het tegenstander-bord via het `shot-result` dat de guest terugstuur

## Capabilities

### New Capabilities

_(geen)_

### Modified Capabilities

- `game-session`: het schietprotocol tussen host en guest werkt nu symmetrisch — beide kanten verwerken inkomende schoten op hun eigen bord

## Impact

- `src/views/GameView.vue`: verwijder de `role !== 'host'` guard in de `shot` message handler; voeg verwerking toe aan de guest-kant
