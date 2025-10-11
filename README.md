# Library Search Lite for Online Build (at BMIET Portal)

A modern, responsive single-page application for searching and bookmarking books. Built with vanilla HTML, CSS, and JavaScript.

## Features

- **Book Search**: Real-time search by title or author
- **Bookmarking**: Save your favorite books with persistent storage
- **Filter Views**: Toggle between all books and bookmarked books
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on mobile (360px) and desktop (1440px+)
- **FAQ Section**: Expandable help section
- **Statistics**: Live count of books and bookmarks

## Getting Started

1. **Clone or download** this project
2. **Open `index.html`** in your web browser
3. **Start searching and bookmarking books!**

## File Structure

```
Library Search Lite/
├── index.html          # Main HTML structure
├── style.css           # Responsive CSS with dark mode
├── script.js           # JavaScript functionality
├── books.json          # Sample book data
└── README.md           # This file
└── NOTES.txt           # AI agents and prompts used
```

## Usage

### Searching Books
- Type in the search box to filter books by title or author
- Search is case-insensitive and updates in real-time

### Bookmarking
- Click the bookmark button (📖) on any book to save it
- Click again to remove from bookmarks
- Bookmarks are saved automatically and persist across page reloads

### Filtering
- **All Books**: Shows all available books
- **Bookmarked**: Shows only your bookmarked books

### Dark Mode
- Click the moon/sun icon in the top-right corner
- Your preference is saved automatically

### Keyboard Shortcuts
- **Ctrl/Cmd + K**: Focus the search box
- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close FAQ items

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features in Detail

### Responsive Design
- Mobile-first approach
- Breakpoints: 360px (mobile), 768px (tablet), 1440px (desktop)
- Flexible grid layout that adapts to screen size

### Accessibility
- Semantic HTML structure
- ARIA labels and attributes
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Reduced motion support

### Performance
- Efficient DOM manipulation
- Debounced search input
- Minimal re-renders
- Optimized CSS animations

## Customization

### Adding More Books
Edit `books.json` to add more books:

```json
{
  "id": 11,
  "title": "Your Book Title",
  "author": "Author Name",
  "year": 2024,
  "genre": "Genre",
  "description": "Book description"
}
```

### Styling
- Modify CSS custom properties in `:root` for easy theming
- Responsive breakpoints can be adjusted in media queries

### Functionality
- All JavaScript is modular and well-commented
- Easy to extend with new features
- State management is centralized in `AppState` object

## Live Demo
https://librarysearchlitee.netlify.app/
