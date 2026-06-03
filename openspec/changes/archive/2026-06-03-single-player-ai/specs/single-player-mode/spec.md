## ADDED Requirements

### Requirement: Speler kan een solo partij starten vanaf het startscherm
Het systeem SHALL op het startscherm een "Solo spelen" knop tonen waarmee de speler direct een partij tegen de AI kan starten zonder verbindingscode.

#### Scenario: Solo knop zichtbaar op home
- **WHEN** de speler het startscherm bezoekt
- **THEN** is er een knop "Solo spelen" zichtbaar naast de multiplayer opties

#### Scenario: Solo start navigeert naar plaatsing
- **WHEN** de speler op "Solo spelen" klikt
- **THEN** initialiseert het systeem een `AIGameConnection` en navigeert naar de plaatsingsfase

### Requirement: Solo spelstroom verloopt via dezelfde fases als multiplayer
Het systeem SHALL de solo spelstroom laten verlopen via dezelfde views en fases als multiplayer (plaatsing → spelen → gameover), zonder aparte solo-views.

#### Scenario: Plaatsingsfase in solo modus
- **WHEN** de speler in solo modus de plaatsingsfase bereikt
- **THEN** plaatst de AI zijn schepen willekeurig op de achtergrond terwijl de speler zijn eigen schepen plaatst

#### Scenario: Spelerfase in solo modus
- **WHEN** de speler klaar is met plaatsen en de AI ook klaar is
- **THEN** start het spel en schiet de eerste beurt random (50% kans speler, 50% kans AI)

### Requirement: ConnectionWarning is niet zichtbaar in solo modus
Het systeem SHALL de `ConnectionWarning` component uitsluitend tonen in P2P modus en niet in solo modus.

#### Scenario: Geen verbindingswaarschuwing in solo
- **WHEN** de speler in solo modus speelt
- **THEN** toont het systeem geen `ConnectionWarning`, ook niet na lange tijd
