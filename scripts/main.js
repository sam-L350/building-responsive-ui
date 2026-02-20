document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    try {
        console.log('Initializing Student Finance Tracker...');
        
        State.init();
        UI.init();
        
        console.log('Application initialized successfully');
        
        addSampleDataIfNeeded();
        
        UI.showPage('about');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

function addSampleDataIfNeeded() {
    const transactions = State.getAllTransactions();
    
    if (transactions.length === 0) {
        console.log('Adding sample data...');
        
        const sampleTransactions = [
            {
                description: 'Lunch at university cafeteria',
                amount: 8.50,
                category: 'Food',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                description: 'Textbook for computer science course',
                amount: 89.99,
                category: 'Books',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                description: 'Monthly bus pass',
                amount: 45.00,
                category: 'Transport',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                description: 'Coffee with study group',
                amount: 12.75,
                category: 'Food',
                date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                description: 'Movie ticket with friends',
                amount: 15.00,
                category: 'Entertainment',
                date: new Date().toISOString().split('T')[0]
            },
            {
                description: 'Course registration fee',
                amount: 150.00,
                category: 'Fees',
                date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                description: 'Groceries for week',
                amount: 67.43,
                category: 'Food',
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                description: 'Printer paper and ink',
                amount: 23.99,
                category: 'Other',
                date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        ];

        sampleTransactions.forEach(transactionData => {
            const result = State.addTransaction(transactionData);
            if (!result.success) {
                console.error('Failed to add sample transaction:', result.error);
            }
        });

        State.updateBudget(500.00);
        
        console.log('Sample data added successfully');
        
        UI.updateAllPages();
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fee2e2;
        color: #991b1b;
        padding: 1rem;
        border: 1px solid #fca5a5;
        border-radius: 6px;
        z-index: 9999;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please refresh the page.');
});

window.StudentFinanceTracker = {
    State,
    UI,
    Search,
    Validators,
    Storage
};
