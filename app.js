// البيانات والمتغيرات العامة
let currentUser = null;
let html5QrcodeScanner = null;
let scanningMode = null; // 'add' أو 'sell'
let pendingProduct = null;

// البيانات الافتراضية
const defaultData = {
    products: [
        {
            id: "1",
            name: "لابتوب Dell",
            barcode: "123456789012",
            price: 1500,
            stock: 25,
            category: "إلكترونيات"
        },
        {
            id: "2", 
            name: "هاتف iPhone",
            barcode: "987654321098",
            price: 2000,
            stock: 15,
            category: "إلكترونيات"
        },
        {
            id: "3",
            name: "شاشة Samsung",
            barcode: "456789123456",
            price: 800,
            stock: 30,
            category: "إلكترونيات"
        },
        {
            id: "4",
            name: "طابعة HP",
            barcode: "789123456789",
            price: 300,
            stock: 20,
            category: "مكتبية"
        }
    ],
    users: [
        {
            id: "admin1",
            username: "admin",
            password: "admin123",
            role: "admin",
            name: "أحمد المدير",
            inventory: {},
            sales: []
        },
        {
            id: "sales1",
            username: "مندوب1",
            password: "123456",
            role: "salesman", 
            name: "محمد المندوب",
            inventory: {},
            sales: []
        },
        {
            id: "driver1",
            username: "سائق1",
            password: "123456",
            role: "driver",
            name: "علي السائق",
            inventory: {},
            sales: []
        }
    ],
    activities: [],
    sales: []
};

// متغيرات التخزين المحلي
let appData = {
    products: [],
    users: [],
    activities: [],
    sales: []
};

// وظائف التخزين المحلي المحسنة
function saveData(key, data) {
    try {
        appData[key] = data;
        console.log(`تم حفظ ${key}:`, data);
    } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
    }
}

function loadData(key) {
    try {
        return appData[key] || null;
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        return null;
    }
}

// تهيئة البيانات
function initializeData() {
    if (!appData.products || appData.products.length === 0) {
        appData.products = JSON.parse(JSON.stringify(defaultData.products));
    }
    if (!appData.users || appData.users.length === 0) {
        appData.users = JSON.parse(JSON.stringify(defaultData.users));
    }
    if (!appData.activities) {
        appData.activities = [];
    }
    if (!appData.sales) {
        appData.sales = [];
    }

    console.log('تم تهيئة البيانات:', appData);
    return appData;
}

// وظائف التنبيهات
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert--${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// وظائف الصفحات
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// وظائف المصادقة
function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function login() {
    console.log('تم استدعاء وظيفة تسجيل الدخول');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    console.log('بيانات تسجيل الدخول:', { username, password });
    
    if (!username || !password) {
        showAlert('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    const data = initializeData();
    const user = data.users.find(u => u.username === username && u.password === password);
    
    console.log('المستخدم الموجود:', user);
    
    if (user) {
        currentUser = user;
        console.log('تم تسجيل الدخول للمستخدم:', currentUser);
        
        if (user.role === 'admin') {
            showPage('adminDashboard');
            loadAdminDashboard();
        } else {
            showPage('userDashboard');
            loadUserDashboard();
        }
        
        showAlert(`مرحباً ${user.name}`, 'success');
    } else {
        showAlert('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
}

function register() {
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const role = document.getElementById('userRole').value;
    
    if (!name || !username || !password) {
        showAlert('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    const data = initializeData();
    
    // التحقق من وجود اسم المستخدم
    if (data.users.find(u => u.username === username)) {
        showAlert('اسم المستخدم موجود بالفعل', 'error');
        return;
    }
    
    // إضافة المستخدم الجديد
    const newUser = {
        id: 'user_' + Date.now(),
        username,
        password,
        role,
        name,
        inventory: {},
        sales: []
    };
    
    data.users.push(newUser);
    saveData('users', data.users);
    
    showAlert('تم إنشاء الحساب بنجاح، يمكنك الآن تسجيل الدخول', 'success');
    showLoginForm();
    
    // مسح الحقول
    document.getElementById('regName').value = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
}

function logout() {
    currentUser = null;
    showPage('loginPage');
    showAlert('تم تسجيل الخروج بنجاح', 'info');
}

// وظائف لوحة تحكم الأدمن
function loadAdminDashboard() {
    document.getElementById('userWelcome').textContent = `مرحباً ${currentUser.name}`;
    updateDashboardStats();
    loadRecentActivities();
}

function showAdminTab(tabName) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('#adminDashboard .tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('#adminDashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار التبويب المحدد
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // تحديد الزر النشط
    const clickedBtn = event ? event.target : document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    // تحميل محتوى التبويب
    switch(tabName) {
        case 'dashboard':
            updateDashboardStats();
            loadRecentActivities();
            break;
        case 'inventory':
            loadInventoryTable();
            break;
        case 'users':
            loadUsersTable();
            break;
        case 'reports':
            loadReportsTab();
            break;
    }
}

function updateDashboardStats() {
    const data = initializeData();
    
    const totalProducts = data.products.reduce((sum, p) => sum + p.stock, 0);
    const totalSalesValue = data.sales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const activeSalesmen = data.users.filter(u => u.role === 'salesman' || u.role === 'driver').length;
    const lowStockItems = data.products.filter(p => p.stock < 10).length;
    
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalSales').textContent = totalSalesValue.toLocaleString() + ' ر.س';
    document.getElementById('activeSalesmen').textContent = activeSalesmen;
    document.getElementById('lowStockItems').textContent = lowStockItems;
}

function loadRecentActivities() {
    const activities = loadData('activities') || [];
    const recentActivities = activities.slice(-10).reverse();
    
    const container = document.getElementById('recentActivities');
    container.innerHTML = '';
    
    if (recentActivities.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center;">لا توجد أنشطة حديثة</p>';
        return;
    }
    
    recentActivities.forEach(activity => {
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity-item';
        activityDiv.innerHTML = `
            <div>${activity.description}</div>
            <div class="activity-time">${new Date(activity.timestamp).toLocaleString('ar-SA')}</div>
        `;
        container.appendChild(activityDiv);
    });
}

function addActivity(description) {
    const activities = loadData('activities') || [];
    activities.push({
        id: Date.now(),
        description,
        timestamp: new Date().toISOString(),
        userId: currentUser.id
    });
    saveData('activities', activities);
}

function loadInventoryTable() {
    const data = initializeData();
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';
    
    data.products.forEach(product => {
        const row = document.createElement('tr');
        
        let stockStatus = 'stock-status--normal';
        if (product.stock === 0) stockStatus = 'stock-status--out';
        else if (product.stock < 10) stockStatus = 'stock-status--low';
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.barcode}</td>
            <td>${product.price.toLocaleString()} ر.س</td>
            <td><span class="stock-status ${stockStatus}">${product.stock}</span></td>
            <td>${product.category}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn--sm btn--outline" onclick="deleteProduct('${product.id}')">حذف</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddProductModal() {
    document.getElementById('addProductModal').classList.remove('hidden');
}

function closeAddProductModal() {
    document.getElementById('addProductModal').classList.add('hidden');
    // مسح الحقول
    document.getElementById('productName').value = '';
    document.getElementById('productBarcode').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('productCategory').value = '';
}

function addProduct() {
    const name = document.getElementById('productName').value.trim();
    const barcode = document.getElementById('productBarcode').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('productCategory').value.trim();
    
    if (!name || !barcode || !price || !stock || !category) {
        showAlert('يرجى ملء جميع الحقول', 'error');
        return;
    }
    
    const data = initializeData();
    
    // التحقق من وجود الباركود
    if (data.products.find(p => p.barcode === barcode)) {
        showAlert('الباركود موجود بالفعل', 'error');
        return;
    }
    
    const newProduct = {
        id: Date.now().toString(),
        name,
        barcode,
        price,
        stock,
        category
    };
    
    data.products.push(newProduct);
    saveData('products', data.products);
    
    addActivity(`تم إضافة منتج جديد: ${name}`);
    closeAddProductModal();
    loadInventoryTable();
    updateDashboardStats();
    showAlert('تم إضافة المنتج بنجاح', 'success');
}

function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    const data = initializeData();
    const productIndex = data.products.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        const productName = data.products[productIndex].name;
        data.products.splice(productIndex, 1);
        saveData('products', data.products);
        
        addActivity(`تم حذف المنتج: ${productName}`);
        loadInventoryTable();
        updateDashboardStats();
        showAlert('تم حذف المنتج بنجاح', 'success');
    }
}

function loadUsersTable() {
    const data = initializeData();
    const container = document.getElementById('usersTable');
    container.innerHTML = '';
    
    data.users.filter(user => user.role !== 'admin').forEach(user => {
        const userSales = data.sales.filter(s => s.userId === user.id);
        const totalSales = userSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
        const totalItems = Object.values(user.inventory || {}).reduce((sum, qty) => sum + qty, 0);
        
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <div class="user-header">
                <div>
                    <div class="user-name">${user.name}</div>
                    <div class="user-role">${user.role === 'salesman' ? 'مندوب تسويق' : 'سائق'}</div>
                </div>
            </div>
            <div class="user-stats">
                <div class="user-stat">
                    <div class="user-stat-value">${totalItems}</div>
                    <div class="user-stat-label">المنتجات المحملة</div>
                </div>
                <div class="user-stat">
                    <div class="user-stat-value">${userSales.length}</div>
                    <div class="user-stat-label">عدد المبيعات</div>
                </div>
                <div class="user-stat">
                    <div class="user-stat-value">${totalSales.toLocaleString()}</div>
                    <div class="user-stat-label">إجمالي المبيعات (ر.س)</div>
                </div>
            </div>
        `;
        container.appendChild(userCard);
    });
}

function loadReportsTab() {
    const data = initializeData();
    const container = document.getElementById('salesReport');
    
    // إحصائيات المبيعات
    const totalSales = data.sales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    const totalQuantity = data.sales.reduce((sum, s) => sum + s.quantity, 0);
    const uniqueProducts = new Set(data.sales.map(s => s.productId)).size;
    
    container.innerHTML = `
        <div class="report-section">
            <div class="report-header">
                <h3>تقرير المبيعات الإجمالي</h3>
            </div>
            <div class="sales-summary">
                <div class="summary-item">
                    <div class="summary-value">${totalSales.toLocaleString()}</div>
                    <div class="summary-label">إجمالي المبيعات (ر.س)</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${totalQuantity}</div>
                    <div class="summary-label">إجمالي الكميات المباعة</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${uniqueProducts}</div>
                    <div class="summary-label">عدد المنتجات المختلفة</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${data.sales.length}</div>
                    <div class="summary-label">إجمالي العمليات</div>
                </div>
            </div>
        </div>
    `;
}

// وظائف واجهة المستخدم
function loadUserDashboard() {
    document.getElementById('userWelcomeUser').textContent = `مرحباً ${currentUser.name}`;
    loadUserInventory();
}

function showUserTab(tabName) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('#userDashboard .tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('#userDashboard .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار التبويب المحدد
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // تحديد الزر النشط
    const clickedBtn = event ? event.target : document.querySelector(`[onclick="showUserTab('${tabName}')"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    
    // تحميل محتوى التبويب
    switch(tabName) {
        case 'inventory':
            loadUserInventory();
            break;
        case 'sales':
            loadUserSales();
            break;
    }
}

function loadUserInventory() {
    const container = document.getElementById('userInventoryList');
    const data = initializeData();
    const userInventory = currentUser.inventory || {};
    
    container.innerHTML = '';
    
    if (Object.keys(userInventory).length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center;">لا توجد منتجات في مخزونك</p>';
        return;
    }
    
    Object.entries(userInventory).forEach(([productId, quantity]) => {
        const product = data.products.find(p => p.id === productId);
        if (product && quantity > 0) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${product.name}</span>
                    <span class="item-quantity">${quantity}</span>
                </div>
                <div class="item-details">
                    <span>السعر: ${product.price.toLocaleString()} ر.س</span>
                    <span>الباركود: ${product.barcode}</span>
                </div>
            `;
            container.appendChild(itemDiv);
        }
    });
}

function loadUserSales() {
    const container = document.getElementById('userSalesList');
    const data = initializeData();
    const userSales = data.sales.filter(s => s.userId === currentUser.id).reverse();
    
    container.innerHTML = '';
    
    if (userSales.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center;">لا توجد مبيعات مسجلة</p>';
        return;
    }
    
    userSales.forEach(sale => {
        const product = data.products.find(p => p.id === sale.productId);
        if (product) {
            const saleDiv = document.createElement('div');
            saleDiv.className = 'sales-item';
            saleDiv.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${product.name}</span>
                    <span class="item-quantity">${sale.quantity}</span>
                </div>
                <div class="item-details">
                    <span>السعر: ${sale.price.toLocaleString()} ر.س</span>
                    <span>الإجمالي: ${(sale.price * sale.quantity).toLocaleString()} ر.س</span>
                    <span>التاريخ: ${new Date(sale.timestamp).toLocaleDateString('ar-SA')}</span>
                </div>
            `;
            container.appendChild(saleDiv);
        }
    });
}

// وظائف مسح الباركود
function startScanning(mode) {
    scanningMode = mode;
    const scannerContainer = document.getElementById('scannerContainer');
    scannerContainer.classList.remove('hidden');
    
    // محاكاة مسح الباركود للاختبار
    setTimeout(() => {
        const testBarcode = "123456789012"; // باركود لابتوب Dell
        onScanSuccess(testBarcode);
    }, 2000);
    
    showAlert('سيتم محاكاة مسح باركود لابتوب Dell خلال ثانيتين...', 'info');
}

function stopScanning() {
    document.getElementById('scannerContainer').classList.add('hidden');
    if (html5QrcodeScanner) {
        html5QrcodeScanner = null;
    }
}

function onScanSuccess(decodedText) {
    const data = initializeData();
    const product = data.products.find(p => p.barcode === decodedText);
    
    if (product) {
        stopScanning();
        pendingProduct = product;
        showQuantityModal(product, scanningMode);
    } else {
        showAlert('المنتج غير موجود في النظام', 'error');
    }
}

function showQuantityModal(product, mode) {
    const modal = document.getElementById('quantityModal');
    const title = document.getElementById('quantityModalTitle');
    const productInfo = document.getElementById('quantityModalProduct');
    
    title.textContent = mode === 'add' ? 'إضافة من المخزن' : 'تسجيل المبيع';
    productInfo.textContent = `المنتج: ${product.name} - السعر: ${product.price.toLocaleString()} ر.س`;
    
    document.getElementById('quantity').value = 1;
    modal.classList.remove('hidden');
}

function closeQuantityModal() {
    document.getElementById('quantityModal').classList.add('hidden');
    pendingProduct = null;
}

function confirmQuantity() {
    const quantity = parseInt(document.getElementById('quantity').value);
    
    if (!quantity || quantity < 1) {
        showAlert('يرجى إدخال كمية صحيحة', 'error');
        return;
    }
    
    if (scanningMode === 'add') {
        addToUserInventory(pendingProduct, quantity);
    } else if (scanningMode === 'sell') {
        recordSale(pendingProduct, quantity);
    }
    
    closeQuantityModal();
}

function addToUserInventory(product, quantity) {
    const data = initializeData();
    
    // التحقق من توفر الكمية في المخزن
    if (product.stock < quantity) {
        showAlert('الكمية المطلوبة غير متوفرة في المخزن', 'error');
        return;
    }
    
    // تحديث مخزون المنتج
    const productIndex = data.products.findIndex(p => p.id === product.id);
    data.products[productIndex].stock -= quantity;
    
    // إضافة للمخزون الشخصي
    if (!currentUser.inventory) currentUser.inventory = {};
    currentUser.inventory[product.id] = (currentUser.inventory[product.id] || 0) + quantity;
    
    // تحديث بيانات المستخدم
    const userIndex = data.users.findIndex(u => u.id === currentUser.id);
    data.users[userIndex] = currentUser;
    
    saveData('products', data.products);
    saveData('users', data.users);
    
    addActivity(`${currentUser.name} أخذ ${quantity} من ${product.name} من المخزن`);
    showAlert(`تم إضافة ${quantity} من ${product.name} لمخزونك`, 'success');
    
    // تحديث العرض
    loadUserInventory();
}

function recordSale(product, quantity) {
    const data = initializeData();
    
    // التحقق من توفر الكمية في المخزون الشخصي
    const userInventoryQuantity = currentUser.inventory[product.id] || 0;
    if (userInventoryQuantity < quantity) {
        showAlert('الكمية المطلوبة غير متوفرة في مخزونك', 'error');
        return;
    }
    
    // تحديث المخزون الشخصي
    currentUser.inventory[product.id] -= quantity;
    if (currentUser.inventory[product.id] === 0) {
        delete currentUser.inventory[product.id];
    }
    
    // تسجيل المبيع
    const newSale = {
        id: Date.now().toString(),
        productId: product.id,
        userId: currentUser.id,
        quantity: quantity,
        price: product.price,
        timestamp: new Date().toISOString()
    };
    
    data.sales.push(newSale);
    
    // تحديث بيانات المستخدم
    const userIndex = data.users.findIndex(u => u.id === currentUser.id);
    data.users[userIndex] = currentUser;
    
    saveData('users', data.users);
    saveData('sales', data.sales);
    
    const totalValue = product.price * quantity;
    addActivity(`${currentUser.name} باع ${quantity} من ${product.name} بقيمة ${totalValue.toLocaleString()} ر.س`);
    showAlert(`تم تسجيل بيع ${quantity} من ${product.name} بقيمة ${totalValue.toLocaleString()} ر.س`, 'success');
    
    // تحديث العرض
    loadUserInventory();
    loadUserSales();
}

// التهيئة الأولية
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة');
    
    initializeData();
    showPage('loginPage');
    
    // إضافة مستمعين للأحداث
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
    
    console.log('تم الانتهاء من التهيئة');
});