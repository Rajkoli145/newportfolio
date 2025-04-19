document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginSection = document.getElementById('loginSection');
    const messagesSection = document.getElementById('messagesSection');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginError = document.getElementById('loginError');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const messagesContainer = document.getElementById('messagesContainer');
    const totalMessagesEl = document.getElementById('totalMessages');
    const todayMessagesEl = document.getElementById('todayMessages');
    const uniqueSendersEl = document.getElementById('uniqueSenders');
    const searchMessages = document.getElementById('searchMessages');
    const sortMessages = document.getElementById('sortMessages');
    
    // Admin credentials (in a real application, this would be handled server-side)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';
    
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        showMessagesSection();
    }
    
    // Login button click event
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const usernameValue = username.value.trim();
            const passwordValue = password.value.trim();
            
            if (!usernameValue || !passwordValue) {
                showLoginError('Please enter both username and password');
                return;
            }
            
            if (usernameValue === ADMIN_USERNAME && passwordValue === ADMIN_PASSWORD) {
                // Set login status in localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                showMessagesSection();
            } else {
                showLoginError('Invalid username or password');
            }
        });
    }
    
    // Logout button click event
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            showLoginSection();
        });
    }
    
    // Search functionality
    if (searchMessages) {
        searchMessages.addEventListener('input', function() {
            displayMessages();
        });
    }
    
    // Sort functionality
    if (sortMessages) {
        sortMessages.addEventListener('change', function() {
            displayMessages();
        });
    }
    
    // Display messages if logged in
    if (isLoggedIn) {
        displayMessages();
    }
    
    // Function to show login error
    function showLoginError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        
        // Clear error after 3 seconds
        setTimeout(() => {
            loginError.textContent = '';
            loginError.style.display = 'none';
        }, 3000);
    }
    
    // Function to show messages section
    function showMessagesSection() {
        loginSection.classList.add('hidden');
        messagesSection.classList.remove('hidden');
        displayMessages();
        updateStats();
    }
    
    // Function to show login section
    function showLoginSection() {
        messagesSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        // Clear form fields
        username.value = '';
        password.value = '';
    }
    
    // Function to display messages
    function displayMessages() {
        if (!messagesContainer) return;
        
        // Get messages from localStorage
        const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        
        // Clear current messages
        messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p class="no-messages">No messages yet.</p>';
            return;
        }
        
        // Filter messages based on search
        let filteredMessages = messages;
        const searchTerm = searchMessages ? searchMessages.value.trim().toLowerCase() : '';
        
        if (searchTerm) {
            filteredMessages = messages.filter(msg => 
                msg.name.toLowerCase().includes(searchTerm) ||
                msg.email.toLowerCase().includes(searchTerm) ||
                msg.subject.toLowerCase().includes(searchTerm) ||
                msg.message.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort messages
        const sortOrder = sortMessages ? sortMessages.value : 'newest';
        
        if (sortOrder === 'newest') {
            filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else {
            filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        
        // Display filtered and sorted messages
        if (filteredMessages.length === 0) {
            messagesContainer.innerHTML = '<p class="no-messages">No messages match your search.</p>';
            return;
        }
        
        filteredMessages.forEach(msg => {
            // Format date and time
            const date = new Date(msg.timestamp);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString();
            
            // Create message element
            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.innerHTML = `
                <div class="message-header">
                    <div class="message-sender">
                        <h4>${msg.name}</h4>
                        <p><i class="fas fa-envelope"></i> ${msg.email}</p>
                    </div>
                    <div class="message-time">
                        <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
                        <p><i class="fas fa-clock"></i> ${formattedTime}</p>
                    </div>
                </div>
                <div class="message-subject">
                    <strong>Subject:</strong> ${msg.subject}
                </div>
                <div class="message-body">
                    <p>${msg.message}</p>
                </div>
            `;
            
            messagesContainer.appendChild(messageElement);
        });
    }
    
    // Function to update stats
    function updateStats() {
        const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        
        // Total messages
        totalMessagesEl.textContent = messages.length;
        
        // Today's messages
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayCount = messages.filter(msg => {
            const msgDate = new Date(msg.timestamp);
            return msgDate >= today;
        }).length;
        
        todayMessagesEl.textContent = todayCount;
        
        // Unique senders (based on email)
        const uniqueEmails = new Set(messages.map(msg => msg.email));
        uniqueSendersEl.textContent = uniqueEmails.size;
    }
});
