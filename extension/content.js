(function () {
  const BANNER_ID = "gmail-otp-banner-root";
  const STYLE_ID = "gmail-otp-banner-style";
  const AUTO_CLOSE_MS = 5 * 1000;
  let autoCloseTimerId = null;
  let isClosing = false;

  if (window.__gmailOtpBannerContentLoaded) {
    return;
  }

  window.__gmailOtpBannerContentLoaded = true;

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "SHOW_OTP_BANNER") {
      renderBanner(message.item);
    }

    if (message?.type === "CLEAR_OTP_BANNER") {
      removeBanner({ notify: false });
    }
  });

  function renderBanner(item) {
    if (!item?.code || !item?.email || !item?.messageId) {
      return;
    }

    injectStyles();
    removeBanner({ notify: false, instant: true });
    isClosing = false;

    const banner = document.createElement("div");
    banner.id = BANNER_ID;
    banner.setAttribute("role", "status");
    banner.innerHTML = `
      <div class="gmail-otp-banner__meta">
        <span class="gmail-otp-banner__label">Verification code</span>
        <span class="gmail-otp-banner__account"></span>
      </div>
      <div class="gmail-otp-banner__row">
        <strong class="gmail-otp-banner__code"></strong>
        <button class="gmail-otp-banner__copy" type="button">Copy</button>
        <button class="gmail-otp-banner__close" type="button" aria-label="Close">x</button>
      </div>
      <div class="gmail-otp-banner__time"></div>
    `;

    banner.querySelector(".gmail-otp-banner__account").textContent = item.email;
    banner.querySelector(".gmail-otp-banner__code").textContent = item.code;
    banner.querySelector(".gmail-otp-banner__time").textContent = formatDetectedAt(item.detectedAt);
    banner.querySelector(".gmail-otp-banner__copy").addEventListener("click", async () => {
      await navigator.clipboard.writeText(item.code);
      banner.querySelector(".gmail-otp-banner__copy").textContent = "Copied";
    });
    banner.querySelector(".gmail-otp-banner__close").addEventListener("click", () => {
      removeBanner({ notify: true, item, reason: "dismiss" });
    });

    document.documentElement.appendChild(banner);
    autoCloseTimerId = window.setTimeout(() => {
      console.log("[OTP] banner auto closed");
      removeBanner({ notify: true, item, reason: "auto" });
    }, AUTO_CLOSE_MS);
  }

  function removeBanner({ notify, item, reason, instant } = {}) {
    if (autoCloseTimerId) {
      window.clearTimeout(autoCloseTimerId);
      autoCloseTimerId = null;
    }

    const existing = document.getElementById(BANNER_ID);

    if (existing && instant) {
      existing.remove();
    } else if (existing && !isClosing) {
      isClosing = true;
      existing.classList.add("gmail-otp-banner--closing");
      window.setTimeout(() => {
        existing.remove();
        isClosing = false;
      }, 220);
    }

    if (notify && item) {
      chrome.runtime.sendMessage({ type: "OTP_BANNER_CLOSED", item, reason });
    }
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${BANNER_ID} {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2147483647;
        min-width: 310px;
        max-width: min(390px, calc(100vw - 32px));
        padding: 16px;
        border: 1px solid rgba(26, 115, 232, 0.18);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.98);
        color: #172033;
        box-shadow: 0 18px 48px rgba(23, 32, 51, 0.22);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        line-height: 1.3;
        animation: otpSlideIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        backdrop-filter: blur(12px);
      }

      #${BANNER_ID}.gmail-otp-banner--closing {
        animation: otpSlideOut 200ms ease-in both;
      }

      #${BANNER_ID} .gmail-otp-banner__meta {
        display: grid;
        gap: 3px;
        margin-bottom: 10px;
      }

      #${BANNER_ID} .gmail-otp-banner__label {
        color: #58667a;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      #${BANNER_ID} .gmail-otp-banner__account {
        overflow: hidden;
        color: #27364a;
        font-size: 12px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #${BANNER_ID} .gmail-otp-banner__row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #${BANNER_ID} .gmail-otp-banner__code {
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: 0;
      }

      #${BANNER_ID} button {
        min-height: 32px;
        border: 0;
        border-radius: 999px;
        cursor: pointer;
        font: inherit;
        transition: transform 140ms ease, background 140ms ease;
      }

      #${BANNER_ID} button:hover {
        transform: translateY(-1px);
      }

      #${BANNER_ID} .gmail-otp-banner__copy {
        padding: 0 12px;
        background: #1a73e8;
        color: #ffffff;
        font-weight: 700;
      }

      #${BANNER_ID} .gmail-otp-banner__close {
        width: 32px;
        background: #eef2f7;
        color: #172033;
      }

      #${BANNER_ID} .gmail-otp-banner__time {
        margin-top: 8px;
        color: #667386;
        font-size: 12px;
      }

      @keyframes otpSlideIn {
        from {
          opacity: 0;
          transform: translateX(28px);
        }

        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes otpSlideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }

        to {
          opacity: 0;
          transform: translateX(28px);
        }
      }
    `;
    document.documentElement.appendChild(style);
  }

  function formatDetectedAt(detectedAt) {
    if (!detectedAt) {
      return "Detected now";
    }

    return `Detected at ${new Date(detectedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })}`;
  }
})();
