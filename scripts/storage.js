const Storage = {
  KEYS: {
    TRANSACTIONS: "student_finance_transactions",
    SETTINGS: "student_finance_settings",
    BUDGET: "student_finance_budget",
    CURRENCY: "student_finance_currency",
  },

  saveTransactions(transactions) {
    try {
      localStorage.setItem(
        this.KEYS.TRANSACTIONS,
        JSON.stringify(transactions),
      );
      return true;
    } catch (error) {
      console.error("Error saving transactions:", error);
      return false;
    }
  },

  loadTransactions() {
    try {
      const data = localStorage.getItem(this.KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading transactions:", error);
      return [];
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      return false;
    }
  },

  loadSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch (error) {
      console.error("Error loading settings:", error);
      return this.getDefaultSettings();
    }
  },

  saveBudget(budget) {
    try {
      localStorage.setItem(this.KEYS.BUDGET, JSON.stringify(budget));
      return true;
    } catch (error) {
      console.error("Error saving budget:", error);
      return false;
    }
  },

  loadBudget() {
    try {
      const data = localStorage.getItem(this.KEYS.BUDGET);
      return data ? JSON.parse(data) : 0;
    } catch (error) {
      console.error("Error loading budget:", error);
      return 0;
    }
  },

  saveCurrency(currency) {
    try {
      localStorage.setItem(this.KEYS.CURRENCY, JSON.stringify(currency));
      return true;
    } catch (error) {
      console.error("Error saving currency:", error);
      return false;
    }
  },

  loadCurrency() {
    try {
      const data = localStorage.getItem(this.KEYS.CURRENCY);
      return data ? JSON.parse(data) : this.getDefaultCurrency();
    } catch (error) {
      console.error("Error loading currency:", error);
      return this.getDefaultCurrency();
    }
  },

  getDefaultSettings() {
    return {
      theme: "light",
      dateFormat: "YYYY-MM-DD",
      currency: "USD",
    };
  },

  getDefaultCurrency() {
    return {
      base: "USD",
      rates: {
        USD: 1.0,
        EUR: 0.85,
        GBP: 0.75,
        RWF: 1300,
      },
    };
  },

  clearAllData() {
    try {
      Object.values(this.KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error("Error clearing data:", error);
      return false;
    }
  },

  exportData() {
    return {
      transactions: this.loadTransactions(),
      settings: this.loadSettings(),
      budget: this.loadBudget(),
      currency: this.loadCurrency(),
      exportDate: new Date().toISOString(),
      version: "1.0",
    };
  },

  importData(data) {
    const result = {
      success: false,
      messages: [],
      imported: {
        transactions: 0,
        settings: false,
        budget: false,
        currency: false,
      },
    };

    try {
      // Validate data structure
      if (!data || typeof data !== "object") {
        result.messages.push("Invalid data format");
        return result;
      }

      // Import transactions
      if (data.transactions && Array.isArray(data.transactions)) {
        const validTransactions = data.transactions.filter((transaction) =>
          this.validateTransaction(transaction),
        );

        if (validTransactions.length > 0) {
          this.saveTransactions(validTransactions);
          result.imported.transactions = validTransactions.length;
          result.messages.push(
            `Imported ${validTransactions.length} transactions`,
          );
        } else {
          result.messages.push("No valid transactions found");
        }
      }

      // Import settings
      if (data.settings && typeof data.settings === "object") {
        this.saveSettings(data.settings);
        result.imported.settings = true;
        result.messages.push("Settings imported");
      }

      // Import budget
      if (typeof data.budget === "number" && data.budget >= 0) {
        this.saveBudget(data.budget);
        result.imported.budget = true;
        result.messages.push("Budget imported");
      }

      // Import currency
      if (data.currency && typeof data.currency === "object") {
        this.saveCurrency(data.currency);
        result.imported.currency = true;
        result.messages.push("Currency settings imported");
      }

      result.success =
        result.imported.transactions > 0 ||
        result.imported.settings ||
        result.imported.budget ||
        result.imported.currency;
    } catch (error) {
      console.error("Error importing data:", error);
      result.messages.push("Error during import: " + error.message);
    }

    return result;
  },

  /**
   * Validate transaction object structure
   * @param {Object} transaction - Transaction object to validate
   * @returns {boolean} True if valid
   */
  validateTransaction(transaction) {
    return (
      transaction &&
      typeof transaction.id === "string" &&
      typeof transaction.description === "string" &&
      typeof transaction.amount === "number" &&
      typeof transaction.category === "string" &&
      typeof transaction.date === "string" &&
      typeof transaction.createdAt === "string" &&
      typeof transaction.updatedAt === "string"
    );
  },

  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getStorageInfo() {
    const info = {
      total: 0,
      used: 0,
      available: 0,
      details: {},
    };

    try {
      // Calculate total localStorage size (approximate)
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }

      info.used = totalSize;
      // Most browsers have 5-10MB limit, we'll use 5MB as conservative estimate
      info.total = 5 * 1024 * 1024; // 5MB in bytes
      info.available = info.total - info.used;

      // Get details for our app's keys
      Object.values(this.KEYS).forEach((key) => {
        const value = localStorage.getItem(key);
        if (value) {
          info.details[key] = {
            size: value.length + key.length,
            items:
              key === this.KEYS.TRANSACTIONS ? JSON.parse(value).length : 1,
          };
        }
      });
    } catch (error) {
      console.error("Error getting storage info:", error);
    }

    return info;
  },
};
