const Validators = {
    patterns: {
        description: /^\S(?:.*\S)?$/,
        amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
        date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
        duplicateWords: /\b(\w+)\s+\1\b/,
        beverageKeywords: /^(?=.*\b(coffee|tea|caffeine|espresso|latte|cappuccino)\b).*$/i,
        hasCents: /\.\d{2}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        currencyCode: /^[A-Z]{3}$/
    },

    validateDescription(value) {
        const result = {
            isValid: false,
            error: '',
            cleanedValue: ''
        };

        if (!value || typeof value !== 'string') {
            result.error = 'Description is required';
            return result;
        }

        // Trim and collapse multiple spaces
        const cleaned = value.trim().replace(/\s+/g, ' ');
        result.cleanedValue = cleaned;

        if (cleaned.length === 0) {
            result.error = 'Description cannot be empty';
            return result;
        }

        if (cleaned.length > 200) {
            result.error = 'Description must be 200 characters or less';
            return result;
        }

        if (!this.patterns.description.test(cleaned)) {
            result.error = 'Description cannot start or end with spaces';
            return result;
        }

        if (this.patterns.duplicateWords.test(cleaned)) {
            result.error = 'Description contains duplicate words';
            return result;
        }

        result.isValid = true;
        return result;
    },

    validateAmount(value) {
        const result = {
            isValid: false,
            error: '',
            numericValue: 0
        };

        if (!value || typeof value !== 'string') {
            result.error = 'Amount is required';
            return result;
        }

        const trimmed = value.trim();

        if (!this.patterns.amount.test(trimmed)) {
            result.error = 'Amount must be a valid number (e.g., 12.50)';
            return result;
        }

        const numeric = parseFloat(trimmed);

        if (isNaN(numeric)) {
            result.error = 'Amount must be a valid number';
            return result;
        }

        if (numeric <= 0) {
            result.error = 'Amount must be greater than 0';
            return result;
        }

        if (numeric > 999999.99) {
            result.error = 'Amount cannot exceed 999,999.99';
            return result;
        }

        result.isValid = true;
        result.numericValue = numeric;
        return result;
    },

    validateDate(value) {
        const result = {
            isValid: false,
            error: '',
            dateObject: null
        };

        if (!value || typeof value !== 'string') {
            result.error = 'Date is required';
            return result;
        }

        const trimmed = value.trim();

        if (!this.patterns.date.test(trimmed)) {
            result.error = 'Date must be in YYYY-MM-DD format';
            return result;
        }

        const date = new Date(trimmed);

        if (isNaN(date.getTime())) {
            result.error = 'Invalid date';
            return result;
        }

        // Check if date is not in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date > today) {
            result.error = 'Date cannot be in the future';
            return result;
        }

        // Check if date is not too old (more than 1 year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        if (date < oneYearAgo) {
            result.error = 'Date cannot be more than 1 year old';
            return result;
        }

        result.isValid = true;
        result.dateObject = date;
        return result;
    },

    validateCategory(value) {
        const result = {
            isValid: false,
            error: '',
            cleanedValue: ''
        };

        if (!value || typeof value !== 'string') {
            result.error = 'Category is required';
            return result;
        }

        const trimmed = value.trim();
        result.cleanedValue = trimmed;

        if (trimmed.length === 0) {
            result.error = 'Category cannot be empty';
            return result;
        }

        if (!this.patterns.category.test(trimmed)) {
            result.error = 'Category can only contain letters, spaces, and hyphens';
            return result;
        }

        if (trimmed.length > 50) {
            result.error = 'Category must be 50 characters or less';
            return result;
        }

        result.isValid = true;
        return result;
    },

    validateBudget(value) {
        const result = {
            isValid: false,
            error: '',
            numericValue: 0
        };

        if (!value || value.trim() === '') {
            result.isValid = true;
            result.numericValue = 0;
            return result;
        }

        const amountResult = this.validateAmount(value);
        if (!amountResult.isValid) {
            result.error = amountResult.error;
            return result;
        }

        result.isValid = true;
        result.numericValue = amountResult.numericValue;
        return result;
    },

    validateCurrencyRate(value) {
        const result = {
            isValid: false,
            error: '',
            numericValue: 0
        };

        if (!value || typeof value !== 'string') {
            result.error = 'Rate is required';
            return result;
        }

        const trimmed = value.trim();

        // Allow decimal rates with up to 6 decimal places
        const ratePattern = /^(0|[1-9]\d*)(\.\d{1,6})?$/;
        
        if (!ratePattern.test(trimmed)) {
            result.error = 'Rate must be a valid number (e.g., 0.85)';
            return result;
        }

        const numeric = parseFloat(trimmed);

        if (isNaN(numeric)) {
            result.error = 'Rate must be a valid number';
            return result;
        }

        if (numeric <= 0) {
            result.error = 'Rate must be greater than 0';
            return result;
        }

        if (numeric > 10000) {
            result.error = 'Rate seems too high';
            return result;
        }

        result.isValid = true;
        result.numericValue = numeric;
        return result;
    },

    validateTransactionForm(formData) {
        const result = {
            isValid: true,
            errors: {},
            cleanedData: {}
        };

        const descResult = this.validateDescription(formData.description);
        if (!descResult.isValid) {
            result.errors.description = descResult.error;
            result.isValid = false;
        } else {
            result.cleanedData.description = descResult.cleanedValue;
        }

        const amountResult = this.validateAmount(formData.amount);
        if (!amountResult.isValid) {
            result.errors.amount = amountResult.error;
            result.isValid = false;
        } else {
            result.cleanedData.amount = amountResult.numericValue;
        }

        const categoryResult = this.validateCategory(formData.category);
        if (!categoryResult.isValid) {
            result.errors.category = categoryResult.error;
            result.isValid = false;
        } else {
            result.cleanedData.category = categoryResult.cleanedValue;
        }

        const dateResult = this.validateDate(formData.date);
        if (!dateResult.isValid) {
            result.errors.date = dateResult.error;
            result.isValid = false;
        } else {
            result.cleanedData.date = formData.date;
        }

        return result;
    },

    testSearchPattern(pattern, caseInsensitive = false) {
        const result = {
            isValid: false,
            error: '',
            regex: null
        };

        if (!pattern || typeof pattern !== 'string') {
            result.error = 'Search pattern is required';
            return result;
        }

        try {
            const flags = caseInsensitive ? 'gi' : 'g';
            result.regex = new RegExp(pattern, flags);
            result.isValid = true;
        } catch (error) {
            result.error = 'Invalid regex pattern: ' + error.message;
        }

        return result;
    },

    hasBeverageKeywords(text) {
        return this.patterns.beverageKeywords.test(text);
    },

    hasCents(amount) {
        return this.patterns.hasCents.test(amount.toString());
    },

     getPatternDocumentation() {
        return {
            description: {
                pattern: this.patterns.description.source,
                description: 'No leading/trailing spaces, collapse multiple spaces'
            },
            amount: {
                pattern: this.patterns.amount.source,
                description: 'Valid amount with optional 2 decimal places'
            },
            date: {
                pattern: this.patterns.date.source,
                description: 'Date in YYYY-MM-DD format'
            },
            category: {
                pattern: this.patterns.category.source,
                description: 'Letters, spaces, and hyphens only'
            },
            duplicateWords: {
                pattern: this.patterns.duplicateWords.source,
                description: 'Advanced: Detects duplicate words using back-reference'
            },
            beverageKeywords: {
                pattern: this.patterns.beverageKeywords.source,
                description: 'Advanced: Detects beverage keywords using lookahead'
            },
            hasCents: {
                pattern: this.patterns.hasCents.source,
                description: 'Advanced: Detects amounts with exactly 2 decimal places'
            }
        };
    }
};
