const Search = {
    currentPattern: '',
    currentRegex: null,
    caseInsensitive: false,

    searchTransactions(transactions, pattern, caseInsensitive = false) {
        const result = {
            success: false,
            error: '',
            pattern: pattern,
            results: [],
            totalMatches: 0,
            highlightedResults: []
        };

        if (!pattern || pattern.trim() === '') {
            result.success = true;
            result.results = transactions;
            return result;
        }

        const patternResult = Validators.testSearchPattern(pattern, caseInsensitive);
        
        if (!patternResult.isValid) {
            result.error = patternResult.error;
            return result;
        }

        this.currentPattern = pattern;
        this.currentRegex = patternResult.regex;
        this.caseInsensitive = caseInsensitive;

        try {
            const matches = [];
            let totalMatchCount = 0;

            transactions.forEach(transaction => {
                const matchResult = this.searchTransaction(transaction, this.currentRegex);
                
                if (matchResult.matches) {
                    matches.push({
                        ...transaction,
                        highlighted: matchResult.highlighted,
                        matchCount: matchResult.matchCount
                    });
                    totalMatchCount += matchResult.matchCount;
                }
            });

            result.success = true;
            result.results = matches;
            result.totalMatches = totalMatchCount;
            result.highlightedResults = matches.map(t => t.highlighted);

        } catch (error) {
            console.error('Error during search:', error);
            result.error = 'Search failed: ' + error.message;
        }

        return result;
    },

    searchTransaction(transaction, regex) {
        const searchableText = [
            transaction.description,
            transaction.amount.toString(),
            transaction.category,
            transaction.date
        ].join(' ').toLowerCase();

        const matches = regex.test(searchableText);
        
        if (!matches) {
            return { matches: false, highlighted: null, matchCount: 0 };
        }

        const highlighted = {
            description: this.highlightText(transaction.description, regex),
            amount: this.highlightText(transaction.amount.toString(), regex),
            category: this.highlightText(transaction.category, regex),
            date: this.highlightText(transaction.date, regex)
        };

        const matchCount = (
            (transaction.description.match(regex) || []).length +
            (transaction.amount.toString().match(regex) || []).length +
            (transaction.category.match(regex) || []).length +
            (transaction.date.match(regex) || []).length
        );

        return {
            matches: true,
            highlighted: highlighted,
            matchCount: matchCount
        };
    },

    highlightText(text, regex) {
        if (!text || !regex) return text;

        try {
            regex.lastIndex = 0;
            
            return text.replace(regex, (match) => {
                return `<mark>${match}</mark>`;
            });
        } catch (error) {
            console.error('Error highlighting text:', error);
            return text;
        }
    },

    getSearchSuggestions() {
        return [
            {
                pattern: '/\\d{2}$/',
                description: 'Amounts ending with two digits',
                example: 'Finds amounts like 12.50, 25.00'
            },
            {
                pattern: '/\\.(coffee|tea)/i',
                description: 'Beverage purchases',
                example: 'Finds "coffee" or "tea" in any case'
            },
            {
                pattern: '/\\b(\\w+)\\s+\\1\\b/',
                description: 'Duplicate words',
                example: 'Finds "coffee coffee" or "lunch lunch"'
            },
            {
                pattern: '/^Food/i',
                description: 'Category starting with "Food"',
                example: 'Finds transactions in Food category'
            },
            {
                pattern: '/\\d{4}-\\d{2}-\\d{2}/',
                description: 'Date patterns',
                example: 'Finds any date in YYYY-MM-DD format'
            },
            {
                pattern: '/\\b\\d{1,3}\\.\\d{2}\\b/',
                description: 'Specific amount format',
                example: 'Finds amounts like 12.50, 99.99'
            },
            {
                pattern: '/(lunch|dinner|breakfast)/i',
                description: 'Meal types',
                example: 'Finds meal-related transactions'
            },
            {
                pattern: '/\\b[0-9]{1,2}\\b/',
                description: 'Single or double digit numbers',
                example: 'Finds amounts under 100'
            }
        ];
    },

    validatePattern(pattern) {
        const result = {
            isValid: false,
            error: '',
            regex: null
        };

        if (!pattern || typeof pattern !== 'string') {
            result.error = 'Pattern is required';
            return result;
        }

        try {
            new RegExp(pattern);
            result.isValid = true;
        } catch (error) {
            result.error = 'Invalid regex pattern: ' + error.message;
        }

        return result;
    },

    getAdvancedPatterns() {
        return [
            {
                name: 'Beverage Detection',
                pattern: '^(?=.*\\b(coffee|tea|caffeine|espresso|latte|cappuccino)\\b).*$',
                flags: 'i',
                description: 'Uses lookahead to find beverage keywords'
            },
            {
                name: 'Duplicate Words',
                pattern: '\\b(\\w+)\\s+\\1\\b',
                flags: 'g',
                description: 'Uses back-reference to find duplicate words'
            },
            {
                name: 'Cents Detection',
                pattern: '\\.\\d{2}$',
                flags: '',
                description: 'Finds amounts with exactly 2 decimal places'
            },
            {
                name: 'Amount Range',
                pattern: '\\b([1-9]\\d{0,2}|1000)\\.\\d{2}\\b',
                flags: '',
                description: 'Amounts between 1.00 and 1000.00'
            },
            {
                name: 'Weekend Pattern',
                pattern: '\\d{4}-\\d{2}-(0[6-7]|1[3-4]|2[0-1]|2[7-8])',
                flags: '',
                description: 'Finds weekend dates (simplified)'
            }
        ];
    },

    searchByCategory(transactions, category) {
        if (!category) return transactions;
        
        return transactions.filter(t => 
            t.category.toLowerCase() === category.toLowerCase()
        );
    },

    searchByDateRange(transactions, startDate, endDate) {
        if (!startDate && !endDate) return transactions;
        
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                return transactionDate >= start && transactionDate <= end;
            } else if (startDate) {
                const start = new Date(startDate);
                return transactionDate >= start;
            } else if (endDate) {
                const end = new Date(endDate);
                return transactionDate <= end;
            }
            
            return true;
        });
    },

    searchByAmountRange(transactions, minAmount, maxAmount) {
        if (minAmount === undefined && maxAmount === undefined) return transactions;
        
        return transactions.filter(t => {
            if (minAmount !== undefined && maxAmount !== undefined) {
                return t.amount >= minAmount && t.amount <= maxAmount;
            } else if (minAmount !== undefined) {
                return t.amount >= minAmount;
            } else if (maxAmount !== undefined) {
                return t.amount <= maxAmount;
            }
            
            return true;
        });
    },

    clearSearch() {
        this.currentPattern = '';
        this.currentRegex = null;
        this.caseInsensitive = false;
    },

    getSearchStats(transactions, searchResults) {
        const stats = {
            totalTransactions: transactions.length,
            matchingTransactions: searchResults.length,
            matchPercentage: 0,
            totalMatches: 0,
            averageMatchesPerTransaction: 0
        };

        if (transactions.length > 0) {
            stats.matchPercentage = (stats.matchingTransactions / stats.totalTransactions) * 100;
        }

        stats.totalMatches = searchResults.reduce((sum, t) => sum + (t.matchCount || 0), 0);

        if (stats.matchingTransactions > 0) {
            stats.averageMatchesPerTransaction = stats.totalMatches / stats.matchingTransactions;
        }

        return stats;
    }
};
