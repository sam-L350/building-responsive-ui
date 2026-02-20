/**
 * UI module for handling DOM manipulation and user interface updates
 * Manages page navigation, form handling, and visual updates
 */

const UI = {
    currentPage: 'about',
    editingTransaction: null,

    /**
     * Initialize UI components
     */
    init() {
        this.setupNavigation();
        this.setupMobileNavigation();
        this.setupForms();
        this.setupSettings();
        this.setupEventListeners();
        this.showPage('about');
    },

    /**
     * Setup navigation
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
                this.updateActiveNav(link);
            });
        });
    },

    /**
     * Setup mobile navigation
     */
    setupMobileNavigation() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const mobileNavClose = document.getElementById('mobile-nav-close');
        const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
        const mobileNav = document.getElementById('mobile-nav');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

        // Toggle mobile menu
        const toggleMobileMenu = (show) => {
            if (hamburgerBtn) {
                hamburgerBtn.setAttribute('aria-expanded', show);
            }
            if (mobileNav) {
                mobileNav.classList.toggle('active', show);
            }
            if (mobileNavOverlay) {
                mobileNavOverlay.classList.toggle('active', show);
            }
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = show ? 'hidden' : '';
        };

        // Hamburger button click
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', () => {
                const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
                toggleMobileMenu(!isExpanded);
            });
        }

        // Close button click
        if (mobileNavClose) {
            mobileNavClose.addEventListener('click', () => {
                toggleMobileMenu(false);
            });
        }

        // Overlay click
        if (mobileNavOverlay) {
            mobileNavOverlay.addEventListener('click', () => {
                toggleMobileMenu(false);
            });
        }

        // Mobile nav links click
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
                this.updateActiveNav(link);
                this.updateMobileActiveNav(link);
                toggleMobileMenu(false);
            });
        });

        // Escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const isMenuOpen = hamburgerBtn?.getAttribute('aria-expanded') === 'true';
                if (isMenuOpen) {
                    toggleMobileMenu(false);
                    hamburgerBtn?.focus();
                }
            }
        });
    },

    /**
     * Show a specific page
     * @param {string} pageName - Page name to show
     */
    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.page-section');
        pages.forEach(page => page.classList.add('hidden'));

        // Show selected page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            this.currentPage = pageName;
            
            // Update page-specific content
            this.updatePageContent(pageName);
        }
    },

    /**
     * Update active navigation link
     * @param {HTMLElement} activeLink - Active navigation link
     */
    updateActiveNav(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
        
        // Also update mobile nav if it exists (without recursion)
        const page = activeLink.dataset.page;
        const mobileLink = document.querySelector(`.mobile-nav-link[data-page="${page}"]`);
        if (mobileLink && !mobileLink.classList.contains('active')) {
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
            mobileNavLinks.forEach(link => link.classList.remove('active'));
            mobileLink.classList.add('active');
        }
    },

    /**
     * Update active mobile navigation link
     * @param {HTMLElement} activeLink - Active mobile navigation link
     */
    updateMobileActiveNav(activeLink) {
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
        
        // Also update desktop nav if it exists (without recursion)
        const page = activeLink.dataset.page;
        const desktopLink = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (desktopLink && !desktopLink.classList.contains('active')) {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => link.classList.remove('active'));
            desktopLink.classList.add('active');
        }
    },

    /**
     * Update page-specific content
     * @param {string} pageName - Page name
     */
    updatePageContent(pageName) {
        switch (pageName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'records':
                this.updateRecordsTable();
                break;
            case 'settings':
                this.updateSettingsPage();
                break;
        }
    },

    /**
     * Update dashboard with current statistics
     */
    updateDashboard() {
        const stats = State.getDashboardStats();
        
        // Update stat cards
        this.updateElement('total-transactions', stats.totalTransactions);
        this.updateElement('total-spent', State.formatCurrency(stats.totalSpent));
        this.updateElement('top-category', stats.topCategory || 'None');
        
        // Update budget status
        this.updateBudgetStatus(stats);
        
        // Update trend chart
        this.updateTrendChart(stats.last7Days);
    },

    /**
     * Update budget status display
     * @param {Object} stats - Dashboard statistics
     */
    updateBudgetStatus(stats) {
        const budgetStatusEl = document.getElementById('budget-status');
        const budgetAlertEl = document.getElementById('budget-alert');
        
        if (stats.budgetStatus === 'no-budget') {
            budgetStatusEl.textContent = 'No budget set';
            budgetAlertEl.className = 'budget-alert hidden';
        } else {
            const remaining = Math.abs(stats.budgetRemaining);
            const formattedRemaining = State.formatCurrency(remaining);
            
            switch (stats.budgetStatus) {
                case 'good':
                    budgetStatusEl.textContent = `${formattedRemaining} remaining`;
                    budgetAlertEl.className = 'budget-alert success';
                    budgetAlertEl.textContent = `Great! You have ${formattedRemaining} left in your budget.`;
                    budgetAlertEl.setAttribute('aria-live', 'polite');
                    break;
                case 'warning':
                    budgetStatusEl.textContent = `${formattedRemaining} remaining`;
                    budgetAlertEl.className = 'budget-alert warning';
                    budgetAlertEl.textContent = `Warning: Only ${formattedRemaining} left in your budget.`;
                    budgetAlertEl.setAttribute('aria-live', 'polite');
                    break;
                case 'over':
                    budgetStatusEl.textContent = `${formattedRemaining} over`;
                    budgetAlertEl.className = 'budget-alert danger';
                    budgetAlertEl.textContent = `Alert: You are ${formattedRemaining} over your budget!`;
                    budgetAlertEl.setAttribute('aria-live', 'assertive');
                    break;
            }
        }
    },

    /**
     * Update trend chart
     * @param {Array} data - Last 7 days data
     */
    updateTrendChart(data) {
        const chartContainer = document.getElementById('trend-chart');
        if (!chartContainer) return;

        // Clear existing chart
        chartContainer.innerHTML = '';

        if (!data || data.length === 0) {
            chartContainer.innerHTML = '<p>No data available</p>';
            return;
        }

        // Find max amount for scaling
        const maxAmount = Math.max(...data.map(d => d.amount));
        
        // Create chart bars
        data.forEach(day => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            
            const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
            bar.style.height = `${Math.max(height, 2)}%`;
            
            bar.setAttribute('data-day', day.day);
            bar.setAttribute('title', `${day.day}: ${State.formatCurrency(day.amount)}`);
            
            chartContainer.appendChild(bar);
        });
    },

    /**
     * Update records table
     */
    updateRecordsTable() {
        const tbody = document.getElementById('records-tbody');
        const noRecordsEl = document.getElementById('no-records');
        
        if (!tbody) return;

        // Get current filter and sort
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const caseInsensitive = document.getElementById('case-insensitive')?.checked || false;
        
        const filter = searchInput ? searchInput.value : '';
        const sort = sortSelect ? sortSelect.value : 'date-desc';
        
        // Get filtered transactions
        const transactions = State.getFilteredTransactions(filter, sort);
        
        // Clear table
        tbody.innerHTML = '';

        if (transactions.length === 0) {
            tbody.classList.add('hidden');
            if (noRecordsEl) noRecordsEl.classList.remove('hidden');
            return;
        }

        tbody.classList.remove('hidden');
        if (noRecordsEl) noRecordsEl.classList.add('hidden');

        // Populate table
        transactions.forEach(transaction => {
            const row = this.createTransactionRow(transaction);
            tbody.appendChild(row);
        });
    },

    /**
     * Create table row for transaction
     * @param {Object} transaction - Transaction object
     * @returns {HTMLElement} Table row element
     */
    createTransactionRow(transaction) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', transaction.id);
        row.setAttribute('tabindex', '0');
        
        // Use highlighted text if available, otherwise use original
        const description = transaction.highlighted?.description || transaction.description;
        const amount = transaction.highlighted?.amount || transaction.amount;
        const category = transaction.highlighted?.category || transaction.category;
        const date = transaction.highlighted?.date || transaction.date;

        row.innerHTML = `
            <td>${description}</td>
            <td>${State.formatCurrency(transaction.amount)}</td>
            <td>${category}</td>
            <td>${date}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon edit" data-id="${transaction.id}" aria-label="Edit transaction">Edit</button>
                    <button class="btn-icon delete" data-id="${transaction.id}" aria-label="Delete transaction">Delete</button>
                </div>
            </td>
        `;

        // Add event listeners
        const editBtn = row.querySelector('.edit');
        const deleteBtn = row.querySelector('.delete');

        editBtn.addEventListener('click', () => this.editTransaction(transaction.id));
        deleteBtn.addEventListener('click', () => this.deleteTransaction(transaction.id));

        return row;
    },

    /**
     * Edit transaction
     * @param {string} id - Transaction ID
     */
    editTransaction(id) {
        const transaction = State.getTransaction(id);
        if (!transaction) return;

        // Switch to add page
        this.showPage('add');
        this.updateActiveNav(document.querySelector('[data-page="add"]'));

        // Populate form
        const form = document.getElementById('transaction-form');
        if (form) {
            document.getElementById('description').value = transaction.description;
            document.getElementById('amount').value = transaction.amount;
            document.getElementById('category').value = transaction.category;
            document.getElementById('date').value = transaction.date;
            
            // Change submit button text
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Transaction';
            
            // Store editing ID
            this.editingTransaction = id;
        }
    },

    /**
     * Delete transaction with confirmation
     * @param {string} id - Transaction ID
     */
    deleteTransaction(id) {
        const transaction = State.getTransaction(id);
        if (!transaction) return;

        if (confirm(`Are you sure you want to delete "${transaction.description}"?`)) {
            const result = State.deleteTransaction(id);
            
            if (result.success) {
                this.showStatusMessage('Transaction deleted successfully', 'success');
                this.updateRecordsTable();
                this.updateDashboard();
            } else {
                this.showStatusMessage('Failed to delete transaction', 'error');
            }
        }
    },

    /**
     * Setup forms
     */
    setupForms() {
        const transactionForm = document.getElementById('transaction-form');
        if (!transactionForm) return;

        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransactionForm();
        });

        transactionForm.addEventListener('reset', () => {
            this.clearFormErrors();
            this.editingTransaction = null;
            const submitBtn = transactionForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Add Transaction';
        });
    },

    /**
     * Handle transaction form submission
     */
    async handleTransactionForm() {
        const form = document.getElementById('transaction-form');
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        const transactionData = {
            description: formData.get('description'),
            amount: formData.get('amount'),
            category: formData.get('category'),
            date: formData.get('date')
        };

        // Validate form
        const validation = Validators.validateTransactionForm(transactionData);
        
        if (!validation.isValid) {
            this.showFormErrors(validation.errors);
            if (submitBtn) this.shakeButton(submitBtn);
            return;
        }

        // Clear errors
        this.clearFormErrors();

        // Add loading state
        if (submitBtn) this.setButtonLoading(submitBtn, true);

        try {
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 300));

            let result;
            if (this.editingTransaction) {
                // Update existing transaction
                result = State.updateTransaction(this.editingTransaction, validation.cleanedData);
                if (result.success) {
                    this.showStatusMessage('Transaction updated successfully', 'success');
                    if (submitBtn) this.setButtonSuccess(submitBtn);
                }
            } else {
                // Add new transaction
                result = State.addTransaction(validation.cleanedData);
                if (result.success) {
                    this.showStatusMessage('Transaction added successfully', 'success');
                    if (submitBtn) this.setButtonSuccess(submitBtn);
                }
            }

            if (result.success) {
                form.reset();
                this.editingTransaction = null;
                if (submitBtn) {
                    submitBtn.textContent = 'Add Transaction';
                    setTimeout(() => {
                        this.setButtonSuccess(submitBtn, false);
                    }, 1500);
                }
                
                // Update UI
                this.updateRecordsTable();
                this.updateDashboard();
                
                // Switch to records page
                this.showPage('records');
                this.updateActiveNav(document.querySelector('[data-page="records"]'));
            } else {
                this.showStatusMessage(result.error || 'Failed to save transaction', 'error');
                if (submitBtn) this.shakeButton(submitBtn);
            }
        } catch (error) {
            this.showStatusMessage('An error occurred while saving', 'error');
            if (submitBtn) this.shakeButton(submitBtn);
        } finally {
            if (submitBtn) this.setButtonLoading(submitBtn, false);
        }
    },

    /**
     * Show form errors
     * @param {Object} errors - Error object
     */
    showFormErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const input = document.getElementById(field);
            const errorEl = document.getElementById(`${field}-error`);
            
            if (input) input.classList.add('error');
            if (errorEl) errorEl.textContent = message;
        });
    },

    /**
     * Clear form errors
     */
    clearFormErrors() {
        const inputs = document.querySelectorAll('.error');
        const errorMessages = document.querySelectorAll('.error-message');
        
        inputs.forEach(input => input.classList.remove('error'));
        errorMessages.forEach(msg => msg.textContent = '');
    },

    /**
     * Setup settings page
     */
    setupSettings() {
        // Budget save
        const saveBudgetBtn = document.getElementById('save-budget');
        if (saveBudgetBtn) {
            saveBudgetBtn.addEventListener('click', () => this.saveBudget());
        }

        // Currency save
        const saveRatesBtn = document.getElementById('save-rates');
        if (saveRatesBtn) {
            saveRatesBtn.addEventListener('click', () => this.saveCurrencyRates());
        }

        // Data management
        const exportBtn = document.getElementById('export-json');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        const importBtn = document.getElementById('import-json');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importData());
        }

        const clearDataBtn = document.getElementById('clear-data');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }
    },

    /**
     * Update settings page with current values
     */
    updateSettingsPage() {
        // Budget
        const budgetCap = document.getElementById('budget-cap');
        if (budgetCap) {
            budgetCap.value = State.budget > 0 ? State.budget : '';
        }

        // Currency
        const baseCurrency = document.getElementById('base-currency');
        if (baseCurrency) {
            baseCurrency.value = State.currency.base || 'USD';
        }

        const rateUsd = document.getElementById('rate-usd');
        const rateEur = document.getElementById('rate-eur');
        const rateGbp = document.getElementById('rate-gbp');
        const rateRwf = document.getElementById('rate-rwf');

        if (rateUsd) rateUsd.value = State.currency.rates?.USD || 1.00;
        if (rateEur) rateEur.value = State.currency.rates?.EUR || 0.85;
        if (rateGbp) rateGbp.value = State.currency.rates?.GBP || 0.75;
        if (rateRwf) rateRwf.value = State.currency.rates?.RWF || 1300;
    },

    /**
     * Save budget
     */
    async saveBudget() {
        const budgetInput = document.getElementById('budget-cap');
        const saveBtn = document.getElementById('save-budget');
        if (!budgetInput || !saveBtn) return;

        const validation = Validators.validateBudget(budgetInput.value);
        
        if (!validation.isValid) {
            this.showSettingsStatus(validation.error, 'error');
            this.shakeButton(saveBtn);
            return;
        }

        // Add loading state
        this.setButtonLoading(saveBtn, true);
        
        try {
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const result = State.updateBudget(validation.numericValue);
            
            if (result.success) {
                this.showSettingsStatus('Budget saved successfully', 'success');
                this.setButtonSuccess(saveBtn);
                this.updateDashboard();
                setTimeout(() => {
                    this.setButtonSuccess(saveBtn, false);
                }, 2000);
            } else {
                this.showSettingsStatus(result.error, 'error');
                this.shakeButton(saveBtn);
            }
        } catch (error) {
            this.showSettingsStatus('Failed to save budget', 'error');
            this.shakeButton(saveBtn);
        } finally {
            this.setButtonLoading(saveBtn, false);
        }
    },

    /**
     * Save currency rates
     */
    async saveCurrencyRates() {
        const baseCurrency = document.getElementById('base-currency')?.value || 'USD';
        const rateUsd = document.getElementById('rate-usd')?.value || '1.00';
        const rateEur = document.getElementById('rate-eur')?.value || '0.85';
        const rateGbp = document.getElementById('rate-gbp')?.value || '0.75';
        const rateRwf = document.getElementById('rate-rwf')?.value || '1300';
        const saveBtn = document.getElementById('save-rates');

        // Validate rates
        const usdValidation = Validators.validateCurrencyRate(rateUsd);
        const eurValidation = Validators.validateCurrencyRate(rateEur);
        const gbpValidation = Validators.validateCurrencyRate(rateGbp);
        const rwfValidation = Validators.validateCurrencyRate(rateRwf);

        if (!usdValidation.isValid || !eurValidation.isValid || !gbpValidation.isValid || !rwfValidation.isValid) {
            this.showSettingsStatus('Invalid currency rates', 'error');
            if (saveBtn) this.shakeButton(saveBtn);
            return;
        }

        // Add loading state
        if (saveBtn) this.setButtonLoading(saveBtn, true);

        try {
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 500));

            const currencyData = {
                base: baseCurrency,
                rates: {
                    USD: usdValidation.numericValue,
                    EUR: eurValidation.numericValue,
                    GBP: gbpValidation.numericValue,
                    RWF: rwfValidation.numericValue
                }
            };

            const result = State.updateCurrency(currencyData);
            
            if (result.success) {
                this.showSettingsStatus('Currency rates saved successfully', 'success');
                if (saveBtn) this.setButtonSuccess(saveBtn);
                this.updateRecordsTable();
                this.updateDashboard();
                setTimeout(() => {
                    if (saveBtn) this.setButtonSuccess(saveBtn, false);
                }, 2000);
            } else {
                this.showSettingsStatus(result.error, 'error');
                if (saveBtn) this.shakeButton(saveBtn);
            }
        } catch (error) {
            this.showSettingsStatus('Failed to save currency rates', 'error');
            if (saveBtn) this.shakeButton(saveBtn);
        } finally {
            if (saveBtn) this.setButtonLoading(saveBtn, false);
        }
    },

    /**
     * Export data
     */
    exportData() {
        try {
            const data = State.exportData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `student-finance-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSettingsStatus('Data exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showSettingsStatus('Failed to export data', 'error');
        }
    },

    /**
     * Import data
     */
    importData() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput) return;

        fileInput.click();
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const result = State.importData(data);
                    
                    if (result.success) {
                        this.showSettingsStatus(
                            `Import successful: ${result.messages.join(', ')}`, 
                            'success'
                        );
                        this.updateAllPages();
                    } else {
                        this.showSettingsStatus(
                            `Import failed: ${result.messages.join(', ')}`, 
                            'error'
                        );
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    this.showSettingsStatus('Failed to parse JSON file', 'error');
                }
                
                // Clear file input
                fileInput.value = '';
            };
            
            reader.readAsText(file);
        });
    },

    /**
     * Clear all data
     */
    async clearAllData() {
        const clearBtn = document.getElementById('clear-data');
        
        if (confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
            if (clearBtn) this.setButtonLoading(clearBtn, true);
            
            try {
                // Simulate async operation
                await new Promise(resolve => setTimeout(resolve, 800));
                
                const result = State.clearAllData();
                
                if (result.success) {
                    this.showSettingsStatus('All data cleared successfully', 'success');
                    if (clearBtn) this.setButtonSuccess(clearBtn);
                    this.updateAllPages();
                    setTimeout(() => {
                        if (clearBtn) this.setButtonSuccess(clearBtn, false);
                    }, 2000);
                } else {
                    this.showSettingsStatus(result.error, 'error');
                    if (clearBtn) this.shakeButton(clearBtn);
                }
            } catch (error) {
                this.showSettingsStatus('Failed to clear data', 'error');
                if (clearBtn) this.shakeButton(clearBtn);
            } finally {
                if (clearBtn) this.setButtonLoading(clearBtn, false);
            }
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const caseInsensitiveCheckbox = document.getElementById('case-insensitive');
        const sortSelect = document.getElementById('sort-select');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.updateRecordsTable());
        }

        if (caseInsensitiveCheckbox) {
            caseInsensitiveCheckbox.addEventListener('change', () => this.updateRecordsTable());
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.updateRecordsTable());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.editingTransaction) {
                const form = document.getElementById('transaction-form');
                if (form) form.reset();
                this.editingTransaction = null;
            }
        });
    },

    /**
     * Update all pages
     */
    updateAllPages() {
        this.updateDashboard();
        this.updateRecordsTable();
        this.updateSettingsPage();
    },

    /**
     * Show status message
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, error)
     */
    showStatusMessage(message, type) {
        const statusEl = document.getElementById('form-status');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `form-status ${type}`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'form-status';
        }, 3000);
    },

    /**
     * Show settings status message
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, error)
     */
    showSettingsStatus(message, type) {
        const statusEl = document.getElementById('settings-status');
        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = `settings-status ${type}`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'settings-status';
        }, 3000);
    },

    /**
     * Update element content safely
     * @param {string} id - Element ID
     * @param {string} content - Content to set
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    },

    /**
     * Set button loading state
     * @param {HTMLElement} button - Button element
     * @param {boolean} loading - Whether to show loading state
     */
    setButtonLoading(button, loading) {
        if (!button) return;
        
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            const originalText = button.textContent;
            button.setAttribute('data-original-text', originalText);
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.textContent = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    },

    /**
     * Set button success state
     * @param {HTMLElement} button - Button element
     * @param {boolean} success - Whether to show success state
     */
    setButtonSuccess(button, success = true) {
        if (!button) return;
        
        if (success) {
            button.classList.add('success');
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.textContent = 'Success!';
            }
        } else {
            button.classList.remove('success');
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.textContent = originalText;
            }
        }
    },

    /**
     * Shake button for error feedback
     * @param {HTMLElement} button - Button element
     */
    shakeButton(button) {
        if (!button) return;
        
        button.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 500);
    }
};
