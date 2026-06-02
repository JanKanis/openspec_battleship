## MODIFIED Requirements

### Requirement: Verbindingsverlies wordt gemeld
Het systeem SHALL de speler informeren als de P2P verbinding wegvalt of de heartbeat uitblijft. Het systeem SHALL de verbinding NIET automatisch verbreken — de speler beslist zelf of hij wil wachten of het spel wil afbreken.

#### Scenario: Verbinding verbroken tijdens spel (WebRTC close event)
- **WHEN** de P2P verbinding wegvalt en het `close` event valt tijdens de speel- of plaatsingsfase
- **THEN** toont het systeem een melding dat de verbinding verbroken is, en navigeert na 3 seconden terug naar het startscherm

#### Scenario: Heartbeat blijft uit (geen close event)
- **WHEN** er gedurende meer dan 15 seconden geen heartbeat of spelbericht ontvangen is maar de verbinding technisch nog open lijkt
- **THEN** toont het systeem een melding met tijdsindicator en een knop om het spel af te breken (zie connection-health spec)
