// Application State Management
class SalesApp {
  constructor() {
    this.currentUser = null;
    this.currentView = "dashboard";
    this.html5QrCode = null;
    this.scannedProduct = null;
    this.init();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.initializeData();
        this.setupEventListeners();
        this.checkAuthentication();
      });
    } else {
      this.initializeData();
      this.setupEventListeners();
      this.checkAuthentication();
    }
  }

  // Initialize default data if not exists
  initializeData() {
    if (!localStorage.getItem("users")) {
      const defaultUsers = [
        {
          id: 1,
          username: "admin",
          password: "admin123",
          role: "admin",
          name: "مدير النظام",
        },
      ];
      localStorage.setItem("users", JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem("products")) {
      const sampleProducts = [
        {
          id: 1,
          name: "منتج تجريبي 1",
          barcode: "1234567890123",
          wholesalePrice: 10,
          retailPrice: 15,
          stock: 100,
        },
        {
          id: 2,
          name: "منتج تجريبي 2",
          barcode: "9876543210987",
          wholesalePrice: 20,
          retailPrice: 30,
          stock: 50,
        },
      ];
      localStorage.setItem("products", JSON.stringify(sampleProducts));
    }

    // Initialize other data structures if they don't exist
    if (!localStorage.getItem("inventory")) {
      localStorage.setItem("inventory", JSON.stringify([]));
    }
    if (!localStorage.getItem("sales")) {
      localStorage.setItem("sales", JSON.stringify([]));
    }
    if (!localStorage.getItem("customers")) {
      localStorage.setItem("customers", JSON.stringify([]));
    }
    if (!localStorage.getItem("messages")) {
      localStorage.setItem("messages", JSON.stringify([]));
    }
    if (!localStorage.getItem("activityLog")) {
      localStorage.setItem("activityLog", JSON.stringify([]));
    }
  }

  // Setup all event listeners
  setupEventListeners() {
    // Login/Register forms
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    // Switch between login/register
    const showRegisterLink = document.getElementById("showRegister");
    const showLoginLink = document.getElementById("showLogin");

    if (showRegisterLink) {
      showRegisterLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.showPage("registerPage");
      });
    }

    if (showLoginLink) {
      showLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.showPage("loginPage");
      });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout());
    }

    // Modal controls
    this.setupModalControls();

    // Action buttons
    this.setupActionButtons();
  }

  setupModalControls() {
    // Product Modal
    const addProductBtn = document.getElementById("addProductBtn");
    if (addProductBtn) {
      addProductBtn.addEventListener("click", () => this.openProductModal());
    }

    const closeProductModal = document.getElementById("closeProductModal");
    if (closeProductModal) {
      closeProductModal.addEventListener("click", () =>
        this.closeModal("productModal")
      );
    }

    const cancelProductModal = document.getElementById("cancelProductModal");
    if (cancelProductModal) {
      cancelProductModal.addEventListener("click", () =>
        this.closeModal("productModal")
      );
    }

    const productForm = document.getElementById("productForm");
    if (productForm) {
      productForm.addEventListener("submit", (e) => this.handleProductForm(e));
    }

    // Scanner Modal
    const scanBarcodeBtn = document.getElementById("scanBarcodeBtn");
    if (scanBarcodeBtn) {
      scanBarcodeBtn.addEventListener("click", () => this.openScannerModal());
    }

    const closeScannerModal = document.getElementById("closeScannerModal");
    if (closeScannerModal) {
      closeScannerModal.addEventListener("click", () =>
        this.closeScannerModal()
      );
    }

    const addScannedProduct = document.getElementById("addScannedProduct");
    if (addScannedProduct) {
      addScannedProduct.addEventListener("click", () =>
        this.addScannedProductToInventory()
      );
    }

    const cancelScan = document.getElementById("cancelScan");
    if (cancelScan) {
      cancelScan.addEventListener("click", () => this.closeScannerModal());
    }

    // Sale Modal
    const addSaleBtn = document.getElementById("addSaleBtn");
    if (addSaleBtn) {
      addSaleBtn.addEventListener("click", () => this.openSaleModal());
    }

    const closeSaleModal = document.getElementById("closeSaleModal");
    if (closeSaleModal) {
      closeSaleModal.addEventListener("click", () =>
        this.closeModal("saleModal")
      );
    }

    const cancelSaleModal = document.getElementById("cancelSaleModal");
    if (cancelSaleModal) {
      cancelSaleModal.addEventListener("click", () =>
        this.closeModal("saleModal")
      );
    }

    const saleForm = document.getElementById("saleForm");
    if (saleForm) {
      saleForm.addEventListener("submit", (e) => this.handleSaleForm(e));
    }

    // Customer Modal
    const addCustomerBtn = document.getElementById("addCustomerBtn");
    if (addCustomerBtn) {
      addCustomerBtn.addEventListener("click", () => this.openCustomerModal());
    }

    const closeCustomerModal = document.getElementById("closeCustomerModal");
    if (closeCustomerModal) {
      closeCustomerModal.addEventListener("click", () =>
        this.closeModal("customerModal")
      );
    }

    const cancelCustomerModal = document.getElementById("cancelCustomerModal");
    if (cancelCustomerModal) {
      cancelCustomerModal.addEventListener("click", () =>
        this.closeModal("customerModal")
      );
    }

    const customerForm = document.getElementById("customerForm");
    if (customerForm) {
      customerForm.addEventListener("submit", (e) =>
        this.handleCustomerForm(e)
      );
    }

    // Toast close
    const closeToast = document.getElementById("closeToast");
    if (closeToast) {
      closeToast.addEventListener("click", () => this.hideToast());
    }
  }

  setupActionButtons() {
    // Chat
    const sendMessageBtn = document.getElementById("sendMessageBtn");
    if (sendMessageBtn) {
      sendMessageBtn.addEventListener("click", () => this.sendMessage());
    }

    const chatMessageInput = document.getElementById("chatMessageInput");
    if (chatMessageInput) {
      chatMessageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage();
        }
      });
    }
  }

  // Authentication Methods
  checkAuthentication() {
    const user = localStorage.getItem("currentUser");
    if (user) {
      try {
        this.currentUser = JSON.parse(user);
        this.showMainApp();
      } catch (e) {
        localStorage.removeItem("currentUser");
        this.showPage("loginPage");
      }
    } else {
      this.showPage("loginPage");
    }
  }

  handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username || !password) {
      this.showToast("يرجى إدخال اسم المستخدم وكلمة المرور", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      this.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      this.logActivity("تسجيل دخول", `قام المستخدم ${user.name} بتسجيل الدخول`);
      this.showMainApp();
      this.showToast("تم تسجيل الدخول بنجاح", "success");
    } else {
      this.showToast("اسم المستخدم أو كلمة المرور غير صحيحة", "error");
    }
  }

  handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const role = document.getElementById("registerRole").value;

    if (!name || !username || !password || !role) {
      this.showToast("يرجى إدخال جميع البيانات المطلوبة", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find((u) => u.username === username)) {
      this.showToast("اسم المستخدم موجود بالفعل", "error");
      return;
    }

    const newUser = {
      id: Date.now(),
      username,
      password,
      role,
      name,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    this.showToast("تم إنشاء الحساب بنجاح", "success");
    this.showPage("loginPage");

    // Clear form
    document.getElementById("registerForm").reset();
  }

  logout() {
    if (this.currentUser) {
      this.logActivity(
        "تسجيل خروج",
        `قام المستخدم ${this.currentUser.name} بتسجيل الخروج`
      );
    }
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    this.showPage("loginPage");
    this.showToast("تم تسجيل الخروج بنجاح", "success");
  }

  // Page Navigation
  showPage(pageId) {
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active");
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add("active");
    }
  }

  showMainApp() {
    this.showPage("mainApp");
    this.updateUserInfo();
    this.setupNavigation();
    this.showView("dashboard");
  }

  updateUserInfo() {
    const roleNames = {
      admin: "مدير",
      rep: "مندوب مبيعات",
      driver: "سائق",
    };
    const userInfoEl = document.getElementById("userInfo");
    if (userInfoEl && this.currentUser) {
      userInfoEl.textContent = `${this.currentUser.name} (${
        roleNames[this.currentUser.role]
      })`;
    }
  }

  setupNavigation() {
    const navItems = document.getElementById("navItems");
    if (!navItems) return;

    navItems.innerHTML = "";

    const navigation = {
      admin: [
        { id: "dashboard", name: "لوحة التحكم" },
        { id: "products", name: "المنتجات" },
        { id: "inventory", name: "المخزون" },
        { id: "sales", name: "المبيعات" },
        { id: "customers", name: "العملاء" },
        { id: "chat", name: "الدردشة" },
        { id: "reports", name: "التقارير" },
      ],
      rep: [
        { id: "dashboard", name: "لوحة التحكم" },
        { id: "inventory", name: "مخزوني" },
        { id: "sales", name: "مبيعاتي" },
        { id: "customers", name: "عملائي" },
        { id: "chat", name: "الدردشة" },
      ],
      driver: [
        { id: "dashboard", name: "لوحة التحكم" },
        { id: "inventory", name: "مخزوني" },
        { id: "sales", name: "مبيعاتي" },
        { id: "customers", name: "عملائي" },
        { id: "chat", name: "الدردشة" },
      ],
    };

    const userNav = navigation[this.currentUser.role] || navigation.rep;
    userNav.forEach((item) => {
      const button = document.createElement("button");
      button.className = "nav-item";
      button.textContent = item.name;
      button.addEventListener("click", () => this.showView(item.id));
      navItems.appendChild(button);
    });
  }

  showView(viewId) {
    this.currentView = viewId;

    // Update navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Find the nav item that corresponds to this view
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      if (item.textContent.includes(this.getViewTitle(viewId))) {
        item.classList.add("active");
      }
    });

    // Show view
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.remove("active");
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
      targetView.classList.add("active");
    }

    // Load view data
    this.loadViewData(viewId);
  }

  getViewTitle(viewId) {
    const titles = {
      dashboard: "لوحة التحكم",
      products: "المنتجات",
      inventory: "المخزون",
      sales: "المبيعات",
      customers: "العملاء",
      chat: "الدردشة",
      reports: "التقارير",
    };
    return titles[viewId] || viewId;
  }

  loadViewData(viewId) {
    switch (viewId) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "products":
        this.loadProducts();
        break;
      case "inventory":
        this.loadInventory();
        break;
      case "sales":
        this.loadSales();
        break;
      case "customers":
        this.loadCustomers();
        break;
      case "chat":
        this.loadChat();
        break;
      case "reports":
        this.loadReports();
        break;
    }
  }

  // Dashboard
  loadDashboard() {
    const stats = this.getDashboardStats();
    const statsContainer = document.getElementById("dashboardStats");
    const contentContainer = document.getElementById("dashboardContent");

    if (statsContainer) {
      statsContainer.innerHTML = stats
        .map(
          (stat) => `
                <div class="stat-card">
                    <div class="stat-value">${stat.value}</div>
                    <p class="stat-label">${stat.label}</p>
                </div>
            `
        )
        .join("");
    }

    // Load recent activity
    if (contentContainer) {
      contentContainer.innerHTML = `
                <div class="activity-log">
                    <h3>النشاط الأخير</h3>
                    ${this.getRecentActivity()}
                </div>
            `;
    }
  }

  getDashboardStats() {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");

    if (this.currentUser.role === "admin") {
      return [
        { label: "إجمالي المنتجات", value: products.length },
        { label: "إجمالي المبيعات", value: sales.length },
        { label: "إجمالي العملاء", value: customers.length },
        {
          label: "المستخدمين النشطين",
          value: JSON.parse(localStorage.getItem("users") || "[]").length - 1,
        },
      ];
    } else {
      const userInventory = inventory.filter(
        (item) => item.userId === this.currentUser.id
      );
      const userSales = sales.filter(
        (item) => item.userId === this.currentUser.id
      );
      const userCustomers = customers.filter(
        (item) => item.userId === this.currentUser.id
      );

      return [
        { label: "منتجاتي", value: userInventory.length },
        { label: "مبيعاتي", value: userSales.length },
        { label: "عملائي", value: userCustomers.length },
        {
          label: "المبيعات اليوم",
          value: userSales.filter(
            (sale) =>
              new Date(sale.date).toDateString() === new Date().toDateString()
          ).length,
        },
      ];
    }
  }

  getRecentActivity() {
    const activity = JSON.parse(localStorage.getItem("activityLog") || "[]");
    let recentActivity;

    if (this.currentUser.role === "admin") {
      recentActivity = activity.slice(-10).reverse();
    } else {
      recentActivity = activity
        .filter((item) => item.userId === this.currentUser.id)
        .slice(-10)
        .reverse();
    }

    if (recentActivity.length === 0) {
      return '<div class="empty-state"><p>لا توجد أنشطة حديثة</p></div>';
    }

    return recentActivity
      .map(
        (item) => `
            <div class="activity-item">
                <div class="activity-time">${new Date(
                  item.timestamp
                ).toLocaleString("ar-SA")}</div>
                <div class="activity-content">${item.action}: ${
          item.details
        }</div>
            </div>
        `
      )
      .join("");
  }

  // Products Management
  loadProducts() {
    if (this.currentUser.role !== "admin") return;

    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const container = document.getElementById("productsGrid");

    if (!container) return;

    if (products.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><h3>لا توجد منتجات</h3><p>ابدأ بإضافة منتج جديد</p></div>';
      return;
    }

    container.innerHTML = products
      .map(
        (product) => `
            <div class="product-card">
                <div class="product-header">
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-actions">
                        <button class="btn btn--sm btn--outline" onclick="app.editProduct(${product.id})">تعديل</button>
                        <button class="btn btn--sm btn--danger" onclick="app.deleteProduct(${product.id})">حذف</button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-detail">
                        <span class="product-detail-label">الباركود:</span>
                        <span class="product-detail-value">${product.barcode}</span>
                    </div>
                    <div class="product-detail">
                        <span class="product-detail-label">سعر الجملة:</span>
                        <span class="product-detail-value">${product.wholesalePrice} د.أ </span>
                    </div>
                    <div class="product-detail">
                        <span class="product-detail-label">سعر المفرق:</span>
                        <span class="product-detail-value">${product.retailPrice} د.أ </span>
                    </div>
                    <div class="product-detail">
                        <span class="product-detail-label">المخزون:</span>
                        <span class="product-detail-value">${product.stock}</span>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  openProductModal(productId = null) {
    const modal = document.getElementById("productModal");
    const title = document.getElementById("productModalTitle");
    const form = document.getElementById("productForm");

    if (!modal || !title || !form) return;

    if (productId) {
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const product = products.find((p) => p.id === productId);

      if (product) {
        title.textContent = "تعديل المنتج";
        document.getElementById("productName").value = product.name;
        document.getElementById("productBarcode").value = product.barcode;
        document.getElementById("productWholesalePrice").value =
          product.wholesalePrice;
        document.getElementById("productRetailPrice").value =
          product.retailPrice;
        document.getElementById("productStock").value = product.stock;
        form.dataset.productId = productId;
      }
    } else {
      title.textContent = "إضافة منتج";
      form.reset();
      delete form.dataset.productId;
    }

    modal.classList.remove("hidden");
  }

  handleProductForm(e) {
    e.preventDefault();

    const name = document.getElementById("productName").value.trim();
    const barcode = document.getElementById("productBarcode").value.trim();
    const wholesalePrice = parseFloat(
      document.getElementById("productWholesalePrice").value
    );
    const retailPrice = parseFloat(
      document.getElementById("productRetailPrice").value
    );
    const stock = parseInt(document.getElementById("productStock").value);

    if (
      !name ||
      !barcode ||
      isNaN(wholesalePrice) ||
      isNaN(retailPrice) ||
      isNaN(stock)
    ) {
      this.showToast("يرجى إدخال جميع البيانات بشكل صحيح", "error");
      return;
    }

    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const form = document.getElementById("productForm");
    const productId = form.dataset.productId;

    if (productId) {
      // Edit existing product
      const index = products.findIndex((p) => p.id === parseInt(productId));
      if (index !== -1) {
        products[index] = {
          ...products[index],
          name,
          barcode,
          wholesalePrice,
          retailPrice,
          stock,
        };
        this.logActivity("تعديل منتج", `تم تعديل المنتج: ${name}`);
      }
    } else {
      // Check if barcode already exists
      if (products.find((p) => p.barcode === barcode)) {
        this.showToast("الباركود موجود بالفعل", "error");
        return;
      }

      // Add new product
      const newProduct = {
        id: Date.now(),
        name,
        barcode,
        wholesalePrice,
        retailPrice,
        stock,
      };
      products.push(newProduct);
      this.logActivity("إضافة منتج", `تم إضافة المنتج: ${name}`);
    }

    localStorage.setItem("products", JSON.stringify(products));
    this.closeModal("productModal");
    this.loadProducts();
    this.showToast("تم حفظ المنتج بنجاح", "success");
  }

  editProduct(productId) {
    this.openProductModal(productId);
  }

  deleteProduct(productId) {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const product = products.find((p) => p.id === productId);
      const filteredProducts = products.filter((p) => p.id !== productId);

      localStorage.setItem("products", JSON.stringify(filteredProducts));

      if (product) {
        this.logActivity("حذف منتج", `تم حذف المنتج: ${product.name}`);
      }

      this.loadProducts();
      this.showToast("تم حذف المنتج بنجاح", "success");
    }
  }

  // Inventory Management
  loadInventory() {
    const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const container = document.getElementById("inventoryList");

    if (!container) return;

    let userInventory;
    if (this.currentUser.role === "admin") {
      userInventory = inventory;
    } else {
      userInventory = inventory.filter(
        (item) => item.userId === this.currentUser.id
      );
    }

    if (userInventory.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><h3>لا توجد منتجات في المخزون</h3><p>ابدأ بإضافة منتجات عبر مسح الباركود</p></div>';
      return;
    }

    container.innerHTML = userInventory
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const user =
          this.currentUser.role === "admin"
            ? JSON.parse(localStorage.getItem("users") || "[]").find(
                (u) => u.id === item.userId
              )
            : this.currentUser;

        return `
                <div class="inventory-item">
                    <div class="inventory-product">
                        <div class="inventory-product-name">${
                          product?.name || "منتج غير موجود"
                        }</div>
                        <div class="inventory-product-details">
                            الباركود: ${product?.barcode || "غير محدد"}
                            ${
                              this.currentUser.role === "admin"
                                ? `<br>المستخدم: ${user?.name || "غير محدد"}`
                                : ""
                            }
                        </div>
                    </div>
                    <div class="inventory-quantity">
                        <div class="quantity-value">${item.quantity}</div>
                        <div class="quantity-label">قطعة</div>
                    </div>
                    <div class="inventory-actions">
                        <button class="btn btn--sm btn--danger" onclick="app.removeFromInventory(${
                          item.id
                        })">
                            إزالة
                        </button>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  // Barcode Scanner
  openScannerModal() {
    const modal = document.getElementById("scannerModal");
    const resultDiv = document.getElementById("scanResult");

    if (!modal || !resultDiv) return;

    modal.classList.remove("hidden");
    resultDiv.classList.add("hidden");

    this.startBarcodeScanner();
  }

  startBarcodeScanner() {
    if (typeof Html5Qrcode === "undefined") {
      this.showToast("مكتبة مسح الباركود غير متوفرة", "error");
      return;
    }

    this.html5QrCode = new Html5Qrcode("qr-reader");

    this.html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText, decodedResult) => {
          this.handleBarcodeScanned(decodedText);
        },
        (errorMessage) => {
          // يمكنك استقبال رسالة الخطأ إذا رغبت
        }
      )
      .catch((err) => {
        this.showToast("فشل في تشغيل الكاميرا", "error");
        console.error("Camera start error:", err);
      });
  }

  handleBarcodeScanned(barcode) {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const product = products.find((p) => p.barcode === barcode);

    if (product) {
      const scanResult = document.getElementById("scanResult");
      const scannedProduct = document.getElementById("scannedProduct");

      if (scanResult && scannedProduct) {
        scanResult.classList.remove("hidden");
        scannedProduct.innerHTML = `
                    <strong>${product.name}</strong><br>
                    الباركود: ${product.barcode}<br>
                    سعر الجملة: ${product.wholesalePrice}د.أ <br>
                    سعر المفرق: ${product.retailPrice}د.أ <br>
                    المتوفر في المخزن: ${product.stock}
                `;

        this.scannedProduct = product;
        if (this.html5QrCode) {
          this.html5QrCode
            .stop()
            .catch((err) => console.log("Stop camera error:", err));
        }
      }
    } else {
      this.showToast("المنتج غير موجود في قاعدة البيانات", "error");
    }
  }

  addScannedProductToInventory() {
    if (!this.scannedProduct) return;

    const quantityInput = document.getElementById("scannedQuantity");
    if (!quantityInput) return;

    const quantity = parseInt(quantityInput.value);
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");

    // Check if product has enough stock
    if (this.scannedProduct.stock < quantity) {
      this.showToast("الكمية المطلوبة غير متوفرة في المخزن", "error");
      return;
    }

    // Add to user inventory
    const inventoryItem = {
      id: Date.now(),
      userId: this.currentUser.id,
      productId: this.scannedProduct.id,
      quantity: quantity,
      dateAdded: new Date().toISOString(),
    };

    inventory.push(inventoryItem);

    // Update product stock
    const productIndex = products.findIndex(
      (p) => p.id === this.scannedProduct.id
    );
    if (productIndex !== -1) {
      products[productIndex].stock -= quantity;
    }

    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("products", JSON.stringify(products));

    this.logActivity(
      "إضافة للمخزون",
      `تم إضافة ${quantity} من ${this.scannedProduct.name}`
    );

    this.closeScannerModal();
    this.loadInventory();
    this.showToast("تم إضافة المنتج للمخزون بنجاح", "success");
  }

  closeScannerModal() {
    if (this.html5QrCode) {
      this.html5QrCode
        .stop()
        .catch((err) => console.log("Stop camera error:", err));
      this.html5QrCode = null;
    }
    this.closeModal("scannerModal");
    this.scannedProduct = null;
  }

  removeFromInventory(inventoryId) {
    if (confirm("هل أنت متأكد من إزالة هذا المنتج من المخزون؟")) {
      const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
      const products = JSON.parse(localStorage.getItem("products") || "[]");

      const item = inventory.find((i) => i.id === inventoryId);
      if (!item) return;

      const product = products.find((p) => p.id === item.productId);

      // Return stock to main warehouse
      const productIndex = products.findIndex((p) => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock += item.quantity;
      }

      // Remove from inventory
      const filteredInventory = inventory.filter((i) => i.id !== inventoryId);

      localStorage.setItem("inventory", JSON.stringify(filteredInventory));
      localStorage.setItem("products", JSON.stringify(products));

      if (product) {
        this.logActivity(
          "إزالة من المخزون",
          `تم إزالة ${item.quantity} من ${product.name}`
        );
      }

      this.loadInventory();
      this.showToast("تم إزالة المنتج من المخزون", "success");
    }
  }

  // Sales Management
  loadSales() {
    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const container = document.getElementById("salesList");

    if (!container) return;

    let userSales;
    if (this.currentUser.role === "admin") {
      userSales = sales;
    } else {
      userSales = sales.filter((sale) => sale.userId === this.currentUser.id);
    }

    if (userSales.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><h3>لا توجد مبيعات</h3><p>ابدأ بتسجيل عملية بيع جديدة</p></div>';
      return;
    }

    container.innerHTML = userSales
      .map((sale) => {
        const product = products.find((p) => p.id === sale.productId);
        const customer = customers.find((c) => c.id === sale.customerId);
        const user =
          this.currentUser.role === "admin"
            ? JSON.parse(localStorage.getItem("users") || "[]").find(
                (u) => u.id === sale.userId
              )
            : this.currentUser;

        return `
                <div class="sale-item">
                    <div class="sale-details">
                        <div class="sale-product">${
                          product?.name || "منتج غير موجود"
                        }</div>
                        <div class="sale-customer">العميل: ${
                          customer?.name || "غير محدد"
                        }</div>
                        <div class="sale-customer">الكمية: ${
                          sale.quantity
                        }</div>
                        ${
                          this.currentUser.role === "admin"
                            ? `<div class="sale-customer">البائع: ${
                                user?.name || "غير محدد"
                              }</div>`
                            : ""
                        }
                    </div>
                    <div class="sale-amount">
                        <div class="amount-value">${sale.totalPrice}د.أ </div>
                        <div class="sale-date">${new Date(
                          sale.date
                        ).toLocaleDateString("ar-SA")}</div>
                    </div>
                    <div class="sale-actions">
                        <button class="btn btn--sm btn--danger" onclick="app.deleteSale(${
                          sale.id
                        })">
                            حذف
                        </button>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  openSaleModal() {
    const modal = document.getElementById("saleModal");
    const productSelect = document.getElementById("saleProduct");
    const customerSelect = document.getElementById("saleCustomer");

    if (!modal || !productSelect || !customerSelect) return;

    // Load user's inventory products
    const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const userInventory = inventory.filter(
      (item) => item.userId === this.currentUser.id
    );

    productSelect.innerHTML = '<option value="">اختر المنتج</option>';
    userInventory.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        productSelect.innerHTML += `<option value="${item.id}">${product.name} (متوفر: ${item.quantity})</option>`;
      }
    });

    // Load user's customers
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const userCustomers = customers.filter(
      (customer) => customer.userId === this.currentUser.id
    );

    customerSelect.innerHTML = '<option value="">اختر العميل</option>';
    userCustomers.forEach((customer) => {
      customerSelect.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
    });

    modal.classList.remove("hidden");
  }

  handleSaleForm(e) {
    e.preventDefault();

    const inventoryId = parseInt(document.getElementById("saleProduct").value);
    const quantity = parseInt(document.getElementById("saleQuantity").value);
    const priceType = document.getElementById("salePriceType").value;
    const customerId = parseInt(document.getElementById("saleCustomer").value);

    if (!inventoryId || !quantity || !priceType || !customerId) {
      this.showToast("يرجى إدخال جميع البيانات المطلوبة", "error");
      return;
    }

    const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");

    const inventoryItem = inventory.find((item) => item.id === inventoryId);
    if (!inventoryItem) {
      this.showToast("المنتج غير موجود في المخزون", "error");
      return;
    }

    const product = products.find((p) => p.id === inventoryItem.productId);
    const customer = customers.find((c) => c.id === customerId);

    if (!product || !customer) {
      this.showToast("بيانات المنتج أو العميل غير صحيحة", "error");
      return;
    }

    if (inventoryItem.quantity < quantity) {
      this.showToast("الكمية المطلوبة غير متوفرة", "error");
      return;
    }

    const unitPrice =
      priceType === "wholesale" ? product.wholesalePrice : product.retailPrice;
    const totalPrice = unitPrice * quantity;

    const sale = {
      id: Date.now(),
      userId: this.currentUser.id,
      productId: product.id,
      customerId: customerId,
      quantity: quantity,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      priceType: priceType,
      date: new Date().toISOString(),
    };

    sales.push(sale);

    // Update inventory
    const inventoryIndex = inventory.findIndex(
      (item) => item.id === inventoryId
    );
    inventory[inventoryIndex].quantity -= quantity;

    // Remove from inventory if quantity becomes 0
    if (inventory[inventoryIndex].quantity === 0) {
      inventory.splice(inventoryIndex, 1);
    }

    localStorage.setItem("sales", JSON.stringify(sales));
    localStorage.setItem("inventory", JSON.stringify(inventory));

    this.logActivity(
      "تسجيل بيع",
      `تم بيع ${quantity} من ${product.name} للعميل ${customer.name}`
    );

    this.closeModal("saleModal");
    this.loadSales();
    this.loadInventory();
    this.showToast("تم تسجيل البيع بنجاح", "success");
  }

  deleteSale(saleId) {
    if (confirm("هل أنت متأكد من حذف هذه العملية؟")) {
      const sales = JSON.parse(localStorage.getItem("sales") || "[]");
      const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");

      const sale = sales.find((s) => s.id === saleId);
      if (!sale) return;

      const filteredSales = sales.filter((s) => s.id !== saleId);

      // Return quantity to inventory
      const existingInventoryItem = inventory.find(
        (item) =>
          item.userId === sale.userId && item.productId === sale.productId
      );

      if (existingInventoryItem) {
        existingInventoryItem.quantity += sale.quantity;
      } else {
        inventory.push({
          id: Date.now(),
          userId: sale.userId,
          productId: sale.productId,
          quantity: sale.quantity,
          dateAdded: new Date().toISOString(),
        });
      }

      localStorage.setItem("sales", JSON.stringify(filteredSales));
      localStorage.setItem("inventory", JSON.stringify(inventory));

      this.logActivity(
        "حذف بيع",
        `تم حذف عملية بيع بقيمة ${sale.totalPrice}د.أ `
      );
      this.loadSales();
      this.showToast("تم حذف العملية بنجاح", "success");
    }
  }

  // Customer Management
  loadCustomers() {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const container = document.getElementById("customersList");

    if (!container) return;

    let userCustomers;
    if (this.currentUser.role === "admin") {
      userCustomers = customers;
    } else {
      userCustomers = customers.filter(
        (customer) => customer.userId === this.currentUser.id
      );
    }

    if (userCustomers.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><h3>لا توجد عملاء</h3><p>ابدأ بإضافة عميل جديد</p></div>';
      return;
    }

    container.innerHTML = userCustomers
      .map((customer) => {
        const user =
          this.currentUser.role === "admin"
            ? JSON.parse(localStorage.getItem("users") || "[]").find(
                (u) => u.id === customer.userId
              )
            : this.currentUser;

        return `
                <div class="customer-card">
                    <div class="customer-info">
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-phone">${customer.phone}</div>
                        ${
                          this.currentUser.role === "admin"
                            ? `<div class="customer-phone">المسؤول: ${
                                user?.name || "غير محدد"
                              }</div>`
                            : ""
                        }
                    </div>
                    <div class="customer-actions">
                        <button class="btn btn--sm btn--outline" onclick="app.editCustomer(${
                          customer.id
                        })">تعديل</button>
                        <button class="btn btn--sm btn--danger" onclick="app.deleteCustomer(${
                          customer.id
                        })">حذف</button>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  openCustomerModal(customerId = null) {
    const modal = document.getElementById("customerModal");
    const form = document.getElementById("customerForm");

    if (!modal || !form) return;

    if (customerId) {
      const customers = JSON.parse(localStorage.getItem("customers") || "[]");
      const customer = customers.find((c) => c.id === customerId);

      if (customer) {
        document.getElementById("customerName").value = customer.name;
        document.getElementById("customerPhone").value = customer.phone;
        form.dataset.customerId = customerId;
      }
    } else {
      form.reset();
      delete form.dataset.customerId;
    }

    modal.classList.remove("hidden");
  }

  handleCustomerForm(e) {
    e.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();

    if (!name || !phone) {
      this.showToast("يرجى إدخال جميع البيانات المطلوبة", "error");
      return;
    }

    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const form = document.getElementById("customerForm");
    const customerId = form.dataset.customerId;

    if (customerId) {
      // Edit existing customer
      const index = customers.findIndex((c) => c.id === parseInt(customerId));
      if (index !== -1) {
        customers[index] = { ...customers[index], name, phone };
        this.logActivity("تعديل عميل", `تم تعديل العميل: ${name}`);
      }
    } else {
      // Add new customer
      const newCustomer = {
        id: Date.now(),
        name,
        phone,
        userId: this.currentUser.id,
      };
      customers.push(newCustomer);
      this.logActivity("إضافة عميل", `تم إضافة العميل: ${name}`);
    }

    localStorage.setItem("customers", JSON.stringify(customers));
    this.closeModal("customerModal");
    this.loadCustomers();
    this.showToast("تم حفظ العميل بنجاح", "success");
  }

  editCustomer(customerId) {
    this.openCustomerModal(customerId);
  }

  deleteCustomer(customerId) {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      const customers = JSON.parse(localStorage.getItem("customers") || "[]");
      const customer = customers.find((c) => c.id === customerId);
      const filteredCustomers = customers.filter((c) => c.id !== customerId);

      localStorage.setItem("customers", JSON.stringify(filteredCustomers));

      if (customer) {
        this.logActivity("حذف عميل", `تم حذف العميل: ${customer.name}`);
      }

      this.loadCustomers();
      this.showToast("تم حذف العميل بنجاح", "success");
    }
  }

  // Chat System
  loadChat() {
    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    const container = document.getElementById("chatMessages");

    if (!container) return;

    let relevantMessages;
    if (this.currentUser.role === "admin") {
      relevantMessages = messages;
    } else {
      relevantMessages = messages.filter(
        (msg) =>
          msg.from === this.currentUser.id ||
          msg.to === this.currentUser.id ||
          msg.to === "admin"
      );
    }

    if (relevantMessages.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><p>لا توجد رسائل</p></div>';
      return;
    }

    container.innerHTML = relevantMessages
      .map((message) => {
        const isCurrentUser = message.from === this.currentUser.id;
        const messageClass = isCurrentUser ? "sent" : "received";

        return `
                <div class="message ${messageClass}">
                    <div class="message-content">${message.content}</div>
                    <div class="message-time">${new Date(
                      message.timestamp
                    ).toLocaleString("ar-SA")}</div>
                </div>
            `;
      })
      .join("");

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  sendMessage() {
    const input = document.getElementById("chatMessageInput");
    if (!input) return;

    const content = input.value.trim();

    if (!content) return;

    const messages = JSON.parse(localStorage.getItem("messages") || "[]");
    const newMessage = {
      id: Date.now(),
      from: this.currentUser.id,
      to: this.currentUser.role === "admin" ? "all" : "admin",
      content: content,
      timestamp: new Date().toISOString(),
    };

    messages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(messages));

    input.value = "";
    this.loadChat();
    this.logActivity(
      "إرسال رسالة",
      `تم إرسال رسالة: ${content.substring(0, 50)}...`
    );
  }

  // Reports
  loadReports() {
    if (this.currentUser.role !== "admin") return;

    const container = document.getElementById("reportsContent");
    if (!container) return;

    const sales = JSON.parse(localStorage.getItem("sales") || "[]");
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");

    // Calculate total sales
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const todaySales = sales.filter(
      (sale) => new Date(sale.date).toDateString() === new Date().toDateString()
    );
    const todayTotal = todaySales.reduce(
      (sum, sale) => sum + sale.totalPrice,
      0
    );

    // Top products
    const productSales = {};
    sales.forEach((sale) => {
      if (!productSales[sale.productId]) {
        productSales[sale.productId] = { quantity: 0, revenue: 0 };
      }
      productSales[sale.productId].quantity += sale.quantity;
      productSales[sale.productId].revenue += sale.totalPrice;
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5);

    // Sales by user
    const userSales = {};
    sales.forEach((sale) => {
      if (!userSales[sale.userId]) {
        userSales[sale.userId] = { count: 0, revenue: 0 };
      }
      userSales[sale.userId].count += 1;
      userSales[sale.userId].revenue += sale.totalPrice;
    });

    container.innerHTML = `
            <div class="report-section">
                <h3 class="report-title">إحصائيات عامة</h3>
                <div class="report-stats">
                    <div class="report-stat">
                        <div class="report-stat-value">${totalSales.toFixed(
                          2
                        )}</div>
                        <div class="report-stat-label">إجمالي المبيعات (د.أ )</div>
                    </div>
                    <div class="report-stat">
                        <div class="report-stat-value">${todayTotal.toFixed(
                          2
                        )}</div>
                        <div class="report-stat-label">مبيعات اليوم (د.أ )</div>
                    </div>
                    <div class="report-stat">
                        <div class="report-stat-value">${sales.length}</div>
                        <div class="report-stat-label">إجمالي العمليات</div>
                    </div>
                    <div class="report-stat">
                        <div class="report-stat-value">${customers.length}</div>
                        <div class="report-stat-label">إجمالي العملاء</div>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h3 class="report-title">المنتجات الأكثر مبيعاً</h3>
                <div class="products-grid">
                    ${
                      topProducts.length > 0
                        ? topProducts
                            .map(([productId, data]) => {
                              const product = products.find(
                                (p) => p.id === parseInt(productId)
                              );
                              return `
                            <div class="product-card">
                                <h4>${product?.name || "منتج غير موجود"}</h4>
                                <div class="product-info">
                                    <div class="product-detail">
                                        <span class="product-detail-label">الكمية المباعة:</span>
                                        <span class="product-detail-value">${
                                          data.quantity
                                        }</span>
                                    </div>
                                    <div class="product-detail">
                                        <span class="product-detail-label">الإيرادات:</span>
                                        <span class="product-detail-value">${data.revenue.toFixed(
                                          2
                                        )}د.أ </span>
                                    </div>
                                </div>
                            </div>
                        `;
                            })
                            .join("")
                        : "<p>لا توجد بيانات مبيعات</p>"
                    }
                </div>
            </div>

            <div class="report-section">
                <h3 class="report-title">أداء المبيعات حسب المستخدم</h3>
                <div class="report-stats">
                    ${
                      Object.entries(userSales).length > 0
                        ? Object.entries(userSales)
                            .map(([userId, data]) => {
                              const user = users.find(
                                (u) => u.id === parseInt(userId)
                              );
                              return `
                            <div class="report-stat">
                                <div class="report-stat-value">${data.revenue.toFixed(
                                  2
                                )}</div>
                                <div class="report-stat-label">${
                                  user?.name || "مستخدم غير موجود"
                                }</div>
                            </div>
                        `;
                            })
                            .join("")
                        : "<p>لا توجد بيانات مبيعات</p>"
                    }
                </div>
            </div>
        `;
  }

  // Utility Methods
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const messageEl = document.getElementById("toastMessage");

    if (!toast || !messageEl) return;

    messageEl.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove("hidden");

    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  hideToast() {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.classList.add("hidden");
    }
  }

  logActivity(action, details) {
    if (!this.currentUser) return;

    const activity = JSON.parse(localStorage.getItem("activityLog") || "[]");
    activity.push({
      id: Date.now(),
      userId: this.currentUser.id,
      action: action,
      details: details,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 1000 activities
    if (activity.length > 1000) {
      activity.splice(0, activity.length - 1000);
    }

    localStorage.setItem("activityLog", JSON.stringify(activity));
  }
}

// Initialize the application when the script loads
const app = new SalesApp();
