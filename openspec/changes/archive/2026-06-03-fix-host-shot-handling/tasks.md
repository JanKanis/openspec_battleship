## 1. Bug fix in GameView

- [x] 1.1 Verwijder de `if (gameState.role !== 'host') return` guard uit de `shot` message handler in `GameView.vue`
- [x] 1.2 Vervang de `processShot('host-attacking')` tak door directe verzending van een `shot` bericht (dit doet hij al — verwijder de omweg via de `else` tak in `processShot`)
- [x] 1.3 Zorg dat de `shot` handler voor beide rollen identiek werkt: verwerk het schot op `myBoard` via `fireShot`, stuur `shot-result` terug, stuur `game-over` als `checkWin` true is
- [x] 1.4 Verwijder de `'host-attacking' | 'guest-attacking'` parameter uit `processShot` of vereenvoudig de functie nu beide paden hetzelfde zijn

## 2. Verificatie

- [x] 2.1 Test: host schiet op guest → `shot-result` komt terug → `opponentBoard` van host wordt bijgewerkt
- [x] 2.2 Test: guest schiet op host → `shot-result` komt terug → `opponentBoard` van guest wordt bijgewerkt
- [x] 2.3 Test: beurtenwisseling werkt correct (mis = wisselen, raak = zelfde speler blijft)
- [x] 2.4 Test: winnaar wordt correct bepaald vanuit beide kanten

> Gedekt door automatische tests in `GameView.test.ts` en `src/__tests__/full-game.test.ts`.
