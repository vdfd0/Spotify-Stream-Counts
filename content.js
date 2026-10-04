(() => {
  const counts = new Map(); // track id -> play count (number)

  // 1) Listen to the web player's own data requests and collect play counts.
  function scan(node, depth = 0) {
    if (!node || typeof node !== "object" || depth > 30) return;
    if (Array.isArray(node)) {
      for (const n of node) scan(n, depth + 1);
      return;
    }
    if (
      node.playcount !== undefined &&
      typeof node.uri === "string" &&
      node.uri.startsWith("spotify:track:")
    ) {
      const n = Number(node.playcount);
      if (!Number.isNaN(n)) counts.set(node.uri.split(":")[2], n);
    }
    for (const k in node) scan(node[k], depth + 1);
  }

  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const res = await origFetch.apply(this, args);
    try {
      const req = args[0];
      const url = typeof req === "string" ? req : (req && req.url) || "";
      if (url.includes("pathfinder") || url.includes("api-partner.spotify.com")) {
        res.clone().json().then(scan).catch(() => {});
      }
    } catch (_) {}
    return res;
  };

  // 2) Put the numbers into the track rows.
  function render() {
    // Artist pages already show play counts natively, so don't add a second one.
    if (location.pathname.startsWith("/artist/")) {
      document.querySelectorAll(".spc-count").forEach((e) => e.remove());
      return;
    }

    document.querySelectorAll('[data-testid="tracklist-row"]').forEach((row) => {
      const link = row.querySelector('a[href*="/track/"]');
      if (!link) return;
      const m = link.getAttribute("href").match(/\/track\/([A-Za-z0-9]+)/);
      if (!m) return;
      const count = counts.get(m[1]);
      if (count === undefined) return;

      let el = row.querySelector(".spc-count");
      if (!el) {
        el = document.createElement("span");
        el.className = "spc-count";
        el.style.cssText =
          "position:absolute;top:50%;transform:translateY(-50%);" +
          "font-size:14px;color:#b3b3b3;font-variant-numeric:tabular-nums;" +
          "pointer-events:none;white-space:nowrap;";
        row.style.position = "relative";
        row.appendChild(el);
      }
      el.textContent = count.toLocaleString();

      // Sit just left of the last cell (like button + duration + "more" button).
      const cells = row.querySelectorAll('[role="gridcell"]');
      const lastCell = cells[cells.length - 1];
      const rowRect = row.getBoundingClientRect();
      const gap = 16;
      let right = 190;
      if (lastCell && cells.length > 1) {
        right = rowRect.right - lastCell.getBoundingClientRect().left + gap;
      }
      el.style.right = right + "px";
    });
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      render();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  window.addEventListener("resize", schedule);
  setInterval(render, 1500); // catches counts that arrive after the rows render
})();
