import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    resources: {
      en: {
        translation: {
          app_title: 'DJ Organizer',
          swipe_feed_placeholder: 'SwipeFeed placeholder',
          loading_tracks: 'Loading tracks...',
          no_tracks_found: 'No tracks found.',
          no_artwork: 'No Artwork',
          unknown_artist: 'Unknown Artist',
          duration: 'Duration',
          play_preview: 'Play Preview',
          pause: 'Pause',
          loading: 'Loading...',
          error: 'Error',
          genre: 'Genre',
          select_genre: 'Select Genre',
          mood: 'Mood',
          status: 'Status',
          status_unassigned: 'Unassigned',
          status_assigned: 'Assigned',
          status_moved: 'Moved',
          status_error: 'Error',
        },
      },
      de: {
        translation: {
          app_title: 'DJ Organizer',
          swipe_feed_placeholder: 'SwipeFeed Platzhalter',
          loading_tracks: 'Tracks werden geladen...',
          no_tracks_found: 'Keine Tracks gefunden.',
          no_artwork: 'Kein Artwork',
          unknown_artist: 'Unbekannter Künstler',
          duration: 'Dauer',
          play_preview: 'Vorschau abspielen',
          pause: 'Pause',
          loading: 'Lädt...',
          error: 'Fehler',
          genre: 'Genre',
          select_genre: 'Genre auswählen',
          mood: 'Stimmung',
          status: 'Status',
          status_unassigned: 'Nicht zugewiesen',
          status_assigned: 'Zugewiesen',
          status_moved: 'Verschoben',
          status_error: 'Fehler',
        },
      },
    },
  });

export default i18n;
