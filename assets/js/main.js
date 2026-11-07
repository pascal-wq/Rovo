/* Rovo-sound — site scripts (no dependencies) */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* Mobile navigation ---------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* Header shadow on scroll ---------------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Reveal on scroll ----------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Footer year ---------------------------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* Contact form ----------------------------------------------------------
     Works out of the box: builds an e-mail in the visitor's mail client.
     To send server-side instead, set data-endpoint on the <form> to a
     Formspree/Netlify/your own endpoint; the form will POST as JSON.
  ------------------------------------------------------------------------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    var showStatus = function (type, msg) {
      status.className = "form-status is-visible " + type;
      status.textContent = msg;
      status.focus();
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector(".hp input") && form.querySelector(".hp input").value) return; // honeypot
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      var endpoint = form.getAttribute("data-endpoint");

      if (endpoint) {
        var btn = form.querySelector("button[type=submit]");
        btn.disabled = true;
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (!r.ok) throw new Error("Request failed");
          form.reset();
          showStatus("ok", "Bedankt! Je bericht is verzonden. We nemen zo snel mogelijk contact met je op.");
        }).catch(function () {
          showStatus("err", "Verzenden is niet gelukt. Bel ons op 06 - 15 50 92 05 of mail naar info@rovo-sound.nl.");
        }).finally(function () { btn.disabled = false; });
        return;
      }

      var lines = [
        "Naam: " + data.naam,
        "E-mail: " + data.email,
        "Telefoon: " + (data.telefoon || "-"),
        "Soort evenement: " + (data.soort || "-"),
        "Datum: " + (data.datum || "-"),
        "Locatie: " + (data.locatie || "-"),
        "",
        data.bericht
      ];
      var subject = "Aanvraag via rovo-sound.nl" + (data.soort ? " - " + data.soort : "");
      window.location.href = "mailto:info@rovo-sound.nl?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      showStatus("ok", "Je e-mailprogramma wordt geopend met je bericht. Lukt dat niet? Mail dan direct naar info@rovo-sound.nl.");
    });
  }
})();
