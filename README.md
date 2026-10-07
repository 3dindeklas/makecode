# KlasCode

KlasCode is een eigen, Nederlandstalige blokeditor voor micro:bit-lessen. De docent kiest welke blokken de klas kan gebruiken. Leerlingen bouwen hun programma in Blockly en testen het in een interactieve micro:bit-preview.

## Eerste editorblokken

- Start- en knopgebeurtenissen.
- LED-pictogrammen, getallen tonen en het scherm wissen.
- Een melodie of losse muzieknoot spelen en het volume instellen.
- Wachten, een vast aantal keren herhalen en blijven herhalen.

De docent kan de meeste blokken per klas aan- of uitzetten via **Blokken kiezen**. De blokdefinities en codegenerator staan in `editor.js`; daar kunnen nieuwe blokken aan worden toegevoegd.

## Preview

De preview laat het 5×5-ledscherm zien. Knoppen A en B zijn aanklikbaar en muziekblokken spelen een toon via de browser. De gegenereerde TypeScript-code is te bekijken en te downloaden.

Deze eerste simulator voert de blokken voor LEDs, knoppen en muziek in de browser uit. De export is TypeScript, geen `.hex`; programma's rechtstreeks naar een fysieke micro:bit flashen zit nog niet in deze versie. Het geluid werkt na een gebruikersactie en is afhankelijk van browserondersteuning.

## Klasomgeving

- Docentdashboard met klascode, leerlingstatussen en pauzeren.
- Leerlingen laten deelnemen met naam en een deellink.
- Startcode delen met alle leerlingen of een selectie; leerlingen bevestigen voordat bestaande blokken worden vervangen.
- Leerlingcode bekijken, aanpassen, afronden en een korte reflectie verzamelen.
- Klasbestand downloaden/openen en een voortgangsrapport downloaden.
- 3Dindeklas Foundation-stijl en bediening voor iPad en desktop.

De sessie staat lokaal in de browser. De demo synchroniseert docent- en leerlingtabbladen op hetzelfde apparaat; een server voor verschillende apparaten moet nog worden toegevoegd.

## Bronnen

- [3Dindeklas Foundation](https://github.com/3dindeklas/Foundation)
- [Blockly documentatie: eigen blokken en codegeneratie](https://developers.google.com/blockly/guides/create-custom-blocks/code-generation/block-code)
- [micro:bit muziekblokken](https://makecode.microbit.org/reference/music)
- [micro:bit knopgebeurtenissen](https://makecode.microbit.org/reference/input/on-button-pressed)
