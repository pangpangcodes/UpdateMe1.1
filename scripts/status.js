// scripts/status.js
function initializeStatusGenerator() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const formatExampleEditor = document.getElementById('format-example');
    const formatToolbar = formatExampleEditor.previousElementSibling;
    const formatRichEditor = setupRichTextEditor(formatExampleEditor, formatToolbar);
    const generateBtn = document.getElementById('generate-status-btn');
    const statusPreview = document.getElementById('status-preview');
    const copyBtn = document.getElementById('copy-status-btn');
    
    // Set default dates (last 2 weeks)
    const today = new Date();
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    startDateInput.value = twoWeeksAgo.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];
    
    // Generate button
    generateBtn.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const formatExample = formatRichEditor.getContent();
        
        if (!startDate || !endDate) {
            alert('Please select a date range');
            return;
        }
        
        if (!formatExample.trim()) {
            alert('Please provide an example format');
            return;
        }
        
        // Get entries in date range
        const entries = Storage.get('entries') || [];
        const filteredEntries = entries.filter(entry => {
            const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
            return entryDate >= startDate && entryDate <= endDate;
        });
        
        if (filteredEntries.length === 0) {
            statusPreview.innerHTML = '<p class="empty-message">No entries found in the selected date range.</p>';
            copyBtn.style.display = 'none';
            return;
        }
        
        // Group entries by category
        const groupedEntries = {};
        
        filteredEntries.forEach(entry => {
            if (!groupedEntries[entry.category]) {
                groupedEntries[entry.category] = [];
            }
            groupedEntries[entry.category].push(entry);
        });
        
        // Extract the formatted date range for the title
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateRange = `${formatDate(start)} - ${formatDate(end)}`;
        
        // Create status update based on the example format
        let statusContent = generateStatusFromExample(formatExample, groupedEntries, dateRange);
        
        // Show the preview
        statusPreview.innerHTML = statusContent;
        
        // Show copy button
        copyBtn.style.display = 'block';
    });
    
    // Function to generate status update based on example format
    function generateStatusFromExample(example, groupedEntries, dateRange) {
        // Start with the example as the base
        let result = example;
        
        // Replace date range placeholders
        result = result.replace(/\{date[_\s]range\}/gi, dateRange);
        result = result.replace(/\{date\}/gi, dateRange);
        result = result.replace(/\{period\}/gi, dateRange);
        
        // Look for section patterns in the example
        // This will attempt to match headings/sections for various categories
        
        // Common header patterns (h1-h6, bold text, etc.)
        const headerPatterns = [
            /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi,
            /<strong>(.*?)<\/strong>/gi,
            /<b>(.*?)<\/b>/gi
        ];
        
        // Try to identify sections in the example
        const potentialSections = [];
        
        // Extract potential section titles from headers
        headerPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(example)) !== null) {
                potentialSections.push(match[1].toLowerCase());
            }
        });
        
        // For each category of entries
        Object.keys(groupedEntries).forEach(category => {
            const entries = groupedEntries[category];
            if (entries.length === 0) return;
            
            // Try to find a matching section in the example
            let matchedSection = null;
            
            // Category synonyms to check
            const synonyms = categoryToSynonyms(category);
            
            // Check if any potential section might match this category
            for (const section of potentialSections) {
                for (const synonym of synonyms) {
                    if (section.includes(synonym)) {
                        matchedSection = section;
                        break;
                    }
                }
                if (matchedSection) break;
            }
            
            if (matchedSection) {
                // Create a bullet list of entries
                const entriesHtml = entries.map(entry => 
                    `<li>${entry.content.replace(/<\/?div>/g, '')}</li>`
                ).join('');
                
                const bulletList = `<ul>${entriesHtml}</ul>`;
                
                // For each header pattern, try to find and insert after the matching section
                headerPatterns.forEach(pattern => {
                    pattern.lastIndex = 0; // Reset the regex
                    let match;
                    while ((match = pattern.exec(example)) !== null) {
                        if (match[1].toLowerCase() === matchedSection) {
                            // Insert the bullet list after this header
                            const beforeHeader = example.substring(0, match.index + match[0].length);
                            const afterHeader = example.substring(match.index + match[0].length);
                            
                            // Don't replace if there's already content there
                            if (!afterHeader.trim().startsWith('<ul>')) {
                                result = result.replace(match[0], match[0] + bulletList);
                            }
                        }
                    }
                });
            } else {
                // No matching section found, append to the end
                const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
                const entriesHtml = entries.map(entry => 
                    `<li>${entry.content.replace(/<\/?div>/g, '')}</li>`
                ).join('');
                
                result += `<h3>${categoryTitle}</h3><ul>${entriesHtml}</ul>`;
            }
        });
        
        return result;
    }
    
    // Helper function to map categories to common synonyms
    function categoryToSynonyms(category) {
        const mappings = {
            'meeting': ['meeting', 'meetings', 'call', 'calls', 'discussion', 'discussions', 'sync', 'syncs'],
            'launch': ['launch', 'launches', 'release', 'releases', 'ship', 'shipping', 'deployment', 'deployments'],
            'progress': ['progress', 'in progress', 'ongoing', 'working on', 'current', 'development', 'implemented'],
            'blocker': ['blocker', 'blockers', 'issue', 'issues', 'problem', 'problems', 'challenge', 'challenges', 'impediment'],
            'general': ['general', 'update', 'updates', 'status', 'summary', 'overview'],
            'other': ['other', 'miscellaneous', 'misc', 'note', 'notes']
        };
        
        // Try to find an exact match first
        if (mappings[category.toLowerCase()]) {
            return mappings[category.toLowerCase()];
        }
        
        // If no exact match, return the category itself as a single synonym
        return [category.toLowerCase()];
    }
    
    // Copy button
    copyBtn.addEventListener('click', () => {
        // Get clean text version without backgrounds
        const cleanedHtml = statusPreview.innerHTML
            .replace(/background-color:[^;]+;/g, '')  // Fixed regex: removed extra +
            .replace(/background:[^;]+;/g, '')  // Remove background
            .replace(/style="[^"]*background[^"]*"/g, '');
        
        // Create a temporary div to hold the cleaned content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanedHtml;
        
        // Get the text content
        const cleanText = tempDiv.innerText;
        
        // Create a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = cleanText;
        
        // Hide the textarea (optional)
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        
        // Add to the document
        document.body.appendChild(textarea);
        
        // Select and copy
        textarea.select();
        document.execCommand('copy');
        
        // Clean up
        document.body.removeChild(textarea);
        tempDiv.remove();
        
        // Show confirmation
        alert('Status update copied to clipboard!');
    });
}