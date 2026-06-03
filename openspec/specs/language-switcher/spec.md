### Requirement: Taalschakelaar zichtbaar op elke pagina
Het systeem SHALL op elke pagina een taalschakelaar tonen waarmee de gebruiker kan wisselen tussen Nederlands en Engels.

#### Scenario: Schakelaar zichtbaar
- **WHEN** de gebruiker een willekeurige pagina van de app bezoekt
- **THEN** is de taalschakelaar zichtbaar in de interface

#### Scenario: Wisselen naar Engels
- **WHEN** de gebruiker op de schakelaar klikt terwijl de actieve taal Nederlands is
- **THEN** schakelt de UI direct over naar Engels zonder pagina-herlaad

#### Scenario: Wisselen naar Nederlands
- **WHEN** de gebruiker op de schakelaar klikt terwijl de actieve taal Engels is
- **THEN** schakelt de UI direct over naar Nederlands zonder pagina-herlaad

#### Scenario: Actieve taal gemarkeerd
- **WHEN** de taalschakelaar getoond wordt
- **THEN** is de actieve taal visueel herkenbaar (bijv. vetgedrukt of gemarkeerd)
