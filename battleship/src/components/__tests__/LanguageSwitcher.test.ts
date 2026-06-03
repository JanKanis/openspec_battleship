import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import LanguageSwitcher from '../../components/LanguageSwitcher.vue'
import { useLocale } from '../../composables/useLocale'

vi.mock('../../composables/useLocale')

describe('LanguageSwitcher', () => {
  let mockLocale: ReturnType<typeof ref<'nl' | 'en'>>
  let mockSetLocale: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockLocale = ref<'nl' | 'en'>('nl')
    mockSetLocale = vi.fn()
    vi.mocked(useLocale).mockReturnValue({
      locale: mockLocale as any,
      t: (key: string) => key,
      setLocale: mockSetLocale,
    })
  })

  it('toont NL en EN knoppen', () => {
    const wrapper = mount(LanguageSwitcher)
    const buttons = wrapper.findAll('.lang-btn')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('NL')
    expect(buttons[1].text()).toBe('EN')
  })

  it('markeert de actieve taal (NL)', () => {
    mockLocale.value = 'nl'
    const wrapper = mount(LanguageSwitcher)
    const buttons = wrapper.findAll('.lang-btn')
    expect(buttons[0].classes()).toContain('active')
    expect(buttons[1].classes()).not.toContain('active')
  })

  it('markeert de actieve taal (EN)', () => {
    mockLocale.value = 'en'
    const wrapper = mount(LanguageSwitcher)
    const buttons = wrapper.findAll('.lang-btn')
    expect(buttons[0].classes()).not.toContain('active')
    expect(buttons[1].classes()).toContain('active')
  })

  it('klik op EN roept setLocale("en") aan', async () => {
    const wrapper = mount(LanguageSwitcher)
    await wrapper.findAll('.lang-btn')[1].trigger('click')
    expect(mockSetLocale).toHaveBeenCalledWith('en')
  })

  it('klik op NL roept setLocale("nl") aan', async () => {
    mockLocale.value = 'en'
    const wrapper = mount(LanguageSwitcher)
    await wrapper.findAll('.lang-btn')[0].trigger('click')
    expect(mockSetLocale).toHaveBeenCalledWith('nl')
  })
})
