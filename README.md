# GabiTrainer

Aplikacja dla podopiecznych i panel dla trenerki, połączone wspólną bazą danych.

| Część | Folder | Gdzie działa |
| --- | --- | --- |
| Aplikacja klienta (iOS, Android, przeglądarka) | `app/` | `https://<konto>.github.io/<repozytorium>/` — można dodać do ekranu głównego telefonu |
| Panel trenera (przeglądarka, Mac) | `panel/` | `https://<konto>.github.io/<repozytorium>/panel/` |
| Baza danych i logowanie (Firebase) | `firebase/` | konsola Firebase |
| Projekt z Claude Design | `project/`, `chats/` | — |

## Jak to działa

- Klient wypełnia ankietę i zakłada konto (e-mail + hasło). W panelu pojawia się jako „Nowa ankieta”.
- Trenerka zapisuje plan treningowy i jadłospis — klient widzi je od razu w aplikacji.
- Klient zapisuje treningi, wysyła raport tygodniowy ze zdjęciami i pisze na czacie — trenerka widzi to na żywo.
- Feedback do raportu trafia do czatu klienta.

Każdy klient widzi wyłącznie swoje dane. Do panelu wejdzie tylko jeden, potwierdzony adres e-mail trenerki
(`firebase/firestore.rules` i `panel/src/backend/config.ts`).

## Publikacja

Każda zmiana wysłana na gałąź `main` publikuje się sama (`.github/workflows/deploy.yml`, zakładka *Actions* na GitHubie).

## Praca lokalna

```bash
cd app && npm install && npx expo start      # aplikacja
cd panel && npm install && npm run dev       # panel
```

Testy bez prawdziwej bazy: uruchom emulatory Firebase w `firebase/` (`npx firebase-tools emulators:start --project demo-gabi`)
i zbuduj aplikacje z `EXPO_PUBLIC_USE_EMULATOR=1` / `VITE_USE_EMULATOR=1`.
