// scripts/templates.js
function initializeTemplates() {
    const templateList = document.getElementById('template-list');
    const newTemplateBtn = document.getElementById('new-template-btn');
    const templateEditor = document.getElementById('template-editor');
    const templateNameInput = document.getElementById('template-name');
    const templateContent = document.getElementById('template-content');
    const saveTemplateBtn = document.getElementById('save-template-btn');
    const cancelTemplateBtn = document.getElementById('cancel-template-btn');
    const templateSelect = document.getElementById('template-select');
    
    // Rich text editor setup
    const templateToolbar = templateContent.previousElementSibling;
    const templateRichEditor = setupRichTextEditor(templateContent, templateToolbar);
    
    // Display templates
    displayTemplates();
    populateTemplateSelect();
    
    // New template button
    newTemplateBtn.addEventListener('click', () => {
        // Show template editor
        templateEditor.style.display = 'block';
        templateNameInput.value = '';
        templateRichEditor.setContent('');
        templateNameInput.focus();
        
        // Reset save button
        saveTemplateBtn.textContent = 'Save Template';
        saveTemplateBtn.removeAttribute('data-id');
    });
    
    // Save template button
    saveTemplateBtn.addEventListener('click', () => {
        const name = templateNameInput.value.trim();
        const content = templateRichEditor.getContent();
        
        if (!name) {
            alert('Please enter a template name');
            return;
        }
        
        if (!content.trim()) {
            alert('Please enter template content');
            return;
        }
        
        // Check if we're updating or creating
        const templateId = saveTemplateBtn.getAttribute('data-id');
        
        if (templateId) {
            // Update existing template
            updateTemplate(templateId, name, content);
        } else {
            // Create template object
            const template = {
                id: Date.now().toString(),
                name: name,
                content: content,
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            };
            
            // Save template
            saveTemplate(template);
        }
        
        // Hide editor
        templateEditor.style.display = 'none';
        
        // Refresh display
        displayTemplates();
        populateTemplateSelect();
    });
    
    // Cancel button
    cancelTemplateBtn.addEventListener('click', () => {
        // Hide editor
        templateEditor.style.display = 'none';
    });
    
    function saveTemplate(template) {
        // Get existing templates
        let templates = Storage.get('templates') || [];
        
        // Add new template
        templates.push(template);
        
        // Save to storage
        Storage.save('templates', templates);
    }
    
    function updateTemplate(id, name, content) {
        // Get existing templates
        let templates = Storage.get('templates') || [];
        
        // Find the template
        const templateIndex = templates.findIndex(t => t.id === id);
        
        if (templateIndex === -1) {
            alert('Template not found');
            return;
        }
        
        // Update the template
        templates[templateIndex].name = name;
        templates[templateIndex].content = content;
        templates[templateIndex].updated = new Date().toISOString();
        
        // Save to storage
        Storage.save('templates', templates);
    }
    
    function displayTemplates() {
        // Get templates
        let templates = Storage.get('templates') || [];
        
        // Clear container
        templateList.innerHTML = '';
        
        // Display templates
        if (templates.length === 0) {
            templateList.innerHTML = '<p class="empty-message">No templates yet. Create your first template!</p>';
        } else {
            templates.forEach(template => {
                const templateEl = document.createElement('div');
                templateEl.className = 'template-item';
                
                const updated = formatDate(new Date(template.updated));
                
                templateEl.innerHTML = `
                    <h3>${template.name}</h3>
                    <p class="template-meta">Last edited: ${updated}</p>
                    <div class="template-actions">
                        <button class="btn-preview" data-id="${template.id}">Preview</button>
                        <button class="btn-edit" data-id="${template.id}">Edit</button>
                        <button class="btn-delete" data-id="${template.id}">Delete</button>
                    </div>
                `;
                
                templateList.appendChild(templateEl);
            });
            
            // Add event listeners for buttons
            templateList.querySelectorAll('.btn-preview').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const templateId = button.getAttribute('data-id');
                    previewTemplate(templateId);
                });
            });
            
            templateList.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const templateId = button.getAttribute('data-id');
                    editTemplate(templateId);
                });
            });
            
            templateList.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const templateId = button.getAttribute('data-id');
                    deleteTemplate(templateId);
                });
            });
        }
    }
    
    function previewTemplate(id) {
        // Get templates
        let templates = Storage.get('templates') || [];
        
        // Find the template
        const template = templates.find(t => t.id === id);
        
        if (!template) {
            alert('Template not found');
            return;
        }
        
        // Create a clean version of the content
        const cleanContent = template.content
            .replace(/background-color:[^;]+;/g, '')  // Remove background color
            .replace(/background:[^;]+;/g, '')  // Remove background
            .replace(/color:#[0-9a-fA-F]+;/g, '') // Remove existing color styles
            .replace(/style="[^"]*"/g, '')  // Remove any inline styles
            .replace(/(<[^>]+) style\s*=\s*"[^"]*"/g, '$1')  // Remove style attributes
            .replace(/url\([^)]+\)/g, '');  // Remove any background image URLs
        
        // Create and show preview modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="background: transparent; box-shadow: none;">
                <div class="modal-header" style="background: none; border-bottom: none;">
                    <h3 style="color: #333;">${template.name} - Preview</h3>
                    <button class="modal-close" style="color: #333;">&times;</button>
                </div>
                <div class="modal-body" style="background: none;">
                    <div class="template-preview" style="background: none; color: #333; line-height: 1.6; padding: 0;">
                        ${cleanContent}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close button event
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Add CSS to ensure emojis are inline and text is black
        const styleTag = document.createElement('style');
        styleTag.textContent = `
            .template-preview,
            .template-preview * {
                color: #333 !important;
                background: none !important;
            }
            .template-preview img {
                display: inline-block;
                vertical-align: middle;
                margin: 0 2px;
                height: 1em;
                width: 1em;
            }
            .template-preview ul {
                padding-left: 20px;
            }
        `;
        modal.querySelector('.modal-content').appendChild(styleTag);
    }
    
    function editTemplate(id) {
        // Get templates
        let templates = Storage.get('templates') || [];
        
        // Find the template
        const template = templates.find(t => t.id === id);
        
        if (!template) {
            alert('Template not found');
            return;
        }
        
        // Show editor with template data
        templateEditor.style.display = 'block';
        templateNameInput.value = template.name;
        templateRichEditor.setContent(template.content);
        
        // Update save button to update instead of create new
        saveTemplateBtn.setAttribute('data-id', template.id);
        saveTemplateBtn.textContent = 'Update Template';
    }
    
    function deleteTemplate(id) {
        if (confirm('Are you sure you want to delete this template?')) {
            // Get templates
            let templates = Storage.get('templates') || [];
            
            // Remove the template
            templates = templates.filter(t => t.id !== id);
            
            // Save to storage
            Storage.save('templates', templates);
            
            // Refresh display
            displayTemplates();
            populateTemplateSelect();
        }
    }
    
    function populateTemplateSelect() {
        // Get templates
        let templates = Storage.get('templates') || [];
        
        // Clear select
        templateSelect.innerHTML = '<option value="">Select a template</option>';
        
        // Add template options
        templates.forEach(template => {
            const option = document.createElement('option');
            option.value = template.id;
            option.textContent = template.name;
            templateSelect.appendChild(option);
        });
    }
}

function initializeStatusGenerator() {
    const templateSelect = document.getElementById('template-select');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-status-btn');
    const statusPreview = document.getElementById('status-preview');
    const copyBtn = document.getElementById('copy-status-btn');
    
    // Set default dates (current week)
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Saturday
    
    startDateInput.value = startOfWeek.toISOString().split('T')[0];
    endDateInput.value = endOfWeek.toISOString().split('T')[0];
    
    // Generate button
    generateBtn.addEventListener('click', () => {
        const templateId = templateSelect.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (!templateId) {
            alert('Please select a template');
            return;
        }
        
        if (!startDate || !endDate) {
            alert('Please select a date range');
            return;
        }
        
        // Get template
        const templates = Storage.get('templates') || [];
        const template = templates.find(t => t.id === templateId);
        
        if (!template) {
            alert('Template not found');
            return;
        }
        
        // Get entries in date range
        const entries = Storage.get('entries') || [];
        const filteredEntries = entries.filter(entry => {
            const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
            return entryDate >= startDate && entryDate <= endDate;
        });
        
        // Group entries by category
        const groupedEntries = {
            achievement: [],
            blocker: [],
            progress: [],
            meeting: [],
            other: []
        };
        
        filteredEntries.forEach(entry => {
            groupedEntries[entry.category].push(entry);
        });
        
        // Create status update
        let statusContent = template.content;
        
        // Extract the formatted date range for the title
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateRange = `${formatDate(start)} - ${formatDate(end)}`;
        
        // Replace any placeholders with actual content
        statusContent = replaceContentPlaceholders(statusContent, groupedEntries, dateRange);
        
        // Show the preview
        statusPreview.innerHTML = statusContent;
        
        // Show copy button
        copyBtn.style.display = 'block';
    });
    
    // Function to replace placeholders with content
    function replaceContentPlaceholders(content, groupedEntries, dateRange) {
        // Replace date range if there's a {date_range} placeholder
        content = content.replace(/{date_range}/g, dateRange);
        
        // Look for sections and add entries
        const categoryLabels = {
            achievement: ['achievements', 'completed', 'accomplished', 'done'],
            blocker: ['blockers', 'issues', 'problems', 'challenges'],
            progress: ['progress', 'in progress', 'ongoing', 'working on'],
            meeting: ['meetings', 'calls', 'discussions', 'syncs'],
            other: ['other', 'miscellaneous', 'notes']
        };
        
        // For each category, try to find a matching section and populate it
        for (const [category, labels] of Object.entries(categoryLabels)) {
            if (groupedEntries[category].length > 0) {
                // Create a bulleted list of entries
                const entriesHtml = groupedEntries[category].map(entry => 
                    `<li>${entry.content.replace(/<\/?div>/g, '')}</li>`
                ).join('');
                
                // Try to find a section for this category
                let foundSection = false;
                
                // Check each label for this category
                for (const label of labels) {
                    // Create a regex that looks for headings with this label
                    const regex = new RegExp(`(<h[1-6][^>]*>.*?${label}.*?<\/h[1-6]>)`, 'i');
                    
                    if (regex.test(content)) {
                        // Found a heading matching this category, insert entries after it
                        content = content.replace(regex, `$1\n<ul>${entriesHtml}</ul>`);
                        foundSection = true;
                        break;
                    }
                }
                
                // If no section was found but we have bullets, maybe look for emoji headings
                if (!foundSection) {
                    for (const label of labels) {
                        const emojiRegex = new RegExp(`([📋🎯✅⚠️🚀🗓️].*?${label}.*?)(?:<br|<\/|<div)`, 'i');
                        
                        if (emojiRegex.test(content)) {
                            content = content.replace(emojiRegex, `$1\n<ul>${entriesHtml}</ul>`);
                            foundSection = true;
                            break;
                        }
                    }
                }
            }
        }
        
        return content;
    }
    
    // Copy button
    copyBtn.addEventListener('click', () => {
        // Get clean text version without backgrounds
        const cleanedHtml = statusPreview.innerHTML
            .replace(/background-color:[^;]++;/g, '')  // Remove background color
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

// Initialize both template and status generator functions
document.addEventListener('DOMContentLoaded', () => {
    initializeTemplates();
    initializeStatusGenerator();
});