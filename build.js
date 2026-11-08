#!/usr/bin/env node
/**
 * Bouwt de website: leest content/*.yml, vult de templates en schrijft alles naar dist/.
 *   node build.js            eenmalig bouwen
 *   node build.js --watch    opnieuw bouwen bij elke wijziging in content/, src/ of assets/
 */
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const T = require("./src/templates");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
const MAX_IMAGE_WIDTH = 1920;

function load(name) {
  const file = path.join(ROOT, "content", `${name}.yml`);
  try {
    return yaml.load(fs.readFileSync(file, "utf8")) || {};
  } catch (e) {
    console.error(`\nFout in content/${name}.yml:\n${e.message}\n`);
    process.exit(1);
  }
}

async function optimizeImages(srcDir, dstDir) {
  fs.mkdirSync(dstDir, { recursive: true });
  let sharp = null;
  try { sharp = require("sharp"); } catch { console.warn("sharp niet beschikbaar: afbeeldingen worden ongewijzigd gekopieerd."); }
  for (const name of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, name);
    const dst = path.join(dstDir, name);
    if (fs.statSync(src).isDirectory()) { await optimizeImages(src, dst); continue; }
    const ext = path.extname(name).toLowerCase();
    if (sharp && [".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      try {
        const image = sharp(src, { failOn: "none" }).rotate();
        const meta = await image.metadata();
        if ((meta.width || 0) > MAX_IMAGE_WIDTH) {
          // Grote foto's (bijv. rechtstreeks van een telefoon) worden verkleind voor de live site.
          await image.resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true }).toFile(dst);
          console.log(`  verkleind: ${name} (${meta.width}px -> ${MAX_IMAGE_WIDTH}px)`);
          continue;
        }
      } catch (e) {
        console.warn(`  kon ${name} niet verwerken (${e.message}); kopieer origineel`);
      }
    }
    fs.copyFileSync(src, dst);
  }
}

function sitemap(site) {
  const base = site.website_url.replace(/\/+$/, "");
  const urls = [["", "1.0"], ["diensten.html", "0.9"], ["materiaal.html", "0.8"], ["over-ons.html", "0.7"], ["contact.html", "0.9"]];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schema/0.9">\n${urls.map(([u, p]) => `  <url><loc>${base}/${u}</loc><priority>${p}</priority></url>`).join("\n")}\n</urlset>\n`;
}

async function build() {
  const started = Date.now();
  const site = load("instellingen");
  const home = load("home"), diensten = load("diensten"), materiaal = load("materiaal"), over = load("over-ons"), contact = load("contact");

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const foot = T.footer(site, materiaal);
  const pages = {
    "index.html": T.home(site, home, diensten) + foot,
    "diensten.html": T.diensten(site, diensten) + foot,
    "materiaal.html": T.materiaal(site, materiaal) + foot,
    "over-ons.html": T.overOns(site, over) + foot,
    "contact.html": T.contact(site, contact) + foot,
    "404.html": T.notFound(site) + foot,
  };
  for (const [name, html] of Object.entries(pages)) fs.writeFileSync(path.join(OUT, name), html);

  fs.cpSync(path.join(ROOT, "assets", "css"), path.join(OUT, "assets", "css"), { recursive: true });
  fs.cpSync(path.join(ROOT, "assets", "js"), path.join(OUT, "assets", "js"), { recursive: true });
  await optimizeImages(path.join(ROOT, "assets", "img"), path.join(OUT, "assets", "img"));
  fs.copyFileSync(path.join(ROOT, "favicon.svg"), path.join(OUT, "favicon.svg"));
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemap(site));
  fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.website_url.replace(/\/+$/, "")}/sitemap.xml\n`);
  fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
  if (site.eigen_domein && String(site.eigen_domein).trim()) fs.writeFileSync(path.join(OUT, "CNAME"), String(site.eigen_domein).trim() + "\n");

  console.log(`Site gebouwd in dist/ (${Object.keys(pages).length} pagina's, ${Date.now() - started} ms)`);
}

build().then(() => {
  if (!process.argv.includes("--watch")) return;
  console.log("Wacht op wijzigingen in content/, src/ en assets/ ...");
  let timer;
  for (const dir of ["content", "src", "assets"]) {
    fs.watch(path.join(ROOT, dir), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => build().catch((e) => console.error(e)), 150);
    });
  }
}).catch((e) => { console.error(e); process.exit(1); });
