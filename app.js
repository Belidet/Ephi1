// ===== Ermi App - 55-Day New Testament Reading Tracker =====

// Bible data structure
const bibleData = {
    books: [
        { name: "Matthew", chapters: 28, testament: "NT" },
        { name: "Mark", chapters: 16, testament: "NT" },
        { name: "Luke", chapters: 24, testament: "NT" },
        { name: "John", chapters: 21, testament: "NT" },
        { name: "Acts", chapters: 28, testament: "NT" },
        { name: "Romans", chapters: 16, testament: "NT" },
        { name: "1 Corinthians", chapters: 16, testament: "NT" },
        { name: "2 Corinthians", chapters: 13, testament: "NT" },
        { name: "Galatians", chapters: 6, testament: "NT" },
        { name: "Ephesians", chapters: 6, testament: "NT" },
        { name: "Philippians", chapters: 4, testament: "NT" },
        { name: "Colossians", chapters: 4, testament: "NT" },
        { name: "1 Thessalonians", chapters: 5, testament: "NT" },
        { name: "2 Thessalonians", chapters: 3, testament: "NT" },
        { name: "1 Timothy", chapters: 6, testament: "NT" },
        { name: "2 Timothy", chapters: 4, testament: "NT" },
        { name: "Titus", chapters: 3, testament: "NT" },
        { name: "Philemon", chapters: 1, testament: "NT" },
        { name: "Hebrews", chapters: 13, testament: "NT" },
        { name: "James", chapters: 5, testament: "NT" },
        { name: "1 Peter", chapters: 5, testament: "NT" },
        { name: "2 Peter", chapters: 3, testament: "NT" },
        { name: "1 John", chapters: 5, testament: "NT" },
        { name: "2 John", chapters: 1, testament: "NT" },
        { name: "3 John", chapters: 1, testament: "NT" },
        { name: "Jude", chapters: 1, testament: "NT" },
        { name: "Revelation", chapters: 22, testament: "NT" }
    ]
};

// Calculate total chapters in New Testament
const totalNTChapters = bibleData.books.reduce((total, book) => total + book.chapters, 0); // Should be 260

// Fixed 55-day reading plan
function generateFixedReadingPlan() {
    const totalDays = 55;
    const plan = [];
    let currentBook = 0;
    let currentChapter = 1;
    
    // Calculate average chapters per day (260/55 ≈ 4.73)
    // We'll distribute chapters as evenly as possible
    
    for (let day = 1; day <= totalDays; day++) {
        let reading = {
            day: day,
            passages: [],
            completed: false,
            isCurrent: false,
            date: null // Will be set based on start date
        };
        
        // Determine how many chapters for this day (aim for even distribution)
        const remainingDays = totalDays - day + 1;
        const remainingChapters = totalNTChapters - (plan.reduce((total, d) => {
            return total + d.passages.reduce((sum, p) => sum + (p.endChapter - p.startChapter + 1), 0);
        }, 0));
        
        // Target chapters per day, rounding appropriately
        let chaptersPerDay = Math.round(remainingChapters / remainingDays);
        // Ensure at least 1 chapter per day and not too many
        chaptersPerDay = Math.max(1, Math.min(8, chaptersPerDay));
        
        while (chaptersPerDay > 0 && currentBook < bibleData.books.length) {
            const book = bibleData.books[currentBook];
            const remainingInBook = book.chapters - currentChapter + 1;
            
            if (remainingInBook <= chaptersPerDay) {
                // Take the rest of this book
                reading.passages.push({
                    book: book.name,
                    startChapter: currentChapter,
                    endChapter: book.chapters
                });
                chaptersPerDay -= remainingInBook;
                currentBook++;
                currentChapter = 1;
            } else {
                // Take part of this book
                reading.passages.push({
                    book: book.name,
                    startChapter: currentChapter,
                    endChapter: currentChapter + chaptersPerDay - 1
                });
                currentChapter += chaptersPerDay;
                chaptersPerDay = 0;
            }
        }
        
        plan.push(reading);
    }
    
    return plan;
}

// Initialize reading plan (fixed, not regenerated)
let readingPlan = generateFixedReadingPlan();

// Set start date (February 16, 2026)
const START_DATE = new Date(2026, 1, 16); // Month is 0-indexed, so 1 = February

// Assign dates to each day
function assignDatesToPlan() {
    readingPlan.forEach((day, index) => {
        const date = new Date(START_DATE);
        date.setDate(START_DATE.getDate() + index);
        day.date = date;
    });
}
assignDatesToPlan();

// Load saved progress from localStorage
function loadProgress() {
    const savedProgress = localStorage.getItem('ermi-progress');
    if (savedProgress) {
        const completedDays = JSON.parse(savedProgress);
        completedDays.forEach(dayNum => {
            const day = readingPlan.find(d => d.day === dayNum);
            if (day) {
                day.completed = true;
            }
        });
        
        // Update current day
        updateCurrentDay();
    }
    
    // Update UI after loading
    renderReadingList();
    updateProgressBar();
    renderCalendar();
    updateTodayHighlight();
}

// Save progress to localStorage
function saveProgress() {
    const completedDays = readingPlan
        .filter(day => day.completed)
        .map(day => day.day);
    localStorage.setItem('ermi-progress', JSON.stringify(completedDays));
}

// Update current day based on progress
function updateCurrentDay() {
    // Reset current flag
    readingPlan.forEach(day => day.isCurrent = false);
    
    // Find first incomplete day
    for (let i = 0; i < readingPlan.length; i++) {
        if (!readingPlan[i].completed) {
            readingPlan[i].isCurrent = true;
            break;
        }
    }
}

// Toggle day completion
function toggleDay(dayNum) {
    const day = readingPlan.find(d => d.day === dayNum);
    if (day) {
        // Toggle only this specific day
        day.completed = !day.completed;
        
        // Update current day
        updateCurrentDay();
        
        // Save to localStorage
        saveProgress();
        
        // Update UI
        renderReadingList();
        updateProgressBar();
        renderCalendar();
        updateTodayHighlight();
    }
}

// Update progress bar
function updateProgressBar() {
    const completedCount = readingPlan.filter(day => day.completed).length;
    const totalDays = readingPlan.length;
    const percentage = (completedCount / totalDays) * 100;
    
    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('total-days').textContent = totalDays;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

// Format passage text
function formatPassage(passages) {
    if (passages.length === 1) {
        const p = passages[0];
        if (p.startChapter === p.endChapter) {
            return `${p.book} ${p.startChapter}`;
        } else {
            return `${p.book} ${p.startChapter}-${p.endChapter}`;
        }
    } else {
        return passages.map(p => {
            if (p.startChapter === p.endChapter) {
                return `${p.book} ${p.startChapter}`;
            } else {
                return `${p.book} ${p.startChapter}-${p.endChapter}`;
            }
        }).join(', ');
    }
}

// Format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Render reading list
function renderReadingList() {
    const container = document.getElementById('reading-list');
    container.innerHTML = '';
    
    readingPlan.forEach(day => {
        const passageText = formatPassage(day.passages);
        const dateText = formatDate(day.date);
        
        const dayCard = document.createElement('div');
        dayCard.className = `day-card ${day.completed ? 'completed' : ''} ${day.isCurrent ? 'current' : ''}`;
        
        dayCard.innerHTML = `
            <div class="day-number">Day ${day.day}</div>
            <div class="day-date">${dateText}</div>
            <div class="day-content">
                <div class="day-passage">${passageText}</div>
                <div class="day-description">New Testament Reading</div>
            </div>
            <div class="saint-icon" title="St. ${day.completed ? 'Completed' : 'Incomplete'}"></div>
            <label class="checkbox-container">
                <input type="checkbox" ${day.completed ? 'checked' : ''} data-day="${day.day}">
                <span class="checkmark"></span>
            </label>
        `;
        
        container.appendChild(dayCard);
    });
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.checkbox-container input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            const dayNum = parseInt(e.target.dataset.day);
            toggleDay(dayNum);
        });
    });
}

// Calendar functionality
let currentCalendarDate = new Date();

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Update month/year display
    document.getElementById('month-year-display').textContent = 
        currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();
    
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    // Add days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if this date has a reading
        const readingDay = readingPlan.find(d => {
            const dDate = new Date(d.date);
            dDate.setHours(0, 0, 0, 0);
            return dDate.getTime() === date.getTime();
        });
        
        if (readingDay) {
            dayElement.classList.add('has-reading');
            if (readingDay.completed) {
                dayElement.classList.add('completed-reading');
            }
            
            // Add tooltip with reading info
            const passageText = formatPassage(readingDay.passages);
            dayElement.title = `Day ${readingDay.day}: ${passageText}`;
        }
        
        // Check if it's today
        if (date.getTime() === today.getTime()) {
            dayElement.classList.add('today');
        }
        
        calendarDays.appendChild(dayElement);
    }
}

// Update today's reading highlight
function updateTodayHighlight() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayReading = readingPlan.find(d => {
        const dDate = new Date(d.date);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() === today.getTime();
    });
    
    const highlightElement = document.getElementById('today-highlight');
    
    if (todayReading) {
        const passageText = formatPassage(todayReading.passages);
        const dateText = formatDate(todayReading.date);
        
        highlightElement.innerHTML = `
            <div class="today-header">
                <span class="today-label">Today's Reading</span>
                <span class="today-date">${dateText}</span>
            </div>
            <div class="today-content">
                <div class="today-passage">Day ${todayReading.day}: ${passageText}</div>
                <button class="btn-mark-read ${todayReading.completed ? 'completed' : ''}" 
                        data-day="${todayReading.day}" 
                        ${todayReading.completed ? 'disabled' : ''}>
                    ${todayReading.completed ? '✓ Completed' : 'Mark as Read'}
                </button>
            </div>
        `;
        
        // Add event listener to the button
        const markReadBtn = highlightElement.querySelector('.btn-mark-read');
        if (markReadBtn && !todayReading.completed) {
            markReadBtn.addEventListener('click', () => {
                toggleDay(todayReading.day);
            });
        }
    } else {
        highlightElement.innerHTML = `
            <div class="today-header">
                <span class="today-label">Today's Reading</span>
                <span class="today-date">${formatDate(today)}</span>
            </div>
            <div class="today-content">
                <div class="today-passage">No reading scheduled for today</div>
            </div>
        `;
    }
}

// Notification handling
async function setupNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        const banner = document.getElementById('notification-banner');
        
        if (Notification.permission === 'granted') {
            banner.classList.add('hidden');
            scheduleDailyNotification();
        } else if (Notification.permission !== 'denied') {
            banner.classList.remove('hidden');
            
            document.getElementById('enable-notifications').addEventListener('click', async () => {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    banner.classList.add('hidden');
                    scheduleDailyNotification();
                }
            });
        }
    }
}

// Schedule daily notification
function scheduleDailyNotification() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered');
                
                const now = new Date();
                const notificationTime = new Date();
                notificationTime.setHours(8, 0, 0, 0);
                
                if (now > notificationTime) {
                    notificationTime.setDate(notificationTime.getDate() + 1);
                }
                
                const timeUntilNotification = notificationTime - now;
                
                setTimeout(() => {
                    registration.showNotification('Ermi - Daily Reading Reminder', {
                        body: 'Time for today\'s New Testament reading!',
                        icon: 'icons/icon-192x192.png',
                        badge: 'icons/icon-72x72.png',
                        vibrate: [200, 100, 200],
                        tag: 'daily-reading',
                        renotify: true
                    });
                    
                    setInterval(() => {
                        registration.showNotification('Ermi - Daily Reading Reminder', {
                            body: 'Time for today\'s New Testament reading!',
                            icon: 'icons/icon-192x192.png',
                            badge: 'icons/icon-72x72.png',
                            vibrate: [200, 100, 200],
                            tag: 'daily-reading',
                            renotify: true
                        });
                    }, 24 * 60 * 60 * 1000);
                }, timeUntilNotification);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
}

// Initialize calendar navigation
function initCalendarNavigation() {
    document.getElementById('prev-month').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Load progress from localStorage
    loadProgress();
    
    // Render initial reading list
    renderReadingList();
    
    // Update progress bar
    updateProgressBar();
    
    // Setup calendar
    initCalendarNavigation();
    renderCalendar();
    
    // Update today's highlight
    updateTodayHighlight();
    
    // Setup notifications
    setupNotifications();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('PWA Service Worker registered:', registration);
                })
                .catch(error => {
                    console.error('PWA Service Worker registration failed:', error);
                });
        });
    }
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { readingPlan, bibleData };
}