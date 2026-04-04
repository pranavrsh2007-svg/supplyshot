/**
 * useVoice — AI Voice Guidance hook using Web Speech API
 *
 * Features:
 *  - Reads global voiceEnabled flag from VoiceContext (persisted in localStorage)
 *  - Auto-detects available voices after voiceschanged fires
 *  - Marathi (mr-IN): uses mr-IN voice if available, else falls back to hi-IN
 *  - Hindi  (hi-IN): uses hi-IN voice if available, else Google Hindi
 *  - English (en-IN): uses en-IN / en-US voice
 *  - Queued speech with priority override
 *
 * Usage:
 *   const { speak, stop, supported } = useVoice();
 *   speak(t("voice.routePlanned"));      // normal queued
 *   speak(t("voice.sosActivated"), true); // priority – cancels queue
 */

import { useCallback, useEffect, useRef, useState } from "react";
import i18n from "../i18n";
import { useVoiceCtx } from "../context/AppContext";

/* ─── Language → BCP-47 tag ───────────────────────────── */
const LANG_MAP = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };

/* ─── Voice selector with Marathi fallback ─────────────── */
function pickVoice(langCode, voices) {
  if (!voices || voices.length === 0) return null;

  const base = langCode.split("-")[0]; // "hi", "mr", "en"

  // 1. Exact lang match + preferred name
  const preferredNames = ["Google", "Natural", "Female", "Hemant", "Lekha", "Ravi"];
  const exactPref = voices.find(
    (v) =>
      v.lang === langCode &&
      preferredNames.some((n) => v.name.includes(n))
  );
  if (exactPref) return { voice: exactPref, lang: langCode };

  // 2. Exact lang match (any voice)
  const exact = voices.find((v) => v.lang === langCode);
  if (exact) return { voice: exact, lang: langCode };

  // 3. Base language match (e.g., mr-XX for "mr")
  const basePref = voices.find(
    (v) =>
      v.lang.startsWith(base) &&
      preferredNames.some((n) => v.name.includes(n))
  );
  if (basePref) return { voice: basePref, lang: basePref.lang };

  const baseAny = voices.find((v) => v.lang.startsWith(base));
  if (baseAny) return { voice: baseAny, lang: baseAny.lang };

  // 4. Marathi-specific fallback → Hindi
  if (base === "mr") {
    const hiFallback =
      voices.find((v) => v.lang === "hi-IN") ||
      voices.find((v) => v.lang.startsWith("hi"));
    if (hiFallback) return { voice: hiFallback, lang: hiFallback.lang };
  }

  // 5. Last resort: first available voice
  return { voice: voices[0], lang: voices[0].lang };
}

/* ─── Hook ─────────────────────────────────────────────── */
export function useVoice() {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Global toggle from context
  const { voiceEnabled, toggleVoice } = useVoiceCtx();

  const voicesRef   = useRef([]);
  const queueRef    = useRef([]);
  const speakingRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  /* Cancel all speech on unmount to prevent voice continuing after navigation */
  useEffect(() => {
    return () => {
      if (supported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  /* Load voices – fires immediately if already loaded, else on event */
  useEffect(() => {
    if (!supported) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [supported]);

  /* Core: process one item from the queue */
  const processQueue = useCallback(() => {
    if (!supported || speakingRef.current || queueRef.current.length === 0)
      return;

    const text = queueRef.current.shift();
    speakingRef.current = true;

    const lang =
      i18n.language ||
      localStorage.getItem("truckLang") ||
      "en";
    const langCode = LANG_MAP[lang] || "en-IN";

    const msg = new SpeechSynthesisUtterance(text);
    msg.rate   = 0.92;
    msg.pitch  = 1;
    msg.volume = 1;
    msg.lang   = langCode;

    const picked = pickVoice(langCode, voicesRef.current);
    if (picked) {
      msg.voice = picked.voice;
      msg.lang  = picked.lang; // may be hi-IN for Marathi fallback
    }

    msg.onstart = () => {
      setIsSpeaking(true);
    };
    msg.onend = () => {
      speakingRef.current = false;
      setIsSpeaking(false);
      processQueue();
    };
    msg.onerror = () => {
      speakingRef.current = false;
      setIsSpeaking(false);
      processQueue();
    };

    window.speechSynthesis.speak(msg);
  }, [supported]);

  /* Public: speak(text, priority?) */
  const speak = useCallback(
    (text, priority = false) => {
      if (!supported || !voiceEnabled || !text) return;
      if (priority) {
        window.speechSynthesis.cancel();
        speakingRef.current = false;
        queueRef.current = [text];
      } else {
        queueRef.current.push(text);
      }
      processQueue();
    },
    [supported, voiceEnabled, processQueue]
  );

  /* Public: stop() – immediately cancels all speech and clears queue */
  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    queueRef.current = [];
    setIsSpeaking(false);
  }, [supported]);

  return { speak, stop, voiceEnabled, toggleVoice, supported, isSpeaking };
}
