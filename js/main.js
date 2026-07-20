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

  // Live references into the map SVG so the living-map choreography can
  // draw lines, pop stations, and run trains after the fact.
  const MAPREFS = {
    svg: null,
    paths: {},
    casings: {},
    stations: {},
    bullets: {},
    specials: [],
    shared: null,
  };

  function buildSystemMap() {
    const svg = document.getElementById("system-map");
    svg.setAttribute("viewBox", "0 0 " + MAP.w + " " + MAP.h);
    MAPREFS.svg = svg;

    // Shared trackage: Digital Leadership -> Contact
    MAPREFS.shared = svgEl("path", {
      d: "M " + MAP.process.x + " " + MAP.process.y + " L " + MAP.contact.x + " " + MAP.contact.y,
      stroke: "#111111",
      "stroke-width": 10,
      fill: "none",
      "stroke-linecap": "round",
    });
    svg.appendChild(MAPREFS.shared);

    // Colored routes. Lines whose color can't reach 3:1 against the white map
    // (the yellow shuttle) get a dark casing stroke underneath — the classic
    // transit-map treatment — so the route stays visible to low-vision riders.
    Object.values(LINES).forEach((line) => {
      if (line.casing) {
        MAPREFS.casings[line.id] = svgEl("path", {
          d: routePath(line),
          stroke: line.casing,
          "stroke-width": 14,
          fill: "none",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        });
        svg.appendChild(MAPREFS.casings[line.id]);
      }
      MAPREFS.paths[line.id] = svgEl("path", {
        d: routePath(line),
        stroke: line.color,
        "stroke-width": 10,
        fill: "none",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      });
      svg.appendChild(MAPREFS.paths[line.id]);
    });

    // Route bullets at the start of each horizontal run.
    // Lines below the About interchange get their bullet below the track so
    // nothing collides with the interchange labels.
    Object.values(LINES).forEach((line) => {
      const r = MAP.routes[line.id];
      const bulletY = r.y > MAP.about.y ? r.y + 30 : r.y - 26;
      const g = svgEl("g", {});
      g.appendChild(
        svgEl("circle", {
          cx: r.dep - 34,
          cy: bulletY,
          r: 17,
          fill: line.color,
          stroke: line.casing || "none",
          "stroke-width": line.casing ? 2 : 0,
        })
      );
      g.appendChild(
        svgEl("text", {
          x: r.dep - 34,
          y: bulletY,
          "text-anchor": "middle",
          dy: "0.36em",
          "font-size": "19",
          "font-weight": "700",
          fill: line.darkText ? "#111111" : "#ffffff",
          text: line.bullet,
        })
      );
      MAPREFS.bullets[line.id] = g;
      svg.appendChild(g);
    });

    // Project + minor stations
    Object.entries(MAP.stations).forEach(([id, st]) => {
      const line = LINES[st.route];
      const r = MAP.routes[st.route];
      const isProject = PROJECTS.some((p) => p.id === id);
      const g = svgEl("g", { class: "station", tabindex: "0", role: "link" });
      const dotR = isProject ? 9 : 7;
      if (line.casing) {
        g.appendChild(
          svgEl("circle", {
            cx: st.x,
            cy: r.y,
            r: dotR + 4,
            fill: "none",
            stroke: line.casing,
            "stroke-width": 2,
          })
        );
      }
      g.appendChild(
        svgEl("circle", {
          cx: st.x,
          cy: r.y,
          r: dotR,
          fill: "#ffffff",
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
      (MAPREFS.stations[st.route] = MAPREFS.stations[st.route] || []).push(g);
      svg.appendChild(g);
    });

    // Interchanges + terminal
    const specials = [
      { x: MAP.about.x, y: MAP.about.y, name: "About Me", sub: "Interchange", target: "#about", labelX: MAP.about.x - 14, nameY: MAP.about.y + 48, anchor: "middle" },
      // Label sits up-and-right of the interchange, clear of the arriving diagonals.
      { x: MAP.process.x, y: MAP.process.y, name: "Digital Leadership", sub: "All lines run via process", target: "#process", labelX: MAP.process.x + 18, nameY: MAP.process.y - 48, anchor: "start" },
      { x: MAP.contact.x, y: MAP.contact.y, name: "Contact", sub: "Terminal", target: "#contact", labelX: MAP.contact.x, nameY: MAP.contact.y + 46, anchor: "middle" },
    ];
    specials.forEach((s) => {
      const g = svgEl("g", { class: "station", tabindex: "0", role: "link" });
      g.appendChild(
        svgEl("circle", { cx: s.x, cy: s.y, r: 13, fill: "#ffffff", stroke: "#111111", "stroke-width": 5 })
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
      MAPREFS.specials.push(g);
      svg.appendChild(g);
    });
  }

  /* ---------- The living map ----------
     Inspired by data-driven transit art: each line draws itself with a
     personality derived from that chapter of the career, then trains run
     the routes continuously, blooming when they call at interchanges. */

  // delay/duration/easing = how each chapter "moves"; trains-per-line and
  // speed = how that era ran. Founder shuttle gets three trains — one per
  // startup. All values are choreography data, not decoration.
  const PERSONALITY = {
    honeywell: { delay: 0, duration: 2600, easing: "cubic-bezier(0.35,0,0.15,1)", trains: 2, speed: 58 },
    eda: { delay: 480, duration: 3000, easing: "cubic-bezier(0.5,0,0.35,1)", trains: 2, speed: 50 },
    ecomdash: { delay: 1060, duration: 1500, easing: "cubic-bezier(0.2,0,0.1,1)", trains: 1, speed: 84 },
    founder: { delay: 1420, duration: 1900, easing: "cubic-bezier(0.5,0,0.1,1)", trains: 3, speed: 96 },
  };

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function bloomAt(x, y, color) {
    const ring = svgEl("circle", {
      cx: x,
      cy: y,
      r: 8,
      fill: "none",
      stroke: color,
      "stroke-width": 3,
      opacity: 0.85,
      "pointer-events": "none",
    });
    MAPREFS.svg.appendChild(ring);
    const anim = ring.animate(
      [
        { r: "8px", opacity: 0.85 },
        { r: "26px", opacity: 0 },
      ],
      { duration: 700, easing: "cubic-bezier(0.2,0,0.3,1)" }
    );
    anim.onfinish = () => ring.remove();
  }

  function initLivingMap() {
    if (!MAPREFS.svg) return;

    const linePaths = Object.values(LINES).map((l) => MAPREFS.paths[l.id]);
    const allHideable = [
      MAPREFS.shared,
      ...Object.values(MAPREFS.bullets),
      ...MAPREFS.specials,
      ...Object.values(MAPREFS.stations).flat(),
    ];

    if (reducedMotion()) {
      startTrains(); // trains are also skipped inside when reduced
      return;
    }

    // Prime: lines undrawn, everything else hidden.
    Object.values(LINES).forEach((line) => {
      [MAPREFS.paths[line.id], MAPREFS.casings[line.id]].forEach((p) => {
        if (!p) return;
        const len = p.getTotalLength();
        p.style.strokeDasharray = len + " " + len;
        p.style.strokeDashoffset = len;
      });
    });
    allHideable.forEach((n) => (n.style.opacity = "0"));

    let played = false;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || played) return;
          played = true;
          obs.disconnect();
          playDrawIn();
        });
      },
      { threshold: 0.35 }
    );
    obs.observe(MAPREFS.svg);

    function playDrawIn() {
      let lastEnd = 0;
      Object.values(LINES).forEach((line) => {
        const p = PERSONALITY[line.id];
        lastEnd = Math.max(lastEnd, p.delay + p.duration);

        [MAPREFS.paths[line.id], MAPREFS.casings[line.id]].forEach((pathEl) => {
          if (!pathEl) return;
          const len = pathEl.getTotalLength();
          pathEl.animate(
            [{ strokeDashoffset: len + "px" }, { strokeDashoffset: "0px" }],
            { duration: p.duration, delay: p.delay, easing: p.easing, fill: "forwards" }
          );
          setTimeout(() => {
            pathEl.style.strokeDasharray = "none";
            pathEl.style.strokeDashoffset = "0";
          }, p.delay + p.duration + 60);
        });

        // Bullet appears as the line departs; stations pop as it lands.
        const bullet = MAPREFS.bullets[line.id];
        if (bullet) fadeIn(bullet, p.delay + 260);
        (MAPREFS.stations[line.id] || []).forEach((g, i) =>
          fadeIn(g, p.delay + p.duration - 200 + i * 110)
        );
      });

      // Interchanges, terminal, and shared track close the sequence.
      fadeIn(MAPREFS.shared, lastEnd + 80);
      MAPREFS.specials.forEach((g, i) => {
        fadeIn(g, lastEnd + 140 + i * 130);
        const c = g.querySelector("circle");
        if (c) {
          setTimeout(
            () => bloomAt(+c.getAttribute("cx"), +c.getAttribute("cy"), "#111"),
            lastEnd + 220 + i * 130
          );
        }
      });

      setTimeout(startTrains, lastEnd + 500);
    }

    function fadeIn(node, delay) {
      node.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 380,
        delay: delay,
        easing: "ease-out",
        fill: "forwards",
      });
      setTimeout(() => (node.style.opacity = "1"), delay + 420);
    }
  }

  /* Trains: continuous pulses running About -> Digital Leadership, looping.
     Paused when the map is offscreen or the tab is hidden. */

  function startTrains() {
    if (reducedMotion() || !MAPREFS.svg) return;

    const trains = [];
    Object.values(LINES).forEach((line) => {
      const path = MAPREFS.paths[line.id];
      const len = path.getTotalLength();
      const p = PERSONALITY[line.id];
      for (let i = 0; i < p.trains; i++) {
        const dot = svgEl("circle", {
          r: 5.5,
          fill: line.color,
          stroke: line.darkText ? "#111" : "#fff",
          "stroke-width": 1.5,
          "pointer-events": "none",
        });
        MAPREFS.svg.appendChild(dot);
        trains.push({
          dot: dot,
          path: path,
          len: len,
          speed: p.speed,
          offset: (len / p.trains) * i,
          color: line.color,
          lastBloom: 0,
        });
      }
    });

    const interchanges = [MAP.about, MAP.process];
    let running = true;
    let last = performance.now();
    let t = 0;

    const vis = new IntersectionObserver(
      (es) => es.forEach((e) => (running = e.isIntersecting)),
      { threshold: 0.05 }
    );
    vis.observe(MAPREFS.svg);
    document.addEventListener("visibilitychange", () => {
      last = performance.now();
    });

    function tick(now) {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      if (running && !document.hidden) {
        t += dt;
        trains.forEach((tr) => {
          const s = (tr.offset + t * tr.speed) % tr.len;
          const pt = tr.path.getPointAtLength(s);
          tr.dot.setAttribute("cx", pt.x);
          tr.dot.setAttribute("cy", pt.y);
          // Calling at an interchange: bloom, at most once every 1.4s per train.
          if (now - tr.lastBloom > 1400) {
            for (const ic of interchanges) {
              if (Math.abs(pt.x - ic.x) < 7 && Math.abs(pt.y - ic.y) < 7) {
                tr.lastBloom = now;
                bloomAt(ic.x, ic.y, tr.color);
                break;
              }
            }
          }
        });
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
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
      // Case study sits on the platform behind a pair of sliding doors,
      // headed by a 28th-St-style mosaic station band.
      const doors = el("div", { class: "doors", "aria-hidden": "true" }, [
        el("div", { class: "door left" }, [
          el("span", { class: "door-window" }),
          el("span", { class: "door-sticker", text: "Stand clear" }),
        ]),
        el("div", { class: "door right" }, [
          el("span", { class: "door-window" }),
          el("span", { class: "door-sticker", text: "of the doors" }),
        ]),
      ]);
      const caseWrap = el("div", { class: "case-wrap" }, [
        el("div", { class: "mosaic" }, [
          el("span", { class: "mosaic-text", text: project.station }),
        ]),
        caseStudy,
        doors,
      ]);

      const toggle = el("button", {
        class: "stop-toggle",
        type: "button",
        "aria-expanded": "false",
        text: "Open Doors →",
      });

      const card = el(
        "div",
        { class: "stop-card" },
        [
          el("div", { class: "led-board", "aria-hidden": "true" }, [
            el("span", { class: "led-dot" }),
            el("span", {
              text:
                project.station + " · stop " + (index + 1) + " of " + PROJECTS.length,
            }),
          ]),
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
          caseWrap,
        ]
      );
      card.style.setProperty("--line-color", line.color);

      toggle.addEventListener("click", () => {
        const opening = !card.classList.contains("open");
        toggle.setAttribute("aria-expanded", String(opening));
        toggle.textContent = opening ? "Exit Station ←" : "Open Doors →";
        if (opening) {
          card.classList.add("open");
          history.replaceState(null, "", "#stop-" + project.id);
          // Two frames so the closed doors paint before they slide apart.
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              card.classList.add("doors-open");
              doorChime();
            })
          );
        } else {
          card.classList.remove("doors-open", "open");
        }
        // Card height changed — reflow the trunk backdrop behind the feed.
        setTimeout(drawTrunk, 60);
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
          fill: "#ffffff",
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
  let lastArrivalId = null;

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
    if (id && id !== lastArrivalId) {
      lastArrivalId = id;
      playArrival(svg, id);
    }
  }

  // Arrival choreography: the branch draws itself toward the platform, a
  // train pulse runs down it, and the station dot blooms as the card lands.
  function playArrival(svg, id) {
    if (reducedMotion()) return;
    const branch = svg.querySelector('[data-branch="' + id + '"]');
    const station = svg.querySelector('[data-station="' + id + '"]');
    if (!branch || !station) return;

    const len = branch.getTotalLength();
    const color = branch.getAttribute("stroke");

    // 1. Draw the branch in.
    branch.style.strokeDasharray = len + " " + len;
    const draw = branch.animate(
      [{ strokeDashoffset: len + "px" }, { strokeDashoffset: "0px" }],
      { duration: 620, easing: "cubic-bezier(0.3,0,0.15,1)", fill: "forwards" }
    );
    draw.onfinish = () => {
      branch.style.strokeDasharray = "none";
      branch.style.strokeDashoffset = "0";
    };

    // 2. A pulse rides the fresh track.
    const pulse = svgEl("circle", {
      r: 6,
      fill: color,
      stroke: "#fff",
      "stroke-width": 1.5,
      "pointer-events": "none",
    });
    svg.appendChild(pulse);
    const t0 = performance.now();
    const ride = 560;
    (function run(now) {
      const k = Math.min((now - t0) / ride, 1);
      const eased = 1 - Math.pow(1 - k, 2.2);
      const pt = branch.getPointAtLength(eased * len);
      pulse.setAttribute("cx", pt.x);
      pulse.setAttribute("cy", pt.y);
      if (k < 1) requestAnimationFrame(run);
      else {
        pulse.remove();
        // 3. The station blooms on arrival.
        const cx = +station.getAttribute("cx");
        const cy = +station.getAttribute("cy");
        const ring = svgEl("circle", {
          cx: cx,
          cy: cy,
          r: 12,
          fill: "none",
          stroke: color,
          "stroke-width": 3,
          opacity: 0.9,
          "pointer-events": "none",
        });
        svg.appendChild(ring);
        const anim = ring.animate(
          [
            { r: "12px", opacity: 0.9 },
            { r: "34px", opacity: 0 },
          ],
          { duration: 750, easing: "cubic-bezier(0.2,0,0.3,1)" }
        );
        anim.onfinish = () => ring.remove();
      }
    })(t0);
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
            updateStrip(activeStopId);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    document.querySelectorAll(".stop").forEach((s) => observer.observe(s));
  }

  /* ---------- In-car strip map ---------- */

  function buildStripMap() {
    const inner = document.getElementById("strip-inner");
    if (!inner) return;

    const end = (label, target) => {
      const b = el("button", {
        class: "strip-end",
        type: "button",
        "aria-label": label,
        title: label,
      });
      b.addEventListener("click", () => scrollToTarget(target));
      return b;
    };

    inner.appendChild(end("About Me — start of the line", "#about"));
    PROJECTS.forEach((p, i) => {
      const seg = el("span", { class: "strip-seg", "aria-hidden": "true" });
      seg.style.background = LINES[p.lineId].color;
      inner.appendChild(seg);

      const dot = el("button", {
        class: "strip-dot",
        type: "button",
        "data-strip": p.id,
        "aria-label": p.station + " — stop " + (i + 1) + " of " + PROJECTS.length,
        title: p.station,
      });
      dot.style.setProperty("--dot-color", LINES[p.lineId].color);
      dot.addEventListener("click", () => scrollToTarget("#stop-" + p.id));
      inner.appendChild(dot);
    });
    const lastSeg = el("span", { class: "strip-seg", "aria-hidden": "true" });
    lastSeg.style.background = "#0b0b0b";
    inner.appendChild(lastSeg);
    inner.appendChild(end("Contact — terminal", "#contact"));
  }

  function updateStrip(id) {
    const now = document.getElementById("strip-now");
    const idx = PROJECTS.findIndex((p) => p.id === id);
    if (now && idx >= 0) now.textContent = "This is " + PROJECTS[idx].station;
    document.querySelectorAll(".strip-dot").forEach((d, i) => {
      d.classList.toggle("current", d.dataset.strip === id);
      d.classList.toggle("passed", idx >= 0 && i < idx);
    });
  }

  /* ---------- Door chime + sound toggle ---------- */

  let soundOn = false;
  try {
    soundOn = localStorage.getItem("dm_sound") === "1";
  } catch (e) { /* storage unavailable — sound stays off */ }

  function doorChime() {
    if (!soundOn) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      doorChime.ctx = doorChime.ctx || new Ctx();
      const ctx = doorChime.ctx;
      const t = ctx.currentTime;
      // The two-tone "doors closing" chime: E5 then C5.
      [[659.25, 0, 0.3], [523.25, 0.24, 0.55]].forEach(([freq, off, dur]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.0001, t + off);
        gain.gain.exponentialRampToValueAtTime(0.16, t + off + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + off + dur);
        osc.start(t + off);
        osc.stop(t + off + dur + 0.05);
      });
    } catch (e) { /* audio unavailable */ }
  }

  function initSoundToggle() {
    const btn = document.getElementById("sound-toggle");
    if (!btn) return;
    const render = () => {
      btn.setAttribute("aria-pressed", String(soundOn));
      btn.textContent = soundOn ? "♪ On" : "♪ Off";
    };
    render();
    btn.addEventListener("click", () => {
      soundOn = !soundOn;
      try {
        localStorage.setItem("dm_sound", soundOn ? "1" : "0");
      } catch (e) { /* ignore */ }
      render();
      if (soundOn) doorChime();
    });
  }

  /* ---------- MetroCard swipe ---------- */

  function initMetroCard() {
    const cardEl = document.getElementById("contact-card");
    if (!cardEl) return;
    const statusEl = cardEl.querySelector(".swipe span:first-child");
    const defaultText = statusEl.textContent;
    let startX = null;
    let startT = 0;
    let moved = false;
    let verdict = null; // null = plain click, "ok" | "slow" | "fast"
    let resetTimer;

    const setStatus = (text, cls) => {
      statusEl.textContent = text;
      statusEl.className = cls || "";
      clearTimeout(resetTimer);
      if (text !== defaultText) {
        resetTimer = setTimeout(() => setStatus(defaultText, ""), 2600);
      }
    };

    cardEl.addEventListener("pointerdown", (e) => {
      startX = e.clientX;
      startT = performance.now();
      moved = false;
      verdict = null;
    });
    cardEl.addEventListener("pointermove", (e) => {
      if (startX !== null && Math.abs(e.clientX - startX) > 12) moved = true;
    });
    cardEl.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = Math.abs(e.clientX - startX);
      const speed = dx / Math.max(performance.now() - startT, 1); // px per ms
      if (moved && dx > 60) {
        verdict = speed < 0.18 ? "slow" : speed > 2.6 ? "fast" : "ok";
      }
      startX = null;
    });
    cardEl.addEventListener("click", (e) => {
      if (verdict === "slow" || verdict === "fast") {
        e.preventDefault();
        setStatus(
          verdict === "slow" ? "Too slow — please swipe again" : "Too fast — please swipe again",
          "status-err"
        );
      } else if (verdict === "ok") {
        e.preventDefault();
        setStatus("GO. Enjoy your ride", "status-ok");
        setTimeout(() => {
          window.location.href = cardEl.href;
        }, 650);
      }
      // Plain click (no swipe): fall through to the mailto link.
      verdict = null;
    });
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

  function buildHeroBullets() {
    const wrap = document.getElementById("hero-bullets");
    if (!wrap) return;
    Object.values(LINES).forEach((line) => wrap.appendChild(bulletEl(line, true)));
  }

  /* ---------- Weekend service change (an authentic MTA experience) ---------- */

  function initServiceStatus() {
    const day = new Date().getDay();
    if (day !== 0 && day !== 6) return;
    const pill = document.querySelector(".service-status .pill");
    if (pill) {
      pill.textContent = "Planned Work";
      pill.classList.add("pill-work");
    }
    const alerts = document.getElementById("rider-alerts");
    if (alerts) {
      const note = el("p", {
        class: "muted",
        text:
          "Weekend service change: the S Founder Shuttle is running local. Allow extra travel time and expect creative delays.",
      });
      alerts.insertBefore(note, alerts.children[1]);
    }
  }

  /* ---------- Tunnel parallax ---------- */

  function initParallax() {
    const girders = document.querySelector(".tunnel-girders");
    if (!girders) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          girders.style.backgroundPositionX = -window.scrollY * 0.35 + "px";
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Choreographed reveals (coordinated cascade) ---------- */

  function initReveals() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hero cascade on load: kicker -> headline -> copy -> index -> bullets.
    const heroSeq = [".hero-kicker", ".hero h1", ".hero p", ".hero-index", ".hero-bullets-row"];
    heroSeq.forEach((sel, i) => {
      const n = document.querySelector(sel);
      if (!n) return;
      n.classList.add("reveal");
      n.style.transitionDelay = i * 130 + "ms";
    });
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        heroSeq.forEach((sel) => {
          const n = document.querySelector(sel);
          if (n) n.classList.add("revealed");
        })
      )
    );

    // Scroll-triggered reveals; siblings in a group stagger like a deck build.
    const groups = [
      ".section-heading",
      ".map-hint",
      ".map-scroll",
      ".legend-item",
      ".poster",
      ".process-item",
      "#about .info-grid",
      ".exit-sign",
      ".footer-grid > div",
    ];
    const staggered = [".legend-item", ".poster", ".process-item", ".footer-grid > div"];
    staggered.forEach((sel) =>
      document.querySelectorAll(sel).forEach((n, i) => {
        n.dataset.revealDelay = i * 110;
      })
    );
    const targets = document.querySelectorAll(groups.join(", "));
    targets.forEach((n) => n.classList.add("reveal"));
    if (reduced) {
      targets.forEach((n) => n.classList.add("revealed"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);
          entry.target.style.transitionDelay = (entry.target.dataset.revealDelay || 0) + "ms";
          entry.target.classList.add("revealed");
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    targets.forEach((n) => obs.observe(n));
  }

  /* ---------- Deep links: #stop-<id> opens that station's doors ---------- */

  function initDeepLinks() {
    const openFromHash = () => {
      const m = location.hash.match(/^#stop-([\w-]+)$/);
      if (!m) return;
      const stopEl = document.getElementById("stop-" + m[1]);
      if (!stopEl) return;
      const card = stopEl.querySelector(".stop-card");
      const toggle = stopEl.querySelector(".stop-toggle");
      if (card && toggle && !card.classList.contains("open")) toggle.click();
      setTimeout(
        () => stopEl.scrollIntoView({ behavior: "smooth", block: "center" }),
        120
      );
    };
    window.addEventListener("hashchange", openFromHash);
    setTimeout(openFromHash, 350);
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildSystemMap();
    buildLegend();
    buildFeed();
    buildAbout();
    buildProcess();
    buildFooter();
    buildHeroBullets();
    buildStripMap();
    initSoundToggle();
    initMetroCard();
    initServiceStatus();
    initParallax();
    initReveals();
    initLivingMap();
    initDeepLinks();
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
