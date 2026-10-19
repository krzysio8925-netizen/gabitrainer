# GabiTrainer — aplikacja klienta

Aplikacja podopiecznego na iOS i Androida (Expo SDK 58, React Native, Expo Router), zbudowana według projektu `project/GabiTrainer Klient.dc.html` w stylu Organic.

## Uruchomienie

```bash
cd app
npm install
npx expo start        # potem: i = symulator iOS, a = Android, w = przeglądarka, albo QR w Expo Go
```

Sprawdzenie kodu: `npm run typecheck` i `npm run lint`.

## Ekrany

| Ekran | Plik |
| --- | --- |
| Onboarding / ankieta startowa (przy pierwszym uruchomieniu) | `src/app/onboarding.tsx` |
| Dziś — pulpit | `src/app/(tabs)/index.tsx` |
| Plan treningowy + dzienniczek | `src/app/(tabs)/trening.tsx` |
| Zapis serii (stoper, ciężar, powtórzenia) | `src/app/log.tsx` |
| Plan żywieniowy (makro, dni A/B/C, składniki) | `src/app/(tabs)/dieta.tsx` |
| Postępy (wykres, obwody, zdjęcia) | `src/app/(tabs)/postepy.tsx` |
| Raport tygodniowy (zdjęcia z galerii, waga, obwody, samopoczucie) | `src/app/raport.tsx` |
| Czat z Gabi | `src/app/(tabs)/czat.tsx` |

## Struktura

- `src/theme.ts` — tokeny Organic (kolory, fonty, promienie, cienie) przeniesione z `styles.css`.
- `src/components/ui.tsx` — podstawowe elementy: tekst, nagłówki, przyciski, karty, tagi, pola, przełącznik segmentowy.
- `src/data/sample.ts` — dane przykładowe (Kasia, tydzień 8). Zastąpią je dane z serwera.
- `src/store.tsx` — cały stan aplikacji w jednym miejscu; tu podłączy się backend (np. Supabase).

## Czcionki i polskie znaki

Caprasimo (nagłówki) nie ma liter ą ć ę ł ń ś ź ż ani znaków · i −. Komponent `HText` rysuje te znaki pogrubionym Fraunces, tak samo jak w prototypie.

## Czego jeszcze nie ma

- Serwera i kont: dane są przykładowe i trzymane w pamięci, po ponownym uruchomieniu wracają do stanu początkowego.
- Synchronizacji z panelem trenera; odpowiedź Gabi w czacie to automatyczna wiadomość demo.
- Wysyłania zdjęć w czacie (przycisk aparatu pokazuje komunikat).
