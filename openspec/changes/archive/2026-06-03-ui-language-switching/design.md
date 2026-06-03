## Context

De Battleship-app is een Vue 3 SPA zonder externe i18n-bibliotheek. Alle UI-teksten zijn momenteel hardcoded in de Vue-components (Nederlands). Er zijn circa 7 views/components met zichtbare teksten. Er is al een patroon van herbruikbare composables (`usePeerConnection`).

## Goals / Non-Goals

**Goals:**
- Alle zichtbare UI-teksten ondersteunen Nederlands (NL) en Engels (EN)
- Gebruiker kan de taal op elk moment wisselen via een zichtbare schakelaar
- Taalkeuze wordt persistent opgeslagen in `localStorage`
- Standaardtaal is Nederlands

**Non-Goals:**
- Meer dan twee talen (geen framework-overkill)
- Server-side rendering of SSR-gebaseerde taaldetectie
- Automatische taaldetectie via browser `navigator.language`
- Vertaling van PeerJS-foutmeldingen of console-output

## Decisions

### Beslissing 1: Eigen lichtgewicht composable in plaats van vue-i18n

**Keuze:** Zelf een `useLocale` composable schrijven met een gedeelde reactive `locale` ref en een `t(key)` vertaalfunctie.

**Alternatieven overwogen:**
- **vue-i18n**: Krachtig, maar zwaar voor slechts twee talen en ~50 strings. Voegt een externe dependency toe en vereist configuratiebestanden.
- **i18n-key/value object + composable**: Eenvoudig, volledig in eigen hand, past bij de bestaande codestijl.

**Rationale:** Het project heeft geen complexe i18n-behoeften (geen pluralisatie, geen datumformattering, geen RTL). Een eigen composable houdt de bundle klein, vereist geen nieuwe dependency en sluit aan bij het bestaande `usePeerConnection`-patroon.

### Beslissing 2: Vertalingen als TypeScript-object in één bestand

**Keuze:** Alle vertalingen in `src/i18n/translations.ts` als genest TypeScript-object `{ nl: {...}, en: {...} }`. De sleutels zijn hiërarchisch (bijv. `home.title`, `game.yourTurn`).

**Alternatieven overwogen:**
- JSON-bestanden per taal: Iets meer tooling-vriendelijk, maar onnodige bestandssplitsing voor de omvang.
- Flat keys: Eenvoudiger, maar minder onderhoudbaar naarmate het groeit.

**Rationale:** TypeScript-object geeft type-veiligheid, autocompletion en voorkomt ontbrekende vertalingen via compile-time checks.

### Beslissing 3: Taalschakelaar als globale component in App.vue

**Keuze:** De `LanguageSwitcher`-component wordt in `App.vue` geplaatst, zodat hij op elke route zichtbaar is.

**Rationale:** Vermijdt herhaling in elke view en garandeert consistente beschikbaarheid.

### Beslissing 4: Standaardtaal via `navigator.languages`

**Keuze:** Bij het eerste bezoek (geen `localStorage`-waarde) worden de browsertalen op volgorde doorlopen via `navigator.languages`. De eerste taal waarvan de code begint met `nl` of `en` bepaalt de standaard (respectievelijk Nederlands of Engels). Wordt geen herkenbare taal gevonden, dan is de standaard Engels.

**Alternatieven overwogen:**
- **Altijd Nederlands als default**: Simpel, maar sluit niet-Nederlandstalige gebruikers direct buiten.
- **Eerste taal die nl is, anders Engels**: Houdt geen rekening met gebruikers die een andere taal als primaire voorkeur hebben maar wel Nederlands of Engels ergens verder in hun lijst hebben staan (bijv. `fr-FR, nl-NL`).
- **`navigator.language` (enkelvoud)**: Kijkt alleen naar de primaire taal, niet naar de volledige voorkeursvolgorde.

**Rationale:** Door de volledige lijst te doorlopen en de eerste `nl`- of `en`-match te gebruiken, sluit de keuze het beste aan bij wat de gebruiker zelf in de browser heeft ingesteld. De prefix-check dekt alle regionale varianten (nl-NL, nl-BE, en-US, en-GB, enz.) zonder een expliciete lijst bij te houden.

## Risks / Trade-offs

- **Ontbrekende vertalingen** → TypeScript zal bij ontbrekende sleutels een type-fout geven; daarnaast fallback naar de NL-tekst als vangnet.
- **Coverage op `translations.ts`** → Pure data, geen branches; `/* c8 ignore */` niet nodig, maar coverage-drempels blijven 100% — alle functies in `useLocale` worden getest.
- **Bestaande tests** → View-tests die op exacte tekst matchen moeten bijgewerkt worden naar vertaalsleutels of NL-teksten; dit is de grootste tijdsinvestering.

## Migration Plan

1. Voeg `translations.ts` en `useLocale.ts` toe
2. Voeg `LanguageSwitcher.vue` toe en integreer in `App.vue`
3. Vervang hardcoded teksten per component/view (van klein naar groot)
4. Pas bestaande tests aan
5. Verifieer 100% coverage
