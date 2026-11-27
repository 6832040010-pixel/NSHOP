const STORAGE_KEY = "nshop_products_v1";
const BOOKMARK_KEY = "nshop_bookmarks_v1";
const ADMIN_SESSION_KEY = "nshop_admin_logged_in";
const THEME_KEY = "nshop_theme_v1";

// Admin credentials requested by user
const ADMIN_USER = "Prct";
const ADMIN_PASS = "Prct2522";

let products = [];
let bookmarks = [];
let activeNavFilter = "ทั้งหมด";
let activeTag = "ทั้งหมด";
let activeGroupTab = "ทั้งหมด";
let searchQuery = "";
let heroIndex = 0;
let heroTimer = null;

// DOM Elements
const productGrid = document.getElementById("productGrid");
const latestGrid = document.getElementById("latestGrid");
const rankingList = document.getElementById("rankingList");
const emptyState = document.getElementById("emptyState");
const itemTotalBadge = document.getElementById("itemTotalBadge");
const mainGridTitle = document.getElementById("mainGridTitle");
const bookmarkCountEl = document.getElementById("bookmarkCount");

const heroBg = document.getElementById("heroBg");
const heroContent = document.getElementById("heroContent");
const heroDots = document.getElementById("heroDots");

const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const searchInput = document.getElementById("searchInput");

const productModalBackdrop = document.getElementById("productModalBackdrop");
const productModalBody = document.getElementById("productModalBody");

const adminModalBackdrop = document.getElementById("adminModalBackdrop");
const adminLoginView = document.getElementById("adminLoginView");
const adminDashboardView = document.getElementById("adminDashboardView");
const adminLoginForm = document.getElementById("adminLoginForm");
const loginError = document.getElementById("loginError");
const addProductForm = document.getElementById("addProductForm");
const adminInventoryList = document.getElementById("adminInventoryList");
const adminItemCount = document.getElementById("adminItemCount");

// Initialization
function init() {
  loadState();
  initTheme();
  bindEvents();
  renderAll();
  startHeroAutoplay();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    try {
      products = JSON.parse(saved);
    } catch {
      products = [...DEFAULT_PRODUCTS];
    }
  } else {
    products = [...DEFAULT_PRODUCTS];
    saveProducts();
  }

  try {
    bookmarks = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
  } catch {
    bookmarks = [];
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function saveBookmarks() {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
  bookmarkCountEl.textContent = bookmarks.length;
}

// Theme
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.checked = theme === "light";
  themeLabel.textContent = theme === "light" ? "LIGHT" : "DARK";
  localStorage.setItem(THEME_KEY, theme);
}

// Filtering
function getFilteredProducts() {
  return products.filter((item) => {
    if (activeNavFilter === "__BOOKMARK__" && !bookmarks.includes(item.id)) {
      return false;
    }
    if (
      activeNavFilter !== "ทั้งหมด" &&
      activeNavFilter !== "__BOOKMARK__" &&
      item.group !== activeNavFilter &&
      item.category !== activeNavFilter
    ) {
      return false;
    }
    if (activeTag !== "ทั้งหมด" && item.category !== activeTag) {
      return false;
    }
    if (activeGroupTab !== "ทั้งหมด" && item.group !== activeGroupTab && item.category !== activeGroupTab) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();
      const hay = `${item.title} ${item.category} ${item.badge} ${item.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// Render All Sections
function renderAll() {
  bookmarkCountEl.textContent = bookmarks.length;
  renderHero();
  renderMainGrid();
  renderLatest();
  renderRanking();
  if (isAdminLoggedIn()) {
    renderAdminInventory();
  }
}

function renderHero() {
  const heroItems = products.slice(0, 4);
  if (heroItems.length === 0) {
    heroBg.style.backgroundImage = "none";
    heroContent.innerHTML = `
      <h1 class="hero-title">ยังไม่มีสินค้าในระบบ NSHOP</h1>
      <p class="hero-desc">คลิกที่ปุ่ม ⚙ Admin ด้านบน เพื่อเพิ่มสิ่งอำนวยความสะดวกในร้านค้าได้เลย</p>
      <button class="hero-cta" onclick="openAdminModal()">เปิดหน้า Admin &gt;</button>
    `;
    heroDots.innerHTML = "";
    return;
  }

  if (heroIndex >= heroItems.length) heroIndex = 0;
  const item = heroItems[heroIndex];

  heroBg.style.backgroundImage = `url('${item.image}')`;
  heroContent.innerHTML = `
    <h1 class="hero-title">${escapeHtml(item.title)}</h1>
    <div class="hero-meta">
      <span class="hero-score">${item.rating.toFixed(1)}</span>
      <span>ประเภท: <strong>${escapeHtml(item.category)}</strong></span>
      <span>• ราคา: <strong>฿${Number(item.price).toLocaleString()}</strong></span>
      <span>• คงเหลือ: <strong>${item.stock} ชิ้น</strong></span>
    </div>
    <p class="hero-desc">${escapeHtml(item.description || "อุปกรณ์และสิ่งอำนวยความสะดวกคุณภาพสำหรับร้านค้ายุคใหม่")}</p>
    <button class="hero-cta" onclick="openProductModal('${item.id}')">
      ดูรายละเอียดสินค้า (สต็อก ${item.stock} ชิ้น) &gt;
    </button>
  `;

  heroDots.innerHTML = heroItems
    .map(
      (_, idx) =>
        `<span class="hero-dot ${idx === heroIndex ? "active" : ""}" data-hero-dot="${idx}"></span>`
    )
    .join("");
}

function renderMainGrid() {
  const list = getFilteredProducts();
  itemTotalBadge.textContent = `${list.length} รายการ`;
  mainGridTitle.textContent =
    activeNavFilter === "__BOOKMARK__" ? "รายการโปรด (Bookmark)" : "สินค้ายอดนิยม";

  if (list.length === 0) {
    productGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  productGrid.innerHTML = list
    .map(
      (item) => `
      <article class="product-card" onclick="openProductModal('${item.id}')">
        <div class="card-thumb-wrap">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />
          <span class="card-badge-top">${escapeHtml(item.badge || "ITEM")}</span>
          <span class="card-badge-bottom">${escapeHtml(item.highlight || "★ แนะนำ")}</span>
        </div>
        <h4 class="card-title">${escapeHtml(item.title)}</h4>
        <div class="card-sub">฿${Number(item.price).toLocaleString()} • คงเหลือ ${item.stock}</div>
        <div class="card-rating">★★★★★ ${Number(item.rating || 4.8).toFixed(1)}</div>
      </article>
    `
    )
    .join("");
}

function renderLatest() {
  const latest = products.slice(0, 4);
  if (latest.length === 0) {
    latestGrid.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">ยังไม่มีรายการอัปเดต</p>`;
    return;
  }
  latestGrid.innerHTML = latest
    .map(
      (item) => `
      <div class="latest-card" onclick="openProductModal('${item.id}')">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
        <div class="latest-info">
          <h4>${escapeHtml(item.title)}</h4>
          <div class="latest-meta">ราคา ฿${Number(item.price).toLocaleString()}</div>
          <div class="latest-meta">สต็อก ${item.stock} ชิ้น • ${escapeHtml(item.updatedText || "เพิ่งเพิ่ม")}</div>
        </div>
      </div>
    `
    )
    .join("");
}

function renderRanking() {
  const ranked = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  if (ranked.length === 0) {
    rankingList.innerHTML = `<p style="color:var(--text-muted);font-size:13px;">ยังไม่มีสินค้าแนะนำ</p>`;
    return;
  }

  rankingList.innerHTML = ranked
    .map(
      (item, idx) => `
      <div class="ranking-item" onclick="openProductModal('${item.id}')">
        <span class="rank-num ${idx > 2 ? "muted" : ""}">${idx + 1}</span>
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
        <div class="rank-info">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.category)} • ฿${Number(item.price).toLocaleString()} • ★ ${Number(item.rating || 4.8).toFixed(1)}</p>
        </div>
      </div>
    `
    )
    .join("");
}

// Product Detail Modal
window.openProductModal = function (id) {
  const item = products.find((p) => p.id === id);
  if (!item) return;

  const isBookmarked = bookmarks.includes(id);
  productModalBody.innerHTML = `
    <img class="detail-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
    <div class="detail-info">
      <h2>${escapeHtml(item.title)}</h2>
      <div class="detail-tags">
        <span class="detail-tag">${escapeHtml(item.category)}</span>
        <span class="detail-tag">${escapeHtml(item.badge || "ITEM")}</span>
        <span class="detail-tag">คงเหลือ ${item.stock} ชิ้น</span>
      </div>
      <div class="detail-price">฿${Number(item.price).toLocaleString()}</div>
      <p class="detail-desc">${escapeHtml(item.description || "อุปกรณ์สิ่งอำนวยความสะดวกในร้านค้า คุณภาพมาตรฐาน")}</p>
      <div class="detail-actions">
        <button class="btn-primary" onclick="toggleBookmark('${item.id}')">
          ${isBookmarked ? "★ ลบออกจากรายการโปรด" : "☆ บันทึกรายการโปรด"}
        </button>
        <button class="btn-outline" onclick="showToast('ส่งคำสั่งซื้อ / ขอใบเสนอราคาเรียบร้อยแล้ว')">
          สั่งซื้อ / ขอใบเสนอราคา
        </button>
      </div>
    </div>
  `;
  productModalBackdrop.classList.remove("hidden");
};

window.toggleBookmark = function (id) {
  if (bookmarks.includes(id)) {
    bookmarks = bookmarks.filter((b) => b !== id);
    showToast("นำออกจากรายการโปรดแล้ว");
  } else {
    bookmarks.push(id);
    showToast("บันทึกลงรายการโปรดแล้ว");
  }
  saveBookmarks();
  renderMainGrid();
  openProductModal(id);
};

// Admin Logic
function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

window.openAdminModal = function () {
  loginError.classList.add("hidden");
  if (isAdminLoggedIn()) {
    adminLoginView.classList.add("hidden");
    adminDashboardView.classList.remove("hidden");
    renderAdminInventory();
  } else {
    adminLoginView.classList.remove("hidden");
    adminDashboardView.classList.add("hidden");
    document.getElementById("adminUsername").value = "";
    document.getElementById("adminPassword").value = "";
  }
  adminModalBackdrop.classList.remove("hidden");
};

function renderAdminInventory() {
  adminItemCount.textContent = products.length;
  if (products.length === 0) {
    adminInventoryList.innerHTML = `<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:24px 0;">ไม่มีสินค้าในระบบ (ถูกเคลียร์แล้ว)</p>`;
    return;
  }

  adminInventoryList.innerHTML = products
    .map(
      (item) => `
      <div class="admin-inv-row">
        <div class="admin-inv-left">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
          <div class="admin-inv-meta">
            <h4>${escapeHtml(item.title)}</h4>
            <span>${escapeHtml(item.category)} • ฿${Number(item.price).toLocaleString()} • สต็อก ${item.stock}</span>
          </div>
        </div>
        <div class="admin-inv-btns">
          <button type="button" class="mini-btn edit" onclick="startEditProduct('${item.id}')">แก้ไข</button>
          <button type="button" class="mini-btn del" onclick="deleteProduct('${item.id}')">ลบ</button>
        </div>
      </div>
    `
    )
    .join("");
}

window.deleteProduct = function (id) {
  products = products.filter((p) => p.id !== id);
  bookmarks = bookmarks.filter((b) => b !== id);
  saveProducts();
  saveBookmarks();
  renderAll();
  showToast("ลบสินค้าเรียบร้อยแล้ว");
};

window.startEditProduct = function (id) {
  const item = products.find((p) => p.id === id);
  if (!item) return;

  document.getElementById("editProductId").value = item.id;
  document.getElementById("prodTitle").value = item.title;
  document.getElementById("prodCategory").value = item.category;
  document.getElementById("prodPrice").value = item.price;
  document.getElementById("prodStock").value = item.stock;
  document.getElementById("prodBadge").value = item.badge || "";
  document.getElementById("prodDesc").value = item.description || "";
  document.getElementById("prodImageUrl").value = item.image.startsWith("http") ? item.image : "";

  document.getElementById("formPanelTitle").textContent = "✎ แก้ไขข้อมูลสินค้า";
  document.getElementById("saveProductBtn").textContent = "บันทึกการแก้ไข";
  document.getElementById("cancelEditBtn").classList.remove("hidden");
};

function resetProductForm() {
  addProductForm.reset();
  document.getElementById("editProductId").value = "";
  document.getElementById("prodBadge").value = "NEW";
  document.getElementById("formPanelTitle").textContent = "+ เพิ่มสินค้าใหม่";
  document.getElementById("saveProductBtn").textContent = "บันทึกเพิ่มสินค้า";
  document.getElementById("cancelEditBtn").classList.add("hidden");
}

function mapCategoryToGroup(cat) {
  if (cat === "ระบบ POS" || cat === "สแกนเนอร์") return "ระบบ POS";
  if (cat === "ชั้นวางสินค้า" || cat === "ตู้แช่ & ความเย็น") return "ชั้นวาง & ตู้แช่";
  return "อุปกรณ์หน้าร้าน";
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Event Listeners
function bindEvents() {
  // Theme toggle
  themeToggle.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "light" : "dark");
  });

  // Top nav links
  document.querySelectorAll("#navLinks .nav-link[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#navLinks .nav-link").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeNavFilter = btn.dataset.filter;
      renderMainGrid();
    });
  });

  // Tag pills
  document.querySelectorAll("#tagBar .tag-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#tagBar .tag-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeTag = btn.dataset.tag;
      renderMainGrid();
    });
  });

  // Panel tabs
  document.querySelectorAll("#panelTabs .panel-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#panelTabs .panel-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeGroupTab = btn.dataset.group;
      renderMainGrid();
    });
  });

  // Search
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderMainGrid();
  });

  // Reset filters
  const resetAllFilters = () => {
    activeNavFilter = "ทั้งหมด";
    activeTag = "ทั้งหมด";
    activeGroupTab = "ทั้งหมด";
    searchQuery = "";
    searchInput.value = "";
    document.querySelectorAll("#navLinks .nav-link").forEach((b) => b.classList.remove("active"));
    document.querySelector('#navLinks .nav-link[data-filter="ทั้งหมด"]').classList.add("active");
    document.querySelectorAll("#tagBar .tag-pill").forEach((b) => b.classList.remove("active"));
    document.querySelector('#tagBar .tag-pill[data-tag="ทั้งหมด"]').classList.add("active");
    document.querySelectorAll("#panelTabs .panel-tab").forEach((b) => b.classList.remove("active"));
    document.querySelector('#panelTabs .panel-tab[data-group="ทั้งหมด"]').classList.add("active");
    renderMainGrid();
  };

  document.getElementById("resetFiltersBtn").addEventListener("click", resetAllFilters);
  document.getElementById("emptyResetBtn").addEventListener("click", resetAllFilters);
  document.getElementById("brandHomeBtn").addEventListener("click", (e) => {
    e.preventDefault();
    resetAllFilters();
  });
  document.getElementById("seeAllLatestBtn").addEventListener("click", resetAllFilters);
  document.getElementById("seeAllRankBtn").addEventListener("click", resetAllFilters);

  // Hero carousel controls
  document.getElementById("heroPrev").addEventListener("click", () => {
    const count = Math.min(products.length, 4);
    if (count === 0) return;
    heroIndex = (heroIndex - 1 + count) % count;
    renderHero();
  });

  document.getElementById("heroNext").addEventListener("click", () => {
    const count = Math.min(products.length, 4);
    if (count === 0) return;
    heroIndex = (heroIndex + 1) % count;
    renderHero();
  });

  heroDots.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-hero-dot]");
    if (!dot) return;
    heroIndex = Number(dot.dataset.heroDot);
    renderHero();
  });

  // Modal close buttons
  document.getElementById("closeProductModal").addEventListener("click", () => {
    productModalBackdrop.classList.add("hidden");
  });
  productModalBackdrop.addEventListener("click", (e) => {
    if (e.target === productModalBackdrop) productModalBackdrop.classList.add("hidden");
  });

  document.getElementById("openAdminBtn").addEventListener("click", openAdminModal);
  document.getElementById("closeAdminModal").addEventListener("click", () => {
    adminModalBackdrop.classList.add("hidden");
  });
  adminModalBackdrop.addEventListener("click", (e) => {
    if (e.target === adminModalBackdrop) adminModalBackdrop.classList.add("hidden");
  });

  // Admin Login Form
  adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userVal = document.getElementById("adminUsername").value.trim();
    const passVal = document.getElementById("adminPassword").value;

    if (userVal === ADMIN_USER && passVal === ADMIN_PASS) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      loginError.classList.add("hidden");
      adminLoginView.classList.add("hidden");
      adminDashboardView.classList.remove("hidden");
      renderAdminInventory();
      showToast("เข้าสู่ระบบ Admin สำเร็จ");
    } else {
      loginError.classList.remove("hidden");
    }
  });

  // Admin Logout
  document.getElementById("adminLogoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    adminDashboardView.classList.add("hidden");
    adminLoginView.classList.remove("hidden");
    document.getElementById("adminUsername").value = "";
    document.getElementById("adminPassword").value = "";
    showToast("ออกจากระบบ Admin แล้ว");
  });

  // Add / Edit Product Submit
  addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const editId = document.getElementById("editProductId").value;
    const title = document.getElementById("prodTitle").value.trim();
    const category = document.getElementById("prodCategory").value;
    const price = Number(document.getElementById("prodPrice").value) || 0;
    const stock = Number(document.getElementById("prodStock").value) || 0;
    const badge = document.getElementById("prodBadge").value.trim() || "NEW";
    const description = document.getElementById("prodDesc").value.trim();
    const presetImg = document.getElementById("prodPresetImg").value;
    const customUrl = document.getElementById("prodImageUrl").value.trim();
    const fileInput = document.getElementById("prodImageFile");

    let finalImage = presetImg;
    if (fileInput.files && fileInput.files[0]) {
      finalImage = await readFileAsDataURL(fileInput.files[0]);
    } else if (customUrl) {
      finalImage = customUrl;
    }

    if (editId) {
      const idx = products.findIndex((p) => p.id === editId);
      if (idx !== -1) {
        products[idx] = {
          ...products[idx],
          title,
          category,
          group: mapCategoryToGroup(category),
          price,
          stock,
          badge,
          description,
          image: finalImage,
          updatedText: "อัปเดตเมื่อสักครู่"
        };
      }
      showToast("อัปเดตข้อมูลสินค้าเรียบร้อย");
    } else {
      const newItem = {
        id: "item-" + Date.now(),
        title,
        category,
        group: mapCategoryToGroup(category),
        badge,
        highlight: "★ สินค้าใหม่",
        price,
        stock,
        rating: 4.9,
        updatedText: "เพิ่งเพิ่ม",
        image: finalImage,
        description: description || "อุปกรณ์สิ่งอำนวยความสะดวกในร้านค้า พร้อมจัดส่ง"
      };
      products.unshift(newItem);
      showToast("เพิ่มสินค้าใหม่เรียบร้อยแล้ว");
    }

    saveProducts();
    resetProductForm();
    renderAll();
  });

  document.getElementById("cancelEditBtn").addEventListener("click", resetProductForm);

  // Clear All Items
  document.getElementById("clearAllItemsBtn").addEventListener("click", () => {
    products = [];
    bookmarks = [];
    saveProducts();
    saveBookmarks();
    renderAll();
    showToast("เคลียร์สินค้าทั้งหมดเรียบร้อยแล้ว");
  });

  // Restore Default Items
  document.getElementById("restoreDefaultBtn").addEventListener("click", () => {
    products = [...DEFAULT_PRODUCTS];
    saveProducts();
    renderAll();
    showToast("คืนค่าสินค้าเริ่มต้นเรียบร้อยแล้ว");
  });
}

function startHeroAutoplay() {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    const count = Math.min(products.length, 4);
    if (count > 1) {
      heroIndex = (heroIndex + 1) % count;
      renderHero();
    }
  }, 6000);
}

// Utilities
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

let toastTimer = null;
window.showToast = function (msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2600);
};

document.addEventListener("DOMContentLoaded", init);
