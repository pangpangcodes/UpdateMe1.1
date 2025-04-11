// scripts/app.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if all required functions are available
    if (typeof initializeEntries !== 'function') {
        console.error('Error: initializeEntries function is not defined. Check if entries.js is loaded correctly.');
        return;
    }
    
    if (typeof initializeStatusGenerator !== 'function') {
        console.error('Error: initializeStatusGenerator function is not defined. Check if status.js is loaded correctly.');
        return;
    }
    
    if (typeof setupRichTextEditor !== 'function') {
        console.error('Error: setupRichTextEditor function is not defined. Check if utils.js is loaded correctly.');
        return;
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Setup rich text editors
    const quickEntryEditor = document.getElementById('quick-entry-editor');
    const quickEntryToolbar = quickEntryEditor.previousElementSibling;
    const quickEntryRichEditor = setupRichTextEditor(quickEntryEditor, quickEntryToolbar);
    
    // Setup format example editor in status tab
    const formatExampleEditor = document.getElementById('format-example');
    if (formatExampleEditor) {
        const formatExampleToolbar = formatExampleEditor.previousElementSibling;
        setupRichTextEditor(formatExampleEditor, formatExampleToolbar);
    }
    
    // Initialize modules
    initializeEntries(quickEntryRichEditor);
    initializeStatusGenerator();
    loadSettings();
    
    // Setup notifications based on settings
    if (Storage.get('settings')?.reminders?.enabled) {
        setupReminders();
    }
});

// Function to load settings
function loadSettings() {
    const settings = Storage.get('settings') || {
        reminders: {
            enabled: true,
            time: '17:00',
            endOfWeek: true
        },
        fiscalYear: {
            month: 0,
            day: 1,
            format: 'FY-YY',
            useQuarters: true
        }
    };
    
    // Set form values based on settings
    document.getElementById('enable-reminder').checked = settings.reminders.enabled;
    document.getElementById('reminder-time').value = settings.reminders.time;
    document.getElementById('end-of-week').checked = settings.reminders.endOfWeek;
    
    document.getElementById('fiscal-month').value = settings.fiscalYear.month;
    document.getElementById('fiscal-day').value = settings.fiscalYear.day;
    document.getElementById('fiscal-format').value = settings.fiscalYear.format;
    document.getElementById('use-quarters').checked = settings.fiscalYear.useQuarters;
    
    // Setup save settings button
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
}

// Function to save settings
function saveSettings() {
    const settings = {
        reminders: {
            enabled: document.getElementById('enable-reminder').checked,
            time: document.getElementById('reminder-time').value,
            endOfWeek: document.getElementById('end-of-week').checked
        },
        fiscalYear: {
            month: parseInt(document.getElementById('fiscal-month').value),
            day: parseInt(document.getElementById('fiscal-day').value),
            format: document.getElementById('fiscal-format').value,
            useQuarters: document.getElementById('use-quarters').checked
        }
    };
    
    // Save to storage
    Storage.save('settings', settings);
    
    // Show confirmation
    alert('Settings saved successfully!');
}

// Function to setup reminders
function setupReminders() {
    const settings = Storage.get('settings');
    
    if (!settings || !settings.reminders || !settings.reminders.enabled) {
        return;
    }
    
    // Request notification permission
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    // Check if we should show a reminder
    checkReminder();
    
    // Set interval to check for reminders (every minute)
    setInterval(checkReminder, 60000);
}

function checkReminder() {
    const settings = Storage.get('settings');
    
    if (!settings || !settings.reminders || !settings.reminders.enabled) {
        return;
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    // Parse reminder time (format: HH:MM)
    const [hours, minutes] = settings.reminders.time.split(':').map(Number);
    const reminderTime = hours * 100 + minutes;
    
    // Check if it's time for the daily reminder
    if (Math.abs(currentTime - reminderTime) <= 1) { // Within 1 minute
        showNotification('UpdateMe Reminder', 'Time to update your work entries for today!');
    }
    
    // Check for end-of-week reminder (Friday at 3PM)
    if (settings.reminders.endOfWeek && 
        now.getDay() === 5 && // Friday
        now.getHours() === 15 && // 3PM
        now.getMinutes() === 0) {
        showNotification('Weekly Update Reminder', 'Time to prepare your weekly status update!');
    }
}

function showNotification(title, message) {
    // Check if notifications are supported and permitted
    if (!('Notification' in window)) {
        console.log('Notifications not supported');
        return;
    }
    
    if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
    }
    
    // Create and show notification
    const notification = new Notification(title, {
        body: message,
        icon: 'assets/icon.png' // Add an icon file to your assets folder
    });
    
    // Handle notification click
    notification.onclick = function() {
        window.focus();
        notification.close();
    };
}