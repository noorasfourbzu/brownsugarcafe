// Global variables
let menuItems = [];
let cart = JSON.parse(localStorage.getItem('bobateaCart')) || [];
let currentItem = null;

// DOM Elements
const menuContainer = document.getElementById('menu-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const cartIcon = document.querySelector('.cart-icon');
const cartCount = document.querySelector('.cart-count');
const cartSidebar = document.getElementById('cart-sidebar');
const cartClose = document.getElementById('cart-close');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const orderModal = document.getElementById('order-modal');
const modalClose = document.getElementById('modal-close');
const cancelOrder = document.getElementById('cancel-order');
const customizationForm = document.getElementById('customization-form');
const quantityInput = document.getElementById('quantity');
const decreaseQty = document.getElementById('decrease-qty');
const increaseQty = document.getElementById('increase-qty');
const totalPriceElement = document.getElementById('total-price');
const successToast = document.getElementById('success-toast');
const toastMessage = document.getElementById('toast-message');
const findStoreBtn = document.getElementById('find-store-btn');
const signinBtn = document.getElementById('signin-btn');
const joinNowBtn = document.getElementById('join-now-btn');
const orderNowBtn = document.getElementById('order-now-btn');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadMenuItems();
    updateCartCount();
    setupEventListeners();
});

// Load menu items from the API
async function loadMenuItems(category = 'all') {
    try {
        const response = await fetch(`/api/menu?category=${category}`);
        menuItems = await response.json();
        displayMenuItems(menuItems);
    } catch (error) {
        console.error('Error loading menu items:', error);
        // Fallback to hardcoded items if API fails
        menuItems = getHardcodedMenuItems();
        displayMenuItems(menuItems);
    }
}

// Hardcoded menu items for fallback
function getHardcodedMenuItems() {
    return [
        {
            id: 1,
            name: "Classic Milk Tea",
            description: "Our signature black tea with creamy milk and chewy tapioca pearls",
            price: 4.95,
            category: "milk-tea",
            image: "classic-milk-tea.jpg",
            customizations: ["Sugar Level", "Ice Level", "Pearls", "Pudding"],
            popular: true
        },
        {
            id: 2,
            name: "Taro Milk Tea",
            description: "Sweet taro flavor blended with milk and tea, topped with taro chunks",
            price: 5.45,
            category: "milk-tea",
            image: "taro-milk-tea.jpg",
            customizations: ["Sugar Level", "Ice Level", "Pearls", "Taro Chunks"],
            popular: true
        },
        {
            id: 3,
            name: "Matcha Latte",
            description: "Premium Japanese matcha green tea with steamed milk",
            price: 5.75,
            category: "specialty",
            image: "matcha-latte.jpg",
            customizations: ["Sugar Level", "Milk Type", "Whipped Cream"],
            popular: false
        },
        {
            id: 4,
            name: "Strawberry Fruit Tea",
            description: "Refreshing green tea with fresh strawberry puree and fruit chunks",
            price: 5.25,
            category: "fruit-tea",
            image: "strawberry-tea.jpg",
            customizations: ["Sugar Level", "Ice Level", "Fruit Toppings"],
            popular: true
        }
    ];
}

// Display menu items in the grid
function displayMenuItems(items) {
    menuContainer.innerHTML = '';
    
    if (items.length === 0) {
        menuContainer.innerHTML = '<p class="no-items">No items found in this category</p>';
        return;
    }
    
    items.forEach(item => {
        const menuItemElement = document.createElement('div');
        menuItemElement.className = 'menu-item';
        menuItemElement.dataset.id = item.id;
        
        // Create image placeholder with emoji based on category
        let emoji = '🧋'; // default boba emoji
        if (item.category === 'fruit-tea') emoji = '🍓';
        if (item.category === 'matcha') emoji = '🍵';
        if (item.category === 'specialty') emoji = '🌟';
        
        menuItemElement.innerHTML = `
            <div class="menu-item-image">
                ${emoji}
            </div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <div class="menu-item-tags">
                        <span class="tag">${item.category.replace('-', ' ')}</span>
                        ${item.popular ? '<span class="tag popular">Popular</span>' : ''}
                    </div>
                    <button class="btn-primary add-to-cart-btn" data-id="${item.id}">Customize</button>
                </div>
            </div>
        `;
        
        menuContainer.appendChild(menuItemElement);
    });
    
    // Add event listeners to the "Customize" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.dataset.id);
            openCustomizationModal(itemId);
        });
    });
}

// Open the customization modal for a specific item
function openCustomizationModal(itemId) {
    currentItem = menuItems.find(item => item.id === itemId);
    
    if (!currentItem) return;
    
    // Set modal content
    document.getElementById('modal-item-name').textContent = currentItem.name;
    document.getElementById('modal-item-description').textContent = currentItem.description;
    document.getElementById('modal-item-price').textContent = `$${currentItem.price.toFixed(2)}`;
    
    // Set image placeholder with appropriate emoji
    const modalImage = document.getElementById('modal-item-image');
    let emoji = '🧋';
    if (currentItem.category === 'fruit-tea') emoji = '🍓';
    if (currentItem.category === 'matcha') emoji = '🍵';
    if (currentItem.category === 'specialty') emoji = '🌟';
    modalImage.innerHTML = emoji;
    modalImage.style.fontSize = '60px';
    modalImage.style.display = 'flex';
    modalImage.style.alignItems = 'center';
    modalImage.style.justifyContent = 'center';
    modalImage.style.height = '100%';
    
    // Reset form
    customizationForm.reset();
    quantityInput.value = 1;
    updateTotalPrice();
    
    // Show modal
    orderModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Update total price in modal
function updateTotalPrice() {
    if (!currentItem) return;
    
    const quantity = parseInt(quantityInput.value);
    let total = currentItem.price * quantity;
    
    // Add toppings cost
    const toppingCheckboxes = document.querySelectorAll('input[name="toppings"]:checked');
    toppingCheckboxes.forEach(checkbox => {
        if (checkbox.value.includes('Tapioca') || checkbox.value.includes('Jelly')) {
            total += 0.5 * quantity;
        } else {
            total += 0.75 * quantity;
        }
    });
    
    totalPriceElement.textContent = total.toFixed(2);
}

// Add item to cart
function addToCart(event) {
    event.preventDefault();
    
    if (!currentItem) return;
    
    const formData = new FormData(customizationForm);
    const sugar = formData.get('sugar');
    const ice = formData.get('ice');
    const toppings = formData.getAll('toppings');
    const quantity = parseInt(quantityInput.value);
    
    // Calculate price with toppings
    let price = currentItem.price;
    toppings.forEach(topping => {
        if (topping.includes('Tapioca') || topping.includes('Jelly')) {
            price += 0.5;
        } else {
            price += 0.75;
        }
    });
    
    const cartItem = {
        id: Date.now(), // Unique ID for cart item
        menuItemId: currentItem.id,
        name: currentItem.name,
        sugar,
        ice,
        toppings,
        quantity,
        price: price * quantity,
        unitPrice: price
    };
    
    cart.push(cartItem);
    saveCartToStorage();
    updateCartCount();
    updateCartDisplay();
    
    // Show success message
    showToast(`${currentItem.name} added to cart!`);
    
    // Close modal
    closeModal();
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Update cart display in sidebar
function updateCartDisplay() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        
        const toppingsText = item.toppings.length > 0 
            ? `<div class="cart-item-details">${item.sugar}, ${item.ice}, ${item.toppings.join(', ')}</div>`
            : `<div class="cart-item-details">${item.sugar}, ${item.ice}</div>`;
        
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name} × ${item.quantity}</h4>
                ${toppingsText}
            </div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        `;
        
        cartItems.appendChild(cartItemElement);
        total += item.price;
    });
    
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('bobateaCart', JSON.stringify(cart));
}

// Show toast notification
function showToast(message) {
    toastMessage.textContent = message;
    successToast.classList.add('show');
    
    setTimeout(() => {
        successToast.classList.remove('show');
    }, 3000);
}

// Close modal
function closeModal() {
    orderModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentItem = null;
}

// Setup event listeners
function setupEventListeners() {
    // Category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Load items for category
            loadMenuItems(category);
        });
    });
    
    // Cart icon click
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        updateCartDisplay();
    });
    
    // Close cart sidebar
    cartClose.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });
    
    // Modal close buttons
    modalClose.addEventListener('click', closeModal);
    cancelOrder.addEventListener('click', closeModal);
    
    // Click outside modal to close
    orderModal.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            closeModal();
        }
    });
    
    // Quantity controls
    decreaseQty.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateTotalPrice();
        }
    });
    
    increaseQty.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
            updateTotalPrice();
        }
    });
    
    quantityInput.addEventListener('change', updateTotalPrice);
    
    // Toppings checkboxes
    document.querySelectorAll('input[name="toppings"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateTotalPrice);
    });
    
    // Sugar and ice radio buttons
    document.querySelectorAll('input[name="sugar"], input[name="ice"]').forEach(radio => {
        radio.addEventListener('change', updateTotalPrice);
    });
    
    // Form submission
    customizationForm.addEventListener('submit', addToCart);
    
    // Checkout button
    checkoutBtn.addEventListener('click', async () => {
        if (cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }
        
        try {
            const response = await fetch('/api/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cart,
                    total: cart.reduce((sum, item) => sum + item.price, 0)
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showToast(`Order placed! Order ID: ${result.order_id}`);
                cart = [];
                saveCartToStorage();
                updateCartCount();
                updateCartDisplay();
                cartSidebar.classList.remove('open');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showToast('Order placed successfully (simulated)');
            cart = [];
            saveCartToStorage();
            updateCartCount();
            updateCartDisplay();
            cartSidebar.classList.remove('open');
        }
    });
    
    // Other button actions
    findStoreBtn.addEventListener('click', () => {
        showToast('Store locator would open here');
    });
    
    signinBtn.addEventListener('click', () => {
        showToast('Sign in modal would open here');
    });
    
    joinNowBtn.addEventListener('click', () => {
        showToast('Join now modal would open here');
    });
    
    orderNowBtn.addEventListener('click', () => {
        document.querySelector('.category-btn[data-category="all"]').click();
        window.scrollTo({
            top: document.querySelector('.menu-header').offsetTop - 100,
            behavior: 'smooth'
        });
    });
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        document.querySelector('.main-nav').classList.toggle('show');
    });
}