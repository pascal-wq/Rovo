# Rovo-sound website

Website van [Rovo-sound](https://rovo-sound.nl): geluidssystemen en live-geluidstechniek uit Hasselt (Overijssel).

De site is statisch en snel, maar de **teksten en foto's zijn zonder technische kennis aan te passen** via een beheerscherm. Elke wijziging wordt automatisch opnieuw gebouwd en gepubliceerd.

---

## Voor Robin: teksten en foto's aanpassen

1. Ga naar **[app.pagescms.org](https://app.pagescms.org)** en log in met het e-mailadres waarmee je bent uitgenodigd.
2. Open **Rovo**. Links zie je de onderdelen van de site:
   - **Bedrijfsgegevens**: telefoonnummer, e-mail, adres, KVK, Facebook en de tekst onderaan elke pagina.
   - **Homepage**, **Diensten**, **Materiaal**, **Over ons**, **Contact**: alle teksten per pagina.
   - **Foto's**: alle afbeeldingen. Hier kun je nieuwe foto's uploaden.
3. Pas de tekst aan en klik op **Save**.
4. Na 1 tot 2 minuten staat de wijziging live op de site. Ververs de pagina in je browser (soms is Ctrl+F5 nodig).

**Foto vervangen**: klik bij het veld "Foto" op de huidige afbeelding, kies **Upload** of selecteer een foto die al in de lijst staat. Grote foto's (bijvoorbeeld rechtstreeks van je telefoon) worden automatisch verkleind, dus je hoeft ze vooraf niet te bewerken. Liggende foto's werken het beste.

**Nieuwe dienst of apparatuur toevoegen**: open Diensten of Materiaal, klik op **Add** onder de lijst, vul de velden in en sla op. Items kun je ook verslepen om de volgorde te wijzigen.

**Iets fout gegaan?** Alles wordt bewaard als versiegeschiedenis. Vraag Pascal om een eerdere versie terug te zetten.

---

## Voor de beheerder: eenmalige inrichting

### 1. GitHub Pages inschakelen

In de repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**. Vanaf dan bouwt en publiceert de workflow in `.github/workflows/deploy.yml` de site bij elke wijziging op `main`. De site staat daarna op `https://<gebruiker>.github.io/Rovo/`.

### 2. Eigen domein koppelen (rovo-sound.nl)

1. Vul in `content/instellingen.yml` het veld `eigen_domein` in (bijvoorbeeld `rovo-sound.nl`). Het bouwscript maakt dan het benodigde `CNAME`-bestand aan.
2. Zet in GitHub **Settings → Pages → Custom domain** hetzelfde domein en vink **Enforce HTTPS** aan.
3. Zet bij de domeinregistrar een `CNAME`-record van `www` naar `<gebruiker>.github.io` en de A-records van de kale domeinnaam naar de IP-adressen van GitHub Pages (zie de GitHub Pages-documentatie).

### 3. Pages CMS koppelen

1. Ga naar [app.pagescms.org](https://app.pagescms.org), log in met GitHub en installeer de Pages CMS GitHub App op deze repository.
2. Open de repository in Pages CMS. De configuratie staat al in `.pages.yml`.
3. Nodig Robin uit via **Settings → Collaborators** met zijn e-mailadres. Hij heeft geen GitHub-account nodig.

### 4. Contactformulier (optioneel)

Standaard opent het formulier het e-mailprogramma van de bezoeker met een vooringevuld bericht. Voor echte verzending maak je een gratis formulier aan bij bijvoorbeeld [Formspree](https://formspree.io) en vul je het adres in bij **Bedrijfsgegevens → Formulier-verzendadres** (`formulier_endpoint` in `content/instellingen.yml`).

---

## Technische opzet

| Map / bestand | Inhoud |
| --- | --- |
| `content/*.yml` | Alle teksten en verwijzingen naar foto's. Dit is wat het CMS bewerkt. |
| `assets/img/` | Foto's en iconen (uploadmap van het CMS). |
| `assets/css/style.css` | Stylesheet (mobile-first, donker thema, kleuren in `:root`). |
| `assets/js/main.js` | Menu, scroll-animaties en contactformulier. |
| `src/templates.js` | HTML-templates per pagina. |
| `src/icons.js` | Inline SVG-iconen die in het CMS gekozen kunnen worden. |
| `build.js` | Bouwt `dist/` uit content + templates, verkleint grote foto's, maakt sitemap en robots.txt. |
| `.pages.yml` | Configuratie van het beheerscherm (Pages CMS). |
| `.github/workflows/` | `deploy.yml` publiceert naar GitHub Pages, `check.yml` controleert pull requests. |

### Lokaal bouwen

```bash
npm install
npm run build     # bouwt naar dist/
npm run watch     # bouwt opnieuw bij elke wijziging
npm run serve     # bouwt en start een lokale server
```

De map `dist/` is het resultaat en kan op elke webhost geplaatst worden. Hij staat niet in git.

### Nieuwe velden of secties

Voeg het veld toe in het juiste `content/*.yml`, gebruik het in `src/templates.js` en beschrijf het in `.pages.yml` zodat het in het beheerscherm verschijnt. Afbeeldingspaden in de content beginnen met `/assets/img/`; het bouwscript maakt ze relatief zodat de site ook in een submap werkt.
