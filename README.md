# Regiokaart adviseurs — DEMO

Demoversie van de regiokaart, bedoeld om te tonen aan externen. Het is exact
dezelfde app, maar met **uitsluitend fictieve gegevens**:

- fictieve adviseurs, regio's, thuisbases, profielen en notities
  (`src/data/`, gegenereerd door `scripts/build-demo-data.mjs`)
- **geen Firebase / geen koppeling met de echte gedeelde database** — alle
  aanpassingen blijven enkel in de browser van de bezoeker (localStorage)
- vaste demo-logins (staan ook op het loginscherm):
  - bekijken: `demo`
  - beheerder: `demo-admin`
- "↺ Herstel naar standaardgegevens" (als beheerder) zet alles terug naar de
  originele demo-data, handig vóór een nieuwe demonstratie
- notities worden relatief t.o.v. vandaag geplaatst, dus de demo toont altijd
  actuele notities

De kaartgrenzen en plaatsnamen (`public/data/`, `postcode-names*.json`) zijn
publieke geografische data (AlignMix / Geo.be / CBS) en zijn dezelfde als in
de echte app.

## Demo-data aanpassen

Pas de lijsten `VLAANDEREN` / `ALKMAAR` bovenaan
`scripts/build-demo-data.mjs` aan (naam, thuispostcode, straal in km,
producten, ...) en draai:

```
node scripts/build-demo-data.mjs
```

## Lokaal draaien

```
npm install
npm run dev
```

## Deployen

Maak een **aparte** GitHub-repo en een **apart** Vercel-project aan voor deze
demo (niet hetzelfde als de echte app). Er zijn geen environment variables
nodig.
