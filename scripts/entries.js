// scripts/entries.js
function initializeEntries(richEditor) {
    const addEntryBtn = document.getElementById('add-entry-btn');
    const entriesContainer = document.getElementById('entries-container');
    const categorySelect = document.getElementById('category-select');
    const customCategoryInput = document.getElementById('custom-category');
    const entryDateInput = document.getElementById('entry-date');
    
    // Pagination variables
    const ENTRIES_PER_PAGE = 5;
    let currentPage = 1;
    let totalPages = 1;
    
    // Set default date (today) for new entries
    entryDateInput.valueAsDate = new Date();
    
    // Setup custom category input
    categorySelect.addEventListener('change', function() {
        if (this.value === 'custom') {
            customCategoryInput.style.display = 'inline-block';
            customCategoryInput.focus();
        } else {
            customCategoryInput.style.display = 'none';
        }
    });
    
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
        // Get selected category
        let category = categorySelect.value;
        
        // Handle custom category
        if (category === 'custom') {
            const customValue = customCategoryInput.value.trim();
            category = customValue || 'other';
            customCategoryInput.value = '';
        } else if (!category) {
            // Default to 'other' if no category selected
            category = 'other';
        }
        
        // Get selected date or default to today
        let entryDate = entryDateInput.valueAsDate || new Date();
        
        // Create entry timestamp for selected date (keeping current time)
        let timestamp = new Date();
        timestamp.setFullYear(entryDate.getFullYear());
        timestamp.setMonth(entryDate.getMonth());
        timestamp.setDate(entryDate.getDate());
        
        // Create entry object
        const entry = {
            id: Date.now().toString(),
            content: content,
            category: category,
            timestamp: timestamp.toISOString()
        };
        
        // Save entry
        saveEntry(entry);
        
        // Clear editor and reset category
        richEditor.clear();
        categorySelect.value = '';
        customCategoryInput.style.display = 'none';
        
        // Always go to the first page when adding a new entry
        currentPage = 1;
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
        
        // Get selected category
        let category = categorySelect.value;
        
        // Handle custom category
        if (category === 'custom') {
            const customValue = customCategoryInput.value.trim();
            category = customValue || entries[entryIndex].category;
            customCategoryInput.value = '';
        } else if (!category) {
            // Keep existing category if no new one selected
            category = entries[entryIndex].category;
        }
        
        // Get selected date or use the original date
        let newDate = entryDateInput.valueAsDate || new Date();
        
        // Create a new timestamp with the selected date but keeping the original time
        const originalTime = new Date(entries[entryIndex].timestamp);
        const newTimestamp = new Date(
            newDate.getFullYear(),
            newDate.getMonth(),
            newDate.getDate(),
            originalTime.getHours(),
            originalTime.getMinutes(),
            originalTime.getSeconds()
        );
        
        // Update the entry
        entries[entryIndex].content = content;
        entries[entryIndex].category = category;
        entries[entryIndex].timestamp = newTimestamp.toISOString();
        entries[entryIndex].updated = new Date().toISOString();
        
        // Save to storage
        Storage.save('entries', entries);
        
        // Reset form
        categorySelect.value = '';
        customCategoryInput.style.display = 'none';
        entryDateInput.valueAsDate = new Date();
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
        
        // Sort entries by timestamp (newest first)
        entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Calculate total pages
        totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
        
        // Ensure current page is valid
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        if (currentPage < 1 || isNaN(currentPage)) {
            currentPage = 1;
        }
        
        // Clear container
        entriesContainer.innerHTML = '';
        
        // Display entries
        if (entries.length === 0) {
            entriesContainer.innerHTML = '<p class="empty-message">No entries yet. Add something!</p>';
        } else {
            // Get entries for current page
            const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
            const endIndex = Math.min(startIndex + ENTRIES_PER_PAGE, entries.length);
            const pageEntries = entries.slice(startIndex, endIndex);
            
            // Create entries list
            const entriesList = document.createElement('div');
            entriesList.className = 'entries-list';
            
            pageEntries.forEach(entry => {
                const entryEl = document.createElement('div');
                entryEl.className = `entry-item entry-${entry.category.replace(/\s+/g, '-').toLowerCase()}`;
                
                const entryDate = new Date(entry.timestamp);
                const time = formatTime(entryDate);
                const date = formatDate(entryDate);
                
                entryEl.innerHTML = `
                    <div class="entry-content">${entry.content}</div>
                    <div class="entry-meta">
                        <span class="entry-category">${entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}</span>
                        <span class="entry-date">${date} ${time}</span>
                        <div class="entry-actions">
                            <button class="btn-edit" data-id="${entry.id}">Edit</button>
                            <button class="btn-delete" data-id="${entry.id}">Delete</button>
                        </div>
                    </div>
                `;
                
                entriesList.appendChild(entryEl);
            });
            
            entriesContainer.appendChild(entriesList);
            
            // Create pagination controls
            if (totalPages > 1) {
                const paginationEl = document.createElement('div');
                paginationEl.className = 'pagination';
                
                // First page button
                const firstBtn = document.createElement('button');
                firstBtn.textContent = '«';
                firstBtn.disabled = currentPage === 1;
                firstBtn.addEventListener('click', () => {
                    currentPage = 1;
                    displayEntries();
                });
                
                // Previous page button
                const prevBtn = document.createElement('button');
                prevBtn.textContent = '‹';
                prevBtn.disabled = currentPage === 1;
                prevBtn.addEventListener('click', () => {
                    currentPage--;
                    displayEntries();
                });
                
                // Page info
                const pageInfo = document.createElement('span');
                pageInfo.className = 'page-info';
                pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
                
                // Next page button
                const nextBtn = document.createElement('button');
                nextBtn.textContent = '›';
                nextBtn.disabled = currentPage === totalPages;
                nextBtn.addEventListener('click', () => {
                    currentPage++;
                    displayEntries();
                });
                
                // Last page button
                const lastBtn = document.createElement('button');
                lastBtn.textContent = '»';
                lastBtn.disabled = currentPage === totalPages;
                lastBtn.addEventListener('click', () => {
                    currentPage = totalPages;
                    displayEntries();
                });
                
                // Add all elements to pagination container
                paginationEl.appendChild(firstBtn);
                paginationEl.appendChild(prevBtn);
                paginationEl.appendChild(pageInfo);
                paginationEl.appendChild(nextBtn);
                paginationEl.appendChild(lastBtn);
                
                entriesContainer.appendChild(paginationEl);
            }
            
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
        
        // Set the entry date
        const entryDate = new Date(entry.timestamp);
        entryDateInput.valueAsDate = new Date(
            entryDate.getFullYear(),
            entryDate.getMonth(),
            entryDate.getDate()
        );
        
        // Set the category dropdown
        if (['meeting', 'launch', 'progress', 'blocker', 'general'].includes(entry.category)) {
            categorySelect.value = entry.category;
            customCategoryInput.style.display = 'none';
        } else {
            categorySelect.value = 'custom';
            customCategoryInput.value = entry.category;
            customCategoryInput.style.display = 'inline-block';
        }
        
        // Change the add button to update
        addEntryBtn.textContent = 'Update Entry';
        addEntryBtn.setAttribute('data-id', id);
        
        // Scroll to editor
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
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
                categorySelect.value = '';
                customCategoryInput.style.display = 'none';
                entryDateInput.valueAsDate = new Date();
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