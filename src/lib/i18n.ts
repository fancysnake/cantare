import { site } from './site';

export type Locale = 'en' | 'pl';

interface Strings {
  siteDescriptionFallback: string;
  navLabel: string;
  navAllSongs: string;
  navArtists: string;
  navTags: string;
  navLanguages: string;
  withChords: string;
  withoutChords: string;
  chordsShown: string;
  chordsHidden: string;
  themeAuto: string;
  themeLight: string;
  themeDark: string;
  themeAutoWord: string;
  themeLightWord: string;
  themeDarkWord: string;
  themeAria: (mode: string) => string;
  searchDefault: string;
  searchNoscript: string;
  browseAllSongs: string;
  randomSong: string;
  filterArtist: string;
  filterAlbum: string;
  filterTag: string;
  filterLanguage: string;
  allSongsTitle: string;
  artistsTitle: string;
  tagsTitle: string;
  languagesTitle: string;
  tagPrefix: string;
  languagePrefix: string;
  artistMeta: string;
  albumMeta: string;
  languageMeta: string;
  keyLabel: string;
  capoLabel: string;
  transposeLabel: string;
  transposeDown: string;
  transposeUp: string;
  transposeReset: string;
  reset: string;
  scrollLabel: string;
  scrollStart: string;
  scrollPause: string;
  scrollSlower: string;
  scrollFaster: string;
  chordsInSong: string;
  chordDiagram: string;
  focusEnter: string;
  focusExit: string;
  notFoundTitle: string;
  notFoundHeading: string;
  notFoundBefore: string;
  notFoundSearch: string;
  notFoundOr: string;
  notFoundBrowse: string;
  songCount: (n: number) => string;
}

const en: Strings = {
  siteDescriptionFallback: 'a songbook for singing together.',
  navLabel: 'Site navigation',
  navAllSongs: 'All songs',
  navArtists: 'Artists',
  navTags: 'Tags',
  navLanguages: 'Languages',
  withChords: '🎸 With chords',
  withoutChords: '🎸 Without chords',
  chordsShown: 'Chords shown. Click to toggle.',
  chordsHidden: 'Chords hidden. Click to toggle.',
  themeAuto: '🌓 Auto',
  themeLight: '☀️ Light',
  themeDark: '🌙 Dark',
  themeAutoWord: 'auto',
  themeLightWord: 'light',
  themeDarkWord: 'dark',
  themeAria: (mode) => `Theme: ${mode}. Click to change.`,
  searchDefault: 'Type to search songs by title, lyrics, artist, album or tag.',
  searchNoscript: 'Search requires JavaScript. You can still',
  browseAllSongs: 'browse all songs',
  randomSong: 'Pick a random song',
  filterArtist: 'Artist',
  filterAlbum: 'Album',
  filterTag: 'Tag',
  filterLanguage: 'Language',
  allSongsTitle: 'All songs',
  artistsTitle: 'Artists',
  tagsTitle: 'Tags',
  languagesTitle: 'Languages',
  tagPrefix: 'Tag',
  languagePrefix: 'Language',
  artistMeta: 'Artist',
  albumMeta: 'Album',
  languageMeta: 'Language',
  keyLabel: 'Key',
  capoLabel: 'Capo',
  transposeLabel: 'Transpose:',
  transposeDown: 'Transpose down a semitone',
  transposeUp: 'Transpose up a semitone',
  transposeReset: 'Reset transposition',
  reset: 'Reset',
  scrollLabel: 'Scroll:',
  scrollStart: 'Start autoscroll',
  scrollPause: 'Pause autoscroll',
  scrollSlower: 'Scroll slower',
  scrollFaster: 'Scroll faster',
  chordsInSong: 'Chords in this song',
  chordDiagram: 'chord diagram',
  focusEnter: 'Enter focus mode (hides site navigation)',
  focusExit: 'Exit focus mode (Esc)',
  notFoundTitle: 'Not found',
  notFoundHeading: 'Page not found',
  notFoundBefore: 'This song seems to have ended. Try the',
  notFoundSearch: 'search',
  notFoundOr: 'or',
  notFoundBrowse: 'browse all songs',
  songCount: (n) => (n === 1 ? '1 song' : `${n} songs`),
};

const plPlural = new Intl.PluralRules('pl');

const pl: Strings = {
  siteDescriptionFallback: 'śpiewnik do wspólnego śpiewania.',
  navLabel: 'Nawigacja',
  navAllSongs: 'Wszystkie piosenki',
  navArtists: 'Wykonawcy',
  navTags: 'Tagi',
  navLanguages: 'Języki',
  withChords: '🎸 Z akordami',
  withoutChords: '🎸 Bez akordów',
  chordsShown: 'Akordy widoczne. Kliknij, aby przełączyć.',
  chordsHidden: 'Akordy ukryte. Kliknij, aby przełączyć.',
  themeAuto: '🌓 Auto',
  themeLight: '☀️ Jasny',
  themeDark: '🌙 Ciemny',
  themeAutoWord: 'automatyczny',
  themeLightWord: 'jasny',
  themeDarkWord: 'ciemny',
  themeAria: (mode) => `Motyw: ${mode}. Kliknij, aby zmienić.`,
  searchDefault: 'Szukaj piosenek po tytule, słowach, wykonawcy, albumie lub tagu.',
  searchNoscript: 'Wyszukiwarka wymaga JavaScriptu. Możesz nadal',
  browseAllSongs: 'przeglądać wszystkie piosenki',
  randomSong: 'Wylosuj piosenkę',
  filterArtist: 'Wykonawca',
  filterAlbum: 'Album',
  filterTag: 'Tag',
  filterLanguage: 'Język',
  allSongsTitle: 'Wszystkie piosenki',
  artistsTitle: 'Wykonawcy',
  tagsTitle: 'Tagi',
  languagesTitle: 'Języki',
  tagPrefix: 'Tag',
  languagePrefix: 'Język',
  artistMeta: 'Wykonawca',
  albumMeta: 'Album',
  languageMeta: 'Język',
  keyLabel: 'Tonacja',
  capoLabel: 'Kapodaster',
  transposeLabel: 'Transpozycja:',
  transposeDown: 'Transponuj o pół tonu w dół',
  transposeUp: 'Transponuj o pół tonu w górę',
  transposeReset: 'Przywróć oryginalną tonację',
  reset: 'Reset',
  scrollLabel: 'Przewijanie:',
  scrollStart: 'Włącz automatyczne przewijanie',
  scrollPause: 'Wstrzymaj automatyczne przewijanie',
  scrollSlower: 'Przewijaj wolniej',
  scrollFaster: 'Przewijaj szybciej',
  chordsInSong: 'Akordy w tej piosence',
  chordDiagram: 'diagram akordu',
  focusEnter: 'Włącz tryb skupienia (ukrywa nawigację)',
  focusExit: 'Wyłącz tryb skupienia (Esc)',
  notFoundTitle: 'Nie znaleziono',
  notFoundHeading: 'Strona nie istnieje',
  notFoundBefore: 'Ta piosenka chyba już się skończyła. Skorzystaj z',
  notFoundSearch: 'wyszukiwarki',
  notFoundOr: 'albo',
  notFoundBrowse: 'przeglądaj wszystkie piosenki',
  songCount: (n) => {
    switch (plPlural.select(n)) {
      case 'one':
        return '1 piosenka';
      case 'few':
        return `${n} piosenki`;
      default:
        return `${n} piosenek`;
    }
  },
};

const STRINGS: Record<Locale, Strings> = { en, pl };

function isLocale(value: string): value is Locale {
  return value in STRINGS;
}

export const locale: Locale = isLocale(site.locale) ? site.locale : 'en';

export const t: Strings = STRINGS[locale];
