const State = {
    transactions: [],
    settings: {},
    budget: 0,
    currency: {},
    currentFilter: '',
    currentSort: 'date-desc',
    editingId: null,

    init() {
        this.transactions = Storage.loadTransactions();
        this.settings = Storage.loadSettings();
        this.budget = Storage.loadBudget();
        this.currency = Storage.loadCurrency();
        this.setDefaultDate();
    },

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = today;
            dateInput.max = today;
        }
    },

    generateId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `rec_${timestamp}_${random}`;
    },

    addTransaction(transactionData) {
        const result = {
            success: false,
            transaction: null,
            error: ''
        };

        try {
            const transaction = {
                id: this.generateId(),
                description: transactionData.description,
                amount: transactionData.amount,
                category: transactionData.category,
                date: transactionData.date,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.transactions.push(transaction);
            this.saveTransactions();

            result.success = true;
            result.transaction = transaction;

        } catch (error) {
            console.error('Error adding transaction:', error);
            result.error = 'Failed to add transaction';
        }

        return result;
    },

    updateTransaction(id, updateData) {
        const result = {
            success: false,
            error: ''
        };

        try {
            const index = this.transactions.findIndex(t => t.id === id);
            
            if (index === -1) {
                result.error = 'Transaction not found';
                return result;
            }

            // Update transaction fields
            this.transactions[index] = {
                ...this.transactions[index],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            this.saveTransactions();
            result.success = true;

        } catch (error) {
            console.error('Error updating transaction:', error);
            result.error = 'Failed to update transaction';
        }

        return result;
    },

    deleteTransaction(id) {
        const result = {
            success: false,
            error: '',
            deletedTransaction: null
        };

        try {
            const index = this.transactions.findIndex(t => t.id === id);
            
            if (index === -1) {
                result.error = 'Transaction not found';
                return result;
            }

            result.deletedTransaction = this.transactions[index];
            this.transactions.splice(index, 1);
            this.saveTransactions();
            result.success = true;

        } catch (error) {
            console.error('Error deleting transaction:', error);
            result.error = 'Failed to delete transaction';
        }

        return result;
    },

    getTransaction(id) {
        return this.transactions.find(t => t.id === id) || null;
    },

    getAllTransactions() {
        return [...this.transactions];
    },

    getFilteredTransactions(filter = '', sort = 'date-desc') {
        let filtered = [...this.transactions];

        if (filter) {
            const searchResult = Search.searchTransactions(filtered, filter);
            filtered = searchResult.results;
        }

        filtered = this.sortTransactions(filtered, sort);

        return filtered;
    },

    sortTransactions(transactions, sortType) {
        const sorted = [...transactions];

        switch (sortType) {
            case 'date-asc':
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'date-desc':
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'description-asc':
                sorted.sort((a, b) => a.description.localeCompare(b.description));
                break;
            case 'description-desc':
                sorted.sort((a, b) => b.description.localeCompare(a.description));
                break;
            case 'amount-asc':
                sorted.sort((a, b) => a.amount - b.amount);
                break;
            case 'amount-desc':
                sorted.sort((a, b) => b.amount - a.amount);
                break;
            default:
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        return sorted;
    },

    saveTransactions() {
        Storage.saveTransactions(this.transactions);
    },

    getDashboardStats() {
        const stats = {
            totalTransactions: this.transactions.length,
            totalSpent: 0,
            topCategory: null,
            last7Days: [],
            budgetStatus: 'no-budget'
        };

        if (this.transactions.length === 0) {
            return stats;
        }

        // Calculate total spent
        stats.totalSpent = this.transactions.reduce((sum, t) => sum + t.amount, 0);

        // Find top category
        const categoryTotals = {};
        this.transactions.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const topCategory = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)[0];
        
        stats.topCategory = topCategory ? topCategory[0] : null;

        // Get last 7 days data
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayTotal = this.transactions
                .filter(t => t.date === dateStr)
                .reduce((sum, t) => sum + t.amount, 0);
            
            stats.last7Days.push({
                date: dateStr,
                day: date.toLocaleDateString('en', { weekday: 'short' }),
                amount: dayTotal
            });
        }

        // Check budget status
        if (this.budget > 0) {
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const monthlySpent = this.transactions
                .filter(t => t.date.startsWith(currentMonth))
                .reduce((sum, t) => sum + t.amount, 0);

            const remaining = this.budget - monthlySpent;
            
            if (remaining < 0) {
                stats.budgetStatus = 'over';
                stats.budgetRemaining = remaining;
            } else if (remaining < this.budget * 0.1) {
                stats.budgetStatus = 'warning';
                stats.budgetRemaining = remaining;
            } else {
                stats.budgetStatus = 'good';
                stats.budgetRemaining = remaining;
            }
        }

        return stats;
    },

    updateBudget(budget) {
        const result = { success: false, error: '' };

        try {
            if (typeof budget !== 'number' || budget < 0) {
                result.error = 'Invalid budget amount';
                return result;
            }

            this.budget = budget;
            Storage.saveBudget(budget);
            result.success = true;

        } catch (error) {
            console.error('Error updating budget:', error);
            result.error = 'Failed to update budget';
        }

        return result;
    },

    updateCurrency(currency) {
        const result = { success: false, error: '' };

        try {
            if (!currency || typeof currency !== 'object') {
                result.error = 'Invalid currency settings';
                return result;
            }

            this.currency = { ...this.currency, ...currency };
            Storage.saveCurrency(this.currency);
            result.success = true;

        } catch (error) {
            console.error('Error updating currency:', error);
            result.error = 'Failed to update currency';
        }

        return result;
    },

    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        const fromRate = this.currency.rates[fromCurrency] || 1;
        const toRate = this.currency.rates[toCurrency] || 1;
        
        const baseAmount = amount / fromRate;
        return baseAmount * toRate;
    },

    formatCurrency(amount, currencyCode = null) {
        const code = currencyCode || this.currency.base || 'USD';
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            RWF: 'FRw'
        };
        
        const symbol = symbols[code] || code;
        
        if (code === 'RWF') {
            return `${symbol}${Math.round(amount).toLocaleString()}`;
        }
        
        return `${symbol}${amount.toFixed(2)}`;
    },

    clearAllData() {
        const result = { success: false, error: '' };

        try {
            this.transactions = [];
            this.budget = 0;
            this.settings = Storage.getDefaultSettings();
            this.currency = Storage.getDefaultCurrency();
            
            Storage.clearAllData();
            result.success = true;

        } catch (error) {
            console.error('Error clearing data:', error);
            result.error = 'Failed to clear data';
        }

        return result;
    },

    exportData() {
        return Storage.exportData();
    },

    importData(data) {
        const result = Storage.importData(data);
        
        if (result.success) {
            this.transactions = Storage.loadTransactions();
            this.settings = Storage.loadSettings();
            this.budget = Storage.loadBudget();
            this.currency = Storage.loadCurrency();
        }

        return result;
    }
};
