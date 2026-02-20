# Student Finance Tracker

A simple but powerful finance tracker designed specifically for students. Keep track of your spending, set budgets, and understand where your money goes each month.

**Try it live**: [https://username.github.io/student-finance-tracker](https://username.github.io/student-finance-tracker)

## What It Looks Like

I went with a clean, modern design that's easy on the eyes:

- **Colors**: Light theme with blue accents (#3b82f6)
- **Fonts**: System fonts so it looks good on any device
- **Layout**: Card-based design with subtle shadows
- **Feel**: Minimal and focused - no clutter

## What You Can Do

### The Basics

- **Add Transactions**: Quick and easy expense tracking
- **See Your Dashboard**: Visual breakdown of your spending
- **Search Everything**: Find specific transactions fast
- **Sort & Filter**: Organize your data how you want
- **Set Budgets**: Get alerts when you're overspending
- **Multiple Currencies**: USD, EUR, GBP, and RWF support
- **Save Your Data**: Export everything as JSON backup

### Under the Hood

- **Works on All Devices**: Mobile, tablet, desktop - you name it
- **Easy to Use**: Built for real people, not just developers
- **Smart Validation**: Catches mistakes before they happen
- **Clean Code**: Organized and maintainable
- **No Dependencies**: Runs in any modern browser

## File Structure

```
summativeAssignment-BuildingResponsiveUI/
├── index.html              # Main HTML file
├── README.md               # Project documentation
├── seed.json               # Sample data
├── instructions.txt        # Assignment requirements
├── styles/
│   └── main.css           # Main stylesheet
├── scripts/
│   ├── main.js            # Application entry point
│   ├── storage.js         # LocalStorage management
│   ├── validators.js      # Form validation with regex
│   ├── state.js           # State management
│   ├── search.js          # Search functionality
│   └── ui.js              # UI manipulation
└── assets/                # Static assets
```

## Smart Search & Validation

I built in some clever search patterns to help you find exactly what you need:

### Search Examples

- **Find coffee purchases**: `/(coffee|tea)/i`
- **Amounts ending in .99**: `/\.99$/`
- **Food category only**: `/^Food/i`
- **Any date**: `/\d{4}-\d{2}-\d{2}/`
- **Duplicate words**: `/\b(\w+)\s+\1\b/`

### Form Validation

The app checks your inputs to make sure everything makes sense:

- **Descriptions**: Can't start or end with spaces
- **Amounts**: Proper money format (like 12.50 or 100)
- **Dates**: Must be real dates in YYYY-MM-DD format
- **Categories**: Letters, spaces, and hyphens only

## Easy for Everyone

I made sure this app works for all users:

- **Screen Reader Friendly**: All the right labels and descriptions
- **Keyboard Navigation**: Use Tab, Enter, Escape - no mouse needed
- **Clear Focus**: You always know where you are on the page
- **Good Contrast**: Easy to read even with vision difficulties
- **Skip to Content**: Jump straight to what matters

## Keyboard Shortcuts

Here are the handy keyboard tricks I built in:

### Quick Navigation

- **Tab**: Move between buttons and fields
- **Shift + Tab**: Go backwards
- **Enter**: Click buttons or submit forms
- **Space**: Toggle checkboxes, open mobile menu
- **Escape**: Close popups or cancel actions

### Page Jumps

- **Alt + H**: Go to Dashboard
- **Alt + A**: Add new transaction
- **Alt + R**: View all records
- **Alt + S**: Open settings
- **Alt + ?**: Get help

### Search Tricks

- **Ctrl + F**: Jump to search box
- **Arrow Keys**: Move through search results
- **Enter**: Pick a search result

## Works Everywhere

I tested this on all the major browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

And it adapts to any screen size:

- **Phone**: Simple, touch-friendly layout
- **Tablet**: Balanced design for medium screens
- **Desktop**: Full-featured experience
- **Large screens**: Optimized for big displays

## Getting Started

1. Download the project files
2. Open `index.html` in your browser
3. That's it! The app loads with sample data to play with

## Testing It Out

I built in some ways to make sure everything works right:

### Quick Checks

1. **Open Developer Tools** (F12) to spot any errors
2. **Try breaking the forms** - see if validation catches mistakes
3. **Navigate with keyboard only** - Tab through everything
4. **Resize your browser** - watch it adapt to different screens
5. **Test the search** - try the patterns I mentioned above

### Browser Testing

I've tested on:

- Chrome
- Firefox
- Safari
- Edge

## What's Next?

Ideas for future versions:

- Better charts and graphs
- Custom transaction categories
- Automatic recurring transactions
- Spending insights and tips
- Cloud sync option
- Mobile app version

---

