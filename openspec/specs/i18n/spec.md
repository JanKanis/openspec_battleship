### Requirement: Vertalingen beschikbaar in NL en EN
Het systeem SHALL alle zichtbare UI-teksten beschikbaar hebben in zowel Nederlands als Engels via een centrale vertalingstabel.

#### Scenario: Tekst ophalen in actieve taal
- **WHEN** een component een tekst ophaalt via een vertaalsleutel (bijv. `t('home.title')`)
- **THEN** retourneert het systeem de tekst in de actieve taal

#### Scenario: Fallback bij ontbrekende vertaling
- **WHEN** een vertaalsleutel niet bestaat in de actieve taal
- **THEN** valt het systeem terug op de Nederlandse tekst voor die sleutel

### Requirement: Actieve taal persistent opgeslagen
Het systeem SHALL de gekozen taal opslaan in `localStorage` zodat deze hersteld wordt bij een volgend bezoek.

#### Scenario: Taalkeuze opslaan
- **WHEN** de gebruiker de taal wijzigt
- **THEN** slaat het systeem de gekozen taalcode op in `localStorage`

#### Scenario: Taal herstellen bij herstart
- **WHEN** de gebruiker de app opent en er een opgeslagen taalkeuze in `localStorage` staat
- **THEN** gebruikt het systeem de opgeslagen taal als actieve taal

#### Scenario: Standaardtaal via browservoorkeur — nl voor en
- **WHEN** er geen taalkeuze opgeslagen is in `localStorage` en de eerste `nl`- of `en`-taal in de browserlijst een `nl`-taal is (bijv. `fr-FR, nl-NL, en-US`)
- **THEN** is de actieve taal Nederlands (`nl`)

#### Scenario: Standaardtaal via browservoorkeur — en voor nl
- **WHEN** er geen taalkeuze opgeslagen is in `localStorage` en de eerste `nl`- of `en`-taal in de browserlijst een `en`-taal is (bijv. `fr-FR, en-US, nl-NL`)
- **THEN** is de actieve taal Engels (`en`)

#### Scenario: Standaardtaal via browservoorkeur — geen nl of en
- **WHEN** er geen taalkeuze opgeslagen is in `localStorage` en de browserlijst geen taal bevat met een `nl`- of `en`-prefix (bijv. `fr-FR, de-DE`)
- **THEN** is de actieve taal Engels (`en`)
