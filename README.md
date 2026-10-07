# KlasCode

Een eerste 3Dindeklas-prototype voor blokprogrammeren in de klas. KlasCode gebruikt de officiële micro:bit MakeCode-editor als programmeeromgeving en bouwt daar een rustige docent- en leerlingroute omheen.

## Wat deze prototypeversie laat zien

- Een docentdashboard met klascode, pincode, leerlingstatussen en voortgang.
- Leerlingen laten deelnemen met een link en eigen naam.
- Een klas pauzeren, leerlinggegevens aanpassen en leerlingen verwijderen.
- Een echt micro:bit MakeCode-project in de editor maken en lokaal bewaren.
- Een opgeslagen MakeCode-project delen met alle of geselecteerde leerlingen in dezelfde browser.
- Statussen bekijken en aanpassen, werk afronden en een korte leerlingreflectie ophalen.
- Een voortgangsrapport en een klasbestand downloaden en een eerder klasbestand openen.
- Een responsive interface in de Foundation-huisstijl, geschikt voor iPad en desktop.

## Huidige grens van deze demo

De klas en projecten worden in de browser opgeslagen. Leerling- en docenttabbladen op hetzelfde apparaat kunnen elkaar bijwerken. Een klaslink op een ander apparaat kan nog niet met deze demo synchroniseren. MakeCode is ingebed met de editor-controllerberichten om projecten te laden en op te slaan; de sessieserver en verbinding tussen apparaten zijn de volgende stap. Het voortgangsrapport bevat nu klasstatus en samenvattingen; het automatisch opnemen van een afbeelding van ieder blokproject moet nog worden toegevoegd.

## Volgende bouwstappen

1. Een server met klascodes en live verbindingen voor verschillende apparaten.
2. Projecten veilig bewaren en herstellen op de server, met privacyvriendelijke bewaartermijnen.
3. Het rapport aanvullen met afbeeldingen van de leerlingprojecten en sessies compleet hervatten.
4. Status, pauzeren, code delen en offline leerlingen live tussen apparaten synchroniseren.

De referentie voor de huisstijl staat in [3Dindeklas Foundation](https://github.com/3dindeklas/Foundation). De klasfunctionaliteit is geïnspireerd op de openbare micro:bit classroom-functies; de interface en merkuitwerking zijn eigen aan 3Dindeklas.
