(() => {
  const themeStorageKey = "xtask-theme";
  const cookieConsentStorageKey = "xtask-cookie-consent";
  const acceptedCookieConsentValue = "accepted";
  const essentialCookieConsentValue = "essential-only";
  const themeButtons = Array.from(document.querySelectorAll("[data-theme-toggle]"));
  const cookieConsent = document.getElementById("cookie-consent");
  const cookieConsentPreferences = document.getElementById("cookie-consent-preferences");
  const cookieConsentAcceptButton = document.querySelector("[data-cookie-consent-accept]");
  const cookieConsentEssentialButton = document.querySelector("[data-cookie-consent-essential]");
  const cookieConsentCustomizeButton = document.querySelector("[data-cookie-consent-customize]");
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const backdrop = document.getElementById("mobile-backdrop");

  const getCookieConsentDecision = () => window.localStorage.getItem(cookieConsentStorageKey);

  const hasCookieConsentDecision = () => {
    const decision = getCookieConsentDecision();
    return decision === acceptedCookieConsentValue || decision === essentialCookieConsentValue;
  };

  const setCookiePreferencesExpanded = (expanded) => {
    if (!cookieConsentPreferences || !cookieConsentCustomizeButton) {
      return;
    }

    cookieConsentPreferences.hidden = !expanded;
    cookieConsentCustomizeButton.setAttribute("aria-expanded", String(expanded));
  };

  const hideCookieConsent = () => {
    if (!cookieConsent) {
      return;
    }

    cookieConsent.hidden = true;
    document.body.classList.remove("cookie-consent-open");
    setCookiePreferencesExpanded(false);
  };

  const showCookieConsent = () => {
    if (!cookieConsent) {
      return;
    }

    cookieConsent.hidden = false;
    document.body.classList.add("cookie-consent-open");
  };

  const storeCookieConsentDecision = (decision) => {
    window.localStorage.setItem(cookieConsentStorageKey, decision);
    hideCookieConsent();
  };

  const acceptCookieConsent = () => {
    storeCookieConsentDecision(acceptedCookieConsentValue);
  };

  const acceptEssentialOnlyCookies = () => {
    storeCookieConsentDecision(essentialCookieConsentValue);
  };

  const resolveThemeLabels = () => {
    const source = themeButtons[0];
    return {
      dark: source?.dataset.themeLabelDark || "Switch to dark mode",
      light: source?.dataset.themeLabelLight || "Switch to day mode",
    };
  };

  const applyTheme = (theme) => {
    const resolvedTheme = theme === "dark" ? "dark" : "light";
    const labels = resolveThemeLabels();
    document.documentElement.dataset.theme = resolvedTheme;
    window.localStorage.setItem(themeStorageKey, resolvedTheme);
    themeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(resolvedTheme === "dark"));
      button.setAttribute(
        "aria-label",
        resolvedTheme === "dark" ? labels.light : labels.dark
      );
      button.setAttribute(
        "title",
        resolvedTheme === "dark" ? labels.light : labels.dark
      );
    });
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const savedTheme = window.localStorage.getItem(themeStorageKey);
  applyTheme(savedTheme === "dark" ? "dark" : "light");
  themeButtons.forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });

  if (cookieConsent && cookieConsentAcceptButton && cookieConsentEssentialButton && cookieConsentCustomizeButton) {
    if (hasCookieConsentDecision()) {
      hideCookieConsent();
    } else {
      showCookieConsent();
    }

    cookieConsentAcceptButton.addEventListener("click", acceptCookieConsent);
    cookieConsentEssentialButton.addEventListener("click", acceptEssentialOnlyCookies);
    cookieConsentCustomizeButton.addEventListener("click", () => {
      const expanded = cookieConsentCustomizeButton.getAttribute("aria-expanded") === "true";
      setCookiePreferencesExpanded(!expanded);
    });
  }

  if (!toggle || !menu || !backdrop) {
    return;
  }

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", toggle.dataset.labelOpen || "Open menu");
    menu.hidden = true;
    backdrop.hidden = true;
  };

  const openMenu = () => {
    document.body.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", toggle.dataset.labelClose || "Close menu");
    menu.hidden = false;
    backdrop.hidden = false;
  };

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    if (expanded) {
      closeMenu();
      return;
    }
    openMenu();
  });

  backdrop.addEventListener("click", closeMenu);
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) {
      closeMenu();
    }
  });

  closeMenu();
})();
