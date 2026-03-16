(() => {
  const themeStorageKey = "xtask-theme";
  const themeButtons = Array.from(document.querySelectorAll("[data-theme-toggle]"));
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  const backdrop = document.getElementById("mobile-backdrop");

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
