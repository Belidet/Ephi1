// ===== Ephi App - 55-Day New Testament Reading Tracker =====
// Enhanced UI/UX Version with Modern Card Design

// ===== Vercel Blob Cloud Storage Integration =====
// NEW: Add this section right after the opening comment
const API_BASE_URL = window.location.origin + '/api';

// Track last sync time to avoid too many requests
let lastCloudSave = 0;
const CLOUD_SAVE_DEBOUNCE = 2000; // 2 seconds

// Load progress from cloud
async function loadProgressFromCloud() {
  try {
    const response = await fetch(`${API_BASE_URL}/sync`);
    if (!response.ok) throw new Error('Failed to load from cloud');
    
    const data = await response.json();
    console.log('Loaded from cloud:', data);
    return data.completedDays || [];
  } catch (error) {
    console.error('Cloud load failed:', error);
    return null;
  }
}

// Save progress to cloud with debounce
async function saveProgressToCloud(completedDays, force = false) {
  const now = Date.now();
  
  // Debounce saves to prevent too many requests
  if (!force && now - lastCloudSave < CLOUD_SAVE_DEBOUNCE) {
    console.log('Debouncing cloud save...');
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedDays })
    });
    
    if (!response.ok) throw new Error('Failed to save to cloud');
    
    lastCloudSave = now;
    console.log('Saved to cloud successfully');
    return true;
  } catch (error) {
    console.error('Cloud save failed:', error);
    return false;
  }
}

// Sync: Try cloud first, fallback to localStorage
async function syncProgress() {
  // Try cloud first
  const cloudProgress = await loadProgressFromCloud();
  
  if (cloudProgress !== null) {
    // Cloud has data - use it
    console.log('Using cloud data');
    return cloudProgress;
  } else {
    // Cloud failed - use localStorage
    console.log('Using local data');
    const localProgress = localStorage.getItem('ephi-progress');
    return localProgress ? JSON.parse(localProgress) : [];
  }
}

// Advanced: Merge cloud and local data if both exist (optional but recommended)
async function smartSync() {
  const cloudProgress = await loadProgressFromCloud();
  const localProgress = localStorage.getItem('ephi-progress');
  const localDays = localProgress ? JSON.parse(localProgress) : [];
  
  if (!cloudProgress) {
    // No cloud data, use local
    return localDays;
  }
  
  if (cloudProgress.length > localDays.length) {
    // Cloud has more progress - use cloud
    console.log('Cloud has more progress');
    return cloudProgress;
  } else if (localDays.length > cloudProgress.length) {
    // Local has more progress - use local and upload to cloud
    console.log('Local has more progress, uploading to cloud');
    await saveProgressToCloud(localDays, true);
    return localDays;
  } else {
    // Same length, use cloud (or either)
    return cloudProgress;
  }
}

// Add a manual sync button to header
function addSyncButton() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  // Check if button already exists
  if (document.getElementById('cloud-sync-btn')) return;
  
  const syncBtn = document.createElement('button');
  syncBtn.id = 'cloud-sync-btn';
  syncBtn.innerHTML = '☁️ Sync';
  syncBtn.style.cssText = `
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: var(--gold);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius-xl);
    font-family: 'Cormorant Garamond', serif;
    font-weight: 600;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
    z-index: 100;
  `;
  
  syncBtn.addEventListener('mouseenter', () => {
    syncBtn.style.backgroundColor = 'transparent';
    syncBtn.style.borderColor = 'var(--gold)';
    syncBtn.style.color = 'var(--gold-dark)';
  });
  
  syncBtn.addEventListener('mouseleave', () => {
    syncBtn.style.backgroundColor = 'var(--gold)';
    syncBtn.style.borderColor = 'transparent';
    syncBtn.style.color = 'var(--text-dark)';
  });
  
  syncBtn.addEventListener('click', async () => {
    const originalText = syncBtn.innerHTML;
    syncBtn.innerHTML = '⏳ Syncing...';
    syncBtn.disabled = true;
    
    const completedDays = readingPlan
      .filter(day => day.completed)
      .map(day => day.day);
    
    const success = await saveProgressToCloud(completedDays, true);
    
    if (success) {
      syncBtn.innerHTML = '✅ Synced!';
      setTimeout(() => {
        syncBtn.innerHTML = '☁️ Sync';
        syncBtn.disabled = false;
      }, 2000);
    } else {
      syncBtn.innerHTML = '❌ Failed';
      setTimeout(() => {
        syncBtn.innerHTML = '☁️ Sync';
        syncBtn.disabled = false;
      }, 2000);
    }
  });
  
  header.appendChild(syncBtn);
}

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
const totalNTChapters = bibleData.books.reduce((total, book) => total + book.chapters, 0); // 260 chapters

// Fixed 55-day reading plan
function generateFixedReadingPlan() {
    const totalDays = 55;
    const plan = [];
    let currentBook = 0;
    let currentChapter = 1;
    
    for (let day = 1; day <= totalDays; day++) {
        let reading = {
            day: day,
            passages: [],
            completed: false,
            isCurrent: false,
            date: null
        };
        
        const remainingDays = totalDays - day + 1;
        const remainingChapters = totalNTChapters - (plan.reduce((total, d) => {
            return total + d.passages.reduce((sum, p) => sum + (p.endChapter - p.startChapter + 1), 0);
        }, 0));
        
        let chaptersPerDay = Math.round(remainingChapters / remainingDays);
        chaptersPerDay = Math.max(1, Math.min(8, chaptersPerDay));
        
        while (chaptersPerDay > 0 && currentBook < bibleData.books.length) {
            const book = bibleData.books[currentBook];
            const remainingInBook = book.chapters - currentChapter + 1;
            
            if (remainingInBook <= chaptersPerDay) {
                reading.passages.push({
                    book: book.name,
                    startChapter: currentChapter,
                    endChapter: book.chapters
                });
                chaptersPerDay -= remainingInBook;
                currentBook++;
                currentChapter = 1;
            } else {
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

// Initialize reading plan
let readingPlan = generateFixedReadingPlan();

// Set start date (February 16, 2026)
const START_DATE = new Date(2026, 1, 16);

// Assign dates to each day
function assignDatesToPlan() {
    readingPlan.forEach((day, index) => {
        const date = new Date(START_DATE);
        date.setDate(START_DATE.getDate() + index);
        day.date = date;
    });
}
assignDatesToPlan();

// ===== MODIFIED FUNCTION: Load saved progress from cloud + localStorage =====
async function loadProgress() {
    // Show loading state
    const container = document.getElementById('reading-list');
    if (container) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--deep-blue);">Loading your progress...</div>';
    }
    
    // Use smartSync to get the best available data
    const completedDays = await smartSync();
    
    // Apply loaded progress
    if (completedDays && completedDays.length > 0) {
        completedDays.forEach(dayNum => {
            const day = readingPlan.find(d => d.day === dayNum);
            if (day) {
                day.completed = true;
            }
        });
    }
    
    updateCurrentDay();
    renderReadingList();
    updateProgressBar();
    renderCalendar();
    updateTodayHighlight();
    
    // Add sync button to header
    addSyncButton();
}

// ===== MODIFIED FUNCTION: Save progress to both localStorage AND cloud =====
function saveProgress() {
    const completedDays = readingPlan
        .filter(day => day.completed)
        .map(day => day.day);
    
    // Always save to localStorage (fast, works offline)
    localStorage.setItem('ephi-progress', JSON.stringify(completedDays));
    
    // Save to cloud (async, doesn't block UI)
    saveProgressToCloud(completedDays);
}

// Update current day based on progress
function updateCurrentDay() {
    readingPlan.forEach(day => day.isCurrent = false);
    
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
        day.completed = !day.completed;
        updateCurrentDay();
        saveProgress();
        
        // Animate the card
        const card = document.querySelector(`.day-card[data-day="${dayNum}"]`);
        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        }
        
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

// Format passage text with improved styling
function formatPassage(passages) {
    if (passages.length === 1) {
        const p = passages[0];
        if (p.startChapter === p.endChapter) {
            return `<span class="passage-book">${p.book}</span> <span class="passage-chapter">${p.startChapter}</span>`;
        } else {
            return `<span class="passage-book">${p.book}</span> <span class="passage-chapter">${p.startChapter}-${p.endChapter}</span>`;
        }
    } else {
        return passages.map(p => {
            if (p.startChapter === p.endChapter) {
                return `<span class="passage-book">${p.book}</span> <span class="passage-chapter">${p.startChapter}</span>`;
            } else {
                return `<span class="passage-book">${p.book}</span> <span class="passage-chapter">${p.startChapter}-${p.endChapter}</span>`;
            }
        }).join('<span class="passage-separator"> • </span>');
    }
}

// Format date nicely
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric'
    });
}

// Get day suffix (st, nd, rd, th)
function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// Render reading list with modern card design
function renderReadingList() {
    const container = document.getElementById('reading-list');
    container.innerHTML = '';
    
    readingPlan.forEach(day => {
        const passageHTML = formatPassage(day.passages);
        const dateText = formatDate(day.date);
        const dayNum = day.day;
        const daySuffix = getDaySuffix(dayNum);
        
        const dayCard = document.createElement('div');
        dayCard.className = `day-card ${day.completed ? 'completed' : ''} ${day.isCurrent ? 'current' : ''}`;
        dayCard.setAttribute('data-day', dayNum);
        
        // Create a more visually appealing card layout
        dayCard.innerHTML = `
            <div class="card-left">
                <div class="day-badge">
                    <span class="day-number-large">${dayNum}</span>
                    <span class="day-suffix">${daySuffix}</span>
                </div>
                <div class="date-badge">
                    <span class="date-icon">📅</span>
                    <span class="date-text">${dateText}</span>
                </div>
            </div>
            <div class="card-middle">
                <div class="passage-container">
                    ${passageHTML}
                </div>
                <div class="reading-meta">
                    <span class="testament-badge">New Testament</span>
                    ${day.isCurrent ? '<span class="current-badge">Current Reading</span>' : ''}
                </div>
            </div>
            <div class="card-right">
                <label class="checkbox-wrapper">
                    <input type="checkbox" ${day.completed ? 'checked' : ''} data-day="${day.day}">
                    <span class="checkbox-custom">
                        <svg class="checkbox-icon" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                    </span>
                </label>
                <div class="completion-status ${day.completed ? 'completed' : ''}">
                    ${day.completed ? 'Read' : 'Mark Read'}
                </div>
            </div>
        `;
        
        container.appendChild(dayCard);
    });
    
    // Add event listeners to checkboxes with improved interaction
    document.querySelectorAll('.checkbox-wrapper input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            const dayNum = parseInt(e.target.dataset.day);
            
            // Add ripple effect
            const wrapper = e.target.closest('.checkbox-wrapper');
            wrapper.classList.add('ripple');
            setTimeout(() => {
                wrapper.classList.remove('ripple');
            }, 300);
            
            toggleDay(dayNum);
        });
    });
}

// Calendar functionality
let currentCalendarDate = new Date();

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    document.getElementById('month-year-display').textContent = 
        currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const readingDay = readingPlan.find(d => {
            const dDate = new Date(d.date);
            dDate.setHours(0, 0, 0, 0);
            return dDate.getTime() === date.getTime();
        });
        
        let dayContent = `<span class="day-number">${day}</span>`;
        
        if (readingDay) {
            dayElement.classList.add('has-reading');
            if (readingDay.completed) {
                dayElement.classList.add('completed-reading');
            }
            
            const passageText = readingDay.passages.map(p => 
                `${p.book} ${p.startChapter}${p.startChapter !== p.endChapter ? '-' + p.endChapter : ''}`
            ).join(', ');
            
            dayElement.setAttribute('data-tooltip', `Day ${readingDay.day}: ${passageText}`);
            dayContent += `<span class="reading-indicator"></span>`;
        }
        
        if (date.getTime() === today.getTime()) {
            dayElement.classList.add('today');
            dayContent += `<span class="today-indicator">Today</span>`;
        }
        
        dayElement.innerHTML = dayContent;
        calendarDays.appendChild(dayElement);
    }
}

// Update today's reading highlight with enhanced design
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
        const passageHTML = formatPassage(todayReading.passages);
        const dateText = today.toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        });
        
        highlightElement.innerHTML = `
            <div class="today-header">
                <div class="today-icon">📖</div>
                <div class="today-title-section">
                    <span class="today-label">Today's Reading</span>
                    <span class="today-full-date">${dateText}</span>
                </div>
            </div>
            <div class="today-content">
                <div class="today-passage-section">
                    <div class="today-day">Day ${todayReading.day}</div>
                    <div class="today-passage">${passageHTML}</div>
                </div>
                <button class="btn-mark-read ${todayReading.completed ? 'completed' : ''}" 
                        data-day="${todayReading.day}" 
                        ${todayReading.completed ? 'disabled' : ''}>
                    <span class="btn-icon">${todayReading.completed ? '✓' : '◉'}</span>
                    <span class="btn-text">${todayReading.completed ? 'Completed Today' : 'Mark as Read'}</span>
                </button>
            </div>
        `;
        
        const markReadBtn = highlightElement.querySelector('.btn-mark-read');
        if (markReadBtn && !todayReading.completed) {
            markReadBtn.addEventListener('click', () => {
                markReadBtn.classList.add('btn-pulse');
                setTimeout(() => {
                    markReadBtn.classList.remove('btn-pulse');
                }, 300);
                toggleDay(todayReading.day);
            });
        }
    } else {
        highlightElement.innerHTML = `
            <div class="today-header">
                <div class="today-icon">📅</div>
                <div class="today-title-section">
                    <span class="today-label">No Reading Today</span>
                    <span class="today-full-date">${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
            </div>
            <div class="today-content">
                <div class="today-message">Your reading plan continues tomorrow</div>
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
                    registration.showNotification('Ephi - Daily Reading Reminder', {
                        body: 'Time for today\'s New Testament reading!',
                        icon: 'icons/icon-192x192.png',
                        badge: 'icons/icon-72x72.png',
                        vibrate: [200, 100, 200],
                        tag: 'daily-reading',
                        renotify: true,
                        actions: [
                            { action: 'open', title: 'Open Reading' },
                            { action: 'mark', title: 'Mark as Read' }
                        ]
                    });
                    
                    setInterval(() => {
                        registration.showNotification('Ephi - Daily Reading Reminder', {
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

// Add smooth scrolling and animations
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== MODIFIED: Initialize app with async loadProgress =====
document.addEventListener('DOMContentLoaded', () => {
    // Make sure to call loadProgress as async
    loadProgress().then(() => {
        // These are now called inside loadProgress to avoid duplication
        // renderReadingList();
        // updateProgressBar();
        // renderCalendar();
        // updateTodayHighlight();
    });
    
    initCalendarNavigation();
    setupNotifications();
    initSmoothScrolling();
    
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

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { readingPlan, bibleData };
}
