# Rovo-sound website

Nieuwe website voor [Rovo-sound](https://rovo-sound.nl): geluidssystemen en live-geluidstechniek uit Hasselt (Overijssel).

## Opzet

Een statische site zonder build-stap. Alles staat kant-en-klaar in deze map:

| Bestand / map        | Inhoud                                                       |
| -------------------- | ------------------------------------------------------------ |
| `index.html`         | Homepage (hero, USP's, diensten, materiaal, werkwijze, FAQ)  |
| `diensten.html`      | Diensten per doelgroep                                       |
| `materiaal.html`     | Volledig materiaaloverzicht met specificaties                |
| `over-ons.html`      | Het verhaal van Robin Vos en waar Rovo-sound voor staat      |
| `contact.html`       | Contactformulier, contactgegevens en kaart                   |
| `404.html`           | Foutpagina                                                   |
| `assets/css/style.css` | Stylesheet (mobile-first, donker thema, rode accentkleur)  |
| `assets/js/main.js`  | Menu, scroll-animaties, contactformulier                     |
| `assets/img/`        | Geoptimaliseerde foto's (WebP) en iconen                     |
| `sitemap.xml`, `robots.txt`, `favicon.svg` | SEO en browser-iconen                  |

## Lokaal bekijken

Open `index.html` in de browser, of start een simpele server:

```bash
python3 -m http.server 8080
```

en ga naar <http://localhost:8080>.

## Publiceren

De site kan op elke webhost of op GitHub Pages / Netlify / Vercel geplaatst worden: upload de inhoud van deze map naar de webroot.
Bij een webhost die `404.html` niet automatisch gebruikt, stel je die in als foutpagina.

## Contactformulier

Standaard opent het formulier het e-mailprogramma van de bezoeker met een vooringevuld bericht aan `info@rovo-sound.nl`.
Wil je het formulier server-side laten verzenden (bijvoorbeeld via [Formspree](https://formspree.io) of Netlify Forms)?
Zet dan in `contact.html` het attribuut `data-endpoint="https://..."` op het `<form id="contact-form">`-element.
Het formulier verstuurt dan een JSON-bericht naar dat adres.

## Aanpassen

- Telefoonnummer, e-mailadres, adres en KVK staan in de header, footer en op de contactpagina van elke HTML-pagina.
- Kleuren en lettertypen staan bovenin `assets/css/style.css` onder `:root`.
- Materiaal wijzigen: pas de lijsten in `materiaal.html` aan (elke regel is een `<li class="spec">`).
