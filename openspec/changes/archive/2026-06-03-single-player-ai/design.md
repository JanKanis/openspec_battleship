## Context

Het spel gebruikt `usePeerConnection` als singleton composable voor alle communicatie tussen twee spelers via PeerJS. `PlacementView` en `GameView` roepen `usePeerConnection()` direct aan en gebruiken P2P-specifieke properties zoals `heartbeatLost`, `secondsSinceLastHeartbeat`, `initHost()` en `connectToHost()`.

Voor een single player modus moet een AI lokaal reageren op spelberichten. Om code-duplicatie te vermijden moeten `GameView` en `PlacementView` werken met beide soorten "tegenstanders" zonder te weten welke het is.

## Goals / Non-Goals

**Goals:**
- Eén `GameConnection` interface waarmee `GameView` en `PlacementView` communiceren
- `PeerGameConnection` wrapper die `usePeerConnection` implementeert (bestaand gedrag ongewijzigd)
- `useAIConnection` die de interface implementeert volledig lokaal
- AI met willekeurige scheepsplaatsing en Hunt & Target schietstrategie
- Solo startknop op `HomeView`
- `ConnectionWarning` alleen zichtbaar in P2P modus
- E2E test die een compleet solo potje speelt

**Non-Goals:**
- AI moeilijkheidsgraden
- Opslaan van scores of statistieken
- Animaties of bijzondere UI voor solo modus

## Decisions

### 1. `GameConnection` als TypeScript interface, niet als abstracte klasse

De interface bevat alleen wat `GameView` en `PlacementView` daadwerkelijk gebruiken:

```typescript
interface GameConnection {
  sendMessage(msg: GameMessage): void
  onMessage(cb: (msg: GameMessage) => void): void
  onDisconnected(cb: () => void): void
  destroy(): void
  readonly role: Ref<PlayerRole | null>
  readonly heartbeatLost: Ref<boolean>
  readonly secondsSinceLastHeartbeat: Ref<number>
  readonly isAI: boolean   // voor conditionele ConnectionWarning
}
```

`heartbeatLost` en `secondsSinceLastHeartbeat` blijven in de interface zodat `GameView` en `PlacementView` geen conditionals nodig hebben — `useAIConnection` retourneert deze altijd als `false`/`0`. `isAI` is het enige conditionale veld, alleen voor de `ConnectionWarning`.

Alternatief overwogen: aparte AI-views zonder heartbeat props — verworpen vanwege code-duplicatie.

### 2. Gedeelde singleton via `useGameConnection()`

Een nieuwe composable `useGameConnection()` retourneert de actieve `GameConnection`. `HomeView` initialiseert de juiste implementatie (Peer of AI); views roepen daarna `useGameConnection()` aan zonder te weten welke het is.

```
  HomeView
  ├── "Multiplayer" → setGameConnection(new PeerGameConnection())
  └── "Solo"        → setGameConnection(new AIGameConnection())

  PlacementView / GameView
  └── useGameConnection() → activeConnection
```

Alternatief: via Vue provide/inject — verworpen, singleton is al het bestaande patroon in deze codebase.

### 3. AI reageert asynchroon met een korte vertraging

`useAIConnection.sendMessage()` verwerkt een inkomend bericht en stuurt na een korte kunstmatige vertraging (`setTimeout`, ~500ms) een antwoord via de geregistreerde `onMessage` callback. Dit simuleert een echte tegenstander en voorkomt dat de UI "flikkert" door directe synchrone antwoorden.

### 4. AI-logica in `src/game/ai.ts`

Puur functioneel, geen Vue-reactivity. Exporteert:
- `randomBoard(): { board: Board, ships: Ship[] }` — willekeurige scheepsplaatsing
- `createAI(remainingShips: ShipType[]): AI` — fabrieksfunctie
- `AI.nextShot(opponentBoard: Board): { x: number, y: number }` — Hunt & Target
- `AI.processResult(x, y, hit, sunk?)` — update interne state

Hunt & Target: in `hunt` modus wordt een kanskaart berekend door alle resterende schepen in alle geldige posities te proberen en per cel het aantal overlappende plaatsingen te tellen. In `target` modus wordt een queue van kandidaat-buurcellen afgewerkt.

### 5. `role` in solo modus

In solo modus is `role` niet relevant voor de spelervaring. De startspeler wordt random bepaald bij initialisatie van `useAIConnection`: 50% kans dat de speler begint, 50% kans dat de AI begint. Als de AI begint, stuurt `useAIConnection` direct na de ready-handshake een `shot` bericht. `gameState.myTurn` wordt dienovereenkomstig gezet en is leidend — niet `role`.

## Risks / Trade-offs

- **Edge case Hunt & Target**: twee aangrenzende schepen kunnen de target-queue verwarren. Mitigatie: na het zinken van een schip worden alleen raak-cellen van dat schip verwijderd uit de hitStack; resterende raak-cellen (van een ander schip) blijven bewaard.
- **Singleton state bij navigatie**: `useGameConnection` singleton moet worden gereset bij `destroy()`, net als `usePeerConnection`. Mitigatie: `HomeView` roept `destroy()` aan bij initialisatie van een nieuwe sessie.
- **Test-determinisme**: de E2E solo test kan niet de winnaar voorspellen door random AI en willekeurige plaatsing. Mitigatie: de test valideert alleen dat het spel een winnaar bereikt (niet wie).
