/**
 * Utility functions for the application
 */

// Format date as MM/DD/YYYY
function formatDate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
}

// Format time as HH:MM AM/PM
function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get today's date as string in YYYY-MM-DD format
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

// Add rich text editor functionality to an element
function setupRichTextEditor(editorElement, toolbarElement) {
    // Add event listeners to toolbar buttons
    toolbarElement.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const command = button.getAttribute('data-command');
            document.execCommand(command, false, null);
            editorElement.focus();
        });
    });
    
    // Handle placeholder text
    editorElement.addEventListener('focus', function() {
        if (this.innerHTML === '') {
            // Clear the placeholder when focused
            this.classList.add('focused');
        }
    });
    
    editorElement.addEventListener('blur', function() {
        if (this.innerHTML === '') {
            // Show placeholder when blurred and empty
            this.classList.remove('focused');
        }
    });
    
    return {
        getContent: () => editorElement.innerHTML,
        setContent: (content) => { editorElement.innerHTML = content; },
        clear: () => { editorElement.innerHTML = ''; }
    };
}

// Convert fiscal quarter to string (e.g., "FY25-Q1")
function getFiscalQuarterString(date, fiscalYearStart, format = 'FY-YY') {
    const d = new Date(date);
    const month = d.getMonth();
    const year = d.getFullYear();
    
    // Determine fiscal year
    let fiscalYear = year;
    if (month < fiscalYearStart.month || (month === fiscalYearStart.month && d.getDate() < fiscalYearStart.day)) {
        fiscalYear = year - 1;
    }
    
    // Determine quarter
    let monthsAfterFYStart = month - fiscalYearStart.month;
    if (monthsAfterFYStart < 0) {
        monthsAfterFYStart += 12;
    }
    const quarter = Math.floor(monthsAfterFYStart / 3) + 1;
    
    // Format the fiscal year string
    let fyString;
    if (format === 'FY-YY') {
        fyString = `FY-${(fiscalYear % 100).toString().padStart(2, '0')}`;
    } else if (format === 'FY-YYYY') {
        fyString = `FY-${fiscalYear}`;
    } else if (format === 'FYXX') {
        fyString = `FY${(fiscalYear % 100).toString().padStart(2, '0')}`;
    }
    
    return `${fyString}-Q${quarter}`;
}