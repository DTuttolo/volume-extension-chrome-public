const sliderEl = document.getElementById("volumeSlider");
const currentLevelEl = document.getElementById("currentLevel");
const sliderFillEl = document.getElementById("sliderFill");
const siteNoticeEl = document.getElementById("siteNotice");
const popoutButtonEl = document.getElementById("popoutButton");
const themeToggleEl = document.getElementById("themeToggle");
const presetButtons = Array.from(document.querySelectorAll(".preset-btn"));
const statusEl = document.getElementById("status");
const ALLOWED_LEVELS = [0, 50, 100, 150, 200, 250, 300];
const targetTabParam = Number.parseInt(new URLSearchParams(window.location.search).get("tabId"), 10);
let pinnedTargetTabId = Number.isInteger(targetTabParam) ? targetTabParam : null;

function setStatus(text, isError = false) {
    statusEl.textContent = text;
    statusEl.style.color = isError ? "#ffb5bf" : "";
}

function updateLevelUI(level) {
    const normalized = ALLOWED_LEVELS.includes(level) ? level : 100;
    sliderEl.value = String(normalized);
    currentLevelEl.textContent = normalized === 0 ? "Mute" : `${normalized}%`;
    sliderFillEl.style.width = `${(normalized / 300) * 100}%`;

    for (const button of presetButtons) {
        button.classList.toggle("is-active", Number.parseInt(button.dataset.level, 10) === normalized);
    }
}

async function findTargetTab() {
    if (pinnedTargetTabId !== null) {
        try {
            const tab = await chrome.tabs.get(pinnedTargetTabId);
            if (tab?.id) {
                return tab;
            }
        } catch (_error) {
            pinnedTargetTabId = null;
        }
    }

    const lastFocusedTabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const candidate = lastFocusedTabs.find((tab) => tab?.id && isSupportedTab(tab));
    if (candidate) {
        return candidate;
    }

    const windows = await chrome.windows.getAll({ populate: true, windowTypes: ["normal"] });
    for (const win of windows) {
        const activeInWindow = (win.tabs || []).find((tab) => tab.active && tab.id && isSupportedTab(tab));
        if (activeInWindow) {
            return activeInWindow;
        }
    }

    throw new Error("No supported browser tab found.");
}

async function getActiveTab() {
    const tab = await findTargetTab();
    if (!tab.id) {
        throw new Error("No active tab found.");
    }
    return tab;
}

function applyVolumeInPage(level) {
    const key = "__volume_control_300_state__";
    if (!window[key]) {
        window[key] = {
            controllers: new WeakMap(),
            audioCtx: null,
            observerStarted: false
        };
    }

    const state = window[key];

    function getAudioContext() {
        if (state.audioCtx) {
            return state.audioCtx;
        }

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
            return null;
        }

        state.audioCtx = new AudioCtx();
        return state.audioCtx;
    }

    function ensureController(media) {
        const existing = state.controllers.get(media);
        if (existing) {
            return existing;
        }

        const ctx = getAudioContext();
        if (!ctx) {
            return null;
        }

        try {
            const source = ctx.createMediaElementSource(media);
            const gain = ctx.createGain();

            source.connect(gain);
            gain.connect(ctx.destination);

            const controller = { gain };
            state.controllers.set(media, controller);
            return controller;
        } catch (_error) {
            return null;
        }
    }

    const summary = {
        totalMedia: 0,
        boostedMedia: 0,
        fallbackMedia: 0
    };

    function applyToMedia(media) {
        summary.totalMedia += 1;

        if (level === 0) {
            media.muted = false;
            media.volume = 1;
            const controller = state.controllers.get(media);
            if (controller) {
                controller.gain.gain.value = 1;
            }
            summary.fallbackMedia += 1;
            return;
        }

        media.muted = false;

        if (level <= 100) {
            media.volume = level / 100;
            const controller = state.controllers.get(media);
            if (controller) {
                controller.gain.gain.value = 1;
            }
            summary.fallbackMedia += 1;
            return;
        }

        media.volume = 1;
        const controller = ensureController(media);
        if (!controller) {
            summary.fallbackMedia += 1;
            return;
        }

        controller.gain.gain.value = level / 100;
        const ctx = getAudioContext();
        if (ctx) {
            ctx.resume().catch(() => { });
        }
        summary.boostedMedia += 1;
    }

    document.querySelectorAll("audio, video").forEach((media) => {
        applyToMedia(media);
    });

    if (!state.observerStarted) {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof Element)) {
                        continue;
                    }

                    if (node.matches && node.matches("audio, video")) {
                        applyToMedia(node);
                    }

                    if (node.querySelectorAll) {
                        node.querySelectorAll("audio, video").forEach((media) => {
                            applyToMedia(media);
                        });
                    }
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        state.observerStarted = true;
    }

    return summary;
}

function isSupportedTab(tab) {
    return Boolean(tab.url) && /^https?:\/\//.test(tab.url);
}

function setControlsDisabled(isDisabled) {
    sliderEl.disabled = isDisabled;
    popoutButtonEl.disabled = false;
    for (const button of presetButtons) {
        button.disabled = isDisabled;
    }
}

async function applySelectedVolume(level) {
    if (!ALLOWED_LEVELS.includes(level)) {
        return;
    }

    try {
        const activeTab = await getActiveTab();
        if (!isSupportedTab(activeTab)) {
            setStatus("This page is not supported (http/https only).", true);
            return;
        }

        if (level === 0) {
            await chrome.tabs.update(activeTab.id, { muted: true });
            await chrome.storage.local.set({ selectedVolumeLevel: level });
            updateLevelUI(level);
            setStatus("Active: Tab muted");
            return;
        }

        await chrome.tabs.update(activeTab.id, { muted: false });

        const results = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id, allFrames: true },
            func: applyVolumeInPage,
            args: [level]
        });

        const summary = results.reduce(
            (acc, item) => {
                const result = item.result || { totalMedia: 0, boostedMedia: 0, fallbackMedia: 0 };
                acc.totalMedia += result.totalMedia;
                acc.boostedMedia += result.boostedMedia;
                acc.fallbackMedia += result.fallbackMedia;
                return acc;
            },
            { totalMedia: 0, boostedMedia: 0, fallbackMedia: 0 }
        );

        await chrome.storage.local.set({ selectedVolumeLevel: level });
        updateLevelUI(level);

        if (level > 100 && summary.totalMedia > 0 && summary.boostedMedia === 0) {
            setStatus("Boost above 100% could not be applied on this page.", true);
            return;
        }

        setStatus(`Active: ${level === 0 ? "Mute" : `${level}%`}`);
    } catch (error) {
        setStatus(error.message || "Could not set volume.", true);
    }
}

async function restoreSelection() {
    try {
        const tab = await getActiveTab();
        if (isSupportedTab(tab)) {
            siteNoticeEl.textContent = "";
            setControlsDisabled(false);
        } else {
            siteNoticeEl.textContent = "This page is not supported (http/https only).";
            setControlsDisabled(true);
        }

        const stored = await chrome.storage.local.get("selectedVolumeLevel");
        const value = stored.selectedVolumeLevel;
        const restored = ALLOWED_LEVELS.includes(value) ? value : 100;

        updateLevelUI(restored);
        setStatus(`Ready: ${restored === 0 ? "Mute" : `${restored}%`}`);
    } catch (error) {
        updateLevelUI(100);
        setStatus(error.message || "Could not initialize popup.", true);
    }
}

sliderEl.addEventListener("input", () => {
    updateLevelUI(Number.parseInt(sliderEl.value, 10));
});

sliderEl.addEventListener("change", () => {
    applySelectedVolume(Number.parseInt(sliderEl.value, 10));
});

for (const button of presetButtons) {
    button.addEventListener("click", () => {
        const level = Number.parseInt(button.dataset.level, 10);
        updateLevelUI(level);
        applySelectedVolume(level);
    });
}

themeToggleEl.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    themeToggleEl.textContent = document.body.classList.contains("light-mode") ? "Dark Mode" : "Light Mode";
});

popoutButtonEl.addEventListener("click", async () => {
    try {
        const activeTab = await getActiveTab();
        await chrome.windows.create({
            url: chrome.runtime.getURL(`popup.html?tabId=${activeTab.id}`),
            type: "popup",
            width: 360,
            height: 620
        });
    } catch (error) {
        setStatus(error.message || "Could not open popout window.", true);
    }
});

document.addEventListener("DOMContentLoaded", restoreSelection);
