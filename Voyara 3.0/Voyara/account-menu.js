(() => {
  if (document.body.classList.contains("voyager-social-page")) return;

  const headerActions = document.querySelector(".header .header-actions");
  const avatar = headerActions?.querySelector(".avatar-button");
  const chevron = headerActions?.querySelector(".account-chevron");
  if (!headerActions || !avatar || headerActions.querySelector(".voyara-account-menu")) return;

  const savedStatus = localStorage.getItem("voyara-presence") || "voyaging";
  const statusData = {
    voyaging: { label: "Voyaging", detail: "Online", mark: "●" },
    slumbering: { label: "Slumbering", detail: "Offline", mark: "☾" },
    avast: { label: "Avast", detail: "Invisible", mark: "◌" }
  };

  const anchor = document.createElement("div");
  anchor.className = "account-menu-anchor";
  avatar.parentNode.insertBefore(anchor, avatar);
  anchor.append(avatar);
  if (chevron) anchor.append(chevron);

  const menu = document.createElement("section");
  menu.className = "voyara-account-menu";
  menu.hidden = true;
  menu.setAttribute("aria-label", "Account menu");
  menu.innerHTML = `
    <div class="account-menu-user">
      <span class="account-menu-avatar"><img src="assets/header-avatar.png" alt=""><i data-presence-dot></i></span>
      <span><strong>Prabh</strong><small>@prabh.voyages</small></span>
      <b class="account-status-badge" data-presence-badge></b>
    </div>
    <div class="account-menu-group account-status-group">
      <button type="button" class="account-menu-row account-submenu-trigger" data-account-panel="status"><span class="account-row-icon">◉</span><span>Update status</span><i>›</i></button>
      <div class="account-submenu" data-account-submenu="status" hidden>
        ${Object.entries(statusData).map(([value, status]) => `<button type="button" data-presence="${value}"><span>${status.mark}</span><b>${status.label}</b><small>${status.detail}</small><i>✓</i></button>`).join("")}
      </div>
    </div>
    <div class="account-menu-group">
      <button type="button" class="account-menu-row" data-account-action="profile"><span class="account-row-icon">○</span><span>Profile</span></button>
      <button type="button" class="account-menu-row" data-account-action="notifications"><span class="account-row-icon">♢</span><span>Notifications</span><b class="account-menu-count">2</b></button>
    </div>
    <div class="account-menu-group">
      <button type="button" class="account-menu-row" data-account-action="download"><span class="account-row-icon">↓</span><span>Download app</span></button>
      <button type="button" class="account-menu-row" data-account-action="whats-new"><span class="account-row-icon">✦</span><span>What’s new</span><i>↗</i></button>
      <button type="button" class="account-menu-row" data-account-action="help"><span class="account-row-icon">?</span><span>Get help</span><i>↗</i></button>
    </div>
    <div class="account-menu-group account-menu-account-actions">
      <button type="button" class="account-menu-row account-submenu-trigger" data-account-panel="accounts"><span class="account-row-icon">⇄</span><span>Switch account</span><i>›</i></button>
      <div class="account-submenu account-switcher" data-account-submenu="accounts" hidden>
        <button type="button" data-switch-account="Voyara Business"><img src="assets/voyara-logo.png" alt=""><span><b>Voyara Business</b><small>Business account</small></span></button>
        <button type="button" data-switch-account="Family Explorer"><img src="assets/header-avatar.png" alt=""><span><b>Family Explorer</b><small>Customer account</small></span></button>
      </div>
      <button type="button" class="account-menu-row account-logout" data-account-action="logout"><span class="account-row-icon">↪</span><span>Log out</span></button>
    </div>
    <div class="account-menu-detail" data-account-detail hidden></div>`;
  anchor.append(menu);

  const toast = document.createElement("button");
  toast.className = "account-toast";
  toast.type = "button";
  toast.hidden = true;
  document.body.append(toast);

  const notificationModal = document.createElement("div");
  notificationModal.className = "notification-modal";
  notificationModal.hidden = true;
  notificationModal.innerHTML = `<section class="notification-dialog" role="dialog" aria-modal="true" aria-labelledby="notification-title">
    <header><div><span>YOUR VOYARA</span><h2 id="notification-title">Notifications</h2></div><button type="button" data-close-notifications aria-label="Close notifications">×</button></header>
    <div class="notification-list">
      <a href="activity-detail.html?id=rose-island-sail"><i>⛵</i><div><strong>Your Rose Island sail is coming up</strong><p>Saturday at 9:30 AM · Nassau Harbour</p><small>View booking details →</small></div><time>Now</time></a>
      <a href="profile.html#rewards"><i>✦</i><div><strong>You’re 550 points from Explorer</strong><p>One more island experience could unlock your next loyalty tier.</p><small>See rewards progress →</small></div><time>2h</time></a>
      <a href="activity-detail.html?id=sunset-beach-session"><i>☀</i><div><strong>Sunset Beach Session reminder</strong><p>Your Cable Beach experience begins August 28 at 5:30 PM.</p><small>View upcoming trip →</small></div><time>1d</time></a>
    </div>
    <footer><button type="button" data-close-notifications>Done</button></footer>
  </section>`;
  document.body.append(notificationModal);

  const closeNotifications = () => { notificationModal.hidden = true; document.body.classList.remove("modal-open"); };
  const openNotifications = () => { closeMenu(); notificationModal.hidden = false; document.body.classList.add("modal-open"); notificationModal.querySelector("[data-close-notifications]")?.focus(); };
  notificationModal.querySelectorAll("[data-close-notifications]").forEach((button) => button.addEventListener("click", closeNotifications));
  notificationModal.addEventListener("click", (event) => { if (event.target === notificationModal) closeNotifications(); });

  const showToast = (message) => {
    toast.textContent = `${message}  ×`;
    toast.hidden = false;
    window.clearTimeout(window.voyaraAccountToastTimer);
    window.voyaraAccountToastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
  };
  toast.addEventListener("click", () => { toast.hidden = true; });

  const renderStatus = (value) => {
    const status = statusData[value] || statusData.voyaging;
    anchor.dataset.status = value;
    menu.dataset.status = value;
    menu.querySelector("[data-presence-badge]").textContent = status.label;
    menu.querySelectorAll("[data-presence]").forEach((button) => button.classList.toggle("selected", button.dataset.presence === value));
    avatar.setAttribute("aria-label", `Account menu — ${status.label} (${status.detail})`);
  };
  renderStatus(savedStatus);

  const closeMenu = () => {
    menu.hidden = true;
    avatar.setAttribute("aria-expanded", "false");
    chevron?.setAttribute("aria-expanded", "false");
    anchor.classList.remove("open");
    menu.querySelectorAll(".account-submenu").forEach((submenu) => { submenu.hidden = true; });
  };
  const toggleMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const opening = menu.hidden;
    menu.hidden = !opening;
    avatar.setAttribute("aria-expanded", String(opening));
    chevron?.setAttribute("aria-expanded", String(opening));
    anchor.classList.toggle("open", opening);
  };
  avatar.setAttribute("aria-haspopup", "menu");
  avatar.setAttribute("aria-expanded", "false");
  avatar.addEventListener("click", toggleMenu);
  chevron?.addEventListener("click", toggleMenu);

  menu.querySelectorAll("[data-account-panel]").forEach((button) => button.addEventListener("click", () => {
    const target = menu.querySelector(`[data-account-submenu="${button.dataset.accountPanel}"]`);
    menu.querySelectorAll(".account-submenu").forEach((submenu) => { if (submenu !== target) submenu.hidden = true; });
    target.hidden = !target.hidden;
  }));

  menu.querySelectorAll("[data-presence]").forEach((button) => button.addEventListener("click", () => {
    localStorage.setItem("voyara-presence", button.dataset.presence);
    renderStatus(button.dataset.presence);
    showToast(`Status updated to ${statusData[button.dataset.presence].label}.`);
    button.closest(".account-submenu").hidden = true;
  }));

  menu.querySelectorAll("[data-switch-account]").forEach((button) => button.addEventListener("click", () => {
    showToast(`Switched to ${button.dataset.switchAccount} for this prototype.`);
    closeMenu();
  }));

  menu.querySelectorAll("[data-account-action]").forEach((button) => button.addEventListener("click", () => {
    const action = button.dataset.accountAction;
    if (action === "notifications") {
      openNotifications();
      return;
    }
    if (action === "profile") {
      window.location.href = "profile.html";
      return;
    }
    const messages = {
      download: "Voyara mobile app download will be available soon.",
      "whats-new": "What’s new: sponsored voyage offers and a refreshed community feed.",
      help: "Voyara Help Centre will open here in the complete product.",
      logout: "You have been logged out of the prototype."
    };
    showToast(messages[action]);
    closeMenu();
  }));

  document.addEventListener("click", (event) => { if (!anchor.contains(event.target)) closeMenu(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeMenu(); closeNotifications(); } });
})();
