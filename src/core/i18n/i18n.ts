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
          empty_state_message: 'No tracks loaded. Please select a folder.',
          select_folder_button: 'Select Folder',
          directory_error_message: 'Could not open the selected folder, possibly due to system file restrictions. Please try selecting a subfolder or use the fallback option.',
          select_subdirectory_button: 'Select Subfolder',
          select_files_fallback_button: 'Select Files (Fallback)',
          scanning_progress: 'Scanning: {{processed}} / {{total}} files',
          abort_scan: 'Abort Scan',
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
          empty_state_message: 'Keine Tracks geladen. Bitte wählen Sie einen Ordner aus.',
          select_folder_button: 'Ordner wählen',
          directory_error_message: 'Der ausgewählte Ordner konnte nicht geöffnet werden, möglicherweise aufgrund von Systemdateibeschränkungen. Bitte versuchen Sie, einen Unterordner auszuwählen oder die Fallback-Option zu verwenden.',
          select_subdirectory_button: 'Unterordner wählen',
          select_files_fallback_button: 'Dateien wählen (Fallback)',
          scanning_progress: 'Scannt: {{processed}} / {{total}} Dateien',
          abort_scan: 'Scan abbrechen',
        },
      },
    },
  });

export default i18n;
