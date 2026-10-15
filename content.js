// YTM Now Playing — a clean "Now Playing" overlay for YouTube Music.
// YouTube Music enforces Trusted Types, so all DOM is built with
// createElement (no innerHTML).
(() => {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  // UI strings: Portuguese when the browser is in Portuguese, English otherwise.
  const STRINGS = {
    en: {
      playPause: "Play/Pause", prev: "Previous", next: "Next", shuffle: "Shuffle", repeat: "Repeat",
      like: "Like", more: "More", queue: "Queue", closeQueue: "Close queue", close: "Close",
      volume: "Volume (click to mute)",
      queueEmpty: "The queue hasn't loaded yet.", openNativeQueue: "Open YouTube Music queue",
    },
    pt: {
      playPause: "Play/Pause", prev: "Anterior", next: "Próxima", shuffle: "Aleatório", repeat: "Repetir",
      like: "Curtir", more: "Mais", queue: "Fila", closeQueue: "Fechar fila", close: "Fechar",
      volume: "Volume (clique = mudo)",
      queueEmpty: "A fila ainda não foi carregada.", openNativeQueue: "Abrir fila do YouTube Music",
    },
  };
  const T = (navigator.language || "en").toLowerCase().startsWith("pt") ? STRINGS.pt : STRINGS.en;
  const ICONS = {
    back: "M15.4 4.6 14 3.2 5.2 12l8.8 8.8 1.4-1.4L8 12z",
    close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.59 17.59 19 19 17.59 13.41 12z",
    queue: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
    prev: "M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z",
    next: "M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z",
    play: "M7 4.5v15l12.5-7.5z",
    pause: "M6 4.5h4.2v15H6zm7.8 0H18v15h-4.2z",
    shuffle: "M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z",
    repeat: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z",
    repeatOne: "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z",
    star: "M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z",
    starFilled: "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    more: "M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
    expand: "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
    volLow: "M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L9 9H6c-.55 0-1 .45-1 1z",
    volHigh: "M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z",
    volMute: "M3.63 3.63a.996.996 0 0 0 0 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 1 0 1.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0 0 14 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z",
    note: "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
  };

  // Native player selectors. YouTube Music currently ships two UIs side by side:
  // the old one (<ytmusic-player-bar>) and the new one (<ytmusic-miniplayer>, *-view-model buttons).
  // `inBar` prefixes each selector with both bars.
  const BARS = ["ytmusic-player-bar", "ytmusic-app-layout > ytmusic-miniplayer"];
  const inBar = (...sels) => BARS.flatMap((b) => sels.map((s) => `${b} ${s}`)).join(", ");

  const SEL = {
    bar: BARS.join(", "),
    prev: inBar(".previous-button", ".ytmusicPlayerControlsPreviousButton button"),
    playPause: inBar("#play-pause-button", ".play-pause-button", ".ytmusicPlayerControlsPlayPauseButton button"),
    next: inBar(".next-button", ".ytmusicPlayerControlsNextButton button"),
    shuffle: inBar(".shuffle", ".ytmusicPlayerControlsShuffleButton button"),
    repeat: inBar(".repeat", ".ytmusicPlayerControlsRepeatButton button"),
    // New UI: <like-button-view-model> with aria-pressed. Old UI: like-status="LIKE".
    likeNew: inBar("like-button-view-model button"),
    likeRenderer: inBar("ytmusic-like-button-renderer"),
    likeBtn: inBar(
      "like-button-view-model button",
      "ytmusic-like-button-renderer #button-shape-like button",
      "ytmusic-like-button-renderer .like"
    ),
    menu: inBar(
      ".ytMusicMiniPlayerMenuButton button",
      "ytmusic-menu-renderer yt-button-shape button",
      "ytmusic-menu-renderer #button",
      "ytmusic-menu-renderer tp-yt-paper-icon-button"
    ),
    title: inBar(".title", ".ytmusicTrackInfoTitle"),
    byline: inBar(".byline", ".ytmusicTrackInfoByline"),
    thumb: inBar(".thumbnail-image-wrapper img", "img.image", "img.ytmusicTrackInfoThumbnail"),
    rightControls: inBar(".right-controls-buttons", ".ytMusicMiniPlayerRightSection"),
    timeInfo: inBar(".time-info", ".ytMusicMiniPlayerTimeInfo"),
    video: "#movie_player video, video.html5-main-video, video",
    dropdowns: "ytmusic-popup-container tp-yt-iron-dropdown",
    menuItems:
      "ytmusic-menu-navigation-item-renderer, ytmusic-menu-service-item-renderer, " +
      "ytmusic-toggle-menu-service-item-renderer, ytmusic-menu-service-item-download-renderer",
    queueItems: "ytmusic-player-queue ytmusic-player-queue-item",
    // Song / Video switch above the player. playback-mode is OMV_PREFERRED in video mode.
    avToggle: "ytmusic-av-toggle",
    songButton: "ytmusic-av-toggle .song-button",
  };

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function h(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v);
    }
    for (const c of children) if (c) el.append(c);
    return el;
  }

  function icon(name) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", ICONS[name]);
    svg.append(path);
    return svg;
  }

  function setIcon(btn, name) {
    if (btn.dataset.icon === name) return;
    btn.dataset.icon = name;
    btn.replaceChildren(icon(name));
  }

  function iconButton(name, cls, label, onclick) {
    const b = h("button", { class: `ytmnp-btn ${cls}`, "aria-label": label, title: label, onclick });
    setIcon(b, name);
    return b;
  }

  // Warn when a native control is missing: YTM changes its markup without notice,
  // and otherwise the button would just silently do nothing.
  const clickNative = (sel) => {
    const el = $(sel);
    if (el) el.click();
    else console.warn("[ytmnp] native control not found:", sel);
    return !!el;
  };

  const fmt = (s) => {
    if (!isFinite(s) || s < 0) s = 0;
    s = Math.floor(s);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = String(s % 60).padStart(2, "0");
    return hh ? `${hh}:${String(mm).padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
  };

  // Swap the Google thumbnail size suffix (=w60-h60...) for a larger version.
  function hiRes(url, size = 1200) {
    if (!url) return "";
    if (/googleusercontent\.com|ggpht\.com/.test(url)) {
      return url
        .replace(/=w\d+-h\d+[^&?#]*$/, `=w${size}-h${size}-l90-rj`)
        .replace(/=s\d+[^&?#]*$/, `=s${size}`);
    }
    if (size < 400) return url;
    // Video thumbnails (i.ytimg.com): try the largest one available.
    return url.replace(/\/(default|mqdefault|hqdefault|sddefault)\.jpg/, "/maxresdefault.jpg");
  }

  async function waitFor(fn, timeout = 1500) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      const v = fn();
      if (v) return v;
      await sleep(40);
    }
    return null;
  }

  // Bridge to main.js (MAIN world): dispatch is synchronous, so the reply arrives before we return.
  function bridge(cmd, extra = {}) {
    let state = null;
    const on = (e) => {
      try {
        state = JSON.parse(e.detail);
      } catch {}
    };
    window.addEventListener("ytmnp:state", on);
    window.dispatchEvent(new CustomEvent("ytmnp:cmd", { detail: JSON.stringify({ cmd, ...extra }) }));
    window.removeEventListener("ytmnp:state", on);
    return state;
  }

  // ---------- Reading the current state ----------

  function readTrack() {
    const md = navigator.mediaSession && navigator.mediaSession.metadata;
    let title = md?.title || $(SEL.title)?.textContent?.trim() || "";
    let artist = md?.artist || "";
    let art = "";

    if (md?.artwork?.length) {
      const best = [...md.artwork].sort((a, b) => (parseInt(b.sizes) || 0) - (parseInt(a.sizes) || 0))[0];
      art = best?.src || "";
    }
    if (!art) art = $(SEL.thumb)?.src || "";

    // Player byline: "Artist • Album • Year".
    if (!artist) artist = $(SEL.byline)?.textContent.split("•")[0].trim() || "";
    return { title, artist, art: hiRes(art) };
  }

  const video = () => $(SEL.video);

  // ---------- Generic slider (progress and volume) ----------

  function makeSlider(cls, { onInput, onCommit }) {
    const fill = h("div", { class: "ytmnp-fill" });
    const knob = h("div", { class: "ytmnp-knob" });
    const el = h("div", { class: `ytmnp-track ${cls}` }, [fill, knob]);
    const s = { el, dragging: false };
    s.paint = (ratio) => {
      ratio = Math.min(1, Math.max(0, ratio));
      fill.style.width = `${ratio * 100}%`;
      knob.style.left = `${ratio * 100}%`;
    };
    const ratioAt = (e) => {
      const r = el.getBoundingClientRect();
      return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    };
    el.addEventListener("pointerdown", (e) => {
      s.dragging = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");
      s.paint(ratioAt(e));
      onInput?.(ratioAt(e));
    });
    el.addEventListener("pointermove", (e) => {
      if (!s.dragging) return;
      s.paint(ratioAt(e));
      onInput?.(ratioAt(e));
    });
    const finish = (e) => {
      if (!s.dragging) return;
      s.dragging = false;
      el.classList.remove("is-dragging");
      onCommit?.(ratioAt(e));
    };
    el.addEventListener("pointerup", finish);
    el.addEventListener("pointercancel", finish);
    return s;
  }

  // ---------- UI ----------

  let root, bgA, bgB, bgFront = "a", artImg, titleEl, artistEl;
  let playBtn, repeatBtn, starBtn, moreBtn, queueBtn, volBtn, volPct, volWrap, seek, vol, tCur, tRem;
  let queuePanel, queueList, queueSig = "", menuEl = null;
  let open = false, timer = null, tick = 0, lastArt = "";

  function build() {
    bgA = h("div", { class: "ytmnp-bg is-visible" });
    bgB = h("div", { class: "ytmnp-bg" });

    titleEl = h("div", { class: "ytmnp-title" });
    artistEl = h("div", { class: "ytmnp-artist" });

    playBtn = iconButton("pause", "ytmnp-main", T.playPause, () => clickNative(SEL.playPause) || togglePlayFallback());

    tCur = h("span", { class: "ytmnp-time" });
    tRem = h("span", { class: "ytmnp-time ytmnp-time-right" });
    seek = makeSlider("ytmnp-seek", {
      onInput: (r) => {
        const { duration } = readTime();
        if (duration > 0) {
          tCur.textContent = fmt(r * duration);
          tRem.textContent = `-${fmt(duration - r * duration)}`;
        }
      },
      onCommit: (r) => {
        const { duration } = readTime();
        if (duration > 0) bridge("seekTo", { value: r * duration });
      },
    });

    vol = makeSlider("ytmnp-vol", {
      onInput: (r) => updateVolume(bridge("setVolume", { value: r * 100 })),
    });
    volBtn = iconButton("volHigh", "ytmnp-small", T.volume, () => updateVolume(bridge("toggleMute")));
    volPct = h("span", { class: "ytmnp-vol-pct" });
    // Popover shows on hover; its bottom padding bridges the gap to the icon.
    volWrap = h("div", { class: "ytmnp-vol-wrap" }, [
      volBtn,
      h("div", { class: "ytmnp-vol-pop" }, [h("div", { class: "ytmnp-vol-pill ytmnp-glass-panel" }, [vol.el, volPct])]),
    ]);

    repeatBtn = iconButton("repeat", "ytmnp-small", T.repeat, () => {
      clickNative(SEL.repeat);
      setTimeout(update, 120);
    });
    starBtn = iconButton("star", "ytmnp-small", T.like, toggleLike);
    moreBtn = iconButton("more", "ytmnp-small", T.more, () => (menuEl ? closeMenu(true) : openMenu()));
    queueBtn = iconButton("queue", "ytmnp-pill-btn", T.queue, toggleQueue);

    artImg = h("img", { class: "ytmnp-art", alt: "", draggable: "false" });

    queueList = h("div", { class: "ytmnp-queue-list" });
    queuePanel = h("aside", { class: "ytmnp-queue ytmnp-glass-panel" }, [
      h("div", { class: "ytmnp-queue-head" }, [
        h("div", { class: "ytmnp-queue-title", text: T.queue }),
        iconButton("close", "ytmnp-small", T.closeQueue, toggleQueue),
      ]),
      queueList,
    ]);

    root = h("div", { class: "ytmnp-root", role: "dialog", "aria-label": "Now Playing" }, [
      bgA,
      bgB,
      h("div", { class: "ytmnp-scrim" }),
      h("div", { class: "ytmnp-top" }, [
        iconButton("back", "ytmnp-glass ytmnp-round", T.close, close),
        h("div", { class: "ytmnp-glass ytmnp-pill" }, [
          queueBtn,
        ]),
      ]),
      h("div", { class: "ytmnp-stage" }, [
        h("div", { class: "ytmnp-left" }, [
          h("div", { class: "ytmnp-meta" }, [titleEl, artistEl]),
          h("div", { class: "ytmnp-controls" }, [
            iconButton("prev", "ytmnp-main", T.prev, () => clickNative(SEL.prev)),
            playBtn,
            iconButton("next", "ytmnp-main", T.next, () => clickNative(SEL.next)),
          ]),
          h("div", { class: "ytmnp-progress" }, [tCur, seek.el, tRem]),
          h("div", { class: "ytmnp-secondary" }, [
            iconButton("shuffle", "ytmnp-small", T.shuffle, () => clickNative(SEL.shuffle)),
            repeatBtn,
            starBtn,
            volWrap,
            moreBtn,
          ]),
        ]),
        h("div", { class: "ytmnp-right" }, [artImg]),
      ]),
      queuePanel,
    ]);

    // Clicking outside the "More" menu or the queue closes it. The click that closes
    // the queue is swallowed so it doesn't accidentally press the button underneath.
    let swallowClick = false;
    root.addEventListener("pointerdown", (e) => {
      if (menuEl && !menuEl.contains(e.target) && !moreBtn.contains(e.target)) closeMenu(true);
      if (root.classList.contains("queue-open") && !queuePanel.contains(e.target) && !queueBtn.contains(e.target)) {
        e.stopPropagation(); // also don't start dragging the progress/volume bar
        toggleQueue();
        swallowClick = true;
      }
    }, true);
    root.addEventListener(
      "click",
      (e) => {
        if (!swallowClick) return;
        swallowClick = false;
        e.stopPropagation();
        e.preventDefault();
      },
      true
    );
    // Don't let mouse clicks focus our buttons: a focused button would take the next
    // Space press (e.g. toggle shuffle again instead of play/pause). Tab focus still works.
    root.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) e.preventDefault();
    });
    document.body.append(root);
  }

  // Track time. Gapless playback keeps the <video> timeline running across tracks
  // (e.g. 27:44 into a 3:38 song), so prefer the player API, then YTM's own
  // "0:15 / 3:21" label, and only then the raw <video> element.
  const parseClock = (s) => s.split(":").reduce((acc, n) => acc * 60 + Number(n), 0);

  function readTime() {
    const api = bridge("getTime");
    const label = $(SEL.timeInfo)?.textContent.match(/(\d+(?::\d{2})+)\s*\/\s*(\d+(?::\d{2})+)/);
    const text = label && { current: parseClock(label[1]), duration: parseClock(label[2]) };
    const apiOk = api && api.duration > 0 && api.current >= 0 && api.current <= api.duration + 1;
    if (apiOk && (!text || Math.abs(api.duration - text.duration) <= 2)) return api;
    if (text && text.duration > 0) return text;
    const v = video();
    return v && isFinite(v.duration) ? { current: v.currentTime, duration: v.duration } : { current: 0, duration: 0 };
  }

  function togglePlayFallback() {
    const v = video();
    if (v) v.paused ? v.play() : v.pause();
  }

  function updateVolume(st) {
    if (!st || !vol) return;
    const level = st.muted ? 0 : st.volume;
    if (!vol.dragging) vol.paint(level / 100);
    volPct.textContent = `${Math.round(level)}`;
    setIcon(volBtn, st.muted || level === 0 ? "volMute" : level < 50 ? "volLow" : "volHigh");
    volBtn.classList.toggle("is-active", !!st.muted);
  }

  function nudgeVolume(delta) {
    const st = bridge("getVolume");
    if (st) updateVolume(bridge("setVolume", { value: (st.muted ? 0 : st.volume) + delta }));
  }

  function setBackground(url) {
    const incoming = bgFront === "a" ? bgB : bgA;
    const outgoing = bgFront === "a" ? bgA : bgB;
    const img = new Image();
    img.onload = () => {
      incoming.style.backgroundImage = `url("${url}")`;
      incoming.classList.add("is-visible");
      outgoing.classList.remove("is-visible");
      bgFront = bgFront === "a" ? "b" : "a";
    };
    img.src = url;
  }

  // ---------- "More" menu (mirrors the native track menu) ----------

  const openDropdown = () =>
    $$(SEL.dropdowns).find(
      (d) => d.style.display !== "none" && d.getAttribute("aria-hidden") !== "true" && $(SEL.menuItems, d)
    );

  async function openMenu() {
    const html = document.documentElement;
    html.classList.add("ytmnp-hide-native-menu");
    if (!clickNative(SEL.menu)) {
      html.classList.remove("ytmnp-hide-native-menu");
      return;
    }
    const dd = await waitFor(openDropdown);
    if (!dd || !open) {
      html.classList.remove("ytmnp-hide-native-menu");
      return;
    }

    const rows = [];
    const pending = []; // [iconSlot, nativeItem] whose native icon hasn't rendered yet
    for (const item of $$(SEL.menuItems, dd)) {
      if (item.hidden || item.offsetParent === null) continue;
      const text = ($(".text, yt-formatted-string", item)?.textContent || item.textContent).trim();
      if (!text) continue;
      const nativeSvg = nativeMenuIcon(item);
      const iconSlot = h("span", { class: "ytmnp-menu-icon" }, [nativeSvg ? nativeSvg.cloneNode(true) : icon("note")]);
      if (!nativeSvg) pending.push([iconSlot, item]);
      const isNav = item.tagName === "YTMUSIC-MENU-NAVIGATION-ITEM-RENDERER";
      rows.push(
        h(
          "button",
          {
            class: "ytmnp-menu-item",
            onclick: () => {
              const target = $("a, tp-yt-paper-item", item) || item;
              closeMenu(false);
              target.click();
              // Navigation items lead to another page: leave the overlay.
              if (isNav) close();
              setTimeout(() => html.classList.remove("ytmnp-hide-native-menu"), 300);
              setTimeout(update, 300);
            },
          },
          [iconSlot, h("span", { text })]
        )
      );
    }
    if (!rows.length) {
      closeMenu(true);
      return;
    }

    menuEl = h("div", { class: "ytmnp-menu ytmnp-glass-panel", role: "menu" }, rows);
    root.append(menuEl);
    const r = moreBtn.getBoundingClientRect();
    const w = menuEl.offsetWidth;
    const left = Math.min(window.innerWidth - w - 16, Math.max(16, r.left + r.width / 2 - w / 2));
    menuEl.style.left = `${left}px`;
    menuEl.style.bottom = `${window.innerHeight - r.top + 10}px`;
    requestAnimationFrame(() => menuEl?.classList.add("is-open"));

    // YTM renders the item icons a moment after the dropdown opens: swap them in as they appear.
    for (let tries = 0; pending.length && tries < 15 && menuEl; tries++) {
      await sleep(100);
      for (let i = pending.length - 1; i >= 0; i--) {
        const svg = nativeMenuIcon(pending[i][1]);
        if (!svg) continue;
        pending[i][0].replaceChildren(svg.cloneNode(true));
        pending.splice(i, 1);
      }
    }
  }

  // The icon's <svg>, skipping empty placeholders that have no shapes yet.
  const nativeMenuIcon = (item) =>
    $$("yt-icon svg, .icon svg, svg", item).find((svg) => svg.querySelector("path, use, circle, rect, polygon"));

  // dismissNative: also close the native dropdown (the user picked nothing).
  function closeMenu(dismissNative) {
    if (menuEl) {
      const el = menuEl;
      menuEl = null;
      el.classList.remove("is-open");
      setTimeout(() => el.remove(), 180);
    }
    if (dismissNative) {
      bridge("closeMenus");
      setTimeout(() => document.documentElement.classList.remove("ytmnp-hide-native-menu"), 200);
    }
  }

  // ---------- Queue panel ----------

  function toggleQueue() {
    const show = !root.classList.contains("queue-open");
    root.classList.toggle("queue-open", show);
    queueBtn.classList.toggle("is-active", show);
    if (show) {
      queueSig = "";
      renderQueue(true);
    }
    root.scrollTop = 0;
  }

  // Skip the hidden "video" counterparts (#counterpart-renderer), which showed up as duplicates.
  const realImg = (src) => (src && /^https?:/.test(src) ? src : "");

  function readQueue() {
    const items = $$(SEL.queueItems).filter((it) => !it.closest("#counterpart-renderer"));
    const thumbs = bridge("queueThumbs", { selector: SEL.queueItems })?.thumbs || [];
    return items.map((it, i) => ({
      el: it,
      index: i,
      title: $(".song-title", it)?.textContent.trim() || "",
      artist: $(".byline", it)?.textContent.trim() || "",
      duration: $(".duration", it)?.textContent.trim() || "",
      thumb: realImg(thumbs[i]) || realImg($(".thumbnail img, yt-img-shadow img, img", it)?.src),
      current: it.hasAttribute("selected") || it.getAttribute("play-button-state") === "playing" || it.getAttribute("play-button-state") === "paused",
    }));
  }

  // A plain el.click() on a queue item doesn't switch tracks, so navigate to the
  // item's endpoint from the main world; fall back to a full simulated mouse click.
  function playQueueItem(q) {
    const isCurrent = () => q.el.hasAttribute("selected") || q.el.getAttribute("play-button-state") === "playing";
    if (!bridge("playQueueItem", { selector: SEL.queueItems, index: q.index })?.ok) simulateClick(q.el);
    setTimeout(() => {
      if (!isCurrent()) simulateClick(q.el);
      renderQueue();
    }, 800);
  }

  function simulateClick(item) {
    const el = $(".song-info", item) || item;
    const r = el.getBoundingClientRect();
    const init = { bubbles: true, cancelable: true, composed: true, view: window, button: 0, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    el.dispatchEvent(new PointerEvent("pointerdown", init));
    el.dispatchEvent(new MouseEvent("mousedown", init));
    el.dispatchEvent(new PointerEvent("pointerup", init));
    el.dispatchEvent(new MouseEvent("mouseup", init));
    el.dispatchEvent(new MouseEvent("click", init));
  }

  function renderQueue(scrollToCurrent = false) {
    const items = readQueue().filter((q) => q.title);
    const sig = items.map((q) => `${q.title}|${q.current ? 1 : 0}|${q.thumb}`).join("\n");
    if (sig === queueSig) return;
    queueSig = sig;

    if (!items.length) {
      queueList.replaceChildren(
        h("div", { class: "ytmnp-queue-empty" }, [
          h("div", { text: T.queueEmpty }),
          h("button", {
            class: "ytmnp-queue-open-native",
            text: T.openNativeQueue,
            onclick: () => {
              close();
              clickNative("ytmusic-player-bar .toggle-player-page-button, ytmusic-player-bar");
            },
          }),
        ])
      );
      return;
    }

    let currentRow = null;
    const rows = items.map((q) => {
      const art = q.thumb
        ? h("img", { class: "ytmnp-q-art", src: hiRes(q.thumb, 120), alt: "", loading: "lazy", referrerpolicy: "no-referrer" })
        : h("div", { class: "ytmnp-q-art ytmnp-q-art-empty" }, [icon("note")]);
      const row = h(
        "button",
        {
          class: `ytmnp-q-item${q.current ? " is-current" : ""}`,
          onclick: () => playQueueItem(q),
        },
        [
          art,
          h("div", { class: "ytmnp-q-text" }, [
            h("div", { class: "ytmnp-q-title", text: q.title }),
            h("div", { class: "ytmnp-q-artist", text: q.artist }),
          ]),
          h("div", { class: "ytmnp-q-dur", text: q.duration }),
        ]
      );
      if (q.current) currentRow = row;
      return row;
    });
    queueList.replaceChildren(...rows);
    // Scroll only the list: scrollIntoView would also scroll the overlay itself
    // (overflow: hidden still scrolls programmatically) and shift the whole view up.
    if (scrollToCurrent && currentRow) {
      queueList.scrollTop = currentRow.offsetTop - queueList.clientHeight / 2 + currentRow.offsetHeight / 2;
    }
  }

  // ---------- Repeat / like state (both UIs) ----------

  function repeatMode() {
    const bar = $(SEL.bar);
    const attr = bar?.getAttribute("repeat-mode") || bar?.getAttribute("repeat-mode_");
    if (attr) return attr.toUpperCase();
    // New UI: only aria-pressed + a localized label ("Repeat one", "Repetir uma"...).
    const btn = $(SEL.repeat);
    if (!btn || btn.getAttribute("aria-pressed") !== "true") return "NONE";
    return /\b(um|uma|one|1)\b/i.test(btn.getAttribute("aria-label") || "") ? "ONE" : "ALL";
  }

  // Like/unlike through YTM's official "+" shortcut, which toggles the like on the
  // current track in both UIs. If the state doesn't change, fall back to clicking the button.
  let liking = false;
  async function toggleLike() {
    if (liking) return;
    liking = true;
    const before = isLiked();
    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "+", code: "Equal", shiftKey: true, keyCode: 187, which: 187, bubbles: true, composed: true })
    );
    const changed = await waitFor(() => isLiked() !== before, 700);
    if (!changed) {
      clickNative(SEL.likeBtn);
      await waitFor(() => isLiked() !== before, 700);
    }
    liking = false;
    update();
  }

  function isLiked() {
    const btn = $(SEL.likeNew);
    if (btn) return btn.getAttribute("aria-pressed") === "true";
    return $(SEL.likeRenderer)?.getAttribute("like-status") === "LIKE";
  }

  // ---------- Periodic update ----------

  function update() {
    if (!root) return;
    const t = readTrack();

    titleEl.textContent = t.title;
    titleEl.title = t.title;
    artistEl.textContent = t.artist;

    if (t.art && t.art !== lastArt) {
      lastArt = t.art;
      artImg.classList.remove("is-loaded");
      artImg.onload = () => artImg.classList.add("is-loaded");
      artImg.onerror = () => {
        // maxresdefault doesn't always exist: fall back to the original thumbnail.
        const fallback = $(SEL.thumb)?.src;
        if (fallback && artImg.src !== fallback) artImg.src = fallback;
      };
      artImg.src = t.art;
      setBackground(t.art);
    }

    const v = video();
    if (v) {
      setIcon(playBtn, v.paused ? "play" : "pause");
      const { current, duration } = readTime();
      if (!seek.dragging && duration > 0) {
        seek.paint(current / duration);
        tCur.textContent = fmt(current);
        tRem.textContent = `-${fmt(duration - current)}`;
      }
    }

    updateVolume(bridge("getVolume"));

    const mode = repeatMode();
    setIcon(repeatBtn, mode === "ONE" ? "repeatOne" : "repeat");
    repeatBtn.classList.toggle("is-active", mode === "ALL" || mode === "ONE");

    const liked = isLiked();
    setIcon(starBtn, liked ? "starFilled" : "star");
    starBtn.classList.toggle("is-active", liked);

    if (root.classList.contains("queue-open") && tick++ % 4 === 0) renderQueue();
  }

  // The view is about the song, so leave YTM's video mode when opening it.
  function switchToSong() {
    const sw = $(SEL.avToggle);
    if (!sw) return;
    const inVideo =
      sw.getAttribute("playback-mode") === "OMV_PREFERRED" || $("ytmusic-player-page")?.hasAttribute("video-mode");
    if (!inVideo) return;
    const btn = $(SEL.songButton) || $$("button, [role='tab']", sw)[0];
    btn?.click();
  }

  function openOverlay() {
    switchToSong();
    if (!root) build();
    open = true;
    lastArt = "";
    update();
    root.classList.add("is-open");
    document.documentElement.classList.add("ytmnp-lock");
    clearInterval(timer);
    timer = setInterval(update, 250);
  }

  function close() {
    if (!root) return;
    closeMenu(true);
    open = false;
    root.classList.remove("is-open");
    document.documentElement.classList.remove("ytmnp-lock");
    clearInterval(timer);
  }

  const toggle = () => (open ? close() : openOverlay());

  // ---------- Player button + shortcuts ----------

  function injectButton() {
    const host = $(SEL.rightControls);
    if (!host || host.querySelector(".ytmnp-launch")) return;
    const b = iconButton("expand", "ytmnp-launch", "Now Playing (C)", (e) => {
      e.stopPropagation();
      toggle();
    });
    host.prepend(b);
  }

  // YTM (iron-overlay scroll lock) blocks the mouse wheel with capture listeners
  // on document. Window capture runs first, so we handle scrolling here.
  window.addEventListener(
    "wheel",
    (e) => {
      if (!open || !root.contains(e.target)) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.target.closest(".ytmnp-vol-wrap")) {
        nudgeVolume(e.deltaY < 0 ? 5 : -5);
        return;
      }
      const box = e.target.closest(".ytmnp-queue-list, .ytmnp-menu");
      if (!box) return;
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? box.clientHeight : 1;
      box.scrollTop += e.deltaY * unit;
    },
    { capture: true, passive: false }
  );

  new MutationObserver(injectButton).observe(document.body, { childList: true, subtree: true });
  injectButton();

  document.addEventListener(
    "keydown",
    (e) => {
      const t = e.target;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      const stop = () => {
        e.preventDefault();
        e.stopPropagation();
      };
      if (e.key === "c" || e.key === "C") {
        stop();
        toggle();
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        stop();
        if (menuEl) closeMenu(true);
        else if (root.classList.contains("queue-open")) toggleQueue();
        else close();
      } else if (e.key === "ArrowUp") {
        stop();
        nudgeVolume(5);
      } else if (e.key === "ArrowDown") {
        stop();
        nudgeVolume(-5);
      } else if (e.key === "q" || e.key === "Q") {
        stop();
        toggleQueue();
      }
    },
    true
  );

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "ytmnp-toggle") toggle();
  });
})();
