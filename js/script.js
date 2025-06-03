// js/script.js

// Global variable to hold all fetched site data
let siteData = {};

// --- APPLICATION STATE ---
let currentStep = 'home';
let selectedProduct = null;
let selectedPlan = null;
let selectedPaymentMethod = null;

// --- DOM Elements (to be assigned in DOMContentLoaded) ---
let persistentHeader, themeSwitcher, headerBackButton;
let homeSection, productOptionsSection, productDetailsSection, planListSection, paymentMethodSection, paymentInstructionsSection, receiptSection;
let adminNoteSection, adminNoteTitle, adminNoteContentDiv;
let qaSection, qaTitle, qaGridDiv;

let productListDiv, productOptionsTitle, productDetailsContent, planListContentDiv, paymentMethodListDiv, paymentInstructionsContentDiv, receiptContentDiv, copyReceiptButton;


// --- DATA FETCHING ---
async function fetchData() {
    try {
        const response = await fetch('data.json'); // Assumes data.json is in the same root directory
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status},  Make sure 'data.json' is in the correct path and accessible.`);
        }
        siteData = await response.json();
        // console.log("Data loaded successfully:", siteData); // Optional: for debugging
        return true;
    } catch (error) {
        console.error("Could not fetch data.json:", error);
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.innerHTML = `<section style="opacity:1; transform:none; text-align:center; padding: 40px; background-color: #ffebee; color: #c62828; border: 1px solid #c62828; border-radius: 10px;">
                                        <h2>Error Loading Site Data</h2>
                                        <p>There was a problem loading the website's content. Please ensure 'data.json' exists in the root directory and is correctly formatted. Try refreshing the page or contact support if the issue persists.</p>
                                        <p>Details: ${error.message}</p>
                                     </section>`;
        }
        return false;
    }
}

// --- UTILITY FUNCTIONS ---
function showSection(sectionId) {
    document.querySelectorAll('main > section:not(#qa-section):not(#admin-note-section)').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active-section');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        setTimeout(() => targetSection.classList.add('active-section'), 30);
        currentStep = sectionId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        if (sectionId !== 'qa-section' && sectionId !== 'admin-note-section') {
            // console.error(`Section with id "${sectionId}" not found for dynamic display.`);
        }
    }
}

function goBack() {
    if (currentStep === 'receipt') showSection('paymentInstructions');
    else if (currentStep === 'paymentInstructions') showSection('paymentMethod');
    else if (currentStep === 'paymentMethod') showSection('planList');
    else if (currentStep === 'planList' || currentStep === 'productDetails') showSection('productOptions');
    else if (currentStep === 'productOptions') showSection('home');
}

// --- INITIALIZATION & DYNAMIC CONTENT POPULATION ---
async function initializeSite() {
    const dataLoaded = await fetchData();
    if (!dataLoaded) {
        return; 
    }

    persistentHeader = document.getElementById('persistent-header-message');
    themeSwitcher = document.getElementById('theme-switcher');
    headerBackButton = document.getElementById('header-back-button');

    homeSection = document.getElementById('home');
    productOptionsSection = document.getElementById('productOptions');
    productDetailsSection = document.getElementById('productDetails');
    planListSection = document.getElementById('planList');
    paymentMethodSection = document.getElementById('paymentMethod');
    paymentInstructionsSection = document.getElementById('paymentInstructions');
    receiptSection = document.getElementById('receipt');

    adminNoteSection = document.getElementById('admin-note-section');
    adminNoteTitle = document.getElementById('admin-note-title');
    adminNoteContentDiv = document.getElementById('admin-note-content-div');

    qaSection = document.getElementById('qa-section');
    qaTitle = document.getElementById('qa-title'); 
    qaGridDiv = document.getElementById('qa-grid-div');

    productListDiv = document.getElementById('product-list');
    productOptionsTitle = document.getElementById('product-options-title');
    productDetailsContent = document.getElementById('product-details-content');
    planListContentDiv = document.getElementById('plan-list-content');
    paymentMethodListDiv = document.getElementById('payment-method-list');
    paymentInstructionsContentDiv = document.getElementById('payment-instructions-content');
    receiptContentDiv = document.getElementById('receipt-content');
    copyReceiptButton = document.getElementById('copy-receipt-button');

    loadPersistentHeader();
    loadAdminNote();
    loadFAQ();
    // Footer is hardcoded, so no loadFooter() call

    loadHomepage();
    showSection('home');

    if (themeSwitcher) themeSwitcher.addEventListener('click', toggleTheme);
    loadTheme();
    if (headerBackButton) {
        headerBackButton.addEventListener('click', goBack);
    }

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (!headerBackButton || !homeSection) return;
                let otherDynamicSectionVisible = false;
                document.querySelectorAll('main > section:not(#qa-section):not(#admin-note-section):not(#home)').forEach(s => {
                    if (s.style.display === 'block') {
                        otherDynamicSectionVisible = true;
                    }
                });
                headerBackButton.style.display = otherDynamicSectionVisible ? 'flex' : 'none';
            }
        });
    });
    document.querySelectorAll('main > section:not(#qa-section):not(#admin-note-section)').forEach(section => {
        if(section) observer.observe(section, { attributes: true });
    });
    if (homeSection && headerBackButton) {
        let otherDynamicSectionVisibleInitial = false;
        document.querySelectorAll('main > section:not(#qa-section):not(#admin-note-section):not(#home)').forEach(s => {
            if (s.style.display === 'block') otherDynamicSectionVisibleInitial = true;
        });
        headerBackButton.style.display = otherDynamicSectionVisibleInitial ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', initializeSite);

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDarkMode = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if(themeSwitcher) themeSwitcher.textContent = isDarkMode ? '☀️' : '🌙';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if(themeSwitcher) themeSwitcher.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        if(themeSwitcher) themeSwitcher.textContent = '🌙';
    }
}

function loadPersistentHeader() {
    if (persistentHeader && siteData.siteConfig && siteData.siteConfig.persistentHeaderMessage) {
        persistentHeader.textContent = siteData.siteConfig.persistentHeaderMessage;
    }
}

function loadAdminNote() {
    if (adminNoteSection && siteData.adminNote) {
        if (siteData.adminNote.isVisible && adminNoteTitle && adminNoteContentDiv) {
            adminNoteSection.style.display = 'block'; 
            adminNoteTitle.textContent = siteData.adminNote.title;
            adminNoteContentDiv.innerHTML = ''; 
            siteData.adminNote.content.forEach(paragraphText => {
                const p = document.createElement('p');
                p.textContent = paragraphText;
                adminNoteContentDiv.appendChild(p);
            });
        } else if (adminNoteSection) {
            adminNoteSection.style.display = 'none';
        }
    }
}

function loadFAQ() {
    if (qaGridDiv && siteData.faq) {
        qaGridDiv.innerHTML = ''; 
        if (qaTitle && siteData.faq.length > 0 && qaTitle.textContent === "Frequently Asked Questions") { // Keep static title if preferred
            // qaTitle.textContent = "Frequently Asked Questions"; // Or make title dynamic from JSON if needed
        }

        siteData.faq.forEach(item => {
            const details = document.createElement('details');
            details.className = 'qa-item';
            details.innerHTML = `
                <summary class="qa-question">${item.question}</summary>
                <p class="qa-answer">${item.answer}</p>
            `;
            qaGridDiv.appendChild(details);
        });
    }
}

function loadHomepage() {
    if (!productListDiv || !siteData.products) return;
    productListDiv.innerHTML = '';
    siteData.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-item';
        if (product.isOutOfStock) {
            productCard.classList.add('out-of-stock');
        }
        productCard.innerHTML = `<h4>${product.name}</h4>`;

        if (!product.isOutOfStock) {
            productCard.addEventListener('click', () => {
                selectedProduct = siteData.products.find(p => p.id === product.id);
                loadProductOptions();
            });
        } else {
            productCard.title = "This product is currently out of stock.";
        }
        productListDiv.appendChild(productCard);
    });
}

function loadProductOptions() {
    if (!selectedProduct || !productOptionsTitle) return; 
    productOptionsTitle.innerHTML = `<span>${selectedProduct.name}</span> Options`;
    const detailsButton = document.getElementById('show-details-button');
    const plansButton = document.getElementById('show-plans-button');
    if (detailsButton) detailsButton.onclick = () => loadProductDetails();
    if (plansButton) plansButton.onclick = () => loadPlanList();
    showSection('productOptions');
}

function loadProductDetails() {
    if (!selectedProduct || !productDetailsContent) return;
    productDetailsContent.innerHTML = `
        <h3>Details for <span>${selectedProduct.name}</span></h3>
        <p>${selectedProduct.description || "No details available."}</p>
        <button onclick="showSection('productOptions')" class="button-style secondary-button">&larr; Back to Options</button>
    `;
    showSection('productDetails');
}

function loadPlanList() {
    if (!selectedProduct || !planListContentDiv) return;
    planListContentDiv.innerHTML = `
        <h3>Available Plans for <span>${selectedProduct.name}</span></h3>
        <button onclick="showSection('productOptions')" class="button-style secondary-button" style="margin-bottom: 24px;">&larr; Back to Product Options</button>
        <div class="product-grid"></div>
    `;
    const plansGrid = planListContentDiv.querySelector('.product-grid');
    if (!plansGrid || !selectedProduct.plans) return;

    selectedProduct.plans.forEach(plan => {
        const planCard = document.createElement('div');
        planCard.className = 'plan-item';
        if (plan.isOutOfStock || selectedProduct.isOutOfStock) { 
            planCard.classList.add('out-of-stock');
        }
        planCard.innerHTML = `
            <h4>${plan.name} (${plan.duration})</h4>
            <p>Price:
                <strong>$${plan.price.toFixed(2)}</strong>
                ${plan.mmksPrice ? `<strong>${plan.mmksPrice.toLocaleString()} MMKS</strong>` : ''}
            </p>
        `;
        if (!plan.isOutOfStock && !selectedProduct.isOutOfStock) {
            planCard.addEventListener('click', () => {
                selectedPlan = selectedProduct.plans.find(p => p.id === plan.id);
                loadPaymentMethodSelection();
            });
        } else {
            planCard.title = "This plan is currently out of stock.";
        }
        plansGrid.appendChild(planCard);
    });
    showSection('planList');
}

function loadPaymentMethodSelection() {
    if (!selectedPlan || !paymentMethodListDiv || !siteData.paymentMethods) return;
    paymentMethodListDiv.innerHTML = `
        <h3>Select Payment Method for <span>${selectedPlan.name}</span></h3>
        <button onclick="loadPlanList()" class="button-style secondary-button" style="margin-bottom: 24px;">&larr; Back to Plans</button>
        <div class="product-grid"></div>
    `;
    const methodsGrid = paymentMethodListDiv.querySelector('.product-grid');
    if(!methodsGrid) return;

    siteData.paymentMethods.forEach(method => {
        const methodCard = document.createElement('div');
        methodCard.className = 'payment-method-button';
        methodCard.innerHTML = `<h4>${method.name}</h4>`;
        methodCard.addEventListener('click', () => {
            selectedPaymentMethod = siteData.paymentMethods.find(m => m.id === method.id);
            loadPaymentInstructions();
        });
        methodsGrid.appendChild(methodCard);
    });
    showSection('paymentMethod');
}

function loadPaymentInstructions() {
    if (!selectedPaymentMethod || !selectedPlan || !selectedProduct || !paymentInstructionsContentDiv) return;

    let totalPriceDisplay;
    if (selectedPaymentMethod.id === "kpay" && selectedPlan.mmksPrice !== undefined) {
        totalPriceDisplay = `${selectedPlan.mmksPrice.toLocaleString()} MMKS`;
    } else {
        totalPriceDisplay = `$${selectedPlan.price.toFixed(2)}`;
    }

    let instructionsHTML = `
        <h3>Payment Instructions for <span>${selectedPaymentMethod.name}</span></h3>
        <button onclick="loadPaymentMethodSelection()" class="button-style secondary-button" style="margin-bottom: 20px;">&larr; Back to Payment Methods</button>
        <div class="instructions-box">
            <p><strong>Product:</strong> ${selectedProduct.name}</p>
            <p><strong>Plan:</strong> ${selectedPlan.name} (${selectedPlan.duration})</p>
            <hr>
            <h4>Please transfer the exact amount to:</h4>
    `;
    const instructions = selectedPaymentMethod.instructions || {};
    if (selectedPaymentMethod.id === "kpay") {
        instructionsHTML += `
            <p><strong>Account Name:</strong> ${instructions.accountName || 'N/A'}</p>
            <p><strong>KPay Number:</strong> ${instructions.accountNumber || 'N/A'}</p>
        `;
    } else if (selectedPaymentMethod.id === "binance") {
        if (instructions.uid) {
            instructionsHTML += `<p><strong>Binance UID:</strong> ${instructions.uid}</p>`;
        }
        if (instructions.currency) {
            instructionsHTML += `<p><strong>Accepted Currency:</strong> ${instructions.currency}</p>`;
        }
    }
    instructionsHTML += `<p><em>${instructions.notes || ""}</em></p></div>`;
    instructionsHTML += `<p class="total-price">Total to Pay: ${totalPriceDisplay}</p>`;
    instructionsHTML += `<button id="completed-payment-button" class="button-style primary-button full-width">I've Completed the Payment</button>`;
    paymentInstructionsContentDiv.innerHTML = instructionsHTML;

    const completedButton = document.getElementById('completed-payment-button');
    if (completedButton) {
        completedButton.addEventListener('click', showReceiptAndRedirect);
    }
    showSection('paymentInstructions');
}

function showReceiptAndRedirect() {
    if (!selectedProduct || !selectedPlan || !selectedPaymentMethod || !receiptContentDiv || !copyReceiptButton || !siteData.siteConfig) return;

    let receiptPriceDisplay;
    if (selectedPaymentMethod.id === "kpay" && selectedPlan.mmksPrice !== undefined) {
        receiptPriceDisplay = `${selectedPlan.mmksPrice.toLocaleString()} MMKS`;
    } else {
        receiptPriceDisplay = `$${selectedPlan.price.toFixed(2)}`;
    }

    // Ensure telegramBotLink is a valid URL, defaulting if necessary
    let telegramLink = siteData.siteConfig.telegramBotLink || "#"; 
    if (typeof telegramLink !== 'string' || !telegramLink.startsWith('http')) {
        console.warn("Invalid or missing telegramBotLink in siteConfig. Defaulting to '#'. Actual value:", telegramLink);
        telegramLink = "#"; // Fallback to prevent errors
    }


    const receiptHTML = `
        <h3>Transaction Receipt</h3>
        <p><strong>Status:</strong> Payment Initiated (Pending Confirmation)</p>
        <hr>
        <p><strong>Product:</strong> ${selectedProduct.name}</p>
        <p><strong>Plan:</strong> ${selectedPlan.name} (${selectedPlan.duration})</p>
        <p><strong>Price:</strong> ${receiptPriceDisplay}</p>
        <p><strong>Payment Method:</strong> ${selectedPaymentMethod.name}</p>
        <hr>
        <p>Thank you! Please keep this receipt for your records. Click the button below to contact us on Telegram for order confirmation and assistance.</p>
        <button onclick="window.location.href='${telegramLink}'" class="button-style primary-button full-width" style="margin-top: 20px;">Go to Telegram &rarr;</button>
    `;
    receiptContentDiv.innerHTML = receiptHTML;

    copyReceiptButton.onclick = () => {
        const receiptText = `
Transaction Receipt
Status: Payment Initiated (Pending Confirmation)
--------------------
Product: ${selectedProduct.name}
Plan: ${selectedPlan.name} (${selectedPlan.duration})
Price: ${receiptPriceDisplay}
Payment Method: ${selectedPaymentMethod.name}
--------------------
Thank you!
        `.trim();
        navigator.clipboard.writeText(receiptText).then(() => {
            alert('Receipt copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy receipt: ', err);
            alert('Failed to copy. Please select and copy manually.');
        });
    };
    showSection('receipt');
}