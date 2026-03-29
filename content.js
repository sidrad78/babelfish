(() => {
  const SAMPLE_TEXT =
    "The quick brown fox jumps over the lazy dog. " +
    "Type or paste text here to translate it.";

  // ── State ────────────────────────────────────────────────────────────────
  let overlay = null;
  let textarea = null;
  let titlebar = null;
  let langBadge = null;
  let settings = {
    enabled: false,
    langFrom: "auto",
    langTo: "en",
    boxColor: "#1a1a2e",
    textColor: "#ffffff",
    opacity: 80,
  };

  // ── Build overlay ────────────────────────────────────────────────────────
  function createOverlay() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.id = "babelfish-overlay";

    // Title bar
    titlebar = document.createElement("div");
    titlebar.id = "babelfish-titlebar";

    const title = document.createElement("span");
    title.id = "babelfish-title";
    title.textContent = "Babelfish";

    langBadge = document.createElement("span");
    langBadge.className = "bf-lang-badge";

    titlebar.appendChild(title);
    titlebar.appendChild(langBadge);

    // Textarea
    textarea = document.createElement("textarea");
    textarea.id = "babelfish-textarea";
    textarea.placeholder = SAMPLE_TEXT;
    textarea.spellcheck = false;

    overlay.appendChild(titlebar);
    overlay.appendChild(textarea);

    // Position bottom-right by default
    overlay.style.bottom = "24px";
    overlay.style.right = "24px";

    document.body.appendChild(overlay);

    applyAppearance();
    makeDraggable(overlay, titlebar);
  }

  // ── Apply appearance settings ────────────────────────────────────────────
  function applyAppearance() {
    if (!overlay) return;

    const { boxColor, textColor, opacity } = settings;
    const alpha = (opacity / 100).toFixed(2);

    // Normalize hex to 6-digit form and convert to RGB for rgba()
    let hex = boxColor.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      hex = "1a1a2e"; // fallback to default if malformed
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    overlay.style.background = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    overlay.style.color = textColor;
    if (textarea) {
      textarea.style.color = textColor;
    }

    // Lang badge
    if (langBadge) {
      const fromLabel =
        settings.langFrom === "auto" ? "Auto" : settings.langFrom.toUpperCase();
      const toLabel = settings.langTo.toUpperCase();
      langBadge.textContent = `${fromLabel} → ${toLabel}`;
    }
  }

  // ── Show / hide ──────────────────────────────────────────────────────────
  function applyEnabled() {
    if (!overlay) {
      if (settings.enabled) createOverlay();
      return;
    }
    if (settings.enabled) {
      overlay.classList.remove("bf-hidden");
    } else {
      overlay.classList.add("bf-hidden");
    }
  }

  // ── Draggable ────────────────────────────────────────────────────────────
  function makeDraggable(el, handle) {
    let startX, startY, startLeft, startTop;

    // Switch from bottom/right anchoring to top/left once moved
    function toTopLeft() {
      const rect = el.getBoundingClientRect();
      el.style.bottom = "";
      el.style.right = "";
      el.style.top = rect.top + "px";
      el.style.left = rect.left + "px";
    }

    handle.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();

      toTopLeft();

      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(el.style.left, 10);
      startTop = parseInt(el.style.top, 10);

      function onMove(e) {
        el.style.left = startLeft + (e.clientX - startX) + "px";
        el.style.top = startTop + (e.clientY - startY) + "px";
      }

      function onUp() {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }

  // ── Message listener ─────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type !== "UPDATE_SETTINGS") return;
    settings = { ...settings, ...msg.settings };
    applyEnabled();
    applyAppearance();
  });

  // ── Load initial settings from storage ──────────────────────────────────
  chrome.storage.sync.get(
    {
      enabled: false,
      langFrom: "auto",
      langTo: "en",
      boxColor: "#1a1a2e",
      textColor: "#ffffff",
      opacity: 80,
    },
    (stored) => {
      settings = stored;
      applyEnabled();
    }
  );
})();
