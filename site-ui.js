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
themeBtn.className = "theme-switch"; // Dùng class mới đồng bộ với CSS

// Bơm trực tiếp 2 icon SVG chuẩn và cục tròn trượt (thay cho icon bx)
themeBtn.innerHTML = `
    <svg class="track-icon moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clip-rule="evenodd" /></svg>
    <svg class="track-icon sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" /></svg>
    <span class="switch-thumb"></span>
`;

holder.appendChild(themeBtn);
    function applyTheme(theme) {
        root.dataset.theme = theme;
        themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
        // CẦN XÓA HOẶC COMMENT DÒNG DƯỚI ĐÂY:
        // themeBtn.setAttribute("aria-label", theme === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
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
            console.log("[site-ui] /api/me ->", response.status, data);
            if (data.user) renderUser(data.user); else renderGuest();
        } catch (error) {
            console.error("[site-ui] lỗi:", error);
            renderGuest();
        }
    }
    
    window.addEventListener("su:refresh", load);     // các trang khác gọi khi vừa đổi ảnh hoặc danh hiệu
    load();
})();