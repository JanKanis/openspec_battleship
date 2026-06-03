## Why

De huidige UI is volledig in het Nederlands, wat de app ontoegankelijk maakt voor niet-Nederlandstalige spelers. Door taalondersteuning toe te voegen (NL/EN) wordt het spel breder inzetbaar en kunnen twee spelers met verschillende taalvoorkeur comfortabel spelen.

## What Changes

- Alle zichtbare teksten in de UI worden beheerd via een i18n-systeem (NL en EN)
- Een taalschakelaar (bijv. vlaggetje of knop) verschijnt op elke pagina waarmee de gebruiker direct kan wisselen
- De gekozen taal wordt opgeslagen in `localStorage` en hersteld bij een volgend bezoek
- Bij het eerste bezoek worden de browsertalen op volgorde doorlopen; de eerste taal die Nederlands (nl-prefix) of Engels (en-prefix) is bepaalt de standaardtaal. Wordt geen Nederlandse of Engelse taal gevonden, dan is de standaard Engels.

## Capabilities

### New Capabilities

- `i18n`: Meertalige teksten beheren en de actieve taal instellen/persistent opslaan
- `language-switcher`: UI-component waarmee de gebruiker de taal kan wisselen

### Modified Capabilities

- `game-ui`: De UI toont teksten via het i18n-systeem in plaats van hardcoded strings

## Impact

- Alle Vue-components en views: teksten vervangen door vertaalsleutels
- Nieuwe composable `useI18n` of Vue i18n-integratie
- Geen wijzigingen aan spellogica of netwerkcommunicatie
- Geen breaking changes voor bestaande functionaliteit
