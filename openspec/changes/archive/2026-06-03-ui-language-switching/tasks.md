## 1. i18n fundament

- [x] 1.1 Maak `src/i18n/translations.ts` aan met alle NL- en EN-teksten als genest TypeScript-object (sleutels voor alle views en components)
- [x] 1.2 Maak `src/composables/useLocale.ts` aan met gedeelde reactive `locale` ref, `t(key)` vertaalfunctie, `localStorage` persistentie, en standaardtaal-detectie via `navigator.languages` (doorloop lijst op volgorde: eerste nl- of en-prefix wint, geen match → EN)
- [x] 1.3 Schrijf unit tests voor `useLocale.ts`: taal wisselen, `t()` ophalen, fallback naar NL, initialisatie vanuit `localStorage`, browser-detectie (nl-voor-en, en-voor-nl, geen match, lege lijst)

## 2. Taalschakelaar component

- [x] 2.1 Maak `src/components/LanguageSwitcher.vue` aan: toont NL/EN knoppen, markeert actieve taal
- [x] 2.2 Integreer `LanguageSwitcher` in `App.vue` zodat hij op elke pagina zichtbaar is
- [x] 2.3 Schrijf unit tests voor `LanguageSwitcher.vue`: knoppen zichtbaar, actieve taal gemarkeerd, klik wisselt taal

## 3. Teksten vervangen in views

- [x] 3.1 Vervang hardcoded teksten in `HomeView.vue` door `t()`-aanroepen
- [x] 3.2 Vervang hardcoded teksten in `PlacementView.vue` door `t()`-aanroepen
- [x] 3.3 Vervang hardcoded teksten in `GameView.vue` door `t()`-aanroepen
- [x] 3.4 Vervang hardcoded teksten in `GameOverView.vue` door `t()`-aanroepen

## 4. Teksten vervangen in components

- [x] 4.1 Vervang hardcoded teksten in `ConnectionWarning.vue` door `t()`-aanroepen
- [x] 4.2 Vervang hardcoded teksten in `GameBoard.vue` door `t()`-aanroepen (indien aanwezig)

## 5. Bestaande tests bijwerken

- [x] 5.1 Update view-tests die op exacte teksten matchen: mock `useLocale` zodat `t(key)` de NL-tekst retourneert
- [x] 5.2 Update `full-game.test.ts` indien nodig

## 6. Verificatie

- [x] 6.1 Verifieer `npm run coverage` — alle drempels 100%
- [x] 6.2 Controleer handmatig: taalschakelaar werkt in de browser, keuze blijft na refresh
