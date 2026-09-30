// DEMO-versie: er is bewust geen Firebase-koppeling. Alle aanpassingen blijven
// in de browser van de bezoeker (localStorage), zodat de demo nooit aan echte
// gedeelde data kan komen. Zelfde exports als de echte app, zodat App.jsx
// verder ongewijzigd kan blijven.
export const firebaseEnabled = false;

export function subscribeToOverrides() {
  return () => {};
}

export function saveOverridesShared() {
  return Promise.resolve();
}

export async function adminSignIn() {
  throw new Error("Niet beschikbaar in de demo");
}

export function adminSignOut() {
  return Promise.resolve();
}

export function subscribeToAdminAuth() {
  return () => {};
}
