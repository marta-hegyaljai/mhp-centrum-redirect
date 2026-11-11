# mhp-centrum-redirect

Permanent (301) redirects from the former **mhp | centrum** domain
(`mhp-centrum.com`, an expired Squarespace site) to the matching pages of
**www.mhp-coaching.ch**, so links, bookmarks and Google's ranking for the old
pages carry over to the new site instead of hitting « Website Expired ».

It is a Vercel project with no build step: everything is in `vercel.json`.
`public/` holds only a `robots.txt` (lets Google crawl the redirects) and a
fallback page that is never served in practice.

## Where the old pages go

Each rule is in `vercel.json`. The first rule that matches wins.

| Old URL (any of `mhp-centrum.com`, `www.`, `en.`) | New page |
| :- | :- |
| `/` | `www.mhp-coaching.ch/` |
| `/fribourg`, `/hypnose-fribourg`, `/lausanne`, `/geneve`, `/centres`, `/contact` | `/centre-hypnose-fribourg` (the only centre today) |
| `/hypnose`, `/hypnotherapie`, `/faq` | `/hypnose` |
| `/hypnotherapie/…`, `/hypnose/…`, `/hypnotherapie/pour/…`, by theme: | |
| tabac, fumer | `/hypnose/arret-du-tabac` |
| concentration, examens, sport, performance | `/hypnose/concentration-examens` |
| enfants, ados | `/hypnose/enfants-adolescents` |
| confiance, estime de soi, parler en public | `/hypnose/confiance-en-soi` |
| douleur, côlon irritable, bruxisme | `/hypnose/troubles-psychosomatiques` |
| anxiété, stress, burn-out, phobies, peur de l'avion, TOC, panique, relaxation, émotions, relations, traumatismes | `/hypnose/stress-anxiete` |
| any other theme (sommeil, poids, alimentation, troubles sexuels…) | `/hypnose` |
| `/therapeutes/marta-hegyaljai-python`, `/hypnose-marta-hegyaljai-python` | `/therapeutes/marta-hegyaljai-python` |
| `/therapeutes/anne-zurcher-kondratowicz` | `/therapeutes/anne-zurcher-kondratowicz` |
| `/therapeutes`, any other `/therapeutes/…` | `/therapeutes` |
| `/rdv`, `/rdv-visite`, `/prendre-rdv`, `/rendez-vous`, `/reservation`, `/booking` | `/appointments` |
| `/formation(s)`, `/agenda`, `/events/…` | `/formations` |
| `/a-propos-mhp`, `/a-propos`, `/about` | `/ecole` |
| `/pro`, `/collabs`, `/abo-pro`, `/coworking-therapeutes`, `/location-cabinets` | `app.mhp-coaching.ch/fr/salles` |
| `therap.mhp-centrum.com/…` (cabinet rental, partner programme) | `app.mhp-coaching.ch/fr/salles` |
| `ls.mhp-centrum.com/…` (workshops) | `app.mhp-coaching.ch/fr/formations` |
| anything else (massages, drainage, coaching, bons cadeaux…) | `www.mhp-coaching.ch/` |

Query strings are kept. `app.mhp-coaching.ch/fr/salles` asks visitors who are
not signed in to sign in first, as it does from the mhp-hypnose footer.

## Test

```sh
npm install
npm test            # every known old URL → its expected destination
npm run test:live   # the same, and every destination answers 200 today
```

The test compiles `vercel.json` with `@vercel/routing-utils`, the library
Vercel uses itself. When you add a rule, add its old URL to `cases` in
`scripts/test.mjs`.

## Deploy (one time)

1. **Vercel → Add New → Project →** import `marta-hegyaljai/mhp-centrum-redirect`.
   Framework preset: *Other*. Leave the build settings empty (they come
   from `vercel.json`). Deploy.
2. **Project → Settings → Domains → add**: `mhp-centrum.com`,
   `www.mhp-centrum.com` and, if their old pages should redirect too,
   `en.mhp-centrum.com`, `therap.mhp-centrum.com`, `ls.mhp-centrum.com`.
   Don't let Vercel redirect one of these domains to another: each must serve
   this project directly, so every old page goes straight to its new page in
   one hop.
3. **DNS at GoDaddy** (the domain's nameservers are `ns71/ns72.domaincontrol.com`).
   Vercel shows the exact values for each domain. Typically:

   | Name | Type | Today | Change to |
   | :- | :- | :- | :- |
   | `@` | A | four Squarespace IPs (198.185.159.144/145, 198.49.23.144/145) and 216.150.1.1 | **only** the A record Vercel shows (delete the four Squarespace ones) |
   | `www` | CNAME | `ext-sq.squarespace.com` | the CNAME Vercel shows |
   | `en` | CNAME | Weglot (`…translate-cf.weglot.io`) | the CNAME Vercel shows |
   | `therap` | CNAME | `ext-cust.squarespace.com` | the CNAME Vercel shows |
   | `ls` | CNAME | `spaces.nexudus.com` | the CNAME Vercel shows, **only if** the Nexudus space is no longer used |

   **Do not touch the MX or TXT records.** E-mail to `@mhp-centrum.com` runs on
   Google Workspace (MX `aspmx.l.google.com`…), and the TXT records hold the
   SPF and the Google Search Console verifications.

4. Check: `curl -I https://www.mhp-centrum.com/hypnose-fribourg` should
   answer `301` with `location: https://www.mhp-coaching.ch/centre-hypnose-fribourg`.
5. **Google Search Console**: in the `mhp-centrum.com` property (it is already
   verified by TXT), use *Settings → Change of address* → `www.mhp-coaching.ch`.
   That tells Google the move is permanent and speeds up the transfer.

Keep the domain registered, and this project live, for at least a year, and
ideally for good: links from other sites keep passing their value only while
the redirects are up.
