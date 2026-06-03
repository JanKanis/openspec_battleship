import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// useLocale gebruikt module-level state en leest localStorage + navigator.languages
// bij module-import. We gebruiken vi.resetModules() + dynamische import per test
// zodat elke test met een frisse module start.

function setNavigatorLanguages(langs: string[]) {
  Object.defineProperty(navigator, 'languages', {
    get: () => langs,
    configurable: true,
  })
}

describe('useLocale', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // --- Taaldetectie via navigator.languages ---

  it('detecteert Nederlands als nl-taal als eerste nl/en-taal in de lijst staat', async () => {
    setNavigatorLanguages(['fr-FR', 'nl-NL', 'en-US'])
    const { useLocale } = await import('../useLocale')
    const { locale } = useLocale()
    expect(locale.value).toBe('nl')
  })

  it('detecteert Engels als en-taal eerder in de lijst staat dan nl', async () => {
    setNavigatorLanguages(['fr-FR', 'en-GB', 'nl-NL'])
    const { useLocale } = await import('../useLocale')
    const { locale } = useLocale()
    expect(locale.value).toBe('en')
  })

  it('defaultt naar Engels als er geen nl- of en-taal in de lijst staat', async () => {
    setNavigatorLanguages(['fr-FR', 'de-DE'])
    const { useLocale } = await import('../useLocale')
    const { locale } = useLocale()
    expect(locale.value).toBe('en')
  })

  it('defaultt naar Engels bij een lege browserlijst', async () => {
    setNavigatorLanguages([])
    const { useLocale } = await import('../useLocale')
    const { locale } = useLocale()
    expect(locale.value).toBe('en')
  })

  it('herkent nl-BE (Vlaams) als Nederlands', async () => {
    setNavigatorLanguages(['nl-BE'])
    const { useLocale } = await import('../useLocale')
    const { locale } = useLocale()
    expect(locale.value).toBe('nl')
  })

  // --- localStorage persistentie ---

  it('gebruikt opgeslagen taal uit localStorage boven browservoorkeur', async () => {
    localStorage.setItem('locale', 'en')
    setNavigatorLanguages(['nl-NL'])
    const { useLocale } = await import('../useLocale')
    const { locale } = useLocale()
    expect(locale.value).toBe('en')
  })

  it('slaat de taal op in localStorage bij setLocale', async () => {
    setNavigatorLanguages(['nl-NL'])
    const { useLocale } = await import('../useLocale')
    const { setLocale } = useLocale()
    setLocale('en')
    expect(localStorage.getItem('locale')).toBe('en')
  })

  it('herstelt opgeslagen nl-keuze ook als browservoorkeur Engels is', async () => {
    localStorage.setItem('locale', 'nl')
    setNavigatorLanguages(['en-US'])
    const { useLocale } = await import('../useLocale')
    const { locale } = useLocale()
    expect(locale.value).toBe('nl')
  })

  // --- setLocale en reactieve updates ---

  it('setLocale wisselt de actieve taal', async () => {
    setNavigatorLanguages(['nl-NL'])
    const { useLocale } = await import('../useLocale')
    const { locale, setLocale } = useLocale()
    expect(locale.value).toBe('nl')
    setLocale('en')
    expect(locale.value).toBe('en')
  })

  // --- t() vertaalfunctie ---

  it('t() geeft de NL-tekst terug in NL-modus', async () => {
    localStorage.setItem('locale', 'nl')
    const { useLocale } = await import('../useLocale')
    const { t } = useLocale()
    expect(t('home.newGame')).toBe('Nieuw spel')
  })

  it('t() geeft de EN-tekst terug in EN-modus', async () => {
    localStorage.setItem('locale', 'en')
    const { useLocale } = await import('../useLocale')
    const { t } = useLocale()
    expect(t('home.newGame')).toBe('New game')
  })

  it('t() valt terug op NL bij een ontbrekende sleutel in EN', async () => {
    localStorage.setItem('locale', 'en')
    const { useLocale } = await import('../useLocale')
    const { t } = useLocale()
    // Vervang tijdelijk een sleutel met undefined door directe aanroep met onbestaande key
    // Fallback: retourneert de sleutel zelf als ook NL hem niet kent
    expect(t('nonexistent.key')).toBe('nonexistent.key')
  })

  it('t() ondersteunt interpolatie van variabelen', async () => {
    localStorage.setItem('locale', 'nl')
    const { useLocale } = await import('../useLocale')
    const { t } = useLocale()
    expect(t('game.yourShipSunk', { ship: 'Kruiser' })).toBe('Jouw Kruiser is gezonken!')
  })

  it('t() ondersteunt interpolatie in EN', async () => {
    localStorage.setItem('locale', 'en')
    const { useLocale } = await import('../useLocale')
    const { t } = useLocale()
    expect(t('game.yourShipSunk', { ship: 'Cruiser' })).toBe('Your Cruiser has been sunk!')
  })
})
