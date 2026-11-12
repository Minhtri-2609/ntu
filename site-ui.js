/* site-ui.js: nút sáng/tối và nút tài khoản dùng chung cho các trang phụ */
(function () {
    const LOCAL = ["127.0.0.1", "localhost"].includes(location.hostname);
    const API = LOCAL ? "http://127.0.0.1:5000" : "https://tr1ssca.pythonanywhere.com";
    const THEME_KEY = "theme";

    // Nạp icon Boxicons nếu trang chưa có
    if (!document.querySelector('link[href*="boxicons"]')) {
        const icons = document.createElement("link");
        icons.rel = "stylesheet";
        icons.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
        document.head.appendChild(icons);
    }

    // Chỗ đặt nút: khung [data-su-slot] (account.html) hoặc .header-actions (các bài viết)
    const slot = document.querySelector("[data-su-slot]") || document.querySelector(".header-actions");
    if (!slot) return;

    const holder = document.createElement("div");
    holder.className = "su-actions";
    slot.appendChild(holder);

    // Ẩn nút sáng/tối cũ của bài viết (thay bằng công tắc mới)
    const oldToggle = document.getElementById("themeToggle");
    if (oldToggle) oldToggle.style.display = "none";

    /* ---------- Sáng / tối ---------- */
    const root = document.documentElement;
    const themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "su-theme";
    themeBtn.innerHTML = '<i class="bx bxs-moon"></i><i class="bx bxs-sun"></i><i class="su-knob"></i>';
    holder.appendChild(themeBtn);

    function applyTheme(theme) {
        root.dataset.theme = theme;
        themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
        themeBtn.setAttribute("aria-label", theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
    }

    let saved = null;
    try {
        saved = localStorage.getItem(THEME_KEY);
    } catch (e) {}
    applyTheme(saved || root.dataset.theme || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"));

    themeBtn.addEventListener("click", function () {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
            localStorage.setItem(THEME_KEY, next);
        } catch (e) {}
    });

    /* ---------- Tài khoản ---------- */
    const userBox = document.createElement("div");
    userBox.className = "su-user";
    holder.appendChild(userBox);

    const ITEMS = [
        ["/account.html?tab=account", "bxs-user-account", "Tài khoản của tôi"],
        ["/profile.html", "bxs-user-detail", "Hồ sơ của tôi"],
        ["/account.html?tab=settings", "bxs-cog", "Cài đặt tài khoản"],
        ["/account.html?tab=follow", "bxs-bookmark-star", "Theo dõi"],
        ["/account.html?tab=badges", "bxs-award", "Danh hiệu"]
    ];

    function badgeClass(b) {
        return b.id === "dev" ? "b-dev" : b.id === "admin" ? "b-admin" : "b-lv" + b.level;
    }

    function renderGuest() {
        userBox.classList.remove("is-open");
        userBox.innerHTML =
            '<a class="su-ic" href="/login.html" aria-label="Đăng nhập / Đăng ký" title="Đăng nhập / Đăng ký">' +
            '<i class="bx bxs-user"></i></a>';
    }

    function renderUser(user) {
        const links = ITEMS.map(function (item) {
            return '<li><a href="' + item[0] + '"><i class="bx ' + item[1] + '"></i> ' + item[2] + "</a></li>";
        }).join("");

        userBox.classList.remove("is-open");
        userBox.innerHTML =
            '<button class="su-ic su-avatar" type="button" aria-haspopup="menu" aria-expanded="false"></button>' +
            '<div class="su-menu" role="menu">' +
                '<div class="su-menu-head">' +
                    '<img class="su-menu-avatar" alt="">' +
                    '<div class="su-menu-info">' +
                        '<div class="su-menu-row"><strong></strong><span class="a-chip" hidden></span></div>' +
                        "<small>Sinh viên NTU</small>" +
                    "</div>" +
                "</div>" +
                '<ul class="su-menu-list">' + links +
                    '<li class="su-sep"></li>' +
                    '<li><a href="#" class="su-logout"><i class="bx bxs-log-out"></i> Đăng xuất</a></li>' +
                "</ul>" +
            "</div>";

        const button = userBox.querySelector(".su-avatar");
        const avatarUrl = user.avatar
            ? API + user.avatar
            : "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.name) + "&background=155eef&color=fff&size=128";

        // Dữ liệu người dùng luôn đặt bằng textContent để không chèn được mã HTML
        if (user.avatar) {
            const img = document.createElement("img");
            img.src = avatarUrl;
            img.alt = "";
            button.appendChild(img);
        } else {
            button.textContent = user.name.trim().charAt(0).toUpperCase();
        }
        button.title = "Tài khoản: " + user.name;
        userBox.querySelector(".su-menu-avatar").src = avatarUrl;
        userBox.querySelector(".su-menu-row strong").textContent = user.name;

        const chip = userBox.querySelector(".a-chip");
        if (user.badge) {
            chip.textContent = user.badge.name;
            chip.className = "a-chip " + badgeClass(user.badge);
            chip.hidden = false;
        }

        button.addEventListener("click", function (e) {
            e.stopPropagation();
            const open = userBox.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(open));
        });

        userBox.querySelector(".su-logout").addEventListener("click", async function (e) {
            e.preventDefault();
            try {
                await fetch(API + "/api/logout", { method: "POST", credentials: "include" });
            } catch (error) {}
            try {
                localStorage.removeItem("demo_session");
            } catch (error) {}
            location.reload();
        });
    }

    document.addEventListener("click", function (e) {
        if (!userBox.contains(e.target)) userBox.classList.remove("is-open");
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") userBox.classList.remove("is-open");
    });

    async function load() {
        try {
            const response = await fetch(API + "/api/me", { credentials: "include" });
            const data = await response.json();
            if (data.user) renderUser(data.user); else renderGuest();
        } catch (error) {
            renderGuest();
        }
    }

    window.addEventListener("su:refresh", load);     // các trang khác gọi khi vừa đổi ảnh hoặc danh hiệu
    load();
})();