# KlasCode

KlasCode is een eigen, Nederlandstalige blokeditor voor micro:bit-lessen. De docent kiest welke blokken de klas kan gebruiken. Leerlingen bouwen hun programma in Blockly en testen het in een interactieve micro:bit-preview.

## Eerste editorblokken

- Start- en knopgebeurtenissen.
- LED-pictogrammen, getallen tonen en het scherm wissen.
- Een melodie of losse muzieknoot spelen en het volume instellen.
- Wachten, een vast aantal keren herhalen en blijven herhalen.

De docent kan de meeste blokken per klas aan- of uitzetten via **Blokken kiezen**. De blokdefinities en codegenerator staan in `editor.js`; daar kunnen nieuwe blokken aan worden toegevoegd.

## Preview

De preview is getekend als een micro:bit met ledmatrix, knoppen, bovenkant en connector. Knoppen A en B zijn aanklikbaar en muziekblokken spelen een toon via de browser. De simulator start vanzelf en wordt opnieuw uitgevoerd zodra blokken veranderen. Je kunt wisselen tussen de blokken en de gegenereerde JavaScript-code; die code kan ook worden gedownload.

Deze simulator voert de ondersteunde blokken voor leds, knoppen, herhaling en muziek in de browser uit. De JavaScript-weergave wordt uit de blokken gegenereerd en is in deze versie alleen-lezen. De export is TypeScript, geen `.hex`; programma's rechtstreeks naar een fysieke micro:bit flashen zit nog niet in deze versie. Het geluid is afhankelijk van browserondersteuning.

## Klasomgeving

- Docentdashboard met klascode, leerlingstatussen en pauzeren met een schermvullende blokkade voor leerlingen.
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
