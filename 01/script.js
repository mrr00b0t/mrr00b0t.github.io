// Application State
let appState = {
    products: [],
    paymentMethods: [],
    notes: [],
    faq: [],
    config: {},
    selectedProduct: null,
    selectedPlan: null,
    selectedCurrency: null,
    selectedPaymentMethod: null,
    currentTheme: 'light'
};

// DOM Elements
const elements = {
    productsGrid: document.getElementById('productsGrid'),
    productModal: document.getElementById('productModal'),
    paymentModal: document.getElementById('paymentModal'),
    receiptModal: document.getElementById('receiptModal'),
    modalClose: document.getElementById('modalClose'),
    paymentModalClose: document.getElementById('paymentModalClose'),
    receiptModalClose: document.getElementById('receiptModalClose'),
    modalBody: document.getElementById('modalBody'),
    paymentModalBody: document.getElementById('paymentModalBody'),
    receiptModalBody: document.getElementById('receiptModalBody'),
    notesContent: document.getElementById('notesContent'),
    faqContainer: document.getElementById('faqContainer'),
    themeToggle: document.getElementById('themeToggle'),
    loadingSpinner: document.getElementById('loadingSpinner')
};

// Utility Functions
const showLoading = () => {
    elements.loadingSpinner.classList.add('active');
};

const hideLoading = () => {
    elements.loadingSpinner.classList.remove('active');
};

const showModal = (modal) => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const hideModal = (modal) => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

const formatCurrency = (amount, currency) => {
    const symbols = {
        'USD': '$',
        'MMK': 'K',
        'THB': '฿'
    };
    return `${symbols[currency] || ''}${amount.toLocaleString()}`;
};

const generateReceiptId = () => {
    return 'RCP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Copied to clipboard!', 'success');
    }
};

const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: var(--blur-md);
        border: 1px solid var(--glass-border);
        border-radius: 0.5rem;
        padding: 1rem 1.5rem;
        z-index: 10000;
        color: hsl(var(--text-primary));
        font-weight: 500;
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

// Data Loading Functions
const loadData = async () => {
    showLoading();
    try {
        const [productsResponse, paymentMethodsResponse, notesResponse, faqResponse, configResponse] = await Promise.all([
            fetch('./data/products.json'),
            fetch('./data/payment-methods.json'),
            fetch('./data/notes.json'),
            fetch('./data/faq.json'),
            fetch('./data/config.json')
        ]);

        if (!productsResponse.ok || !paymentMethodsResponse.ok || !notesResponse.ok || !faqResponse.ok || !configResponse.ok) {
            throw new Error('Failed to load data files');
        }

        appState.products = await productsResponse.json();
        appState.paymentMethods = await paymentMethodsResponse.json();
        appState.notes = await notesResponse.json();
        appState.faq = await faqResponse.json();
        appState.config = await configResponse.json();

        renderProducts();
        renderNotes();
        renderFAQ();
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Failed to load data. Please check if all JSON files exist.', 'error');
    } finally {
        hideLoading();
    }
};

// Rendering Functions
const renderProducts = () => {
    if (!elements.productsGrid) return;
    
    elements.productsGrid.innerHTML = '';
    
    if (appState.products.length === 0) {
        elements.productsGrid.innerHTML = `
            <div class="glass-card" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: hsl(var(--text-secondary)); margin-bottom: 1rem;"></i>
                <h3>No Products Available</h3>
                <p style="color: hsl(var(--text-secondary));">Please add products to the data/products.json file.</p>
            </div>
        `;
        return;
    }

    appState.products.forEach(product => {
        const minPrice = Math.min(...product.plans.flatMap(plan => 
            plan.currencies.map(curr => curr.price)
        ));
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card glass-card';
        productCard.innerHTML = `
            <div class="product-header">
                <div class="product-icon">
                    <i class="${product.icon}"></i>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                </div>
            </div>
            <div class="product-meta">
                <span class="product-plans">${product.plans.length} plan${product.plans.length > 1 ? 's' : ''}</span>
                <span class="product-price">From ${formatCurrency(minPrice, 'USD')}</span>
            </div>
        `;
        
        productCard.addEventListener('click', () => openProductModal(product));
        elements.productsGrid.appendChild(productCard);
    });
};

const renderNotes = () => {
    if (!elements.notesContent || !appState.notes.length) return;
    
    elements.notesContent.innerHTML = appState.notes.map(note => `
        <div class="note-item">
            <h4><i class="${note.icon}"></i> ${note.title}</h4>
            <p>${note.content}</p>
        </div>
    `).join('');
};

const renderFAQ = () => {
    if (!elements.faqContainer || !appState.faq.length) return;
    
    elements.faqContainer.innerHTML = appState.faq.map((item, index) => `
        <div class="faq-item">
            <div class="faq-question glass-card" data-index="${index}">
                <span>${item.question}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer" id="faq-answer-${index}">
                <p>${item.answer}</p>
            </div>
        </div>
    `).join('');

    // Add click handlers for FAQ items
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', (e) => {
            const index = e.currentTarget.dataset.index;
            const answer = document.getElementById(`faq-answer-${index}`);
            const icon = e.currentTarget.querySelector('i');
            
            if (answer.classList.contains('active')) {
                answer.classList.remove('active');
                icon.style.transform = 'rotate(0deg)';
            } else {
                // Close all other answers
                document.querySelectorAll('.faq-answer.active').forEach(activeAnswer => {
                    activeAnswer.classList.remove('active');
                });
                document.querySelectorAll('.faq-question i').forEach(otherIcon => {
                    otherIcon.style.transform = 'rotate(0deg)';
                });
                
                // Open this answer
                answer.classList.add('active');
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
};

// Modal Functions
const openProductModal = (product) => {
    appState.selectedProduct = product;
    
    elements.modalBody.innerHTML = `
        <div class="modal-header">
            <div class="product-header">
                <div class="product-icon">
                    <i class="${product.icon}"></i>
                </div>
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <p>${product.description}</p>
                </div>
            </div>
        </div>
        
        <div class="plans-section">
            <h3>Available Plans</h3>
            <div class="plans-grid">
                ${product.plans.map((plan, index) => `
                    <div class="plan-card" data-plan-index="${index}">
                        <div class="plan-header">
                            <span class="plan-name">${plan.name}</span>
                            <span class="plan-duration">${plan.duration}</span>
                        </div>
                        <p class="plan-description">${plan.description}</p>
                        <div class="plan-currencies">
                            ${plan.currencies.map((currency, currIndex) => `
                                <div class="currency-option" data-currency-index="${currIndex}">
                                    ${currency.currency} ${formatCurrency(currency.price, currency.currency)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-primary" id="selectPlanBtn" disabled>
                <i class="fas fa-credit-card"></i>
                Select Payment Method
            </button>
        </div>
    `;
    
    // Add event listeners for plan selection
    addPlanSelectionListeners();
    showModal(elements.productModal);
};

const addPlanSelectionListeners = () => {
    const planCards = document.querySelectorAll('.plan-card');
    const selectPlanBtn = document.getElementById('selectPlanBtn');
    
    planCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Remove previous selections
            document.querySelectorAll('.plan-card.selected').forEach(c => c.classList.remove('selected'));
            document.querySelectorAll('.currency-option.selected').forEach(c => c.classList.remove('selected'));
            
            card.classList.add('selected');
            const planIndex = parseInt(card.dataset.planIndex);
            appState.selectedPlan = appState.selectedProduct.plans[planIndex];
            appState.selectedCurrency = null;
            
            selectPlanBtn.disabled = true;
            selectPlanBtn.innerHTML = '<i class="fas fa-credit-card"></i> Select Currency First';
        });
        
        // Currency selection within plan
        const currencyOptions = card.querySelectorAll('.currency-option');
        currencyOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Select the plan if not already selected
                if (!card.classList.contains('selected')) {
                    document.querySelectorAll('.plan-card.selected').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    const planIndex = parseInt(card.dataset.planIndex);
                    appState.selectedPlan = appState.selectedProduct.plans[planIndex];
                }
                
                // Remove previous currency selections
                document.querySelectorAll('.currency-option.selected').forEach(c => c.classList.remove('selected'));
                option.classList.add('selected');
                
                const currencyIndex = parseInt(option.dataset.currencyIndex);
                appState.selectedCurrency = appState.selectedPlan.currencies[currencyIndex];
                
                selectPlanBtn.disabled = false;
                selectPlanBtn.innerHTML = '<i class="fas fa-credit-card"></i> Select Payment Method';
            });
        });
    });
    
    selectPlanBtn.addEventListener('click', openPaymentModal);
};

const openPaymentModal = () => {
    hideModal(elements.productModal);
    
    const totalAmount = appState.selectedCurrency.price;
    const currency = appState.selectedCurrency.currency;
    
    elements.paymentModalBody.innerHTML = `
        <div class="payment-header">
            <h2>Payment Details</h2>
            <div class="payment-summary">
                <p><strong>Product:</strong> ${appState.selectedProduct.name}</p>
                <p><strong>Plan:</strong> ${appState.selectedPlan.name} (${appState.selectedPlan.duration})</p>
                <p><strong>Amount:</strong> ${formatCurrency(totalAmount, currency)}</p>
            </div>
        </div>
        
        <div class="payment-methods-section">
            <h3>Select Payment Method</h3>
            <div class="payment-methods">
                ${appState.paymentMethods.map((method, index) => `
                    <div class="payment-method" data-method-index="${index}">
                        <div class="payment-header">
                            <div class="payment-icon">
                                <i class="${method.icon}"></i>
                            </div>
                            <div class="payment-info">
                                <h4>${method.name}</h4>
                                <p>${method.type}</p>
                            </div>
                        </div>
                        <div class="payment-details">
                            ${method.phone ? `<div class="payment-detail"><strong>Phone:</strong> <span>${method.phone}</span></div>` : ''}
                            ${method.accountName ? `<div class="payment-detail"><strong>Account Name:</strong> <span>${method.accountName}</span></div>` : ''}
                            ${method.uid ? `<div class="payment-detail"><strong>UID:</strong> <span>${method.uid}</span></div>` : ''}
                            ${method.accountNumber ? `<div class="payment-detail"><strong>Account:</strong> <span>${method.accountNumber}</span></div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="payment-instructions">
            <div class="glass-card" style="padding: 1.5rem; margin: 1rem 0;">
                <h4><i class="fas fa-info-circle"></i> Payment Instructions</h4>
                <ol style="margin: 1rem 0; padding-left: 1.5rem;">
                    <li>Select a payment method above</li>
                    <li>Send exactly <strong>${formatCurrency(totalAmount, currency)}</strong> to the selected account</li>
                    <li>Click "Payment Done" after completing the transfer</li>
                    <li>Save your receipt for future reference</li>
                </ol>
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-outline" onclick="backToProductModal()">
                <i class="fas fa-arrow-left"></i>
                Back
            </button>
            <button class="btn btn-success" id="paymentDoneBtn" disabled>
                <i class="fas fa-check"></i>
                Payment Done
            </button>
        </div>
    `;
    
    // Add payment method selection listeners
    addPaymentMethodListeners();
    showModal(elements.paymentModal);
};

const addPaymentMethodListeners = () => {
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentDoneBtn = document.getElementById('paymentDoneBtn');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', () => {
            // Remove previous selections
            document.querySelectorAll('.payment-method.selected').forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            
            const methodIndex = parseInt(method.dataset.methodIndex);
            appState.selectedPaymentMethod = appState.paymentMethods[methodIndex];
            
            paymentDoneBtn.disabled = false;
        });
    });
    
    paymentDoneBtn.addEventListener('click', generateReceipt);
};

const backToProductModal = () => {
    hideModal(elements.paymentModal);
    showModal(elements.productModal);
};

const generateReceipt = () => {
    hideModal(elements.paymentModal);
    
    const receiptId = generateReceiptId();
    const timestamp = new Date().toLocaleString();
    const totalAmount = appState.selectedCurrency.price;
    const currency = appState.selectedCurrency.currency;
    
    const receiptText = `
${appState.config.receipt?.companyName || 'DIGITAL PRODUCTS MARKETPLACE'}
═══════════════════════════════

Receipt ID: ${receiptId}
Date: ${timestamp}

PRODUCT DETAILS:
Product: ${appState.selectedProduct.name}
Plan: ${appState.selectedPlan.name}
Duration: ${appState.selectedPlan.duration}
Description: ${appState.selectedPlan.description}

PAYMENT DETAILS:
Method: ${appState.selectedPaymentMethod.name}
Amount: ${formatCurrency(totalAmount, currency)}
Currency: ${currency}

SELLER CONTACT:
Telegram: ${appState.config.seller?.telegram?.displayName || '@yourtelegram'}
Support: ${appState.config.seller?.support?.hours || 'Available 24/7'}

═══════════════════════════════
${appState.config.receipt?.footer || 'Thank you for your purchase!'}
    `.trim();
    
    elements.receiptModalBody.innerHTML = `
        <div class="receipt">
            <div class="receipt-header">
                <h2><i class="fas fa-receipt"></i> Payment Receipt</h2>
                <p>Receipt ID: <strong>${receiptId}</strong></p>
                <p>Generated: ${timestamp}</p>
            </div>
            
            <div class="receipt-details">
                <div class="receipt-row">
                    <span>Product:</span>
                    <span>${appState.selectedProduct.name}</span>
                </div>
                <div class="receipt-row">
                    <span>Plan:</span>
                    <span>${appState.selectedPlan.name} (${appState.selectedPlan.duration})</span>
                </div>
                <div class="receipt-row">
                    <span>Payment Method:</span>
                    <span>${appState.selectedPaymentMethod.name}</span>
                </div>
                <div class="receipt-row receipt-total">
                    <span>Total Amount:</span>
                    <span>${formatCurrency(totalAmount, currency)}</span>
                </div>
            </div>
            
            <div class="receipt-actions">
                <button class="btn btn-outline copy-btn" onclick="copyReceipt(\`${receiptText.replace(/`/g, '\\`')}\`)">
                    <i class="fas fa-copy"></i>
                    Copy Receipt
                </button>
            </div>
        </div>
        
        <div class="contact-section">
            <h3>Contact Seller</h3>
            <p>For any issues or questions about your purchase:</p>
            <a href="${appState.config.seller?.telegram?.url || 'https://t.me/yourtelegram'}" target="_blank" class="btn btn-primary">
                <i class="fab fa-telegram"></i>
                Contact on Telegram
            </a>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-outline" onclick="closeAllModals()">
                <i class="fas fa-home"></i>
                Back to Home
            </button>
        </div>
    `;
    
    showModal(elements.receiptModal);
};

const copyReceipt = (receiptText) => {
    copyToClipboard(receiptText);
};

const closeAllModals = () => {
    hideModal(elements.receiptModal);
    hideModal(elements.paymentModal);
    hideModal(elements.productModal);
    
    // Reset state
    appState.selectedProduct = null;
    appState.selectedPlan = null;
    appState.selectedCurrency = null;
    appState.selectedPaymentMethod = null;
};

// Theme Management
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    appState.currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
};

const toggleTheme = () => {
    appState.currentTheme = appState.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', appState.currentTheme);
    localStorage.setItem('theme', appState.currentTheme);
    updateThemeIcon();
};

const updateThemeIcon = () => {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = appState.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
};

// Event Listeners
const initEventListeners = () => {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Modal close buttons
    elements.modalClose.addEventListener('click', () => hideModal(elements.productModal));
    elements.paymentModalClose.addEventListener('click', () => hideModal(elements.paymentModal));
    elements.receiptModalClose.addEventListener('click', () => hideModal(elements.receiptModal));
    
    // Close modals when clicking outside
    [elements.productModal, elements.paymentModal, elements.receiptModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.receiptModal.classList.contains('active')) {
                hideModal(elements.receiptModal);
            } else if (elements.paymentModal.classList.contains('active')) {
                hideModal(elements.paymentModal);
            } else if (elements.productModal.classList.contains('active')) {
                hideModal(elements.productModal);
            }
        }
    });
};

// Add CSS animations for notifications
const addNotificationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .notification-success {
            border-left: 4px solid hsl(var(--success));
        }
        
        .notification-error {
            border-left: 4px solid hsl(var(--error));
        }
        
        .notification-info {
            border-left: 4px solid hsl(var(--primary));
        }
    `;
    document.head.appendChild(style);
};

// Application Initialization
const initApp = () => {
    console.log('🚀 Digital Products Marketplace - Starting...');
    
    // Initialize theme
    initTheme();
    
    // Add notification styles
    addNotificationStyles();
    
    // Initialize event listeners
    initEventListeners();
    
    // Load data and render
    loadData();
    
    console.log('✅ Application initialized successfully');
};

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Global functions for inline event handlers
window.backToProductModal = backToProductModal;
window.copyReceipt = copyReceipt;
window.closeAllModals = closeAllModals;
