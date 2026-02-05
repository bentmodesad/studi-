// ============================================
// SCRIPT UTAMA - Website Kelas X DKV3
// Tema: Astronomi Galaksi
// Versi: 3.0 - Fixed Role Detection
// ============================================

// Storage Keys - KONSISTEN
const STORAGE_KEYS = {
    USERS: 'dkv3_users',
    CURRENT_USER: 'dkv3_current_user',
    LOGIN_STATUS: 'dkv3_loggedIn',
    REMEMBER_ME: 'dkv3_rememberMe',
    ALBUM_PHOTOS: 'dkv3_album_photos',
    REDIRECT: 'redirectAfterLogin'
};

// Global variables
let currentUser = null;
let currentRole = null;

// ============ SYSTEM INITIALIZATION ============
function initializeSystem() {
    console.log('=== SYSTEM INITIALIZATION ===');
    
    // Initialize default users if not exists
    initializeDefaultUsers();
    
    // Create stars background
    createStars();
    
    // Check and fix login status
    checkAndFixLoginStatus();
    
    // Update UI based on login status
    updateLoginUI();
    
    // Setup lazy loading
    initLazyLoading();
    
    console.log('=== SYSTEM READY ===');
}

// ============ STAR BACKGROUND ============
function createStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;
    
    const starsCount = 150;
    starsContainer.innerHTML = '';
    
    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        const delay = Math.random() * 5;
        const brightness = Math.random() * 0.7 + 0.3;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${delay}s`;
        star.style.opacity = brightness;
        
        starsContainer.appendChild(star);
    }
}

// ============ USER MANAGEMENT ============
function initializeDefaultUsers() {
    const users = getUsersFromStorage();
    
    if (users.length === 0) {
        const defaultUsers = [
            {
                id: 1,
                name: 'Admin DKV3',
                email: 'admin@dkv3.sch.id',
                username: 'admin',
                password: 'dkv123',
                role: 'admin',
                kelas: 'X DKV 3',
                createdAt: new Date().toISOString(),
                status: 'active'
            },
            {
                id: 2,
                name: 'Siswa Contoh',
                email: 'siswa@dkv3.sch.id',
                username: 'siswa',
                password: 'siswa123',
                role: 'student',
                kelas: 'X DKV 3',
                createdAt: new Date().toISOString(),
                status: 'active'
            }
        ];
        
        saveToStorage(STORAGE_KEYS.USERS, defaultUsers);
        console.log('✅ Default users created');
    }
}

function getUsersFromStorage() {
    return loadFromStorage(STORAGE_KEYS.USERS, []);
}

function saveUserToStorage(user) {
    const users = getUsersFromStorage();
    const index = users.findIndex(u => u.username === user.username);
    
    if (index !== -1) {
        users[index] = user;
    } else {
        users.push(user);
    }
    
    saveToStorage(STORAGE_KEYS.USERS, users);
    return true;
}

// ============ LOGIN/ROLE MANAGEMENT ============
function checkAndFixLoginStatus() {
    console.log('🔍 Checking login status...');
    
    const userData = loadFromStorage(STORAGE_KEYS.CURRENT_USER);
    const isLoggedIn = loadFromStorage(STORAGE_KEYS.LOGIN_STATUS) === 'true';
    
    console.log('User data exists:', !!userData);
    console.log('Is logged in:', isLoggedIn);
    
    if (userData && isLoggedIn) {
        try {
            currentUser = userData;
            
            console.log('📊 User data:', {
                username: currentUser.username,
                rawRole: currentUser.role,
                hasRole: !!currentUser.role
            });
            
            // FIX: Ensure role exists and is correct
            if (!currentUser.role) {
                console.log('⚠️ No role found, checking database...');
                fixUserRoleFromDatabase();
            } else {
                // Validate role with database
                validateRoleWithDatabase();
            }
            
            // Final role assignment
            currentRole = currentUser.role || 'student';
            currentUser.role = currentRole; // Ensure role is set
            
            console.log('✅ Final role:', currentRole);
            console.log('✅ Login status verified');
            
        } catch (error) {
            console.error('❌ Error checking login status:', error);
            logout();
        }
    } else {
        console.log('⚠️ Not logged in');
        currentUser = null;
        currentRole = null;
    }
}

function fixUserRoleFromDatabase() {
    const users = getUsersFromStorage();
    const dbUser = users.find(u => u.username === currentUser.username);
    
    if (dbUser) {
        console.log('✅ Found user in database, role:', dbUser.role);
        currentUser.role = dbUser.role;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    } else {
        console.log('⚠️ User not found in database, defaulting to student');
        currentUser.role = 'student';
        saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    }
}

function validateRoleWithDatabase() {
    const users = getUsersFromStorage();
    const dbUser = users.find(u => u.username === currentUser.username);
    
    if (dbUser && dbUser.role !== currentUser.role) {
        console.log(`⚠️ Role mismatch! DB: ${dbUser.role}, Current: ${currentUser.role}`);
        console.log('🔄 Fixing role from database...');
        currentUser.role = dbUser.role;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    }
}

function updateLoginUI() {
    const userInfoElements = document.querySelectorAll('#displayUsername');
    const authButtonsElements = document.querySelectorAll('.auth-buttons');
    
    if (currentUser && currentRole) {
        // Update user info display
        userInfoElements.forEach(element => {
            element.innerHTML = `<strong>${currentUser.name}</strong>`;
            element.style.color = 'var(--accent-light)';
            
            // Add role badge if element has class for it
            if (element.classList.contains('show-role')) {
                const badgeColor = currentRole === 'admin' ? 'var(--admin)' : 'var(--student)';
                element.innerHTML += ` <span style="background: ${badgeColor}; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">${currentRole}</span>`;
            }
        });
        
        // Update auth buttons
        authButtonsElements.forEach(element => {
            element.innerHTML = `
                <span style="color: var(--accent-light); margin-right: 10px;">
                    <i class="fas fa-${currentRole === 'admin' ? 'crown' : 'user'}"></i> ${currentUser.name}
                </span>
                <a href="#" class="btn-logout" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            `;
        });
        
        // Update page-specific UI based on role
        updateRoleBasedUI();
        
    } else {
        // Not logged in
        userInfoElements.forEach(element => {
            element.textContent = 'Pengunjung';
            element.style.color = 'var(--text-secondary)';
        });
        
        authButtonsElements.forEach(element => {
            element.innerHTML = `
                <a href="login.html" class="btn-login">
                    <i class="fas fa-sign-in-alt"></i> Login
                </a>
                <a href="register.html" class="btn-register">
                    <i class="fas fa-user-plus"></i> Daftar
                </a>
            `;
        });
    }
}

function updateRoleBasedUI() {
    // Album page specific updates
    if (window.location.pathname.includes('album.html')) {
        const adminControls = document.getElementById('adminControls');
        const uploadArea = document.getElementById('uploadArea');
        const roleTitle = document.getElementById('roleTitle');
        
        if (adminControls && roleTitle) {
            if (currentRole === 'admin') {
                adminControls.style.display = 'flex';
                roleTitle.innerHTML = '<i class="fas fa-crown"></i> Akses Admin';
                
                // Show admin features
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = 'block';
                });
                
                // Enable upload area
                if (uploadArea) {
                    uploadArea.style.display = 'block';
                }
                
            } else {
                adminControls.style.display = 'none';
                roleTitle.innerHTML = '<i class="fas fa-user-graduate"></i> Akses Siswa';
                
                // Hide admin features
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = 'none';
                });
                
                // Disable upload area
                if (uploadArea) {
                    uploadArea.style.display = 'none';
                }
            }
        }
    }
}

// ============ AUTH FUNCTIONS ============
function login(username, password) {
    const users = getUsersFromStorage();
    const user = users.find(u => 
        (u.username === username || u.email === username) && 
        u.password === password
    );
    
    if (user) {
        currentUser = user;
        currentRole = user.role || 'student';
        
        // Save login state
        saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
        saveToStorage(STORAGE_KEYS.LOGIN_STATUS, 'true');
        
        console.log('✅ Login successful:', { username: user.username, role: currentRole });
        return { success: true, user: user };
    }
    
    return { success: false, message: 'Username atau password salah' };
}

function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        // Clear user data
        currentUser = null;
        currentRole = null;
        
        // Clear storage
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.LOGIN_STATUS);
        
        // Show notification
        showNotification('Anda telah logout!', 'info');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

function register(userData) {
    const users = getUsersFromStorage();
    
    // Check if username or email already exists
    if (users.some(u => u.username === userData.username)) {
        return { success: false, message: 'Username sudah digunakan' };
    }
    
    if (users.some(u => u.email === userData.email)) {
        return { success: false, message: 'Email sudah terdaftar' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    // Add to users
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    
    // Auto login
    currentUser = newUser;
    currentRole = newUser.role || 'student';
    saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    saveToStorage(STORAGE_KEYS.LOGIN_STATUS, 'true');
    
    return { success: true, user: newUser };
}

// ============ STORAGE HELPERS ============
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('❌ Error saving to storage:', error);
        return false;
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('❌ Error loading from storage:', error);
        return defaultValue;
    }
}

// ============ UI HELPERS ============
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 
                     type === 'error' ? 'var(--danger)' : 
                     type === 'warning' ? 'var(--warning)' : 
                     'var(--accent)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        max-width: 350px;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Click to close
    notification.onclick = () => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 300);
    };
}

function showModal(title, content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-header">
            <h3>${title}</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-content">${content}</div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Show with animation
    setTimeout(() => {
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    }, 10);
    
    // Close handlers
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => closeModal(overlay);
    
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal(overlay);
    };
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal(overlay);
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function closeModal(overlay) {
    overlay.style.opacity = '0';
    overlay.querySelector('.modal').style.transform = 'scale(0.9)';
    setTimeout(() => overlay.remove(), 300);
}

// ============ DEBUG FUNCTIONS ============
function debugSystem() {
    console.log('=== SYSTEM DEBUG INFO ===');
    console.log('Current User:', currentUser);
    console.log('Current Role:', currentRole);
    console.log('All Users:', getUsersFromStorage());
    console.log('Login Status:', loadFromStorage(STORAGE_KEYS.LOGIN_STATUS));
    console.log('=========================');
}

function fixRoleManually(username, newRole) {
    const users = getUsersFromStorage();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
        users[userIndex].role = newRole;
        saveToStorage(STORAGE_KEYS.USERS, users);
        
        // Update current user if it's the same
        if (currentUser && currentUser.username === username) {
            currentUser.role = newRole;
            currentRole = newRole;
            saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
        }
        
        console.log(`✅ Fixed ${username} role to ${newRole}`);
        showNotification(`Role ${username} diperbarui ke ${newRole}`, 'success');
        
        // Reload UI
        setTimeout(() => {
            updateLoginUI();
            updateRoleBasedUI();
        }, 500);
        
    } else {
        console.log(`❌ User ${username} not found`);
        showNotification(`User ${username} tidak ditemukan`, 'error');
    }
}

// ============ LAZY LOADING ============
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '50px 0px' });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    } else {
        // Fallback
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// ============ GOOGLE DRIVE LINKS ============
function convertGoogleDriveLink(link) {
    if (!link) return '';
    
    // Extract file ID
    let fileId = '';
    
    // Format: /d/FILE_ID/
    const match1 = link.match(/\/d\/([^\/]+)/);
    if (match1) fileId = match1[1];
    
    // Format: ?id=FILE_ID
    const match2 = link.match(/[?&]id=([^&]+)/);
    if (match2 && !fileId) fileId = match2[1];
    
    if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    return link;
}

// ============ PAGE INITIALIZATION ============
document.addEventListener('DOMContentLoaded', function() {
    // Initialize system
    initializeSystem();
    
    // Add debug button for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🔧 Debug';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 20px;
            cursor: pointer;
            z-index: 10000;
            font-size: 12px;
            opacity: 0.7;
        `;
        debugBtn.onclick = debugSystem;
        document.body.appendChild(debugBtn);
    }
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Update copyright year
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
});

// ============ EXPORT FUNCTIONS ============
window.dkv3 = {
    // System
    initializeSystem,
    debugSystem,
    
    // Auth
    login,
    logout,
    register,
    checkAndFixLoginStatus,
    
    // User Management
    getUsersFromStorage,
    saveUserToStorage,
    fixRoleManually,
    
    // UI
    showNotification,
    showModal,
    updateLoginUI,
    
    // Utilities
    convertGoogleDriveLink,
    saveToStorage,
    loadFromStorage,
    
    // Global State
    getCurrentUser: () => currentUser,
    getCurrentRole: () => currentRole
};

// Make debug functions available in console
window.debugUsers = () => console.log('All Users:', getUsersFromStorage());
window.fixRole = fixRoleManually;
window.forceAdmin = () => {
    if (currentUser) {
        fixRoleManually(currentUser.username, 'admin');
    } else {
        console.log('No user logged in');
    }
};
// Contoh implementasi dengan backend:
async function uploadToServer(file, album) {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('album', album);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
    
    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    return result.photoUrl; // URL dari server
}