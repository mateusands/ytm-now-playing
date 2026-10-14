// Runs in the page's "MAIN" world: only from here can we call the internal
// player API (#movie_player) and the methods of YouTube Music's Polymer elements.
// Talks to content.js through window events carrying JSON in `detail`.
(() => {
  "use strict";

  const player = () => document.querySelector("#movie_player");
  // Old UI: <tp-yt-paper-slider id="volume-slider">. New UI: <input type="range" id="slider">.
  const slider = () => document.querySelector("ytmusic-player-bar #volume-slider");
  const rangeInput = () => document.querySelector("ytmusic-app-layout > ytmusic-miniplayer input#slider");

  function state() {
    const p = player();
    const s = slider();
    let volume = s && typeof s.value === "number" ? s.value : p?.getVolume?.();
    if (typeof volume !== "number") volume = 100;
    return { volume, muted: !!p?.isMuted?.() };
  }

  function setVolume(v) {
    v = Math.round(Math.min(100, Math.max(0, v)));
    const p = player();
    const s = slider();
    // Update YTM's own slider (keeps the app state in sync) and the player.
    const r = rangeInput();
    if (r) {
      // The new UI syncs the player and app state from the "input" event.
      r.value = String(v);
      r.dispatchEvent(new Event("input", { bubbles: true }));
      r.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (s) {
      s.value = v;
      s.dispatchEvent(new CustomEvent("immediate-value-change", { bubbles: true }));
      s.dispatchEvent(new CustomEvent("value-change", { bubbles: true }));
      s.dispatchEvent(new Event("change", { bubbles: true }));
    }
    p?.setVolume?.(v);
    if (v > 0 && p?.isMuted?.()) p.unMute();
  }

  function toggleMute() {
    const p = player();
    if (!p?.isMuted) return;
    p.isMuted() ? p.unMute() : p.mute();
  }

  function closeMenus() {
    document.querySelectorAll("ytmusic-popup-container tp-yt-iron-dropdown").forEach((d) => {
      if (d.opened && typeof d.close === "function") d.close();
    });
  }

  // Queue <img> elements only get a src once the native queue is visible;
  // the Polymer data already holds the thumbnail URL (or at least the videoId).
  function queueThumbs(selector) {
    const items = [...document.querySelectorAll(selector)].filter((it) => !it.closest("#counterpart-renderer"));
    return items.map((it) => {
      const d = it.data || it.__data?.data || {};
      const list = d.thumbnail?.thumbnails;
      if (list?.length) return list[list.length - 1].url;
      return d.videoId ? `https://i.ytimg.com/vi/${d.videoId}/hqdefault.jpg` : "";
    });
  }

  window.addEventListener("ytmnp:cmd", (e) => {
    let msg;
    try {
      msg = JSON.parse(e.detail);
    } catch {
      return;
    }
    let reply = null;
    if (msg.cmd === "setVolume") setVolume(msg.value);
    else if (msg.cmd === "toggleMute") toggleMute();
    else if (msg.cmd === "closeMenus") closeMenus();
    else if (msg.cmd === "queueThumbs") reply = { thumbs: queueThumbs(msg.selector) };
    window.dispatchEvent(new CustomEvent("ytmnp:state", { detail: JSON.stringify(reply || state()) }));
  });
})();
