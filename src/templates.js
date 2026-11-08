// HTML-templates. Elke functie krijgt de inhoud (uit content/*.yml) en geeft HTML terug.
const { marked } = require("marked");
const { icon } = require("./icons");

marked.setOptions({ gfm: true, breaks: false });

/* ---------- helpers ---------- */
const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attr = esc;
// Afbeeldingspaden uit het CMS beginnen met "/assets/..."; de site gebruikt relatieve paden
// zodat hij ook in een submap (bijv. github.io/Rovo/) werkt.
const img = (p) => String(p || "").replace(/^\/+/, "");
const md = (t) => marked.parse(String(t || "")).trim();
const mdInline = (t) => marked.parseInline(String(t || "")).trim();
const paragraphs = (t) => md(t);
const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";

const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="18" fill="#17171c" stroke="#e4202c" stroke-width="2"/><circle cx="20" cy="20" r="11" fill="none" stroke="#f5f5f7" stroke-width="2"/><circle cx="20" cy="20" r="5" fill="#e4202c"/><path d="M31 12a12 12 0 0 1 0 16" fill="none" stroke="#e4202c" stroke-width="2" stroke-linecap="round" opacity=".9"/></svg>`;

const NAV = [
  ["index.html", "Home"],
  ["diensten.html", "Diensten"],
  ["materiaal.html", "Materiaal"],
  ["over-ons.html", "Over ons"],
  ["contact.html", "Contact"],
];

function brand(site) {
  const [a, b] = splitBrand(site.bedrijfsnaam);
  return `<a class="brand" href="index.html" aria-label="${attr(site.bedrijfsnaam)}, naar de homepage">${LOGO}<span>${esc(a)}${b ? `<em>-</em>${esc(b)}` : ""}</span></a>`;
}
function splitBrand(name) {
  const i = String(name || "").indexOf("-");
  return i > 0 ? [name.slice(0, i), name.slice(i + 1)] : [name, ""];
}

/* ---------- head ---------- */
function head(site, page, seo, path) {
  const base = site.website_url.replace(/\/+$/, "");
  const canonical = `${base}/${path === "index.html" ? "" : path}`;
  const ogImage = /^https?:/.test(site.deelafbeelding) ? site.deelafbeelding : `${base}/${img(site.deelafbeelding)}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.bedrijfsnaam,
    description: site.omschrijving,
    url: `${base}/`,
    telephone: site.telefoon_internationaal,
    email: site.email,
    image: ogImage,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.adres.straat,
      postalCode: site.adres.postcode,
      addressLocality: site.adres.plaats,
      addressRegion: site.adres.provincie,
      addressCountry: "NL",
    },
    sameAs: [site.facebook].filter(Boolean),
    founder: { "@type": "Person", name: site.eigenaar },
    areaServed: "Nederland",
    priceRange: "€€",
  };
  return `<!DOCTYPE html>
<html lang="nl" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(seo.titel)}</title>
<meta name="description" content="${attr(seo.omschrijving)}">
<link rel="canonical" href="${attr(canonical)}">
<meta name="theme-color" content="#0b0b0d">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="${attr(site.bedrijfsnaam)}">
<meta property="og:title" content="${attr(seo.titel)}">
<meta property="og:description" content="${attr(seo.omschrijving)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${attr(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Sora:wght@600;700&display=swap">
<link rel="stylesheet" href="assets/css/style.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<a class="skip-link" href="#main">Naar de inhoud</a>
`;
}

/* ---------- header / footer ---------- */
function navLinks(current) {
  return NAV.map(([href, label]) => `<li><a href="${href}"${href === current ? ' aria-current="page"' : ""}>${label}</a></li>`).join("\n");
}

function header(site, current) {
  const tel = `tel:${site.telefoon_internationaal}`;
  return `<header class="site-header">
  <div class="container header-inner">
    ${brand(site)}
    <nav class="nav" aria-label="Hoofdmenu"><ul>
${navLinks(current)}
    </ul></nav>
    <div class="header-actions">
      <a class="btn btn-ghost btn-sm header-phone" href="${tel}">${icon("phone")}${esc(site.telefoon)}</a>
      <a class="btn btn-primary btn-sm header-phone" href="contact.html">Offerte aanvragen</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Menu openen"><span></span></button>
    </div>
  </div>
  <div class="mobile-nav" id="mobile-nav">
    <nav aria-label="Mobiel menu"><ul>
${navLinks(current)}
    </ul></nav>
    <div class="mobile-contact">
      <a class="btn btn-primary" href="contact.html">Offerte aanvragen</a>
      <a class="btn btn-ghost" href="${tel}">${icon("phone")}${esc(site.telefoon)}</a>
    </div>
  </div>
</header>
<main id="main">
`;
}

function cta(site) {
  const c = site.cta || {};
  return `<section class="section-tight">
  <div class="container">
    <div class="cta-band reveal">
      <div>
        ${has(c.eyebrow) ? `<span class="eyebrow">${esc(c.eyebrow)}</span>` : ""}
        <h2>${esc(c.titel)}</h2>
        <p>${esc(c.tekst)}</p>
      </div>
      <div class="actions">
        <a class="btn btn-primary btn-lg" href="contact.html">${esc(c.knop || "Vraag een offerte aan")}</a>
        <a class="btn btn-secondary btn-lg" href="tel:${site.telefoon_internationaal}">${icon("phone")}Bel ${esc(site.telefoon)}</a>
      </div>
    </div>
  </div>
</section>
`;
}

function footer(site, materiaal) {
  const cats = (materiaal.categorieen || []).slice(0, 4).map((c) => `<li><a href="materiaal.html#${attr(c.id)}">${esc(c.menunaam || c.titel)}</a></li>`).join("\n");
  return `</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        ${brand(site)}
        <p>${esc(site.footer_tekst)}</p>
        ${has(site.facebook) ? `<p><a class="social" href="${attr(site.facebook)}" target="_blank" rel="noopener">${icon("fb")} Volg ons op Facebook</a></p>` : ""}
      </div>
      <div>
        <h4>Navigatie</h4>
        <ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h4>Materiaal</h4>
        <ul>${cats}</ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="tel:${site.telefoon_internationaal}">${esc(site.telefoon)}</a></li>
          <li><a href="mailto:${attr(site.email)}">${esc(site.email)}</a></li>
          <li>${esc(site.adres.straat)}<br>${esc(site.adres.postcode)} ${esc(site.adres.plaats)}</li>
          ${has(site.kvk) ? `<li>KVK: ${esc(site.kvk)}</li>` : ""}
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; <span id="year">${new Date().getFullYear()}</span> ${esc(site.bedrijfsnaam)} &middot; Alle rechten voorbehouden</span>
      <span>${esc(site.eigenaar)} &middot; ${esc(site.adres.plaats)}${has(site.adres.provincie) ? ` (${esc(site.adres.provincie)})` : ""}</span>
    </div>
  </div>
</footer>
<script src="assets/js/main.js" defer></script>
</body>
</html>
`;
}

function pageHero(intro, crumb) {
  return `<section class="page-hero">
  <div class="container">
    <ol class="breadcrumb" aria-label="Kruimelpad"><li><a href="index.html">Home</a></li><li>${esc(crumb)}</li></ol>
    <h1>${esc(intro.titel)}</h1>
    ${has(intro.lead) ? `<p class="lead">${esc(intro.lead)}</p>` : ""}
  </div>
</section>
`;
}

function figure(src, alt, caption, cls = "figure tall reveal", extra = "") {
  if (!has(src)) return "";
  return `<figure class="${cls}"${extra}>
  <img src="${attr(img(src))}" alt="${attr(alt)}" loading="lazy">
  ${has(caption) ? `<figcaption>${esc(caption)}</figcaption>` : ""}
</figure>`;
}

/* ---------- pagina's ---------- */
function home(site, c, diensten) {
  const h = c.hero;
  const wave = Array.from({ length: 48 }, (_, i) => `<i style="--i:${i}"></i>`).join("");
  const homeDiensten = (diensten.diensten || []).filter((d) => d.op_homepage);
  return head(site, c, c.seo, "index.html") + header(site, "index.html") + `
<section class="hero">
  <div class="hero-bg"><img src="${attr(img(h.afbeelding))}" alt="${attr(h.afbeelding_alt)}" fetchpriority="high"></div>
  <div class="container">
    <div class="hero-content">
      ${has(h.eyebrow) ? `<span class="eyebrow">${esc(h.eyebrow)}</span>` : ""}
      <h1>${esc(h.titel)} <em>${esc(h.titel_accent)}</em></h1>
      <p class="lead">${esc(h.tekst)}</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="contact.html">${esc(h.knop_primair)} ${icon("arrow")}</a>
        <a class="btn btn-secondary btn-lg" href="materiaal.html">${esc(h.knop_secundair)}</a>
      </div>
      ${(h.tags || []).length ? `<div class="hero-tags" aria-label="Voor wie">${h.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
    </div>
  </div>
  <div class="wave" aria-hidden="true">${wave}</div>
</section>

<section class="usp-strip" aria-label="Waarom ${attr(site.bedrijfsnaam)}">
  <div class="container">
    ${(c.usps || []).map((u) => `<div class="usp">${icon(u.icoon)}<div><strong>${esc(u.titel)}</strong><span>${esc(u.tekst)}</span></div></div>`).join("\n    ")}
  </div>
</section>

<section class="section">
  <div class="container split">
    <div class="reveal">
      <span class="eyebrow">${esc(c.intro.eyebrow)}</span>
      <h2>${esc(c.intro.titel)}</h2>
      <p class="lead">${esc(c.intro.lead)}</p>
      ${paragraphs(c.intro.tekst)}
      <p><a class="btn btn-secondary" href="over-ons.html">${esc(c.intro.knop)} ${icon("arrow")}</a></p>
    </div>
    ${figure(c.intro.afbeelding, c.intro.afbeelding_alt, c.intro.bijschrift)}
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head center reveal">
      <span class="eyebrow">${esc(c.diensten_blok.eyebrow)}</span>
      <h2>${esc(c.diensten_blok.titel)}</h2>
      <p>${esc(c.diensten_blok.tekst)}</p>
    </div>
    <div class="grid grid-4">
      ${homeDiensten.map((d) => `<a class="card card-link reveal" href="diensten.html#${attr(d.id)}"><div class="icon">${icon(d.icoon)}</div><h3>${esc(d.titel)}</h3><p>${esc(d.korte_tekst || d.tekst)}</p><span class="more">Lees meer ${icon("arrow")}</span></a>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container split reverse">
    <div class="reveal">
      <span class="eyebrow">${esc(c.materiaal_blok.eyebrow)}</span>
      <h2>${esc(c.materiaal_blok.titel)}</h2>
      ${paragraphs(c.materiaal_blok.tekst)}
      <ul>${(c.materiaal_blok.punten || []).map((p) => `<li><strong>${esc(p.label)}</strong>: ${esc(p.tekst)}</li>`).join("")}</ul>
      ${has(c.materiaal_blok.slot) ? `<p>${esc(c.materiaal_blok.slot)}</p>` : ""}
      <p><a class="btn btn-secondary" href="materiaal.html">${esc(c.materiaal_blok.knop)} ${icon("arrow")}</a></p>
    </div>
    ${figure(c.materiaal_blok.afbeelding, c.materiaal_blok.afbeelding_alt, c.materiaal_blok.bijschrift)}
  </div>
</section>

<section class="section section-alt">
  <div class="container">
    <div class="section-head center reveal">
      <span class="eyebrow">${esc(c.werkwijze.eyebrow)}</span>
      <h2>${esc(c.werkwijze.titel)}</h2>
      <p>${esc(c.werkwijze.tekst)}</p>
    </div>
    <ol class="steps">
      ${(c.werkwijze.stappen || []).map((s) => `<li class="step reveal"><h3>${esc(s.titel)}</h3><p>${esc(s.tekst)}</p></li>`).join("\n      ")}
    </ol>
  </div>
</section>

<section class="section">
  <div class="container split">
    ${figure(c.over_blok.afbeelding, c.over_blok.afbeelding_alt, c.over_blok.bijschrift)}
    <div class="reveal">
      <span class="eyebrow">${esc(c.over_blok.eyebrow)}</span>
      <h2>${esc(c.over_blok.titel)}</h2>
      ${paragraphs(c.over_blok.tekst)}
      ${has(c.over_blok.quote) ? `<blockquote class="quote">“${esc(c.over_blok.quote)}”<cite>${esc(c.over_blok.quote_auteur)}</cite></blockquote>` : ""}
      <p><a class="btn btn-secondary" href="over-ons.html">${esc(c.over_blok.knop)} ${icon("arrow")}</a></p>
    </div>
  </div>
</section>

${(c.faq.vragen || []).length ? `<section class="section section-alt">
  <div class="container">
    <div class="section-head center reveal">
      <span class="eyebrow">${esc(c.faq.eyebrow)}</span>
      <h2>${esc(c.faq.titel)}</h2>
    </div>
    <div class="faq reveal">
      ${c.faq.vragen.map((q) => `<details><summary>${esc(q.vraag)}</summary><div class="answer">${md(q.antwoord)}</div></details>`).join("\n      ")}
    </div>
  </div>
</section>` : ""}
` + cta(site);
}

function diensten(site, c) {
  return head(site, c, c.seo, "diensten.html") + header(site, "diensten.html") + pageHero(c.intro, "Diensten") + `
<section class="section">
  <div class="container">
    <div class="grid grid-3">
      ${(c.diensten || []).map((d) => `<article class="card reveal" id="${attr(d.id)}" style="scroll-margin-top:90px">
        <div class="icon">${icon(d.icoon)}</div>
        <h3>${esc(d.titel)}</h3>
        <p>${esc(d.tekst)}</p>
        ${(d.punten || []).length ? `<ul class="muted" style="margin-top:14px;padding-left:1.1em;font-size:.97rem">${d.punten.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      </article>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container split">
    <div class="reveal">
      <span class="eyebrow">${esc(c.verwachten.eyebrow)}</span>
      <h2>${esc(c.verwachten.titel)}</h2>
      <ul class="spec-list" style="grid-template-columns:1fr">
        ${(c.verwachten.items || []).map((i) => `<li class="spec"><span class="brand-tag">${esc(i.label)}</span><div><strong>${esc(i.titel)}</strong><span>${esc(i.tekst)}</span></div></li>`).join("\n        ")}
      </ul>
    </div>
    ${figure(c.verwachten.afbeelding, c.verwachten.afbeelding_alt, c.verwachten.bijschrift)}
  </div>
</section>
` + cta(site);
}

function materiaal(site, c) {
  const spec = (i) => `<li class="spec"><span class="brand-tag">${esc(i.merk)}</span><div><strong>${esc(i.naam)}</strong><span>${esc(i.omschrijving)}</span></div></li>`;
  const groupTitle = (t, first) => has(t) ? `<h3 style="font-size:1rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);margin:${first ? "0" : "22px"} 0 10px">${esc(t)}</h3>` : "";
  return head(site, c, c.seo, "materiaal.html") + header(site, "materiaal.html") + pageHero(c.intro, "Materiaal") + `
<section class="section-tight">
  <div class="container">
    <ul class="equip-nav" aria-label="Snel naar">
      ${(c.categorieen || []).map((k) => `<li><a href="#${attr(k.id)}">${esc(k.menunaam || k.titel)}</a></li>`).join("")}
    </ul>
    ${(c.categorieen || []).map((k) => `
    <section class="equip-section" id="${attr(k.id)}">
      <div class="equip-grid">
        <div class="equip-intro reveal">
          <span class="eyebrow">${esc(k.eyebrow || k.menunaam)}</span>
          <h2>${esc(k.titel)}</h2>
          ${paragraphs(k.tekst)}
          ${has(k.afbeelding) ? `<figure class="figure"><img src="${attr(img(k.afbeelding))}" alt="${attr(k.afbeelding_alt)}" loading="lazy"></figure>` : ""}
        </div>
        <div class="reveal">
          ${(k.groepen || []).map((g, gi) => `${groupTitle(g.titel, gi === 0)}<ul class="spec-list">${(g.items || []).map(spec).join("")}</ul>`).join("\n          ")}
          ${has(k.opmerking) ? `<div class="note">${icon("info")}<span>${mdInline(k.opmerking)}</span></div>` : ""}
          ${has(k.sfeerfoto) ? figure(k.sfeerfoto, k.sfeerfoto_alt, k.sfeerfoto_bijschrift, "figure", ' style="margin-top:18px"') : ""}
        </div>
      </div>
    </section>`).join("\n")}
  </div>
</section>
` + cta(site);
}

function overOns(site, c) {
  const v = c.verhaal;
  return head(site, c, c.seo, "over-ons.html") + header(site, "over-ons.html") + pageHero(c.intro, "Over ons") + `
<section class="section">
  <div class="container split">
    <div class="reveal">
      <span class="eyebrow">${esc(v.eyebrow)}</span>
      <h2>${esc(v.titel)}</h2>
      ${has(v.lead) ? `<p class="lead">${esc(v.lead)}</p>` : ""}
      ${paragraphs(v.tekst_boven)}
      ${has(v.quote) ? `<blockquote class="quote">“${esc(v.quote)}”<cite>${esc(v.quote_auteur)}</cite></blockquote>` : ""}
      ${paragraphs(v.tekst_onder)}
    </div>
    ${figure(v.afbeelding, v.afbeelding_alt, v.bijschrift)}
  </div>
</section>

${(c.waarden.items || []).length ? `<section class="section section-alt">
  <div class="container">
    <div class="section-head center reveal">
      <span class="eyebrow">${esc(c.waarden.eyebrow)}</span>
      <h2>${esc(c.waarden.titel)}</h2>
    </div>
    <div class="facts">
      ${c.waarden.items.map((w) => `<div class="fact reveal"><strong>${esc(w.titel)}</strong><span>${esc(w.tekst)}</span></div>`).join("\n      ")}
    </div>
  </div>
</section>` : ""}

<section class="section">
  <div class="container split reverse">
    <div class="reveal">
      <span class="eyebrow">${esc(c.afsluiting.eyebrow)}</span>
      <h2>${esc(c.afsluiting.titel)}</h2>
      ${paragraphs(c.afsluiting.tekst)}
      <p>Mail naar <a href="mailto:${attr(site.email)}">${esc(site.email)}</a> of bel <a href="tel:${site.telefoon_internationaal}">${esc(site.telefoon)}</a>.</p>
      <p><a class="btn btn-primary" href="contact.html">${esc(c.afsluiting.knop)} ${icon("arrow")}</a></p>
    </div>
    ${figure(c.afsluiting.afbeelding, c.afsluiting.afbeelding_alt, "")}
  </div>
</section>
`;
}

function contact(site, c) {
  const f = c.formulier;
  const endpoint = has(site.formulier_endpoint) ? ` data-endpoint="${attr(site.formulier_endpoint)}"` : "";
  return head(site, c, c.seo, "contact.html") + header(site, "contact.html") + pageHero(c.intro, "Contact") + `
<section class="section">
  <div class="container contact-grid">
    <div class="reveal">
      <form class="form" id="contact-form" action="mailto:${attr(site.email)}" method="post" novalidate${endpoint} data-email="${attr(site.email)}" data-phone="${attr(site.telefoon)}">
        <div>
          <h2 style="font-size:1.5rem;margin-bottom:4px">${esc(f.titel)}</h2>
          <p class="hint">${esc(f.hint)}</p>
        </div>
        <div class="form-row">
          <div class="field"><label for="naam">Naam</label><input id="naam" name="naam" type="text" autocomplete="name" required></div>
          <div class="field"><label for="email">E-mailadres</label><input id="email" name="email" type="email" autocomplete="email" required></div>
        </div>
        <div class="form-row">
          <div class="field"><label for="telefoon">Telefoonnummer <small>(optioneel)</small></label><input id="telefoon" name="telefoon" type="tel" autocomplete="tel"></div>
          <div class="field"><label for="soort">Soort evenement</label>
            <select id="soort" name="soort"><option value="">Maak een keuze</option>${(f.soorten || []).map((s) => `<option>${esc(s)}</option>`).join("")}</select>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label for="datum">Datum <small>(optioneel)</small></label><input id="datum" name="datum" type="date"></div>
          <div class="field"><label for="locatie">Locatie <small>(optioneel)</small></label><input id="locatie" name="locatie" type="text" placeholder="Plaats of naam van de locatie"></div>
        </div>
        <div class="field"><label for="bericht">Je bericht</label><textarea id="bericht" name="bericht" required placeholder="${attr(f.bericht_placeholder)}"></textarea></div>
        <div class="hp" aria-hidden="true"><label>Laat dit veld leeg<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
        <div><button class="btn btn-primary btn-lg" type="submit">${esc(f.knop)} ${icon("arrow")}</button></div>
        <p class="hint">Liever direct contact? Bel <a href="tel:${site.telefoon_internationaal}">${esc(site.telefoon)}</a> of mail naar <a href="mailto:${attr(site.email)}">${esc(site.email)}</a>.</p>
        <div class="form-status" id="form-status" role="status" tabindex="-1"></div>
      </form>
    </div>
    <aside class="reveal">
      <span class="eyebrow">Contactgegevens</span>
      <ul class="contact-list">
        <li>${icon("phone")}<div><strong>Telefoon</strong><a href="tel:${site.telefoon_internationaal}">${esc(site.telefoon)}</a></div></li>
        <li>${icon("mail")}<div><strong>E-mail</strong><a href="mailto:${attr(site.email)}">${esc(site.email)}</a></div></li>
        <li>${icon("pin")}<div><strong>Adres</strong>${esc(site.adres.straat)}<br>${esc(site.adres.postcode)} ${esc(site.adres.plaats)}${has(site.adres.provincie) ? ` (${esc(site.adres.provincie)})` : ""}</div></li>
        ${has(site.kvk) ? `<li>${icon("doc")}<div><strong>KVK</strong>${esc(site.kvk)}</div></li>` : ""}
        ${has(site.facebook) ? `<li>${icon("fb")}<div><strong>Social</strong><a href="${attr(site.facebook)}" target="_blank" rel="noopener">${esc(site.facebook.replace(/^https?:\/\/(www\.)?/, ""))}</a></div></li>` : ""}
      </ul>
      ${has(site.kaart_embed_url) ? `<div class="map" style="margin-top:20px"><iframe src="${attr(site.kaart_embed_url)}" title="Kaart met de locatie van ${attr(site.bedrijfsnaam)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>` : ""}
    </aside>
  </div>
</section>

${(c.tips.items || []).length ? `<section class="section section-alt">
  <div class="container">
    <div class="section-head center reveal">
      <span class="eyebrow">${esc(c.tips.eyebrow)}</span>
      <h2>${esc(c.tips.titel)}</h2>
      <p>${esc(c.tips.tekst)}</p>
    </div>
    <div class="grid grid-4">
      ${c.tips.items.map((t) => `<div class="card reveal"><div class="icon">${icon(t.icoon)}</div><h3>${esc(t.titel)}</h3><p>${esc(t.tekst)}</p></div>`).join("\n      ")}
    </div>
  </div>
</section>` : ""}
`;
}

function notFound(site) {
  const seo = { titel: `Pagina niet gevonden | ${site.bedrijfsnaam}`, omschrijving: "Deze pagina bestaat niet (meer)." };
  return head(site, {}, seo, "404.html") + header(site, "") + `
<section class="section">
  <div class="container text-center">
    <span class="eyebrow" style="justify-content:center">Foutmelding 404</span>
    <h1>Deze pagina klinkt niet bekend</h1>
    <p class="lead" style="max-width:560px;margin-inline:auto">De pagina die je zoekt bestaat niet (meer) of is verplaatst. Ga terug naar de homepage of neem contact met ons op.</p>
    <p style="margin-top:28px"><a class="btn btn-primary btn-lg" href="index.html">Naar de homepage</a> <a class="btn btn-secondary btn-lg" href="contact.html">Contact</a></p>
  </div>
</section>
`;
}

module.exports = { home, diensten, materiaal, overOns, contact, notFound, footer };
