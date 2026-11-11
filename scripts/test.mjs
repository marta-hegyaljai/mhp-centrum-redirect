// Checks vercel.json against the old mhp-centrum.com URLs.
//
// The redirects are compiled with @vercel/routing-utils, the library Vercel
// itself uses to turn `redirects` into routes, then each legacy URL is matched
// the way Vercel does: first matching route wins, case-insensitive, `has: host`
// conditions honoured. Optionally (`--live`) every destination is fetched to
// make sure it answers 200 on mhp-coaching.ch (no redirect chain, no 404).
//
//   npm test            # rules only
//   npm run test:live   # rules + destinations answer 200

import { readFileSync } from "node:fs";
import { getTransformedRoutes } from "@vercel/routing-utils";

const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const { routes, error } = getTransformedRoutes({ redirects: config.redirects });
if (error) {
  console.error(error);
  process.exit(1);
}

const W = "https://www.mhp-coaching.ch";
const APP = "https://app.mhp-coaching.ch";

// [legacy URL, expected destination]. URLs from Google's index of
// mhp-centrum.com (Nov 2026), the archived pages in mhp-coaching-astro's
// docs/sources/www.mhp-centrum.com/, and the theme list on its /hypnose page.
const cases = [
  ["https://www.mhp-centrum.com/", `${W}/`],
  ["https://mhp-centrum.com/", `${W}/`],
  ["https://en.mhp-centrum.com/", `${W}/`],
  ["https://www.mhp-centrum.com/fribourg", `${W}/centre-hypnose-fribourg`],
  ["https://www.mhp-centrum.com/hypnose-fribourg", `${W}/centre-hypnose-fribourg`],
  ["https://www.mhp-centrum.com/hypnose-fribourg/", `${W}/centre-hypnose-fribourg`],
  ["https://www.mhp-centrum.com/lausanne", `${W}/centre-hypnose-fribourg`],
  ["https://www.mhp-centrum.com/geneve", `${W}/centre-hypnose-fribourg`],
  ["https://www.mhp-centrum.com/contact", `${W}/centre-hypnose-fribourg`],
  ["https://www.mhp-centrum.com/hypnose", `${W}/hypnose`],
  ["https://en.mhp-centrum.com/hypnotherapie", `${W}/hypnose`],
  ["https://www.mhp-centrum.com/faq", `${W}/hypnose`],
  ["https://www.mhp-centrum.com/hypnotherapie/stop-tabac", `${W}/hypnose/arret-du-tabac`],
  ["https://www.mhp-centrum.com/hypnose/arreter-de-fumer", `${W}/hypnose/arret-du-tabac`],
  ["https://www.mhp-centrum.com/hypnotherapie/troubles-anxieux", `${W}/hypnose/stress-anxiete`],
  ["https://www.mhp-centrum.com/hypnose/troubles-anxieux", `${W}/hypnose/stress-anxiete`],
  ["https://www.mhp-centrum.com/hypnotherapie/stress-burn-out", `${W}/hypnose/stress-anxiete`],
  ["https://www.mhp-centrum.com/hypnotherapie/phobies", `${W}/hypnose/stress-anxiete`],
  ["https://www.mhp-centrum.com/hypnotherapie/peur-de-lavion", `${W}/hypnose/stress-anxiete`],
  ["https://www.mhp-centrum.com/hypnotherapie/toc", `${W}/hypnose/stress-anxiete`],
  ["https://www.mhp-centrum.com/hypnotherapie/traumatismes-sspt", `${W}/hypnose/stress-anxiete`],
  ["https://mhp-centrum.com/hypnotherapie/pour/relaxation", `${W}/hypnose/stress-anxiete`],
  ["https://www.mhp-centrum.com/hypnotherapie/emotions-problemes-relationnels", `${W}/hypnose/stress-anxiete`],
  ["https://www.mhp-centrum.com/hypnotherapie/concentration-examen", `${W}/hypnose/concentration-examens`],
  ["https://www.mhp-centrum.com/hypnotherapie/sport-performance", `${W}/hypnose/concentration-examens`],
  ["https://en.mhp-centrum.com/hypnotherapie/enfants-et-ados", `${W}/hypnose/enfants-adolescents`],
  ["https://www.mhp-centrum.com/hypnotherapie/confiance-en-soi", `${W}/hypnose/confiance-en-soi`],
  ["https://www.mhp-centrum.com/hypnotherapie/estime-de-soi", `${W}/hypnose/confiance-en-soi`],
  ["https://www.mhp-centrum.com/hypnotherapie/parler-en-public", `${W}/hypnose/confiance-en-soi`],
  ["https://www.mhp-centrum.com/hypnotherapie/gestion-de-la-douleur", `${W}/hypnose/troubles-psychosomatiques`],
  ["https://www.mhp-centrum.com/hypnotherapie/syndrome-du-colon-irritable", `${W}/hypnose/troubles-psychosomatiques`],
  ["https://www.mhp-centrum.com/hypnotherapie/bruxisme", `${W}/hypnose/troubles-psychosomatiques`],
  ["https://mhp-centrum.com/hypnotherapie/troubles-alimentaires", `${W}/hypnose`],
  ["https://mhp-centrum.com/hypnotherapie/gestion-du-poids", `${W}/hypnose`],
  ["https://www.mhp-centrum.com/hypnotherapie/troubles-du-sommeil", `${W}/hypnose`],
  ["https://www.mhp-centrum.com/hypnotherapie/troubles-sexuels-feminins", `${W}/hypnose`],
  ["https://www.mhp-centrum.com/therapeutes", `${W}/therapeutes`],
  ["https://www.mhp-centrum.com/therapeutes/category/Hypnose", `${W}/therapeutes`],
  ["https://www.mhp-centrum.com/therapeutes/luca-sessa", `${W}/therapeutes`],
  ["https://www.mhp-centrum.com/therapeutes/laurent-trincat", `${W}/therapeutes`],
  ["https://www.mhp-centrum.com/therapeutes/marta-hegyaljai-python", `${W}/therapeutes/marta-hegyaljai-python`],
  ["https://www.mhp-centrum.com/hypnose-marta-hegyaljai-python", `${W}/therapeutes/marta-hegyaljai-python`],
  ["https://www.mhp-centrum.com/therapeutes/anne-zurcher-kondratowicz", `${W}/therapeutes/anne-zurcher-kondratowicz`],
  ["https://www.mhp-centrum.com/rdv", `${W}/appointments`],
  ["https://www.mhp-centrum.com/rdv-visite", `${W}/appointments`],
  ["https://www.mhp-centrum.com/formation", `${W}/formations`],
  ["https://www.mhp-centrum.com/agenda", `${W}/formations`],
  ["https://www.mhp-centrum.com/events/1415162842/comptabilite-and-administ", `${W}/formations`],
  ["https://www.mhp-centrum.com/a-propos-mhp", `${W}/ecole`],
  ["https://www.mhp-centrum.com/massage-lausanne", `${W}/`],
  ["https://www.mhp-centrum.com/drainage-lymphatique", `${W}/`],
  ["https://www.mhp-centrum.com/coaching", `${W}/`],
  ["https://www.mhp-centrum.com/bons-cadeaux", `${W}/`],
  ["https://www.mhp-centrum.com/pro", `${APP}/fr/salles`],
  ["https://therap.mhp-centrum.com/coworking-therapeutes", `${APP}/fr/salles`],
  ["https://therap.mhp-centrum.com/abo-pro", `${APP}/fr/salles`],
  ["https://ls.mhp-centrum.com/anything", `${APP}/fr/formations`],
  ["https://www.mhp-centrum.com/robots.txt", null], // served by public/robots.txt
];

function resolve(url) {
  const { hostname, pathname } = new URL(url);
  for (const route of routes) {
    if (!route.src || !route.headers?.Location) continue;
    const match = new RegExp(route.src, "i").exec(pathname);
    if (!match) continue;
    const hostOk = (route.has ?? []).every((h) => h.type !== "host" || h.value === hostname);
    if (!hostOk) continue;
    // Vercel fills $1…, and named groups from `:name` params.
    let location = route.headers.Location.replace(/\$(\d+)/g, (_, i) => match[+i] ?? "");
    return { status: route.status, location };
  }
  return null;
}

let failures = 0;
const destinations = new Set();
for (const [url, expected] of cases) {
  const got = resolve(url);
  const location = got?.location ?? null;
  const ok = location === expected && (got === null || got.status === 301);
  if (!ok) {
    failures++;
    console.log(`FAIL ${url}\n     expected ${expected}\n     got      ${location} (${got?.status})`);
  }
  if (location) destinations.add(location);
}
console.log(`${cases.length - failures}/${cases.length} legacy URLs redirect as expected`);

if (process.argv.includes("--live")) {
  for (const destination of destinations) {
    const res = await fetch(destination, { redirect: "manual" });
    // /fr/salles is the app's room booking: it sends visitors who are not
    // signed in to /fr/connexion?next=/fr/salles. Same target the mhp-hypnose
    // footer uses (« Location de cabinets »), so a sign-in redirect is expected.
    const loginWall = destination === `${APP}/fr/salles` && res.status === 307 &&
      (res.headers.get("location") ?? "").startsWith("/fr/connexion");
    const ok = res.status === 200 || loginWall;
    if (!ok) failures++;
    console.log(`${ok ? "ok  " : "FAIL"} ${res.status} ${destination}${loginWall ? " (sign-in page)" : ""}`);
  }
}

process.exit(failures ? 1 : 0);
