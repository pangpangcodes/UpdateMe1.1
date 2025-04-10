// scripts/templates.js
function saveTemplate(template) {
    // Get existing templates
    let templates = Storage.get('templates') || [];
    
    // Add new template
    templates.push(template);
    
    // Save to storage
    Storage.save('templates', templates);
    
    // Verify storage
    const storedTemplates = Storage.get('templates');
    console.log('Templates after saving:', storedTemplates);
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
    
    // Get reference to template list container
    const templateList = document.getElementById('template-list');
    
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

function populateTemplateSelect() {
    // Get reference to template select element
    const templateSelect = document.getElementById('template-select');
    
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

function cleanTemplateContent(content) {
    // Remove Slack-specific styling and backgrounds
    let cleanedContent = content
        .replace(/background-color:\s*#[0-9a-fA-F]+\s*;?/gi, '')
        .replace(/background:\s*#[0-9a-fA-F]+\s*;?/gi, '')
        .replace(/style="\s*background[^"]*"/gi, '')
        .replace(/style="\s*color[^"]*"/gi, '')
        .replace(/<div\s+style="[^"]*">/gi, '<div>')
        .replace(/<span\s+style="[^"]*">/gi, '<span>');

    // Ensure emojis are inline
    cleanedContent = cleanedContent.replace(/([🌟🎉✅⚠️🚀📋🏆🔥📈🤝])\s*/g, 
        '<img src="/api/emoji/$1" alt="$1" style="display:inline-block;vertical-align:middle;height:1em;width:1em;margin:0 2px;">')

    return cleanedContent;
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
    
    // Clean the content
    const cleanedContent = cleanTemplateContent(template.content);
    
    // Create and show preview modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${template.name} - Preview</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="template-preview">
                    ${cleanedContent}
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
    
    // Get references to elements
    const templateEditor = document.getElementById('template-editor');
    const templateNameInput = document.getElementById('template-name');
    const templateContent = document.getElementById('template-content');
    const saveTemplateBtn = document.getElementById('save-template-btn');
    
    // Rich text editor setup
    const templateToolbar = templateContent.previousElementSibling;
    const templateRichEditor = setupRichTextEditor(templateContent, templateToolbar);
    
    // Clean the content before setting
    const cleanedContent = cleanTemplateContent(template.content);
    
    // Show editor with template data
    templateEditor.style.display = 'block';
    templateNameInput.value = template.name;
    templateRichEditor.setContent(cleanedContent);
    
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

function initializeTemplates() {
    console.log('Initializing Templates');
    const templateList = document.getElementById('template-list');
    const newTemplateBtn = document.getElementById('new-template-btn');
    const templateEditor = document.getElementById('template-editor');
    const templateNameInput = document.getElementById('template-name');
    const templateContent = document.getElementById('template-content');
    const saveTemplateBtn = document.getElementById('save-template-btn');
    const cancelTemplateBtn = document.getElementById('cancel-template-btn');
    const templateSelect = document.getElementById('template-select');
    
    console.log('New Template Button:', newTemplateBtn);
    
    // Rich text editor setup
    const templateToolbar = templateContent.previousElementSibling;
    const templateRichEditor = setupRichTextEditor(templateContent, templateToolbar);
    
    // Display templates
    displayTemplates();
    populateTemplateSelect();
    
    // New template button
    if (newTemplateBtn) {
        newTemplateBtn.addEventListener('click', () => {
            console.log('New Template Button Clicked');
            
            // Show template editor
            templateEditor.style.display = 'block';
            templateNameInput.value = '';
            templateRichEditor.setContent('');
            templateNameInput.focus();
            
            // Reset save button
            saveTemplateBtn.textContent = 'Save Template';
            saveTemplateBtn.removeAttribute('data-id');
        });
    } else {
        console.error('New Template Button not found');
    }

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
}

// If this script is loaded after the DOMContentLoaded event, 
// we'll initialize immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTemplates);
} else {
    initializeTemplates();
}