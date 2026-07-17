/* DesignMatt-ers — NYC Subway Edition
   Renders the system map, project feed, trunk-line backdrop, and wiring. */

(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else node.setAttribute(k, v);
      }
    }
    (children || []).forEach((c) => node.appendChild(c));
    return node;
  }

  function svgEl(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "text") node.textContent = v;
        else node.setAttribute(k, v);
      }
    }
    return node;
  }

  function bulletEl(line, small) {
    const b = el("span", {
      class: "bullet" + (line.darkText ? " dark-text" : "") + (small ? " sm" : ""),
      text: line.bullet,
      "aria-hidden": "true",
    });
    b.style.background = line.color;
    return b;
  }

  /* ---------- System map (Vignelli-style diagram) ---------- */

  // Geometry: 45-degree departures from the About interchange, horizontal runs,
  // 45-degree arrivals into the Digital Leadership interchange, then a shared
  // black track to the Contact terminal.
  const MAP = {
    w: 1070,
    h: 640,
    about: { x: 90, y: 320 },
    process: { x: 830, y: 320 },
    contact: { x: 945, y: 320 },
    routes: {
      honeywell: { y: 150, dep: 260, arr: 660 },
      eda: { y: 240, dep: 170, arr: 750 },
      ecomdash: { y: 400, dep: 170, arr: 750 },
      founder: { y: 480, dep: 250, arr: 670 },
    },
    stations: {
      "safety-suite": { x: 350, route: "honeywell", labelSide: "above" },
      lifecare: { x: 540, route: "honeywell", labelSide: "above" },
      "eda-redesign": { x: 300, route: "eda", labelSide: "below" },
      "topbid-ds": { x: 470, route: "eda", labelSide: "below" },
      "topbid-mobile": { x: 640, route: "eda", labelSide: "below" },
      "ecomdash-onboarding": { x: 460, route: "ecomdash", labelSide: "above" },
      reprevive: { x: 350, route: "founder", labelSide: "below" },
      adspark: { x: 480, route: "founder", labelSide: "below" },
      bitflip: { x: 600, route: "founder", labelSide: "below" },
    },
  };

  function routePath(line) {
    const r = MAP.routes[line.id];
    const a = MAP.about;
    const p = MAP.process;
    return (
      "M " + a.x + " " + a.y +
      " L " + r.dep + " " + r.y +
      " L " + r.arr + " " + r.y +
      " L " + p.x + " " + p.y
    );
  }

  function stationName(id) {
    const proj = PROJECTS.find((p) => p.id === id);
    if (proj) return proj.station;
    const minor = MINOR_STATIONS.find((m) => m.id === id);
    return minor ? minor.station : id;
  }

  function buildSystemMap() {
    const svg = document.getElementById("system-map");
    svg.setAttribute("viewBox", "0 0 " + MAP.w + " " + MAP.h);

    // Shared trackage: Digital Leadership -> Contact
    svg.appendChild(
      svgEl("path", {
        d: "M " + MAP.process.x + " " + MAP.process.y + " L " + MAP.contact.x + " " + MAP.contact.y,
        stroke: "#0b0b0b",
        "stroke-width": 10,
        fill: "none",
        "stroke-linecap": "round",
      })
    );

    // Colored routes
    Object.values(LINES).forEach((line) => {
      svg.appendChild(
        svgEl("path", {
          d: routePath(line),
          stroke: line.color,
          "stroke-width": 10,
          fill: "none",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        })
      );
    });

    // Route bullets at the start of each horizontal run.
    // Lines below the About interchange get their bullet below the track so
    // nothing collides with the interchange labels.
    Object.values(LINES).forEach((line) => {
      const r = MAP.routes[line.id];
      const bulletY = r.y > MAP.about.y ? r.y + 30 : r.y - 26;
      const g = svgEl("g", {});
      g.appendChild(
        svgEl("circle", { cx: r.dep - 34, cy: bulletY, r: 15, fill: line.color })
      );
      g.appendChild(
        svgEl("text", {
          x: r.dep - 34,
          y: bulletY,
          "text-anchor": "middle",
          dy: "0.36em",
          "font-size": "15",
          "font-weight": "700",
          fill: line.darkText ? "#111" : "#fff",
          text: line.bullet,
        })
      );
      svg.appendChild(g);
    });

    // Project + minor stations
    Object.entries(MAP.stations).forEach(([id, st]) => {
      const line = LINES[st.route];
      const r = MAP.routes[st.route];
      const isProject = PROJECTS.some((p) => p.id === id);
      const g = svgEl("g", { class: "station", tabindex: "0", role: "link" });
      g.appendChild(
        svgEl("circle", {
          cx: st.x,
          cy: r.y,
          r: isProject ? 9 : 7,
          fill: "#fff",
          stroke: line.color,
          "stroke-width": 5,
        })
      );
      const above = st.labelSide === "above";
      const label = svgEl("text", {
        x: st.x,
        y: above ? r.y - 20 : r.y + 30,
        "text-anchor": "middle",
        class: "station-label",
        text: stationName(id),
      });
      g.appendChild(label);
      const target = isProject ? "#stop-" + id : "#about";
      g.setAttribute("aria-label", stationName(id) + " station — view details");
      g.addEventListener("click", () => scrollToTarget(target));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          scrollToTarget(target);
        }
      });
      svg.appendChild(g);
    });

    // Interchanges + terminal
    const specials = [
      { x: MAP.about.x, y: MAP.about.y, name: "About Me", sub: "All lines board here", target: "#about", labelX: MAP.about.x, nameY: MAP.about.y + 46, anchor: "middle" },
      // Label sits up-and-right of the interchange, clear of the arriving diagonals.
      { x: MAP.process.x, y: MAP.process.y, name: "Digital Leadership", sub: "All lines run via process", target: "#process", labelX: MAP.process.x + 18, nameY: MAP.process.y - 48, anchor: "start" },
      { x: MAP.contact.x, y: MAP.contact.y, name: "Contact", sub: "Terminal", target: "#contact", labelX: MAP.contact.x, nameY: MAP.contact.y + 46, anchor: "middle" },
    ];
    specials.forEach((s) => {
      const g = svgEl("g", { class: "station", tabindex: "0", role: "link" });
      g.appendChild(
        svgEl("circle", { cx: s.x, cy: s.y, r: 13, fill: "#fff", stroke: "#0b0b0b", "stroke-width": 5 })
      );
      g.appendChild(
        svgEl("text", {
          x: s.labelX,
          y: s.nameY,
          "text-anchor": s.anchor,
          class: "station-label",
          text: s.name,
        })
      );
      g.appendChild(
        svgEl("text", {
          x: s.labelX,
          y: s.nameY + 18,
          "text-anchor": s.anchor,
          class: "station-sub",
          text: s.sub,
        })
      );
      g.setAttribute("aria-label", s.name + " — " + s.sub);
      g.addEventListener("click", () => scrollToTarget(s.target));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          scrollToTarget(s.target);
        }
      });
      svg.appendChild(g);
    });
  }

  function scrollToTarget(sel) {
    const target = document.querySelector(sel);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- Legend ---------- */

  function buildLegend() {
    const wrap = document.getElementById("legend");
    Object.values(LINES).forEach((line) => {
      wrap.appendChild(
        el("div", { class: "legend-item" }, [
          bulletEl(line),
          el("div", { class: "names" }, [
            el("span", { class: "line-name", text: line.name }),
            el("span", { class: "line-desc", text: line.description }),
          ]),
        ])
      );
    });
  }

  /* ---------- Project feed ---------- */

  function buildFeed() {
    const feed = document.getElementById("feed-inner");
    PROJECTS.forEach((project, index) => {
      const line = LINES[project.lineId];
      const isLeft = index % 2 === 0;

      const caseStudy = el("div", { class: "case-study" });
      project.caseStudy.forEach((section) => {
        caseStudy.appendChild(el("h4", { text: section.heading }));
        caseStudy.appendChild(el("p", { text: section.body }));
      });
      caseStudy.appendChild(
        el("a", {
          class: "source-link",
          href: project.link,
          target: "_blank",
          rel: "noopener",
          text: "Original case study ↗",
        })
      );

      const toggle = el("button", {
        class: "stop-toggle",
        type: "button",
        "aria-expanded": "false",
        text: "View Station →",
      });

      const card = el(
        "div",
        { class: "stop-card" },
        [
          el("div", { class: "line-tag" }, [
            bulletEl(line, true),
            el("span", { class: "line-label", text: line.name + " · " + project.station + " St" }),
          ]),
          el("h3", { text: project.title }),
          el("div", { class: "role", text: project.role }),
          el("p", { class: "summary", text: project.summary }),
          el(
            "div",
            { class: "chips" },
            project.tools.map((t) => el("span", { class: "chip", text: t }))
          ),
          el("div", { class: "impact" }, [
            el("span", { class: "impact-label", text: "Impact" }),
            el("p", { text: project.impact }),
          ]),
          toggle,
          caseStudy,
        ]
      );
      card.style.setProperty("--line-color", line.color);

      toggle.addEventListener("click", () => {
        const open = card.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "Exit Station ←" : "View Station →";
      });

      feed.appendChild(
        el("div", {
          class: "stop " + (isLeft ? "left" : "right"),
          id: "stop-" + project.id,
          "data-id": project.id,
        }, [card])
      );
    });
  }

  /* ---------- Trunk-line backdrop (desktop) ---------- */

  function drawTrunk() {
    const svg = document.getElementById("trunk-svg");
    const feed = document.getElementById("feed");
    if (!svg || !feed) return;
    svg.innerHTML = "";

    const width = feed.clientWidth;
    const height = feed.clientHeight;
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);
    svg.setAttribute("preserveAspectRatio", "none");

    const lineIds = Object.keys(LINES);
    const centerX = width / 2;
    const spread = 18;

    // Parallel trunks running the feed's full height
    lineIds.forEach((id, i) => {
      const x = centerX + (i - (lineIds.length - 1) / 2) * spread;
      svg.appendChild(
        svgEl("path", {
          d: "M " + x + " 0 L " + x + " " + height,
          stroke: LINES[id].color,
          "stroke-width": 10,
          fill: "none",
          opacity: 0.18,
        })
      );
    });

    // Branch + station dot per stop
    document.querySelectorAll(".stop").forEach((stop, index) => {
      const project = PROJECTS.find((p) => p.id === stop.dataset.id);
      if (!project) return;
      const line = LINES[project.lineId];
      const lineIndex = lineIds.indexOf(project.lineId);
      const trunkX = centerX + (lineIndex - (lineIds.length - 1) / 2) * spread;

      const y = stop.offsetTop + stop.offsetHeight / 2;
      const isLeft = index % 2 === 0;
      const stationX = isLeft ? centerX + width * 0.06 : centerX - width * 0.06;

      svg.appendChild(
        svgEl("path", {
          d:
            "M " + trunkX + " " + (y - 220) +
            " L " + trunkX + " " + (y - 60) +
            " C " + trunkX + " " + y + " " + stationX + " " + y + " " + stationX + " " + y,
          stroke: line.color,
          "stroke-width": 10,
          fill: "none",
          "stroke-linecap": "round",
          opacity: 0.18,
          "data-branch": project.id,
        })
      );
      svg.appendChild(
        svgEl("circle", {
          cx: stationX,
          cy: y,
          r: 9,
          fill: "#fff",
          stroke: line.color,
          "stroke-width": 6,
          opacity: 0.35,
          "data-station": project.id,
        })
      );
    });

    highlightTrunk(activeStopId);
  }

  let activeStopId = null;

  function highlightTrunk(id) {
    const svg = document.getElementById("trunk-svg");
    if (!svg) return;
    svg.querySelectorAll("[data-branch]").forEach((p) => {
      p.setAttribute("opacity", p.dataset.branch === id ? 1 : 0.18);
    });
    svg.querySelectorAll("[data-station]").forEach((c) => {
      const active = c.dataset.station === id;
      c.setAttribute("opacity", active ? 1 : 0.35);
      c.setAttribute("r", active ? 14 : 9);
    });
  }

  /* ---------- Scroll spy ---------- */

  function watchStops() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeStopId = entry.target.dataset.id;
            document.querySelectorAll(".stop-card").forEach((c) => c.classList.remove("active"));
            entry.target.querySelector(".stop-card").classList.add("active");
            highlightTrunk(activeStopId);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    document.querySelectorAll(".stop").forEach((s) => observer.observe(s));
  }

  /* ---------- About / process / footer ---------- */

  function buildAbout() {
    const wrap = document.getElementById("about-body");
    ABOUT.body.forEach((p) => wrap.appendChild(el("p", { class: "body-text", text: p })));
    document.getElementById("about-tagline").textContent = "“" + ABOUT.tagline + "”";
    const founders = document.getElementById("founder-stations");
    MINOR_STATIONS.forEach((m) => {
      founders.appendChild(
        el("li", {}, [
          bulletEl(LINES[m.lineId], true),
          el("div", { class: "names" }, [
            el("span", { class: "line-name", text: m.station }),
            el("span", { class: "line-desc", text: m.note }),
          ]),
        ])
      );
    });
  }

  function buildProcess() {
    const wrap = document.getElementById("process-list");
    PROCESS.points.forEach((pt) => {
      wrap.appendChild(
        el("div", { class: "process-item" }, [
          el("h4", { text: pt.heading }),
          el("p", { text: pt.body }),
        ])
      );
    });
  }

  function buildFooter() {
    const wrap = document.getElementById("footer-lines");
    Object.values(LINES).forEach((line) => {
      wrap.appendChild(
        el("li", {}, [
          bulletEl(line),
          el("div", { class: "names" }, [
            el("span", { class: "line-name", text: line.name }),
            el("span", { class: "line-desc", text: "Good service" }),
          ]),
        ])
      );
    });
    document.getElementById("contact-email").textContent = CONTACT.email;
    document.getElementById("contact-card").href = "mailto:" + CONTACT.email;
    document.getElementById("year").textContent = new Date().getFullYear();
  }

  /* ---------- Boot ---------- */

  document.addEventListener("DOMContentLoaded", () => {
    buildSystemMap();
    buildLegend();
    buildFeed();
    buildAbout();
    buildProcess();
    buildFooter();
    watchStops();
    drawTrunk();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawTrunk, 150);
    });
    // Re-draw once fonts/layout settle
    window.addEventListener("load", drawTrunk);
  });
})();
