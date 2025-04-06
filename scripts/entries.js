// scripts/entries.js
function initializeEntries(richEditor) {
    const addEntryBtn = document.getElementById('add-entry-btn');
    const entriesContainer = document.getElementById('entries-container');
    
    // Load and display existing entries
    displayEntries();
    
    // Add new entry
    addEntryBtn.addEventListener('click', () => {
        const content = richEditor.getContent();
        if (!content.trim()) return;
        
        // Check if this is an update or a new entry
        const entryId = addEntryBtn.getAttribute('data-id');
        
        if (entryId) {
            // Update existing entry
            updateExistingEntry(entryId, content);
            
            // Reset UI
            richEditor.clear();
            addEntryBtn.textContent = 'Add Entry';
            addEntryBtn.removeAttribute('data-id');
            
            // Remove cancel button if it exists
            const cancelBtn = document.getElementById('cancel-edit-btn');
            if (cancelBtn) cancelBtn.remove();
        } else {
            // Create new entry
            createNewEntry(content, richEditor);
        }
        
        // Refresh display
        displayEntries();
    });
    
    function createNewEntry(content, richEditor) {
        // More robust category detection
        let category = 'other';
        const text = content.toLowerCase();
        
        // More comprehensive keyword matching
        const keywords = {
            achievement: ['complet', 'finish', 'deliver', 'ship', 'done', 'achiev', 'success', 'accomplish', 'resolv', 'fix'],
            blocker: ['block', 'issue', 'problem', 'delay', 'stuck', 'fail', 'error', 'bug', 'prevent', 'cannot', 'broken'],
            progress: ['progress', 'work', 'develop', 'implement', 'build', 'creat', 'draft', 'start', 'continu', 'updat'],
            meeting: ['meet', 'call', 'discuss', 'talk', 'sync', 'review', 'present', 'demo', 'interview', 'conference']
        };
        
        // Check each keyword category
        for (const [cat, words] of Object.entries(keywords)) {
            if (words.some(word => text.includes(word))) {
                category = cat;
                break;
            }
        }
        
        // Create entry object
        const entry = {
            id: Date.now().toString(),
            content: content,
            category: category,
            timestamp: new Date().toISOString()
        };
        
        // Save entry
        saveEntry(entry);
        
        // Clear editor
        richEditor.clear();
    }
    
    function updateExistingEntry(entryId, content) {
        // Get entries
        let entries = Storage.get('entries') || [];
        
        // Find the entry
        const entryIndex = entries.findIndex(e => e.id === entryId);
        
        if (entryIndex === -1) {
            alert('Entry not found');
            return;
        }
        
        // Update the content
        entries[entryIndex].content = content;
        entries[entryIndex].updated = new Date().toISOString();
        
        // Update the category based on the new content
        const text = content.toLowerCase();
        
        // More comprehensive keyword matching
        const keywords = {
            achievement: ['complet', 'finish', 'deliver', 'ship', 'done', 'achiev', 'success', 'accomplish', 'resolv', 'fix'],
            blocker: ['block', 'issue', 'problem', 'delay', 'stuck', 'fail', 'error', 'bug', 'prevent', 'cannot', 'broken'],
            progress: ['progress', 'work', 'develop', 'implement', 'build', 'creat', 'draft', 'start', 'continu', 'updat'],
            meeting: ['meet', 'call', 'discuss', 'talk', 'sync', 'review', 'present', 'demo', 'interview', 'conference']
        };
        
        // Check each keyword category
        let category = 'other';
        for (const [cat, words] of Object.entries(keywords)) {
            if (words.some(word => text.includes(word))) {
                category = cat;
                break;
            }
        }
        
        entries[entryIndex].category = category;
        
        // Save to storage
        Storage.save('entries', entries);
    }
    
    function saveEntry(entry) {
        // Get existing entries
        let entries = Storage.get('entries') || [];
        
        // Add new entry
        entries.push(entry);
        
        // Save to storage
        Storage.save('entries', entries);
    }
    
    function displayEntries() {
        // Get entries
        let entries = Storage.get('entries') || [];
        
        // Filter for today's entries
        const today = new Date();
        const todayEntries = entries.filter(entry => 
            isSameDay(new Date(entry.timestamp), today)
        );
        
        // Clear container
        entriesContainer.innerHTML = '';
        
        // Display entries
        if (todayEntries.length === 0) {
            entriesContainer.innerHTML = '<p class="empty-message">No entries for today. Add something!</p>';
        } else {
            // Sort entries by timestamp (newest first)
            todayEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            todayEntries.forEach(entry => {
                const entryEl = document.createElement('div');
                entryEl.className = `entry-item entry-${entry.category}`;
                
                const time = formatTime(new Date(entry.timestamp));
                
                entryEl.innerHTML = `
                    <div class="entry-content">${entry.content}</div>
                    <div class="entry-meta">
                        <span class="entry-category">${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}</span>
                        <span class="entry-time">${time}</span>
                        <div class="entry-actions">
                            <button class="btn-edit" data-id="${entry.id}">Edit</button>
                            <button class="btn-delete" data-id="${entry.id}">Delete</button>
                        </div>
                    </div>
                `;
                
                entriesContainer.appendChild(entryEl);
            });
            
            // Add event listeners for edit and delete buttons
            entriesContainer.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const entryId = button.getAttribute('data-id');
                    editEntry(entryId);
                });
            });
            
            entriesContainer.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const entryId = button.getAttribute('data-id');
                    deleteEntry(entryId);
                });
            });
        }
    }
    
    function editEntry(id) {
        // Get entries
        let entries = Storage.get('entries') || [];
        
        // Find the entry
        const entry = entries.find(e => e.id === id);
        
        if (!entry) {
            alert('Entry not found');
            return;
        }
        
        // Set the editor content
        richEditor.setContent(entry.content);
        
        // Change the add button to update
        addEntryBtn.textContent = 'Update Entry';
        addEntryBtn.setAttribute('data-id', id);
        
        // Add a cancel button
        if (!document.getElementById('cancel-edit-btn')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancel-edit-btn';
            cancelBtn.className = 'button-outline';
            cancelBtn.textContent = 'Cancel';
            addEntryBtn.parentNode.insertBefore(cancelBtn, addEntryBtn);
            
            cancelBtn.addEventListener('click', () => {
                // Reset to add mode
                richEditor.clear();
                addEntryBtn.textContent = 'Add Entry';
                addEntryBtn.removeAttribute('data-id');
                cancelBtn.remove();
            });
        }
    }
    
    function deleteEntry(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            // Get entries
            let entries = Storage.get('entries') || [];
            
            // Remove the entry
            entries = entries.filter(e => e.id !== id);
            
            // Save to storage
            Storage.save('entries', entries);
            
            // Refresh display
            displayEntries();
        }
    }
}