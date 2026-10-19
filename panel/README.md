# GabiTrainer — panel trenera

Panel dla trenerki do pracy w przeglądarce lub na MacBooku (React + Vite + TypeScript), zbudowany według projektu `project/GabiTrainer Trener.dc.html` w stylu Organic.

## Uruchomienie

```bash
cd panel
npm install
npm run dev     # podgląd na http://localhost:5173
npm run build   # jeden samodzielny plik dist/index.html
npm run pack    # dodatkowo dist/artifact.html do publikacji na claude.ai
```

## Sekcje

- **Podopieczni** — lista z wyszukiwarką i filtrami; profil z czterema zakładkami: raport tygodniowy z feedbackiem, porównanie zdjęć przed/po, edytor planu treningowego, edytor jadłospisu (kalorie liczone z makro).
- **Kalendarz** — tydzień spotkań i lista zadań.
- **Wiadomości** — rozmowy z podopiecznymi.

Kod: `src/data.ts` (dane przykładowe), `src/store.ts` (stan panelu — tu podłączy się serwer), `src/views/` (ekrany), `src/styles/` (system Organic, czcionki, układ).

## Czego jeszcze nie ma

Danych z serwera: wszystko jest przykładowe i trzymane w pamięci, a panel nie jest połączony z aplikacją klienta.
