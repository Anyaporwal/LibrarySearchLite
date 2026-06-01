/**
 * Library Search Lite - Main JavaScript File
 * Handles book loading, search, bookmarking, and UI interactions
 */

// Global state management
const AppState = {
    books: [],
    filteredBooks: [],
    bookmarkedIds: new Set(),
    currentFilter: 'all', // 'all' or 'bookmarked'
    searchQuery: '',
    isDarkMode: false
};

// DOM elements
const elements = {
    searchInput: null,
    booksContainer: null,
    booksStats: null,
    bookmarksStats: null,
    showAllBtn: null,
    showBookmarkedBtn: null,
    darkModeToggle: null,
    navToggle: null,
    navLinks: null,
    faqQuestions: null
};

/**
 * Initialize the application
 */
function init() {
    // Get DOM elements
    elements.searchInput = document.getElementById('searchInput');
    elements.booksContainer = document.getElementById('booksContainer');
    elements.booksStats = document.getElementById('booksStats');
    elements.bookmarksStats = document.getElementById('bookmarksStats');
    elements.showAllBtn = document.getElementById('showAllBtn');
    elements.showBookmarkedBtn = document.getElementById('showBookmarkedBtn');
    elements.darkModeToggle = document.getElementById('darkModeToggle');
    elements.navToggle = document.getElementById('navToggle');
    elements.navLinks = document.querySelectorAll('.nav-link');
    elements.faqQuestions = document.querySelectorAll('.faq-question');

    // Load saved preferences
    loadPreferences();
    
    // Load books data
    loadBooks();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize FAQ functionality
    initFAQ();
    
    // Set initial scroll spy state
    handleScrollSpy();
    
    console.log('Library Search Lite initialized successfully');
}

/**
 * Load user preferences from localStorage
 */
function loadPreferences() {
    // Load dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        AppState.isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        elements.darkModeToggle.querySelector('.dark-mode-icon').textContent = '☀️';
    }

    // Load bookmarked books
    const savedBookmarks = localStorage.getItem('bookmarkedBooks');
    if (savedBookmarks) {
        try {
            const bookmarkedIds = JSON.parse(savedBookmarks);
            AppState.bookmarkedIds = new Set(bookmarkedIds);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            AppState.bookmarkedIds = new Set();
        }
    }
}

/**
 * Load books from JSON file
 */
async function loadBooks() {
    try {
        const response = await fetch('books.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const books = await response.json();
        AppState.books = books;
        AppState.filteredBooks = [...books];
        renderBooks();
        updateStats();
    } catch (error) {
        console.error('Error loading books:', error);
        showError('Failed to load books. Please refresh the page.');
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Search input
    elements.searchInput.addEventListener('input', handleSearch);
    
    // Filter buttons
    elements.showAllBtn.addEventListener('click', () => setFilter('all'));
    elements.showBookmarkedBtn.addEventListener('click', () => setFilter('bookmarked'));
    
    // Dark mode toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Navigation toggle
    elements.navToggle.addEventListener('click', toggleNavigation);
    
    // Navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Scroll spy for navigation with throttling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(handleScrollSpy, 10);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', handleClickOutside);
    
    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
}

/**
 * Handle search input
 */
function handleSearch(event) {
    AppState.searchQuery = event.target.value.toLowerCase().trim();
    filterBooks();
}

/**
 * Set the current filter (all books or bookmarked only)
 */
function setFilter(filter) {
    AppState.currentFilter = filter;
    
    // Update button states
    elements.showAllBtn.classList.toggle('active', filter === 'all');
    elements.showBookmarkedBtn.classList.toggle('active', filter === 'bookmarked');
    
    // Update ARIA attributes
    elements.showAllBtn.setAttribute('aria-pressed', filter === 'all');
    elements.showBookmarkedBtn.setAttribute('aria-pressed', filter === 'bookmarked');
    
    // Update navigation active state
    updateNavigationState(filter);
    
    filterBooks();
}

/**
 * Update navigation active state
 */
function updateNavigationState(filter) {
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === filter || 
            (filter === 'all' && link.dataset.section === 'books')) {
            link.classList.add('active');
        }
    });
}

/**
 * Navigate to bookmarked books
 */
function navigateToBookmarks() {
    setFilter('bookmarked');
    const booksSection = document.getElementById('books-section');
    
    if (booksSection) {
        booksSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Update navigation active state
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === 'bookmarked') {
            link.classList.add('active');
        }
    });
}

/**
 * Navigate to FAQ section
 */
function navigateToFAQ() {
    const faqSection = document.getElementById('faq-section');
    
    if (faqSection) {
        faqSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Update navigation active state
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === 'faq') {
                link.classList.add('active');
            }
        });
        
        // Open first FAQ item after scrolling
        setTimeout(() => {
            const firstFAQ = document.querySelector('.faq-question');
            if (firstFAQ && firstFAQ.getAttribute('aria-expanded') !== 'true') {
                firstFAQ.click();
            }
        }, 600);
    }
}

/**
 * Filter books based on current search query and filter
 */
function filterBooks() {
    let filtered = [...AppState.books];
    
    // Apply search filter
    if (AppState.searchQuery) {
        filtered = filtered.filter(book => 
            book.title.toLowerCase().includes(AppState.searchQuery) ||
            book.author.toLowerCase().includes(AppState.searchQuery)
        );
    }
    
    // Apply bookmark filter
    if (AppState.currentFilter === 'bookmarked') {
        filtered = filtered.filter(book => AppState.bookmarkedIds.has(book.id));
    }
    
    AppState.filteredBooks = filtered;
    renderBooks();
    updateStats();
}

/**
 * Render books to the DOM
 */
function renderBooks() {
    if (AppState.filteredBooks.length === 0) {
        showEmptyState();
        return;
    }
    
    const booksHTML = AppState.filteredBooks.map(book => createBookCard(book)).join('');
    elements.booksContainer.innerHTML = booksHTML;
    
    // Add event listeners to bookmark buttons
    addBookmarkEventListeners();
}

/**
 * Create HTML for a single book card
 */
function createBookCard(book) {
    const isBookmarked = AppState.bookmarkedIds.has(book.id);
    const bookmarkText = isBookmarked ? 'Unbookmark' : 'Bookmark';
    const bookmarkIcon = isBookmarked ? '📚' : '📖';
    
    return `
        <div class="book-card" data-book-id="${book.id}">
            <h3 class="book-title">${escapeHtml(book.title)}</h3>
            <p class="book-author">by ${escapeHtml(book.author)}</p>
            <p class="book-year">${book.year}</p>
            <span class="book-genre">${escapeHtml(book.genre)}</span>
            <div class="book-actions">
                <button 
                    class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                    data-book-id="${book.id}"
                    aria-label="${bookmarkText} ${escapeHtml(book.title)}"
                >
                    <span class="bookmark-icon">${bookmarkIcon}</span>
                    ${bookmarkText}
                </button>
            </div>
        </div>
    `;
}

/**
 * Add event listeners to bookmark buttons
 */
function addBookmarkEventListeners() {
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    bookmarkButtons.forEach(button => {
        button.addEventListener('click', handleBookmarkToggle);
    });
}

/**
 * Handle bookmark toggle
 */
function handleBookmarkToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const bookId = parseInt(event.currentTarget.dataset.bookId);
    const isCurrentlyBookmarked = AppState.bookmarkedIds.has(bookId);
    const bookTitle = event.currentTarget.closest('.book-card').querySelector('.book-title').textContent;
    
    if (isCurrentlyBookmarked) {
        AppState.bookmarkedIds.delete(bookId);
        console.log(`Removed "${bookTitle}" from bookmarks`);
    } else {
        AppState.bookmarkedIds.add(bookId);
        console.log(`Added "${bookTitle}" to bookmarks`);
    }
    
    // Save to localStorage
    saveBookmarks();
    
    // Update the UI
    updateBookmarkButton(event.currentTarget, bookId);
    
    // Update stats and re-render if needed
    updateStats();
    
    // Re-render if we're in bookmarked filter mode
    if (AppState.currentFilter === 'bookmarked') {
        filterBooks();
    }
}

/**
 * Update bookmark button appearance
 */
function updateBookmarkButton(button, bookId) {
    const isBookmarked = AppState.bookmarkedIds.has(bookId);
    const bookmarkText = isBookmarked ? 'Unbookmark' : 'Bookmark';
    const bookmarkIcon = isBookmarked ? '📚' : '📖';
    
    button.classList.toggle('bookmarked', isBookmarked);
    
    // Clear and rebuild the button content
    button.innerHTML = `
        <span class="bookmark-icon">${bookmarkIcon}</span>
        ${bookmarkText}
    `;
    
    button.setAttribute('aria-label', `${bookmarkText} ${button.closest('.book-card').querySelector('.book-title').textContent}`);
    
    // Re-add the event listener
    button.addEventListener('click', handleBookmarkToggle);
}

/**
 * Save bookmarks to localStorage
 */
function saveBookmarks() {
    const bookmarkedIds = Array.from(AppState.bookmarkedIds);
    localStorage.setItem('bookmarkedBooks', JSON.stringify(bookmarkedIds));
}

/**
 * Update statistics display
 */
function updateStats() {
    const totalBooks = AppState.books.length;
    const showingBooks = AppState.filteredBooks.length;
    const bookmarkedCount = AppState.bookmarkedIds.size;
    
    elements.booksStats.textContent = `Showing ${showingBooks} of ${totalBooks} books`;
    elements.bookmarksStats.textContent = `Bookmarks: ${bookmarkedCount}`;
}

/**
 * Show empty state when no books match filters
 */
function showEmptyState() {
    let message = '';
    if (AppState.currentFilter === 'bookmarked' && AppState.bookmarkedIds.size === 0) {
        message = `
            <div class="empty-state">
                <h3>No Bookmarks Yet</h3>
                <p>Start bookmarking books to see them here!</p>
            </div>
        `;
    } else if (AppState.searchQuery) {
        message = `
            <div class="empty-state">
                <h3>No Books Found</h3>
                <p>Try adjusting your search terms.</p>
            </div>
        `;
    } else {
        message = `
            <div class="empty-state">
                <h3>No Books Available</h3>
                <p>Please check back later.</p>
            </div>
        `;
    }
    
    elements.booksContainer.innerHTML = message;
}

/**
 * Show error message
 */
function showError(message) {
    elements.booksContainer.innerHTML = `
        <div class="empty-state">
            <h3>Error</h3>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    AppState.isDarkMode = !AppState.isDarkMode;
    
    if (AppState.isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        elements.darkModeToggle.querySelector('.dark-mode-icon').textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        elements.darkModeToggle.querySelector('.dark-mode-icon').textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Toggle navigation menu (for mobile)
 */
function toggleNavigation() {
    const isExpanded = elements.navToggle.getAttribute('aria-expanded') === 'true';
    const mainNav = document.getElementById('mainNav');
    
    if (isExpanded) {
        elements.navToggle.setAttribute('aria-expanded', 'false');
        elements.navToggle.querySelector('.nav-icon').textContent = '☰';
        mainNav.classList.remove('open');
    } else {
        elements.navToggle.setAttribute('aria-expanded', 'true');
        elements.navToggle.querySelector('.nav-icon').textContent = '✕';
        mainNav.classList.add('open');
    }
}

/**
 * Handle navigation link clicks
 */
function handleNavigation(event) {
    event.preventDefault();
    
    const section = event.currentTarget.dataset.section;
    const mainNav = document.getElementById('mainNav');
    
    // Close mobile menu if open
    if (window.innerWidth <= 768) {
        mainNav.classList.remove('open');
        elements.navToggle.setAttribute('aria-expanded', 'false');
        elements.navToggle.querySelector('.nav-icon').textContent = '☰';
    }
    
    // Handle special navigation cases
    if (section === 'bookmarked') {
        navigateToBookmarks();
    } else if (section === 'books') {
        setFilter('all');
        const booksSection = document.getElementById('books-section');
        if (booksSection) {
            booksSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        // Update navigation active state
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === 'books') {
                link.classList.add('active');
            }
        });
    } else if (section === 'search') {
        const searchSection = document.getElementById('search-section');
        if (searchSection) {
            searchSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        elements.searchInput.focus();
        // Update navigation active state
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === 'search') {
                link.classList.add('active');
            }
        });
    } else if (section === 'faq') {
        navigateToFAQ();
    }
}

/**
 * Initialize FAQ functionality
 */
function initFAQ() {
    elements.faqQuestions.forEach(question => {
        question.addEventListener('click', toggleFAQ);
    });
}

/**
 * Toggle FAQ item
 */
function toggleFAQ(event) {
    const question = event.currentTarget;
    const answer = question.nextElementSibling;
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    
    // Close all other FAQ items
    elements.faqQuestions.forEach(q => {
        if (q !== question) {
            q.setAttribute('aria-expanded', 'false');
            q.nextElementSibling.classList.remove('open');
        }
    });
    
    // Toggle current item
    if (isExpanded) {
        question.setAttribute('aria-expanded', 'false');
        answer.classList.remove('open');
    } else {
        question.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
    }
}

/**
 * Handle scroll spy for navigation
 */
function handleScrollSpy() {
    const sections = ['search', 'books', 'faq'];
    const offset = 150; // Offset from top to consider section "active"
    
    let activeSection = null;
    let minDistance = Infinity;
    
    // Special handling for bookmarked section - always show as active when filtering
    if (AppState.currentFilter === 'bookmarked') {
        activeSection = 'bookmarked';
    } else {
        // Find the section closest to the top of the viewport
        sections.forEach(section => {
            const element = document.getElementById(`${section}-section`);
            if (element) {
                const rect = element.getBoundingClientRect();
                const distance = Math.abs(rect.top - offset);
                
                // Check if section is in viewport and closer than previous
                if (rect.top <= offset && rect.bottom >= offset) {
                    if (distance < minDistance) {
                        minDistance = distance;
                        activeSection = section;
                    }
                }
            }
        });
        
        // Fallback: if no section is in viewport, find the closest one
        if (!activeSection) {
            sections.forEach(section => {
                const element = document.getElementById(`${section}-section`);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const distance = Math.abs(rect.top - offset);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        activeSection = section;
                    }
                }
            });
        }
    }
    
    // Update navigation active state
    if (activeSection && elements.navLinks) {
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === activeSection) {
                link.classList.add('active');
            }
        });
    }
}

/**
 * Handle click outside to close mobile menu
 */
function handleClickOutside(event) {
    const mainNav = document.getElementById('mainNav');
    const navToggle = elements.navToggle;
    
    if (window.innerWidth <= 768 && 
        mainNav.classList.contains('open') && 
        !mainNav.contains(event.target) && 
        !navToggle.contains(event.target)) {
        
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.querySelector('.nav-icon').textContent = '☰';
    }
}

/**
 * Handle window resize
 */
function handleWindowResize() {
    const mainNav = document.getElementById('mainNav');
    
    // Close mobile menu if screen becomes larger
    if (window.innerWidth > 768 && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        elements.navToggle.setAttribute('aria-expanded', 'false');
        elements.navToggle.querySelector('.nav-icon').textContent = '☰';
    }
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNavigation(event) {
    // ESC key to close FAQ items and mobile menu
    if (event.key === 'Escape') {
        elements.faqQuestions.forEach(question => {
            question.setAttribute('aria-expanded', 'false');
            question.nextElementSibling.classList.remove('open');
        });
        
        // Close mobile menu if open
        const mainNav = document.getElementById('mainNav');
        if (mainNav.classList.contains('open')) {
            mainNav.classList.remove('open');
            elements.navToggle.setAttribute('aria-expanded', 'false');
            elements.navToggle.querySelector('.nav-icon').textContent = '☰';
        }
    }
    
    // Ctrl/Cmd + K to focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        elements.searchInput.focus();
    }
    
    // Ctrl/Cmd + B to go to bookmarks
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        navigateToBookmarks();
    }
    
    // Ctrl/Cmd + H to go to FAQ
    if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
        event.preventDefault();
        navigateToFAQ();
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Utility function to debounce function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export for testing purposes (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppState, init };
}