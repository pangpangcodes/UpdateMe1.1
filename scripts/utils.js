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

// Clean HTML from pasted content
function cleanPastedHTML(html) {
    // Create a temporary div to manipulate the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove all background color styles
    const elementsWithStyle = tempDiv.querySelectorAll('*');
    elementsWithStyle.forEach(el => {
        if (el.style) {
            el.style.backgroundColor = '';
            el.style.background = '';
            el.style.color = '';
            el.style.fontSize = ''; // Remove any font size styling
        }
        
        // Remove style attribute completely to remove all styles
        el.removeAttribute('style');
        
        // Remove background-related classes
        if (el.className) {
            el.className = el.className.replace(/bg-\S+/g, '');
        }
    });
    
    // Remove all class attributes that might affect styling
    const elementsWithClass = tempDiv.querySelectorAll('[class]');
    elementsWithClass.forEach(el => {
        el.removeAttribute('class');
    });
    
    // Handle emoji images - ensure they're properly sized
    const emojiImages = tempDiv.querySelectorAll('img');
    emojiImages.forEach(img => {
        // Check if it's likely an emoji image
        const isEmoji = img.alt && 
                       (img.alt.length <= 2 || 
                        img.src.includes('emoji') || 
                        /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/u.test(img.alt));
        
        if (isEmoji) {
            img.style.width = '1em';
            img.style.height = '1em';
            img.style.verticalAlign = 'text-bottom';
            img.style.display = 'inline';
            img.className = 'emoji';
            
            // Create a span to wrap the emoji for better sizing control
            const span = document.createElement('span');
            span.style.display = 'inline';
            span.style.fontSize = 'inherit';
            span.className = 'emoji-wrapper';
            
            // Replace the image with the wrapped version
            if (img.parentNode) {
                img.parentNode.insertBefore(span, img);
                span.appendChild(img);
            }
        }
    });
    
    // Handle unicode emoji characters - ensure they're properly sized
    const textNodes = [];
    
    // Get all text nodes
    function getTextNodes(node) {
        if (node.nodeType === 3) { // Text node
            textNodes.push(node);
        } else if (node.nodeType === 1) { // Element node
            for (let i = 0; i < node.childNodes.length; i++) {
                getTextNodes(node.childNodes[i]);
            }
        }
    }
    
    getTextNodes(tempDiv);
    
    // Check for emojis in text nodes and wrap them
    textNodes.forEach(textNode => {
        const text = textNode.nodeValue;
        // More comprehensive emoji regex to catch more unicode emoji
        const emojiRegex = /[\u{1F000}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]/gu;
        
        if (emojiRegex.test(text)) {
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let match;
            
            emojiRegex.lastIndex = 0; // Reset regex
            
            while ((match = emojiRegex.exec(text)) !== null) {
                // Add text before emoji
                if (match.index > lastIndex) {
                    fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
                }
                
                // Add emoji in a span
                const emojiSpan = document.createElement('span');
                emojiSpan.style.display = 'inline';
                emojiSpan.style.verticalAlign = 'text-bottom';
                emojiSpan.style.fontSize = '1em';
                emojiSpan.style.lineHeight = '1';
                emojiSpan.className = 'emoji';
                emojiSpan.setAttribute('role', 'img');
                emojiSpan.textContent = match[0];
                fragment.appendChild(emojiSpan);
                
                lastIndex = emojiRegex.lastIndex;
            }
            
            // Add remaining text
            if (lastIndex < text.length) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            
            // Replace original text node with the fragment
            textNode.parentNode.replaceChild(fragment, textNode);
        }
    });
    
    return tempDiv.innerHTML;
}

// Function to apply emoji styling to any element
function applyEmojiStyling(element) {
    // First, normalize any emoji images
    const emojiImages = element.querySelectorAll('img');
    emojiImages.forEach(img => {
        // Check if likely an emoji
        if (img.alt && img.alt.length <= 2 || img.src.includes('emoji')) {
            img.style.width = '1em';
            img.style.height = '1em';
            img.style.verticalAlign = 'text-bottom';
            img.style.display = 'inline';
            img.className = 'emoji';
            
            // Make sure the parent span has the right styling
            if (img.parentNode && img.parentNode.tagName === 'SPAN') {
                img.parentNode.style.display = 'inline';
                img.parentNode.style.fontSize = 'inherit';
            }
        }
    });
    
    // Handle unicode emojis by finding them in text nodes
    const textWalker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const emojiRegex = /[\u{1F000}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]/gu;
    const nodesToReplace = [];
    
    // Find text nodes with emojis
    while (textWalker.nextNode()) {
        const node = textWalker.currentNode;
        if (emojiRegex.test(node.nodeValue)) {
            nodesToReplace.push(node);
        }
    }
    
    // Process nodes with emojis
    nodesToReplace.forEach(node => {
        const text = node.nodeValue;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;
        
        emojiRegex.lastIndex = 0; // Reset regex
        
        while ((match = emojiRegex.exec(text)) !== null) {
            // Add text before emoji
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            
            // Add emoji in a span
            const emojiSpan = document.createElement('span');
            emojiSpan.style.display = 'inline';
            emojiSpan.style.verticalAlign = 'text-bottom';
            emojiSpan.style.fontSize = '1em';
            emojiSpan.style.lineHeight = '1';
            emojiSpan.className = 'emoji';
            emojiSpan.setAttribute('role', 'img');
            emojiSpan.textContent = match[0];
            fragment.appendChild(emojiSpan);
            
            lastIndex = emojiRegex.lastIndex;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        
        // Replace original text node with the fragment
        if (node.parentNode) {
            node.parentNode.replaceChild(fragment, node);
        }
    });
}

// Add rich text editor functionality to an element
function setupRichTextEditor(editorElement, toolbarElement) {
    // Apply initial emoji styling to the editor
    applyEmojiStyling(editorElement);
    
    // Add event listeners to toolbar buttons
    toolbarElement.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const command = button.getAttribute('data-command');
            document.execCommand(command, false, null);
            editorElement.focus();
            
            // Apply emoji styling after content changes
            setTimeout(() => applyEmojiStyling(editorElement), 10);
        });
    });
    
    // Monitor for content changes including keyboard input
    editorElement.addEventListener('input', () => {
        setTimeout(() => applyEmojiStyling(editorElement), 10);
    });
    
    // Handle paste events to clean up styling
    editorElement.addEventListener('paste', function(e) {
        // Prevent the default paste behavior
        e.preventDefault();
        
        // Get clipboard data as HTML and as plain text
        let html = (e.clipboardData || window.clipboardData).getData('text/html');
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        
        // If HTML is available, clean it up
        if (html) {
            html = cleanPastedHTML(html);
            document.execCommand('insertHTML', false, html);
        } else {
            // If no HTML, use plain text
            document.execCommand('insertText', false, text);
        }
        
        // Apply emoji styling after paste
        setTimeout(() => applyEmojiStyling(editorElement), 50);
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
        getContent: () => {
            // Apply emoji styling before getting content
            applyEmojiStyling(editorElement);
            return editorElement.innerHTML;
        },
        setContent: (content) => { 
            editorElement.innerHTML = content;
            // Apply emoji styling after setting content
            setTimeout(() => applyEmojiStyling(editorElement), 10);
        },
        clear: () => { 
            editorElement.innerHTML = '';
        }
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