// Genereert alle fictieve demo-data in src/data/ vanuit de (publieke)
// postcodegrenzen in public/data/. Elke adviseur krijgt als regio alle
// postcodes binnen een straal rond zijn/haar thuisbasis.
//
//   node scripts/build-demo-data.mjs
import fs from "node:fs";

function centroids(file) {
  const geo = JSON.parse(fs.readFileSync(file, "utf8"));
  const sums = {};
  const names = {};
  geo.features.forEach((f) => {
    if (!f || !f.geometry) return;
    const pc = f.properties.postcode;
    if (f.properties.name) names[pc] = f.properties.name;
    const rings = f.geometry.type === "Polygon" ? [f.geometry.coordinates[0]] : f.geometry.coordinates.map((p) => p[0]);
    rings.forEach((ring) => {
      let sx = 0, sy = 0;
      ring.forEach(([x, y]) => { sx += x; sy += y; });
      if (!sums[pc]) sums[pc] = { lat: 0, lng: 0, n: 0 };
      sums[pc].lat += sy / ring.length;
      sums[pc].lng += sx / ring.length;
      sums[pc].n += 1;
    });
  });
  const out = {};
  Object.entries(sums).forEach(([pc, s]) => { out[pc] = [s.lat / s.n, s.lng / s.n]; });
  return { out, names };
}

function km([lat1, lng1], [lat2, lng2]) {
  const r = Math.PI / 180;
  const x = (lng2 - lng1) * r * Math.cos(((lat1 + lat2) / 2) * r);
  const y = (lat2 - lat1) * r;
  return Math.sqrt(x * x + y * y) * 6371;
}

// naam, thuispostcode, straal (km), producten, extra
const VLAANDEREN = [
  ["Bram De Wit", "2000", 18, ["airco", "zp", "wpb"], { tier: "A", gender: "m", lang: ["NL", "ENG"] }],
  ["Lotte V.", "9000", 22, ["airco", "zp", "wpb", "thuisbatterij"], { tier: "A", gender: "v", lang: ["NL", "FR", "ENG"] }],
  ["Sofie Janssen", "3000", 20, ["airco", "zp"], { tier: "B", gender: "v", lang: ["NL", "FR"] }],
  ["Pieter J.", "8000", 25, ["airco", "zp", "wpb"], { tier: "B", gender: "m", lang: ["NL"] }],
  ["Nina Claes", "3500", 20, ["airco", "zp", "wplw"], { tier: "A", gender: "v", lang: ["NL", "ENG"] }],
  ["Wout", "2800", 16, ["airco", "zp"], { tier: "B", gender: "m", lang: ["NL"] }],
  ["Elke M.", "8500", 22, ["airco", "zp", "wpb"], { tier: "B", gender: "v", lang: ["NL", "FR"] }],
  ["Tim Peeters", "2300", 24, ["zp", "thuisbatterij"], { tier: "B", gender: "m", lang: ["NL"] }],
  ["Jens", "9100", 18, ["airco", "zp"], { tier: "B", gender: "m", lang: ["NL", "ENG"] }],
  ["Hanne D.", "9300", 18, ["airco", "zp", "wpb"], { tier: "A", gender: "v", lang: ["NL", "FR"] }],
  ["Ruben", "3600", 18, ["airco", "zp", "wpb"], { tier: "B", gender: "m", lang: ["NL", "ENG"] }],
  ["Lars Willems", "1700", 20, ["airco", "zp"], { tier: "B", gender: "m", lang: ["NL", "FR", "ENG"] }],
  ["Evi", "8400", 20, ["airco", "zp"], { tier: "B", gender: "v", lang: ["NL"] }],
  ["Stijn B.", "3290", 20, ["zp", "wpb"], { tier: "B", gender: "m", lang: ["NL"] }],
  ["Femke", "2200", 20, ["airco", "zp", "wpb"], { tier: "A", gender: "v", lang: ["NL", "ENG"] }],
  ["Arne Maes", "9700", 22, ["airco", "zp"], { tier: "B", gender: "m", lang: ["NL", "FR"] }],
  ["Joris", "3700", 20, ["airco", "zp", "wplw"], { tier: "B", gender: "m", lang: ["NL", "FR"] }],
  ["Laura S.", "8800", 20, ["airco", "zp", "wpb"], { tier: "B", gender: "v", lang: ["NL"] }],
  ["Koen", "3900", 22, ["wplw"], { tier: "B", gender: "m", lang: ["NL", "ENG"], extra: "Specialist lucht-water warmtepompen.\nMaakt voorlopige berekeningen op aanvraag." }],
  ["Daan", "5611", 16, ["airco", "zp", "wpb"], { tier: "A", gender: "m", lang: ["NL", "ENG"] }],
  ["Sanne", "6211", 13, ["airco", "zp"], { tier: "B", gender: "v", lang: ["NL", "ENG"] }],
  ["Thijs", "5911", 16, ["airco", "zp", "wpb"], { tier: "B", gender: "m", lang: ["NL"] }],
  ["Mila de Groot", "5038", 14, ["airco", "zp"], { tier: "B", gender: "v", lang: ["NL", "ENG"] }],
];

const ALKMAAR = [
  ["Fleur", "1811", 13, ["airco", "zp"], { gender: "v", lang: ["NL"] }],
  ["Bas", "2011", 11, ["airco", "zp", "wpb"], { gender: "m", lang: ["NL", "ENG"] }],
  ["Noor", "1441", 12, ["zp"], { gender: "v", lang: ["NL"] }],
];

const EXTRA_INFO = [
  "Werkt niet op woensdagnamiddag.",
  "Liefst geen afspraken na 18u.",
  "Kan ook zaterdagvoormiddag.",
  "Nieuw in het team, graag eerst afstemmen met de planning.",
  "Voorkeur voor afspraken in de voormiddag.",
  "",
];
const OFFERTE = ["ja", "ja", "nee", "eigen_klant"];

function build(list, geoFile, { withTags }) {
  const { out: cent } = centroids(geoFile);
  const postcodes = {};
  const homes = {};
  const tags = {};
  const profiles = {};
  list.forEach(([name, home, radius, products, extra], i) => {
    if (!cent[home]) throw new Error(`Thuispostcode ${home} (${name}) niet gevonden in ${geoFile}`);
    postcodes[name] = Object.keys(cent)
      .filter((pc) => km(cent[home], cent[pc]) <= radius)
      .sort();
    homes[name] = { postcode: home };
    if (withTags) {
      tags[name] = [...(extra.tier === "A" ? ["prio"] : []), ...products.filter((p) => p !== "thuisbatterij")];
    }
    profiles[name] = {
      gender: extra.gender,
      tier: extra.tier || "",
      products,
      onlineOfferte: OFFERTE[i % OFFERTE.length],
      languages: extra.lang,
      languagesExtra: "",
      thuisbatterijEnkel: products.includes("thuisbatterij") ? "ja" : i % 3 === 0 ? "nee" : "",
      travelRadiusMin: String(30 + (i % 4) * 10),
      extraInfo: extra.extra ?? EXTRA_INFO[i % EXTRA_INFO.length],
    };
  });
  return { postcodes, homes, tags, profiles };
}

const w = (f, d) => fs.writeFileSync(`src/data/${f}`, JSON.stringify(d, null, 2) + "\n");

const vl = build(VLAANDEREN, "public/data/postcodes.geojson", { withTags: true });
w("advisor-postcodes.json", vl.postcodes);
w("advisors-home.json", vl.homes);
w("advisor-tags.json", vl.tags);
w("profiles.json", vl.profiles);
// notities: "inDays" = aantal dagen vanaf vandaag, zodat de demo altijd
// actuele notities toont, ongeacht wanneer ze bekeken wordt
w("notes.json", [
  { postcode: "2930", name: "Bram De Wit", inDays: 1 },
  { postcode: "3980", name: "Femke", inDays: 2 },
  { postcode: "9200", name: "Lotte V.", inDays: 3 },
  { postcode: "8020", name: "Pieter J.", inDays: 5 },
  { postcode: "3520", name: "Nina Claes", inDays: 4 },
  { postcode: "5038", name: "Mila de Groot", inDays: 6 },
  { postcode: "5038", name: "Mila de Groot", inDays: 7 },
]);

const al = build(ALKMAAR, "public/data/postcodes-alkmaar.geojson", { withTags: false });
w("advisor-postcodes-alkmaar.json", al.postcodes);
w("advisors-home-alkmaar.json", al.homes);
w("profiles-alkmaar.json", al.profiles);
w("notes-alkmaar.json", [{ postcode: "1815", name: "Fleur", inDays: 2 }]);

for (const [label, d] of [["Vlaanderen", vl], ["Alkmaar", al]]) {
  console.log(label);
  Object.entries(d.postcodes).forEach(([n, l]) => console.log(`  ${n.padEnd(15)} ${l.length} postcodes`));
}
