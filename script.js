// Windows XP Portfolio - Francisco Bachiller
// Main JavaScript Controller

class WindowsXP {
    constructor() {
        this.windows = [];
        this.activeWindow = null;
        this.zIndexCounter = 100;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startClock();
        this.loadContent();
    }

    setupEventListeners() {
        // Start Menu
        const startButton = document.getElementById('start-button');
        const startMenu = document.getElementById('start-menu');

        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('hidden');
            startButton.classList.toggle('active');
        });

        // Close start menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
                startMenu.classList.add('hidden');
                startButton.classList.remove('active');
            }
        });

        // Desktop icons
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', () => {
                const windowType = icon.dataset.window;
                if (windowType) {
                    this.openWindow(windowType);
                }
            });

            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
                icon.classList.add('selected');
            });
        });

        // Start menu items
        document.querySelectorAll('.start-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const windowType = item.dataset.window;
                if (windowType) {
                    this.openWindow(windowType);
                    startMenu.classList.add('hidden');
                    startButton.classList.remove('active');
                }
            });
        });

        // Shutdown button
        document.getElementById('shutdown').addEventListener('click', () => {
            this.shutdown();
        });

        // User avatar change
        const userAvatar = document.getElementById('user-avatar');
        let currentAvatarIndex = 1;
        userAvatar.addEventListener('click', (e) => {
            e.stopPropagation();
            currentAvatarIndex = (currentAvatarIndex % 17) + 1;
            // user9 y user16 tienen extensión .JPG (mayúscula), el resto .jpg
            const extension = (currentAvatarIndex === 9 || currentAvatarIndex === 16) ? 'JPG' : 'jpg';
            userAvatar.src = `assets/icons/user${currentAvatarIndex}.${extension}`;
        });

        // Deselect icons when clicking desktop
        document.getElementById('desktop').addEventListener('click', () => {
            document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        });
    }

    startClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            document.getElementById('clock').textContent = `${hours}:${minutes}`;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    openWindow(type) {
        // Check if window already exists
        const existingWindow = this.windows.find(w => w.type === type);
        if (existingWindow) {
            this.focusWindow(existingWindow.element);
            if (existingWindow.element.classList.contains('minimized')) {
                this.restoreWindow(existingWindow.element);
            }
            return;
        }

        const template = document.getElementById('window-template');
        const windowElement = template.content.cloneNode(true).querySelector('.window');

        // Set window properties
        const config = this.getWindowConfig(type);
        windowElement.dataset.type = type;
        windowElement.querySelector('.window-title-text').textContent = config.title;
        windowElement.querySelector('.window-icon').src = config.icon;
        windowElement.querySelector('.window-content').innerHTML = config.content;

        // Hide menubar and toolbar if specified
        if (config.hideMenubar) {
            windowElement.querySelector('.window-menubar').style.display = 'none';
        }
        if (config.hideToolbar) {
            windowElement.querySelector('.window-toolbar').style.display = 'none';
        }

        // Remove padding if specified
        if (config.noPadding) {
            windowElement.querySelector('.window-content').style.padding = '0';
            windowElement.querySelector('.window-content').style.overflow = 'hidden';
            windowElement.querySelector('.window-content').style.background = '#000';
        }

        // Remove padding for explorer windows
        if (config.noPaddingExplorer) {
            windowElement.querySelector('.window-content').style.padding = '0';
            windowElement.querySelector('.window-content').style.overflow = 'hidden';
        }

        // Position window
        const offset = this.windows.length * 30;
        windowElement.style.left = `${100 + offset}px`;
        windowElement.style.top = `${80 + offset}px`;
        windowElement.style.width = config.width || '600px';
        windowElement.style.height = config.height || '500px';
        windowElement.style.zIndex = ++this.zIndexCounter;

        // Add to DOM
        document.getElementById('windows-container').appendChild(windowElement);

        // Setup window controls
        this.setupWindowControls(windowElement);
        this.setupWindowDragging(windowElement);

        // Add to windows array
        this.windows.push({
            type: type,
            element: windowElement,
            minimized: false,
            maximized: false
        });

        // Initialize Winamp player if this is a winamp window
        if (type === 'winamp') {
            setTimeout(() => this.initWinamp(), 100);
        }

        // Initialize Pinball if this is a pinball window
        if (type === 'pinball') {
            setTimeout(() => this.initPinball(), 100);
        }

        // Initialize About Me tabs
        if (type === 'about') {
            setTimeout(() => this.initAboutTabs(windowElement), 50);
        }

        // Initialize Contact Notepad
        if (type === 'contact') {
            setTimeout(() => this.initContactNotepad(windowElement), 50);
        }

        // Initialize Projects tooltips
        if (type === 'projects') {
            setTimeout(() => this.initProjectTooltips(windowElement), 50);
        }

        // Initialize Skills tabs
        if (type === 'skills') {
            setTimeout(() => this.initSkillsTabs(windowElement), 50);
        }

        // Add taskbar item
        this.addTaskbarItem(type, config.title, config.icon, windowElement);

        // Focus window
        this.focusWindow(windowElement);
    }

    getWindowConfig(type) {
        const configs = {
            about: {
                title: 'About Me - System Properties',
                icon: 'assets/icons/aboutme.ico',
                width: '520px',
                height: '620px',
                hideMenubar: true,
                hideToolbar: true,
                content: `
                    <div class="system-properties">
                        <!-- Pestañas estilo Windows XP -->
                        <div class="xp-tabs">
                            <div class="xp-tab active" data-tab="general">General</div>
                            <div class="xp-tab" data-tab="experience">Experience</div>
                            <div class="xp-tab" data-tab="hardware">Hardware</div>
                            <div class="xp-tab" data-tab="advanced">Advanced</div>
                        </div>
                        
                        <!-- Tab: General -->
                        <div class="xp-tab-content active" id="tab-general">
                            <div class="system-header">
                                <div class="system-logo">
                                    <div class="xp-logo-container">
                                        <div class="xp-flag">
                                            <div class="flag-wave red"></div>
                                            <div class="flag-wave green"></div>
                                            <div class="flag-wave blue"></div>
                                            <div class="flag-wave yellow"></div>
                                        </div>
                                        <div class="xp-text">
                                            <span class="microsoft">Microsoft</span>
                                            <span class="windows-xp">Windows<sup>®</sup> <em>XP</em></span>
                                            <span class="edition">Professional Portfolio Edition</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="system-divider"></div>
                            
                            <div class="system-info-section">
                                <div class="info-row">
                                    <span class="info-label">System:</span>
                                    <div class="info-value">
                                        <div class="developer-badge">
                                            <div class="badge-icon">
                                                <svg viewBox="0 0 24 24" width="48" height="48">
                                                    <circle cx="12" cy="8" r="5" fill="#4a90a4"/>
                                                    <path d="M4 20 C4 14, 8 12, 12 12 C16 12, 20 14, 20 20" fill="#4a90a4"/>
                                                    <path d="M8 6 L10 8 L8 10" fill="none" stroke="#fff" stroke-width="1.5"/>
                                                    <line x1="10" y1="10" x2="14" y2="10" stroke="#fff" stroke-width="1.5"/>
                                                </svg>
                                            </div>
                                            <div class="badge-info">
                                                <strong>Full-Stack Developer</strong>
                                                <span>Certified Code Craftsman</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="info-row">
                                    <span class="info-label">Registered to:</span>
                                    <div class="info-value">
                                        <strong style="font-size: 14px; color: #003399;">Francisco Bachiller</strong><br>
                                        <span style="color: #666;">Independent Developer</span><br>
                                        <span class="serial-key">XXXX-NARF-BACH-2024</span>
                                    </div>
                                </div>
                                
                                <div class="info-row">
                                    <span class="info-label">Location:</span>
                                    <div class="info-value location-display">
                                        <div class="location-icon">
                                            <svg viewBox="0 0 24 24" width="20" height="20">
                                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#c41e3a"/>
                                                <circle cx="12" cy="9" r="2.5" fill="#fff"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <strong>Argentina</strong> 🇦🇷<br>
                                            <span style="color: #666; font-size: 11px;">GMT-3 | Remote Available</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="system-divider"></div>
                            
                            <div class="computer-section">
                                <div class="computer-header">
                                    <svg viewBox="0 0 24 24" width="32" height="32">
                                        <rect x="2" y="3" width="20" height="14" rx="1" fill="#1a237e" stroke="#0d47a1"/>
                                        <rect x="4" y="5" width="16" height="10" fill="#4fc3f7"/>
                                        <rect x="8" y="17" width="8" height="2" fill="#424242"/>
                                        <rect x="6" y="19" width="12" height="1" fill="#616161"/>
                                        <text x="12" y="12" font-size="6" fill="#fff" text-anchor="middle">DEV</text>
                                    </svg>
                                    <span>Developer Specifications</span>
                                </div>
                                <div class="computer-specs">
                                    <div class="spec-item">
                                        <span class="spec-label">Age:</span>
                                        <span class="spec-value">24 years</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Experience:</span>
                                        <span class="spec-value">4+ years coding</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Status:</span>
                                        <span class="spec-value status-online">● Available for hire</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Work Mode:</span>
                                        <span class="spec-value">Remote / Hybrid / On-site</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab: Experience -->
                        <div class="xp-tab-content" id="tab-experience">
                            <div class="experience-section">
                                <div class="section-title">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <rect x="2" y="7" width="20" height="14" rx="2" fill="#8d6e63"/>
                                        <path d="M8 7 V5 a2 2 0 0 1 2-2 h4 a2 2 0 0 1 2 2 v2" fill="none" stroke="#5d4037" stroke-width="2"/>
                                        <line x1="2" y1="12" x2="22" y2="12" stroke="#6d4c41"/>
                                    </svg>
                                    <span>Professional Experience</span>
                                </div>
                                
                                <div class="experience-timeline">
                                    <div class="timeline-item">
                                        <div class="timeline-marker"></div>
                                        <div class="timeline-content">
                                            <div class="timeline-header">
                                                <strong>Full-Stack Development</strong>
                                                <span class="timeline-period">2020 - Present</span>
                                            </div>
                                            <p>Building modern web applications with React, Vue, Svelte, Node.js and Python. Focus on performance optimization and clean architecture.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="timeline-item">
                                        <div class="timeline-marker"></div>
                                        <div class="timeline-content">
                                            <div class="timeline-header">
                                                <strong>API & Backend Architecture</strong>
                                                <span class="timeline-period">2021 - Present</span>
                                            </div>
                                            <p>Designing RESTful APIs, WebSocket implementations, database optimization and secure authentication systems.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="timeline-item">
                                        <div class="timeline-marker"></div>
                                        <div class="timeline-content">
                                            <div class="timeline-header">
                                                <strong>Desktop Application Development</strong>
                                                <span class="timeline-period">2022 - Present</span>
                                            </div>
                                            <p>Creating cross-platform desktop apps with Python (Tkinter, PyQt) and Electron. Automation tools and utilities.</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="philosophy-box">
                                    <div class="philosophy-header">
                                        <svg viewBox="0 0 24 24" width="18" height="18">
                                            <circle cx="12" cy="12" r="10" fill="#ffc107"/>
                                            <path d="M12 7 L12 13 L16 15" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                        <span>My Philosophy</span>
                                    </div>
                                    <p>"I believe in writing clean, maintainable, and efficient code. I love tackling complex technical challenges and finding elegant solutions that are not only functional but also a pleasure to maintain and scale."</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab: Hardware (Skills) -->
                        <div class="xp-tab-content" id="tab-hardware">
                            <div class="hardware-section">
                                <div class="section-title">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <rect x="4" y="2" width="16" height="20" rx="1" fill="#4caf50"/>
                                        <rect x="6" y="4" width="12" height="8" fill="#81c784"/>
                                        <rect x="6" y="13" width="4" height="2" fill="#a5d6a7"/>
                                        <rect x="6" y="16" width="4" height="2" fill="#a5d6a7"/>
                                        <rect x="11" y="13" width="7" height="5" fill="#66bb6a"/>
                                    </svg>
                                    <span>Installed Components (Skills)</span>
                                </div>
                                
                                <div class="device-manager">
                                    <div class="device-category expanded">
                                        <div class="category-header">
                                            <span class="expand-icon">−</span>
                                            <svg viewBox="0 0 16 16" width="16" height="16">
                                                <rect x="1" y="3" width="14" height="10" rx="1" fill="#1976d2"/>
                                                <rect x="2" y="4" width="12" height="8" fill="#64b5f6"/>
                                            </svg>
                                            <span>Frontend Technologies</span>
                                        </div>
                                        <div class="device-list">
                                            <div class="device-item">
                                                <span class="device-name">JavaScript (ES6+)</span>
                                                <div class="skill-bar"><div class="skill-fill" style="width: 95%"></div></div>
                                            </div>
                                            <div class="device-item">
                                                <span class="device-name">React.js</span>
                                                <div class="skill-bar"><div class="skill-fill" style="width: 90%"></div></div>
                                            </div>
                                            <div class="device-item">
                                                <span class="device-name">Vue.js</span>
                                                <div class="skill-bar"><div class="skill-fill" style="width: 85%"></div></div>
                                            </div>
                                            <div class="device-item">
                                                <span class="device-name">Svelte</span>
                                                <div class="skill-bar"><div class="skill-fill" style="width: 88%"></div></div>
                                            </div>
                                            <div class="device-item">
                                                <span class="device-name">HTML5 & CSS3</span>
                                                <div class="skill-bar"><div class="skill-fill" style="width: 95%"></div></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="device-category expanded">
                                        <div class="category-header">
                                            <span class="expand-icon">−</span>
                                            <svg viewBox="0 0 16 16" width="16" height="16">
                                                <rect x="2" y="2" width="12" height="12" rx="1" fill="#388e3c"/>
                                                <path d="M5 5 h6 v2 h-6 z M5 9 h4 v2 h-4 z" fill="#a5d6a7"/>
                                            </svg>
                                            <span>Backend Technologies</span>
                                        </div>
                                        <div class="device-list">
                                            <div class="device-item">
                                                <span class="device-name">Node.js</span>
                                                <div class="skill-bar"><div class="skill-fill backend" style="width: 90%"></div></div>
                                            </div>
                                            <div class="device-item">
                                                <span class="device-name">Python</span>
                                                <div class="skill-bar"><div class="skill-fill backend" style="width: 92%"></div></div>
                                            </div>
                                            <div class="device-item">
                                                <span class="device-name">REST APIs</span>
                                                <div class="skill-bar"><div class="skill-fill backend" style="width: 95%"></div></div>
                                            </div>
                                            <div class="device-item">
                                                <span class="device-name">WebSockets</span>
                                                <div class="skill-bar"><div class="skill-fill backend" style="width: 85%"></div></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="device-category expanded">
                                        <div class="category-header">
                                            <span class="expand-icon">−</span>
                                            <svg viewBox="0 0 16 16" width="16" height="16">
                                                <ellipse cx="8" cy="8" rx="6" ry="3" fill="#f57c00"/>
                                                <ellipse cx="8" cy="6" rx="6" ry="3" fill="#ff9800"/>
                                                <ellipse cx="8" cy="4" rx="6" ry="3" fill="#ffb74d"/>
                                            </svg>
                                            <span>Databases</span>
                                        </div>
                                        <div class="device-list">
                                            <div class="device-item">
                                                <span class="device-name">MongoDB</span>
                                                <div class="skill-bar"><div class="skill-fill database" style="width: 88%"></div></div>
                                            </div>
                                            <div class="device-item">
                                                <span class="device-name">PostgreSQL</span>
                                                <div class="skill-bar"><div class="skill-fill database" style="width: 82%"></div></div>
                                            </div>
                                            <div class="device-item">
                                                <span class="device-name">Redis</span>
                                                <div class="skill-bar"><div class="skill-fill database" style="width: 80%"></div></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab: Advanced -->
                        <div class="xp-tab-content" id="tab-advanced">
                            <div class="advanced-section">
                                <div class="section-title">
                                    <svg viewBox="0 0 24 24" width="20" height="20">
                                        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="#546e7a"/>
                                    </svg>
                                    <span>Advanced Settings & Principles</span>
                                </div>
                                
                                <div class="settings-group">
                                    <div class="group-box">
                                        <div class="group-title">Development Approach</div>
                                        <div class="group-content">
                                            <div class="checkbox-item checked">
                                                <div class="xp-checkbox">✓</div>
                                                <span>Clean Code Architecture</span>
                                            </div>
                                            <div class="checkbox-item checked">
                                                <div class="xp-checkbox">✓</div>
                                                <span>Performance-First Development</span>
                                            </div>
                                            <div class="checkbox-item checked">
                                                <div class="xp-checkbox">✓</div>
                                                <span>User Experience Priority</span>
                                            </div>
                                            <div class="checkbox-item checked">
                                                <div class="xp-checkbox">✓</div>
                                                <span>Continuous Learning Mode</span>
                                            </div>
                                            <div class="checkbox-item checked">
                                                <div class="xp-checkbox">✓</div>
                                                <span>Attention to Detail: MAXIMUM</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="group-box">
                                        <div class="group-title">Soft Skills Matrix</div>
                                        <div class="group-content">
                                            <div class="soft-skill">
                                                <span>Problem Solving</span>
                                                <div class="rating">
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                </div>
                                            </div>
                                            <div class="soft-skill">
                                                <span>Self-Learning</span>
                                                <div class="rating">
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                </div>
                                            </div>
                                            <div class="soft-skill">
                                                <span>Team Collaboration</span>
                                                <div class="rating">
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star">☆</span>
                                                </div>
                                            </div>
                                            <div class="soft-skill">
                                                <span>Communication</span>
                                                <div class="rating">
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star filled">★</span>
                                                    <span class="star">☆</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="looking-for-box">
                                    <div class="box-header">
                                        <svg viewBox="0 0 24 24" width="18" height="18">
                                            <circle cx="11" cy="11" r="8" fill="none" stroke="#1976d2" stroke-width="2"/>
                                            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#1976d2" stroke-width="2"/>
                                        </svg>
                                        <span>What I'm Looking For</span>
                                    </div>
                                    <div class="box-content">
                                        <ul class="looking-list">
                                            <li>Challenging technical projects</li>
                                            <li>Modern tech stack environments</li>
                                            <li>Collaborative team culture</li>
                                            <li>Growth opportunities</li>
                                            <li>Innovative product development</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Botones de diálogo estilo Windows XP -->
                        <div class="dialog-buttons">
                            <button class="xp-button" onclick="window.open('https://github.com/Narfbach', '_blank')">
                                <svg viewBox="0 0 16 16" width="14" height="14" style="margin-right: 4px;">
                                    <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                                </svg>
                                GitHub
                            </button>
                            <button class="xp-button primary" onclick="windowsXP.openWindow('contact')">Contact Me</button>
                        </div>
                    </div>
                `
            },
            projects: {
                title: 'My Projects',
                icon: 'assets/icons/folder.ico',
                width: '850px',
                height: '580px',
                hideMenubar: false,
                hideToolbar: false,
                noPaddingExplorer: true,
                content: `
                    <div class="explorer-container">
                        <!-- Panel lateral estilo XP -->
                        <div class="explorer-sidebar">
                            <div class="sidebar-section">
                                <div class="sidebar-header">
                                    <span class="sidebar-arrow">▼</span>
                                    <span>File and Folder Tasks</span>
                                </div>
                                <div class="sidebar-content">
                                    <div class="sidebar-item" onclick="window.open('https://github.com/Narfbach', '_blank')">
                                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23245EDC' d='M2 2h5l2 2h5v10H2V2z'/%3E%3C/svg%3E" alt="">
                                        <span>View all repositories</span>
                                    </div>
                                    <div class="sidebar-item">
                                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='6' fill='%23245EDC'/%3E%3C/svg%3E" alt="">
                                        <span>4 projects total</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sidebar-section">
                                <div class="sidebar-header">
                                    <span class="sidebar-arrow">▼</span>
                                    <span>Other Places</span>
                                </div>
                                <div class="sidebar-content">
                                    <div class="sidebar-item" onclick="window.open('https://github.com/Narfbach', '_blank')">
                                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23333' d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'/%3E%3C/svg%3E" alt="">
                                        <span>GitHub Profile</span>
                                    </div>
                                    <div class="sidebar-item" data-window="skills">
                                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23F0C000' d='M2 2h5l2 2h5v10H2V2z'/%3E%3C/svg%3E" alt="">
                                        <span>Skills & Tech</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="sidebar-section details-section">
                                <div class="sidebar-header">
                                    <span class="sidebar-arrow">▼</span>
                                    <span>Details</span>
                                </div>
                                <div class="sidebar-content details-info">
                                    <div class="detail-icon">
                                        <svg viewBox="0 0 48 48" width="40" height="40">
                                            <path d="M4 8 L18 8 L22 14 L44 14 L44 40 L4 40 Z" fill="url(#folderGrad)" stroke="#9E7D16" stroke-width="1"/>
                                            <defs>
                                                <linearGradient id="folderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#FDE87C"/>
                                                    <stop offset="30%" style="stop-color:#F5C800"/>
                                                    <stop offset="100%" style="stop-color:#E9BE1A"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <div class="detail-text">
                                        <strong>My Projects</strong><br>
                                        <span style="color: #666; font-size: 10px;">File Folder</span><br>
                                        <span style="color: #666; font-size: 10px;">4 items</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Área principal con proyectos -->
                        <div class="explorer-main">
                            <div class="explorer-files">
                                <!-- Proyecto 1: Digger UI - Music App Icon -->
                                <div class="file-item" onclick="this.classList.toggle('selected')" ondblclick="window.open('https://github.com/Narfbach/digger-ui', '_blank')">
                                    <div class="file-icon">
                                        <svg viewBox="0 0 48 48" width="48" height="48">
                                            <defs>
                                                <linearGradient id="discGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#4A4A4A"/>
                                                    <stop offset="50%" style="stop-color:#1A1A1A"/>
                                                    <stop offset="100%" style="stop-color:#2A2A2A"/>
                                                </linearGradient>
                                                <linearGradient id="discShine" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#6AF"/>
                                                    <stop offset="50%" style="stop-color:#38F"/>
                                                    <stop offset="100%" style="stop-color:#06C"/>
                                                </linearGradient>
                                            </defs>
                                            <!-- CD/Vinyl disc -->
                                            <circle cx="24" cy="24" r="20" fill="url(#discGrad)" stroke="#000" stroke-width="1"/>
                                            <circle cx="24" cy="24" r="18" fill="none" stroke="#444" stroke-width="0.5"/>
                                            <circle cx="24" cy="24" r="15" fill="none" stroke="#333" stroke-width="0.5"/>
                                            <circle cx="24" cy="24" r="12" fill="none" stroke="#444" stroke-width="0.5"/>
                                            <!-- Rainbow reflection -->
                                            <path d="M24 6 A18 18 0 0 1 42 24" fill="none" stroke="url(#discShine)" stroke-width="2" opacity="0.6"/>
                                            <!-- Center hole -->
                                            <circle cx="24" cy="24" r="6" fill="#222" stroke="#1A1A1A" stroke-width="1"/>
                                            <circle cx="24" cy="24" r="3" fill="#444"/>
                                            <!-- Music note -->
                                            <path d="M22 20 L22 28 M22 28 A2.5 2.5 0 1 1 22 23" fill="#38F" stroke="#38F" stroke-width="1.5"/>
                                            <circle cx="19.5" cy="28" r="2.5" fill="#38F"/>
                                        </svg>
                                    </div>
                                    <div class="file-name">Digger UI</div>
                                    <div class="file-tooltip">
                                        <strong>Digger UI - Music Streaming</strong><br>
                                        <span class="tooltip-tech">JavaScript • PWA • REST API</span><br>
                                        Plataforma de streaming de música con interfaz moderna, reproducción de audio HD, búsqueda en tiempo real y soporte offline.
                                        <div class="tooltip-features">
                                            ✓ Streaming HD &nbsp; ✓ PWA &nbsp; ✓ Offline
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Proyecto 2: Antarctic - Mouse Cursor Icon -->
                                <div class="file-item" onclick="this.classList.toggle('selected')" ondblclick="window.open('https://github.com/Narfbach/antarctic-autoclicker', '_blank')">
                                    <div class="file-icon">
                                        <svg viewBox="0 0 48 48" width="48" height="48">
                                            <defs>
                                                <linearGradient id="cursorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#FFFFFF"/>
                                                    <stop offset="100%" style="stop-color:#D0D0D0"/>
                                                </linearGradient>
                                                <linearGradient id="iceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#E0F7FF"/>
                                                    <stop offset="100%" style="stop-color:#87CEEB"/>
                                                </linearGradient>
                                            </defs>
                                            <!-- Ice/snow background circle -->
                                            <circle cx="24" cy="26" r="18" fill="url(#iceGrad)" stroke="#5BA3C0" stroke-width="1"/>
                                            <!-- Snowflakes -->
                                            <text x="10" y="20" font-size="6" fill="#FFF" opacity="0.8">❄</text>
                                            <text x="36" y="32" font-size="5" fill="#FFF" opacity="0.6">❄</text>
                                            <text x="14" y="38" font-size="4" fill="#FFF" opacity="0.7">❄</text>
                                            <!-- Mouse cursor -->
                                            <path d="M20 10 L20 34 L25 29 L31 40 L35 38 L29 27 L36 27 Z" fill="url(#cursorGrad)" stroke="#000" stroke-width="1.5" stroke-linejoin="round"/>
                                            <!-- Click effect circles -->
                                            <circle cx="22" cy="18" r="3" fill="none" stroke="#FF6B6B" stroke-width="1.5" opacity="0.8"/>
                                            <circle cx="22" cy="18" r="6" fill="none" stroke="#FF6B6B" stroke-width="1" opacity="0.4"/>
                                        </svg>
                                    </div>
                                    <div class="file-name">Antarctic Autoclicker</div>
                                    <div class="file-tooltip">
                                        <strong>Antarctic Autoclicker</strong><br>
                                        <span class="tooltip-tech">Python • Tkinter • Threading</span><br>
                                        Autoclicker profesional con múltiples modos, perfiles, hotkeys globales y modo "Perfect Machine".
                                        <div class="tooltip-features">
                                            ✓ Multi-modo &nbsp; ✓ Hotkeys &nbsp; ✓ Perfiles
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Proyecto 3: CV Maker - Document Icon -->
                                <div class="file-item" onclick="this.classList.toggle('selected')" ondblclick="window.open('https://github.com/Narfbach/cv-maker', '_blank')">
                                    <div class="file-icon">
                                        <svg viewBox="0 0 48 48" width="48" height="48">
                                            <defs>
                                                <linearGradient id="pageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#FFFFFF"/>
                                                    <stop offset="100%" style="stop-color:#E8E8E8"/>
                                                </linearGradient>
                                                <linearGradient id="foldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#B8D4E8"/>
                                                    <stop offset="100%" style="stop-color:#7AB8D8"/>
                                                </linearGradient>
                                            </defs>
                                            <!-- Paper shadow -->
                                            <path d="M12 8 L12 44 L40 44 L40 16 L32 8 Z" fill="#C0C0C0" transform="translate(2,2)"/>
                                            <!-- Main paper -->
                                            <path d="M10 6 L10 42 L38 42 L38 14 L30 6 Z" fill="url(#pageGrad)" stroke="#808080" stroke-width="1"/>
                                            <!-- Folded corner -->
                                            <path d="M30 6 L30 14 L38 14 Z" fill="url(#foldGrad)" stroke="#808080" stroke-width="1"/>
                                            <!-- Photo placeholder -->
                                            <rect x="14" y="12" width="10" height="12" fill="#D0E0F0" stroke="#8080A0" stroke-width="0.5"/>
                                            <circle cx="19" cy="16" r="2.5" fill="#8080A0"/>
                                            <path d="M14 24 Q17 20, 19 22 Q21 24, 24 20" fill="#8080A0"/>
                                            <!-- Text lines -->
                                            <rect x="26" y="12" width="8" height="2" fill="#404080"/>
                                            <rect x="26" y="16" width="6" height="1.5" fill="#808080"/>
                                            <rect x="26" y="20" width="7" height="1.5" fill="#808080"/>
                                            <!-- Body text -->
                                            <rect x="14" y="28" width="20" height="1.5" fill="#606060"/>
                                            <rect x="14" y="32" width="18" height="1.5" fill="#808080"/>
                                            <rect x="14" y="36" width="16" height="1.5" fill="#808080"/>
                                        </svg>
                                    </div>
                                    <div class="file-name">CV Maker</div>
                                    <div class="file-tooltip">
                                        <strong>CV Maker - Resume Builder</strong><br>
                                        <span class="tooltip-tech">JavaScript • CSS • PDF Export</span><br>
                                        Crea CVs profesionales con 5 plantillas únicas, preview en tiempo real y exportación a PDF.
                                        <div class="tooltip-features">
                                            ✓ 5 Templates &nbsp; ✓ PDF &nbsp; ✓ Live Preview
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Proyecto 4: EasyLook - Game Controller Icon -->
                                <div class="file-item" onclick="this.classList.toggle('selected')" ondblclick="window.open('https://github.com/Narfbach/EasyLook-BoomBang', '_blank')">
                                    <div class="file-icon">
                                        <svg viewBox="0 0 48 48" width="48" height="48">
                                            <defs>
                                                <linearGradient id="controllerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#505050"/>
                                                    <stop offset="30%" style="stop-color:#353535"/>
                                                    <stop offset="100%" style="stop-color:#252525"/>
                                                </linearGradient>
                                                <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" style="stop-color:#80D080"/>
                                                    <stop offset="100%" style="stop-color:#40A040"/>
                                                </linearGradient>
                                            </defs>
                                            <!-- Controller body -->
                                            <path d="M6 20 Q6 14 12 14 L36 14 Q42 14 42 20 L42 34 Q42 38 38 40 L32 40 Q28 40 26 36 L22 36 Q20 40 16 40 L10 40 Q6 38 6 34 Z" fill="url(#controllerGrad)" stroke="#1A1A1A" stroke-width="1.5"/>
                                            <!-- D-pad -->
                                            <rect x="11" y="22" width="3" height="9" fill="#222" rx="0.5"/>
                                            <rect x="9" y="25" width="9" height="3" fill="#222" rx="0.5"/>
                                            <!-- Buttons -->
                                            <circle cx="35" cy="22" r="2.5" fill="#E04040" stroke="#A02020" stroke-width="0.5"/>
                                            <circle cx="38" cy="26" r="2.5" fill="#4040E0" stroke="#2020A0" stroke-width="0.5"/>
                                            <circle cx="32" cy="26" r="2.5" fill="#40E040" stroke="#20A020" stroke-width="0.5"/>
                                            <circle cx="35" cy="30" r="2.5" fill="#E0E040" stroke="#A0A020" stroke-width="0.5"/>
                                            <!-- Center details -->
                                            <ellipse cx="24" cy="20" rx="4" ry="2" fill="#222"/>
                                            <ellipse cx="24" cy="32" rx="4" ry="2" fill="#222"/>
                                            <!-- Screen/light -->
                                            <rect x="20" y="24" width="8" height="4" fill="url(#screenGrad)" rx="1" stroke="#2A2A2A"/>
                                            <!-- Flash/Boom effect -->
                                            <path d="M3 12 L7 16 L4 16 L8 22 L5 18 L8 18 L3 12" fill="#FFD700" stroke="#FFA500" stroke-width="0.5"/>
                                        </svg>
                                    </div>
                                    <div class="file-name">EasyLook BoomBang</div>
                                    <div class="file-tooltip">
                                        <strong>EasyLook BoomBang</strong><br>
                                        <span class="tooltip-tech">ActionScript • Flash • Game Mod</span><br>
                                        Modificación de cliente con mejoras de UI, optimizaciones y herramientas de desarrollo.
                                        <div class="tooltip-features">
                                            ✓ UI Mods &nbsp; ✓ Performance &nbsp; ✓ Tools
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Barra de estado -->
                            <div class="explorer-statusbar">
                                <span>4 objects</span>
                                <span class="statusbar-separator">|</span>
                                <span>Double-click to open in GitHub</span>
                            </div>
                        </div>
                    </div>
                `
            },
            skills: {
                title: 'Skills & Technologies',
                icon: 'assets/icons/folder.ico',
                width: '680px',
                height: '520px',
                noPaddingExplorer: true,
                content: `
                    <div class="xp-skills-container">
                        <!-- Tab strip -->
                        <div class="xp-skills-tabs">
                            <div class="xp-tab active" data-tab="languages">Languages</div>
                            <div class="xp-tab" data-tab="frameworks">Frameworks</div>
                            <div class="xp-tab" data-tab="tools">Tools</div>
                            <div class="xp-tab" data-tab="concepts">Concepts</div>
                        </div>
                        
                        <!-- Tab content area -->
                        <div class="xp-skills-content">
                            <!-- Languages Tab -->
                            <div class="xp-tab-panel active" id="tab-languages">
                                <div class="xp-skills-header">
                                    <div class="xp-skills-icon">
                                        <svg viewBox="0 0 48 48" width="48" height="48">
                                            <rect x="8" y="4" width="32" height="40" fill="#F5F5F5" stroke="#808080" rx="2"/>
                                            <text x="14" y="28" font-family="Consolas" font-size="14" fill="#0066CC">&lt;/&gt;</text>
                                        </svg>
                                    </div>
                                    <div class="xp-skills-info">
                                        <strong>Programming Languages</strong><br>
                                        <span>Languages I use for development</span>
                                    </div>
                                </div>
                                
                                <div class="xp-skills-list">
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon js">JS</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">JavaScript (ES6+)</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 95%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Expert</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon py">PY</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">Python</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 85%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Advanced</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon ts">TS</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">TypeScript</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 80%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Advanced</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon html">HTML</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">HTML5 & CSS3</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 95%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Expert</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon sql">SQL</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">SQL</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 75%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Proficient</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon as">AS</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">ActionScript 3.0</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 90%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Expert</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Frameworks Tab -->
                            <div class="xp-tab-panel" id="tab-frameworks">
                                <div class="xp-skills-header">
                                    <div class="xp-skills-icon">
                                        <svg viewBox="0 0 48 48" width="48" height="48">
                                            <rect x="6" y="6" width="36" height="36" fill="#E0E0E0" stroke="#808080" rx="4"/>
                                            <rect x="10" y="10" width="12" height="12" fill="#4A90D9"/>
                                            <rect x="26" y="10" width="12" height="12" fill="#50C878"/>
                                            <rect x="10" y="26" width="12" height="12" fill="#FF6B6B"/>
                                            <rect x="26" y="26" width="12" height="12" fill="#FFD93D"/>
                                        </svg>
                                    </div>
                                    <div class="xp-skills-info">
                                        <strong>Frameworks & Libraries</strong><br>
                                        <span>Tools that accelerate development</span>
                                    </div>
                                </div>
                                
                                <div class="xp-skills-list">
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon react">⚛</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">React.js</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 90%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Expert</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon svelte">S</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">Svelte / SvelteKit</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 85%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Advanced</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon node">N</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">Node.js / Express</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 88%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Advanced</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon vue">V</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">Vue.js</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 75%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Proficient</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon tk">TK</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">Tkinter / CustomTkinter</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 90%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Expert</span>
                                    </div>
                                    <div class="xp-skill-item">
                                        <div class="xp-skill-icon sass">S</div>
                                        <div class="xp-skill-details">
                                            <div class="xp-skill-name">SASS / SCSS</div>
                                            <div class="xp-progress-bar"><div class="xp-progress-fill" style="width: 85%"></div></div>
                                        </div>
                                        <span class="xp-skill-level">Advanced</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Tools Tab -->
                            <div class="xp-tab-panel" id="tab-tools">
                                <div class="xp-skills-header">
                                    <div class="xp-skills-icon">
                                        <svg viewBox="0 0 48 48" width="48" height="48">
                                            <path d="M10 38 L20 28 L28 36 L38 10" fill="none" stroke="#666" stroke-width="4" stroke-linecap="round"/>
                                            <circle cx="38" cy="10" r="6" fill="#F5D83C" stroke="#B89F20"/>
                                            <rect x="6" y="34" width="10" height="10" fill="#808080" stroke="#404040" rx="1"/>
                                        </svg>
                                    </div>
                                    <div class="xp-skills-info">
                                        <strong>Development Tools</strong><br>
                                        <span>Software and utilities I use daily</span>
                                    </div>
                                </div>
                                
                                <div class="xp-skills-grid">
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <circle cx="16" cy="16" r="14" fill="#F05032"/>
                                            <path d="M16 6 L16 26 M10 12 L16 6 L22 12 M10 20 L16 26 L22 20" stroke="white" stroke-width="2" fill="none"/>
                                        </svg>
                                        <span>Git & GitHub</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <path d="M2 8 L16 2 L30 8 L30 24 L16 30 L2 24 Z" fill="#007ACC"/>
                                            <path d="M16 10 L16 22 M10 13 L16 10 L22 13" stroke="white" stroke-width="2" fill="none"/>
                                        </svg>
                                        <span>VS Code</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <rect x="2" y="8" width="28" height="16" rx="2" fill="#CB3837"/>
                                            <text x="16" y="20" text-anchor="middle" fill="white" font-size="8" font-weight="bold">npm</text>
                                        </svg>
                                        <span>npm / pnpm</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <polygon points="16,2 30,28 2,28" fill="#646CFF"/>
                                            <polygon points="16,10 24,24 8,24" fill="#BD34FE"/>
                                        </svg>
                                        <span>Vite</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <circle cx="16" cy="16" r="14" fill="#4285F4"/>
                                            <circle cx="16" cy="16" r="8" fill="#EA4335"/>
                                            <circle cx="16" cy="16" r="4" fill="#FBBC05"/>
                                            <path d="M16 2 A14 14 0 0 1 30 16" fill="#34A853"/>
                                        </svg>
                                        <span>Chrome DevTools</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <rect x="4" y="4" width="24" height="24" rx="4" fill="#21D789"/>
                                            <text x="16" y="21" text-anchor="middle" fill="white" font-size="10" font-weight="bold">Py</text>
                                        </svg>
                                        <span>PyCharm</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <rect x="4" y="4" width="24" height="24" rx="2" fill="#CC0000"/>
                                            <text x="16" y="18" text-anchor="middle" fill="white" font-size="7" font-weight="bold">FLASH</text>
                                            <text x="16" y="25" text-anchor="middle" fill="white" font-size="5">CS6</text>
                                        </svg>
                                        <span>Adobe Flash CS6</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <rect x="4" y="4" width="24" height="24" rx="2" fill="#FFD700"/>
                                            <text x="16" y="18" text-anchor="middle" fill="#333" font-size="6" font-weight="bold">JPEXS</text>
                                            <path d="M10 22 L22 22" stroke="#333" stroke-width="2"/>
                                        </svg>
                                        <span>JPEXS Decompiler</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <ellipse cx="16" cy="16" rx="12" ry="8" fill="#003B57"/>
                                            <ellipse cx="16" cy="16" rx="8" ry="5" fill="none" stroke="#44A8E0" stroke-width="2"/>
                                            <circle cx="16" cy="16" r="3" fill="#44A8E0"/>
                                        </svg>
                                        <span>SQLite</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <rect x="4" y="6" width="24" height="20" rx="2" fill="#0C0C0C"/>
                                            <rect x="6" y="8" width="20" height="16" fill="#1A1A1A"/>
                                            <text x="8" y="18" fill="#00FF00" font-size="6">$_</text>
                                        </svg>
                                        <span>Terminal</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <rect x="4" y="4" width="24" height="24" rx="3" fill="#FF6C37"/>
                                            <circle cx="16" cy="12" r="4" fill="white"/>
                                            <rect x="12" y="18" width="8" height="6" rx="1" fill="white"/>
                                        </svg>
                                        <span>Postman</span>
                                    </div>
                                    <div class="xp-tool-item">
                                        <svg class="xp-tool-svg" viewBox="0 0 32 32" width="32" height="32">
                                            <circle cx="16" cy="16" r="14" fill="#181717"/>
                                            <path d="M16 6 C10 6 6 10 6 16 C6 21 9 25 13 26 L13 23 C11 23 10 22 10 21 C10 20 11 19 11 19 C9 18 9 16 10 15 C10 15 10 13 12 12 C12 12 14 12 16 14 C18 12 20 12 20 12 C22 13 22 15 22 15 C23 16 23 18 21 19 C21 19 22 20 22 21 C22 22 21 23 19 23 L19 26 C23 25 26 21 26 16 C26 10 22 6 16 6" fill="white"/>
                                        </svg>
                                        <span>GitHub Actions</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Concepts Tab -->
                            <div class="xp-tab-panel" id="tab-concepts">
                                <div class="xp-skills-header">
                                    <div class="xp-skills-icon">
                                        <svg viewBox="0 0 48 48" width="48" height="48">
                                            <circle cx="24" cy="24" r="18" fill="none" stroke="#4A90D9" stroke-width="3"/>
                                            <circle cx="24" cy="24" r="8" fill="#FFD93D"/>
                                            <line x1="24" y1="6" x2="24" y2="14" stroke="#4A90D9" stroke-width="2"/>
                                            <line x1="24" y1="34" x2="24" y2="42" stroke="#4A90D9" stroke-width="2"/>
                                            <line x1="6" y1="24" x2="14" y2="24" stroke="#4A90D9" stroke-width="2"/>
                                            <line x1="34" y1="24" x2="42" y2="24" stroke="#4A90D9" stroke-width="2"/>
                                        </svg>
                                    </div>
                                    <div class="xp-skills-info">
                                        <strong>Concepts & Practices</strong><br>
                                        <span>Development methodologies and principles</span>
                                    </div>
                                </div>
                                
                                <div class="xp-concepts-container">
                                    <div class="xp-concept-group">
                                        <div class="xp-concept-title">
                                            <svg viewBox="0 0 16 16" width="16" height="16"><path d="M1 1h14v14H1z" fill="#4A90D9"/><path d="M4 5h8M4 8h6M4 11h4" stroke="white" stroke-width="1.5"/></svg>
                                            Development Practices
                                        </div>
                                        <div class="xp-concept-list">
                                            <div class="xp-concept-item">✓ Clean Code Architecture</div>
                                            <div class="xp-concept-item">✓ Design Patterns</div>
                                            <div class="xp-concept-item">✓ Test-Driven Development</div>
                                            <div class="xp-concept-item">✓ Code Review</div>
                                        </div>
                                    </div>
                                    <div class="xp-concept-group">
                                        <div class="xp-concept-title">
                                            <svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6" fill="#50C878"/><path d="M5 8l2 2 4-4" stroke="white" stroke-width="2" fill="none"/></svg>
                                            Performance & Security
                                        </div>
                                        <div class="xp-concept-list">
                                            <div class="xp-concept-item">✓ Performance Optimization</div>
                                            <div class="xp-concept-item">✓ Security Best Practices</div>
                                            <div class="xp-concept-item">✓ Caching Strategies</div>
                                            <div class="xp-concept-item">✓ API Integration</div>
                                        </div>
                                    </div>
                                    <div class="xp-concept-group">
                                        <div class="xp-concept-title">
                                            <svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="1" width="14" height="14" fill="#FF6B6B" rx="2"/><path d="M4 8h8M8 4v8" stroke="white" stroke-width="2"/></svg>
                                            Soft Skills
                                        </div>
                                        <div class="xp-concept-list">
                                            <div class="xp-concept-item">✓ Problem Solving</div>
                                            <div class="xp-concept-item">✓ Attention to Detail</div>
                                            <div class="xp-concept-item">✓ Self-Learning</div>
                                            <div class="xp-concept-item">✓ Documentation</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bottom status -->
                        <div class="xp-skills-status">
                            <span>6+ years of programming experience</span>
                            <span class="statusbar-separator">|</span>
                            <span>Always learning new technologies</span>
                        </div>
                    </div>
                `
            },
            contact: {
                title: 'Contact.txt - Notepad',
                icon: 'assets/icons/notepad.ico',
                width: '680px',
                height: '480px',
                hideToolbar: true,
                content: `
                    <div class="notepad-container">
                        <div class="notepad-text-area" id="notepad-content">
                            <div class="notepad-line header-line">
                                <span class="line-number">1</span>
                                <span class="line-content">  ┌─────────────────────────────────────────────────────────────────┐</span>
                            </div>
                            <div class="notepad-line header-line">
                                <span class="line-number">2</span>
                                <span class="line-content">  │  ██████╗ ██████╗ ███╗   ██╗████████╗ █████╗  ██████╗████████╗  │</span>
                            </div>
                            <div class="notepad-line header-line">
                                <span class="line-number">3</span>
                                <span class="line-content">  │ ██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔══██╗██╔════╝╚══██╔══╝  │</span>
                            </div>
                            <div class="notepad-line header-line">
                                <span class="line-number">4</span>
                                <span class="line-content">  │ ██║     ██║   ██║██╔██╗ ██║   ██║   ███████║██║        ██║     │</span>
                            </div>
                            <div class="notepad-line header-line">
                                <span class="line-number">5</span>
                                <span class="line-content">  │ ██║     ██║   ██║██║╚██╗██║   ██║   ██╔══██║██║        ██║     │</span>
                            </div>
                            <div class="notepad-line header-line">
                                <span class="line-number">6</span>
                                <span class="line-content">  │ ╚██████╗╚██████╔╝██║ ╚████║   ██║   ██║  ██║╚██████╗   ██║     │</span>
                            </div>
                            <div class="notepad-line header-line">
                                <span class="line-number">7</span>
                                <span class="line-content">  │  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝   ╚═╝     │</span>
                            </div>
                            <div class="notepad-line header-line">
                                <span class="line-number">8</span>
                                <span class="line-content">  └─────────────────────────────────────────────────────────────────┘</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">9</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line section-header">
                                <span class="line-number">10</span>
                                <span class="line-content">/* ═══════════════════ PERSONAL INFO ═══════════════════ */</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">11</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">12</span>
                                <span class="line-content">  <span class="np-key">Name:</span>      <span class="np-value">Francisco Bachiller</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">13</span>
                                <span class="line-content">  <span class="np-key">Role:</span>      <span class="np-value highlight">Full-Stack Developer</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">14</span>
                                <span class="line-content">  <span class="np-key">Age:</span>       <span class="np-value">24</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">15</span>
                                <span class="line-content">  <span class="np-key">Location:</span>  <span class="np-value">Argentina 🇦🇷</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">16</span>
                                <span class="line-content">  <span class="np-key">Timezone:</span>  <span class="np-value">GMT-3 (Buenos Aires)</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">17</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line section-header">
                                <span class="line-number">18</span>
                                <span class="line-content">/* ═══════════════════ GET IN TOUCH ═══════════════════ */</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">19</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line link-line">
                                <span class="line-number">20</span>
                                <span class="line-content">  <span class="np-icon">
                                    <svg viewBox="0 0 16 16" width="14" height="14"><path fill="#333" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                                </span> <span class="np-key">GitHub:</span>   <a href="https://github.com/Narfbach" target="_blank" class="np-link">github.com/Narfbach</a> <span class="np-badge online">● ACTIVE</span></span>
                            </div>
                            <div class="notepad-line link-line">
                                <span class="line-number">21</span>
                                <span class="line-content">  <span class="np-icon">
                                    <svg viewBox="0 0 16 16" width="14" height="14"><path fill="#EA4335" d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555zM0 4.697v7.104l5.803-3.558L0 4.697zM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.026L8 9.586l-1.239-.757zM16 11.801V4.697l-5.803 3.546L16 11.801z"/></svg>
                                </span> <span class="np-key">Email:</span>    <a href="mailto:narfbach@gmail.com" class="np-link">narfbach@gmail.com</a> <span class="np-copy" onclick="navigator.clipboard.writeText('narfbach@gmail.com'); this.textContent='✓ Copied!'; setTimeout(()=>this.textContent='📋 Copy', 2000)">📋 Copy</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">22</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line section-header">
                                <span class="line-number">23</span>
                                <span class="line-content">/* ═══════════════════ AVAILABILITY ═══════════════════ */</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">24</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">25</span>
                                <span class="line-content">  <span class="np-key">Status:</span>    <span class="np-status available">✓ OPEN TO OPPORTUNITIES</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">26</span>
                                <span class="line-content">  <span class="np-key">Type:</span>      <span class="np-tag">Freelance</span> <span class="np-tag">Full-time</span> <span class="np-tag">Contract</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">27</span>
                                <span class="line-content">  <span class="np-key">Remote:</span>    <span class="np-value">Yes ✓</span> | <span class="np-key">Hybrid:</span> <span class="np-value">Yes ✓</span> | <span class="np-key">On-site:</span> <span class="np-value">Negotiable</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">28</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line section-header">
                                <span class="line-number">29</span>
                                <span class="line-content">/* ═══════════════════ LET'S CONNECT ═══════════════════ */</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">30</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">31</span>
                                <span class="line-content">  <span class="np-comment">// I'm interested in:</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">32</span>
                                <span class="line-content">  <span class="np-bullet">►</span> Challenging technical projects</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">33</span>
                                <span class="line-content">  <span class="np-bullet">►</span> Modern tech stack environments</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">34</span>
                                <span class="line-content">  <span class="np-bullet">►</span> Open source contributions</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">35</span>
                                <span class="line-content">  <span class="np-bullet">►</span> Collaborative team culture</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">36</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">37</span>
                                <span class="line-content">  <span class="np-comment">// Feel free to reach out! I usually respond within 24h.</span></span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">38</span>
                                <span class="line-content"></span>
                            </div>
                            <div class="notepad-line footer-line">
                                <span class="line-number">39</span>
                                <span class="line-content">─────────────────────────────────────────────────────────</span>
                            </div>
                            <div class="notepad-line footer-line">
                                <span class="line-number">40</span>
                                <span class="line-content">  Last updated: <span class="np-date" id="contact-date"></span> | Version 2.0.24</span>
                            </div>
                            <div class="notepad-line">
                                <span class="line-number">41</span>
                                <span class="line-content"><span class="cursor">|</span></span>
                            </div>
                        </div>
                        <div class="notepad-statusbar">
                            <div class="statusbar-left">
                                <span>Ln 41, Col 1</span>
                            </div>
                            <div class="statusbar-right">
                                <span>100%</span>
                                <span class="separator">|</span>
                                <span>Windows (CRLF)</span>
                                <span class="separator">|</span>
                                <span>UTF-8</span>
                            </div>
                        </div>
                    </div>
                    <script>
                        document.getElementById('contact-date').textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    </script>
                `
            },
            pinball: {
                title: '3D Pinball for Windows - Space Cadet',
                icon: 'assets/icons/pinball.ico',
                width: '0px',
                height: '0px',
                hideMenubar: true,
                hideToolbar: true,
                noPadding: true,
                content: ``
            },
            winamp: {
                title: 'Winamp',
                icon: 'assets/icons/winamp.PNG',
                width: '0px',
                height: '0px',
                hideMenubar: true,
                hideToolbar: true,
                noPadding: true,
                content: `
                    <div id="webamp-container" style="width: 100%; height: 100%;"></div>
                `
            }
        };

        return configs[type] || configs.about;
    }

    setupWindowControls(windowElement) {
        const minimizeBtn = windowElement.querySelector('.window-minimize');
        const maximizeBtn = windowElement.querySelector('.window-maximize');
        const closeBtn = windowElement.querySelector('.window-close');

        minimizeBtn.addEventListener('click', () => this.minimizeWindow(windowElement));
        maximizeBtn.addEventListener('click', () => this.toggleMaximize(windowElement));
        closeBtn.addEventListener('click', () => this.closeWindow(windowElement));

        // Focus window on click
        windowElement.addEventListener('mousedown', () => {
            this.focusWindow(windowElement);
        });
    }

    setupWindowDragging(windowElement) {
        const titlebar = windowElement.querySelector('.window-titlebar');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            if (windowElement.classList.contains('maximized')) return;

            isDragging = true;
            initialX = e.clientX - windowElement.offsetLeft;
            initialY = e.clientY - windowElement.offsetTop;

            titlebar.style.cursor = 'move';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Keep window within bounds
            const maxX = window.innerWidth - windowElement.offsetWidth;
            const maxY = window.innerHeight - windowElement.offsetHeight - 30;

            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            windowElement.style.left = currentX + 'px';
            windowElement.style.top = currentY + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            titlebar.style.cursor = 'move';
        });

        // Double click to maximize
        titlebar.addEventListener('dblclick', (e) => {
            if (e.target.closest('.window-controls')) return;
            this.toggleMaximize(windowElement);
        });
    }

    minimizeWindow(windowElement) {
        windowElement.classList.add('minimized');
        const windowData = this.windows.find(w => w.element === windowElement);
        if (windowData) windowData.minimized = true;

        // Update taskbar item
        const taskbarItem = document.querySelector(`[data-window-type="${windowElement.dataset.type}"]`);
        if (taskbarItem) taskbarItem.classList.remove('active');
    }

    restoreWindow(windowElement) {
        windowElement.classList.remove('minimized');
        const windowData = this.windows.find(w => w.element === windowElement);
        if (windowData) windowData.minimized = false;
        this.focusWindow(windowElement);
    }

    toggleMaximize(windowElement) {
        windowElement.classList.toggle('maximized');
        const windowData = this.windows.find(w => w.element === windowElement);
        if (windowData) windowData.maximized = !windowData.maximized;
    }

    closeWindow(windowElement) {
        // Remove from windows array
        this.windows = this.windows.filter(w => w.element !== windowElement);

        // Remove taskbar item
        const taskbarItem = document.querySelector(`[data-window-type="${windowElement.dataset.type}"]`);
        if (taskbarItem) taskbarItem.remove();

        // Remove window element
        windowElement.remove();
    }

    focusWindow(windowElement) {
        // Remove active class from all windows
        document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
        document.querySelectorAll('.taskbar-item').forEach(t => t.classList.remove('active'));

        // Add active class to this window
        windowElement.classList.add('active');
        windowElement.style.zIndex = ++this.zIndexCounter;

        // Update taskbar
        const taskbarItem = document.querySelector(`[data-window-type="${windowElement.dataset.type}"]`);
        if (taskbarItem) taskbarItem.classList.add('active');

        this.activeWindow = windowElement;
    }

    addTaskbarItem(type, title, icon, windowElement) {
        const taskbarItems = document.getElementById('taskbar-items');
        const item = document.createElement('div');
        item.className = 'taskbar-item active';
        item.dataset.windowType = type;
        item.innerHTML = `
            <img src="${icon}" alt="${title}">
            <span>${title}</span>
        `;

        item.addEventListener('click', () => {
            if (windowElement.classList.contains('minimized')) {
                this.restoreWindow(windowElement);
            } else if (windowElement.classList.contains('active')) {
                this.minimizeWindow(windowElement);
            } else {
                this.focusWindow(windowElement);
            }
        });

        taskbarItems.appendChild(item);
    }

    shutdown() {
        document.body.style.background = '#000';
        document.getElementById('desktop').style.display = 'none';
        document.getElementById('taskbar').style.display = 'none';
        document.getElementById('start-menu').style.display = 'none';
        document.getElementById('windows-container').innerHTML = '';

        const shutdownScreen = document.createElement('div');
        shutdownScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0054E3;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: white;
            font-family: Tahoma, sans-serif;
            z-index: 99999;
        `;
        shutdownScreen.innerHTML = `
            <h1 style="font-size: 32px; margin-bottom: 20px;">Windows is shutting down...</h1>
            <p style="font-size: 16px;">Thank you for visiting my portfolio!</p>
            <p style="font-size: 14px; margin-top: 40px; opacity: 0.8;">Refresh the page to restart</p>
        `;
        document.body.appendChild(shutdownScreen);
    }

    // ===== WEBAMP PLAYER =====

    initWinamp() {
        // Limpiar cualquier instancia previa
        const existingContainer = document.getElementById('webamp-iframe-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Crear contenedor con iframe para aislar Webamp del CSS principal
        const container = document.createElement('div');
        container.id = 'webamp-iframe-container';
        container.style.cssText = `
            position: fixed;
            top: 50px;
            left: 50px;
            width: 550px;
            height: 500px;
            z-index: 10001;
            background: transparent;
            pointer-events: auto;
            animation: windowOpen 0.2s ease-out forwards;
        `;

        const iframe = document.createElement('iframe');
        iframe.src = 'webamp.html';
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: transparent;
        `;
        iframe.setAttribute('allowtransparency', 'true');

        // Crear barra de arrastre invisible en la parte superior (solo la parte izquierda)
        const dragBar = document.createElement('div');
        dragBar.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 200px;
            height: 14px;
            cursor: move;
            z-index: 10002;
        `;

        // Overlay para capturar eventos durante el arrastre
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            z-index: 10003;
        `;

        container.appendChild(dragBar);
        container.appendChild(overlay);
        container.appendChild(iframe);
        document.body.appendChild(container);

        // Hacer el contenedor arrastrable
        let isDragging = false;
        let startX, startY, initialX, initialY;

        dragBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = container.offsetLeft;
            initialY = container.offsetTop;
            overlay.style.display = 'block'; // Mostrar overlay para capturar eventos
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            container.style.left = `${initialX + dx}px`;
            container.style.top = `${initialY + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            overlay.style.display = 'none'; // Ocultar overlay
        });

        // Cerrar la ventana vacía de Windows XP
        setTimeout(() => {
            const winampWindow = document.querySelector('[data-type="winamp"]');
            if (winampWindow) {
                this.closeWindow(winampWindow);
            }
        }, 100);
    }

    // ===== PINBALL PLAYER =====

    initPinball() {
        // Limpiar cualquier instancia previa
        const existingContainer = document.getElementById('pinball-window-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Crear ventana XP personalizada
        const container = document.createElement('div');
        container.id = 'pinball-window-container';
        container.innerHTML = `
            <div class="xp-window-frame" style="
                position: fixed;
                top: 60px;
                left: 200px;
                width: 640px;
                z-index: 10001;
                background: #ECE9D8;
                border: 3px solid;
                border-color: #0054E3 #001EA0 #001EA0 #0054E3;
                border-radius: 8px 8px 0 0;
                box-shadow: 2px 2px 10px rgba(0,0,0,0.5);
                font-family: 'Tahoma', sans-serif;
                animation: windowOpen 0.2s ease-out forwards;
            ">
                <!-- Barra de título XP -->
                <div class="xp-title-bar" style="
                    background: linear-gradient(180deg, #0997FF 0%, #0053EE 8%, #0053EE 92%, #001EA0 100%);
                    padding: 3px 5px 3px 3px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 5px 5px 0 0;
                    cursor: move;
                    user-select: none;
                ">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <img src="assets/icons/pinball.ico" alt="" style="width: 16px; height: 16px;">
                        <span style="color: white; font-size: 12px; font-weight: bold; text-shadow: 1px 1px 1px rgba(0,0,0,0.5);">3D Pinball for Windows - Space Cadet</span>
                    </div>
                    <div style="display: flex; gap: 2px;">
                        <button class="xp-btn xp-minimize" style="
                            width: 21px; height: 21px; 
                            background: linear-gradient(180deg, #3C8DFF 0%, #2663DE 50%, #1941B5 100%);
                            border: 1px solid; border-color: #4B98FF #1941B5 #1941B5 #4B98FF;
                            border-radius: 3px; cursor: pointer; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 3px;
                        "><span style="width: 8px; height: 2px; background: white; display: block;"></span></button>
                        <button class="xp-btn xp-maximize" style="
                            width: 21px; height: 21px; 
                            background: linear-gradient(180deg, #3C8DFF 0%, #2663DE 50%, #1941B5 100%);
                            border: 1px solid; border-color: #4B98FF #1941B5 #1941B5 #4B98FF;
                            border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center;
                        "><span style="width: 9px; height: 9px; border: 2px solid white; border-top-width: 3px; display: block;"></span></button>
                        <button class="xp-btn xp-close" style="
                            width: 21px; height: 21px; 
                            background: linear-gradient(180deg, #E97458 0%, #C8503A 50%, #B5412D 100%);
                            border: 1px solid; border-color: #FF9E84 #8E2A19 #8E2A19 #FF9E84;
                            border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center;
                            color: white; font-size: 14px; font-weight: bold; line-height: 1;
                        ">✕</button>
                    </div>
                </div>
                
                <!-- Contenido del juego -->
                <div style="background: #000; width: 100%; height: 480px; overflow: hidden;">
                    <iframe src="https://alula.github.io/SpaceCadetPinball/" 
                        style="width: 100%; height: 100%; border: none;" 
                        allow="autoplay; fullscreen">
                    </iframe>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        const windowFrame = container.querySelector('.xp-window-frame');
        const titleBar = container.querySelector('.xp-title-bar');
        const closeBtn = container.querySelector('.xp-close');
        const minimizeBtn = container.querySelector('.xp-minimize');

        // Cerrar ventana
        closeBtn.addEventListener('click', () => {
            container.remove();
            // También remover de la taskbar
            const taskbarItem = document.querySelector('[data-window-type="pinball"]');
            if (taskbarItem) taskbarItem.remove();
        });

        // Minimizar (ocultar)
        minimizeBtn.addEventListener('click', () => {
            container.style.display = 'none';
        });

        // Hacer la ventana arrastrable
        let isDragging = false;
        let startX, startY, initialX, initialY;

        titleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.xp-btn')) return;
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = windowFrame.offsetLeft;
            initialY = windowFrame.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            windowFrame.style.left = `${initialX + dx}px`;
            windowFrame.style.top = `${initialY + dy}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Cerrar la ventana vacía de Windows XP
        setTimeout(() => {
            const pinballWindow = document.querySelector('[data-type="pinball"]');
            if (pinballWindow) {
                this.closeWindow(pinballWindow);
            }
        }, 100);
    }

    async loadWinampPlaylist() {
        // Playlist con las canciones del usuario
        const musicFiles = [
            'assets/music/fishmans-babyblue.flac',
            'assets/music/georgeclanton-slide.flac',
            'assets/music/keane-isitanywonder.flac',
            'assets/music/moby-go.flac',
            'assets/music/smiths-thischarmingman.flac',
            'assets/music/talktalk-itsmylife.flac',
            'assets/music/thesystem-almostgrown.flac'
        ];

        const playlist = document.getElementById('winamp-playlist');

        if (musicFiles.length === 0) {
            playlist.innerHTML = `
                <div style="color: #888; text-align: center; padding: 20px; line-height: 1.6;">
                    <div style="margin-bottom: 10px;">📁 Sin canciones</div>
                    <div style="font-size: 10px;">
                        Agrega archivos MP3 a<br/>
                        <code style="color: #00FF00;">/assets/music/</code><br/>
                        y actualiza el código
                    </div>
                </div>
            `;
            return;
        }

        this.winampData.playlist = musicFiles;
        let html = '';

        musicFiles.forEach((file, index) => {
            // Extraer y formatear nombre del archivo
            let filename = file.split('/').pop().replace(/\.(mp3|flac|ogg|wav)$/i, '');

            // Convertir "artista-titulo" a "Artista - Titulo"
            if (filename.includes('-')) {
                const parts = filename.split('-');
                const artist = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
                const title = parts.slice(1).join('-');
                filename = `${artist} - ${title.charAt(0).toUpperCase() + title.slice(1)}`;
            }

            html += `
                <div class="playlist-item" data-index="${index}" 
                    style="padding: 4px 8px; cursor: pointer; border-bottom: 1px solid #1C1F26; ${index === 0 ? 'background: #1C2F26; color: #00FF00;' : ''}"
                    onmouseover="this.style.background='#2C3F36'" 
                    onmouseout="this.style.background='${index === 0 ? '#1C2F26' : 'transparent'}'">
                    ${index + 1}. ${filename}
                </div>
            `;
        });

        playlist.innerHTML = html;

        // Add click handlers to playlist items
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                this.playWinampTrack(index);
            });
        });
    }

    setupWinampControls() {
        const { audio } = this.winampData;

        // Play button
        document.getElementById('win-play')?.addEventListener('click', () => {
            if (this.winampData.playlist.length > 0) {
                if (audio.src) {
                    audio.play();
                    this.winampData.isPlaying = true;
                } else {
                    this.playWinampTrack(0);
                }
            }
        });

        // Pause button
        document.getElementById('win-pause')?.addEventListener('click', () => {
            if (audio) {
                audio.pause();
                this.winampData.isPlaying = false;
            }
        });

        // Stop button
        document.getElementById('win-stop')?.addEventListener('click', () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                this.winampData.isPlaying = false;
                this.updateWinampDisplay('** STOPPED **', '00:00 / 00:00');
            }
        });

        // Previous button
        document.getElementById('win-prev')?.addEventListener('click', () => {
            if (this.winampData.playlist.length > 0) {
                let prev = this.winampData.currentTrack - 1;
                if (prev < 0) prev = this.winampData.playlist.length - 1;
                this.playWinampTrack(prev);
            }
        });

        // Next button
        document.getElementById('win-next')?.addEventListener('click', () => {
            if (this.winampData.playlist.length > 0) {
                let next = (this.winampData.currentTrack + 1) % this.winampData.playlist.length;
                this.playWinampTrack(next);
            }
        });

        // Volume control
        document.getElementById('winamp-volume')?.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            if (audio) audio.volume = volume;
            document.getElementById('volume-display').textContent = e.target.value + '%';
        });

        // Progress bar
        document.getElementById('winamp-progress')?.addEventListener('input', (e) => {
            if (audio && audio.duration) {
                const time = (e.target.value / 100) * audio.duration;
                audio.currentTime = time;
            }
        });

        // Audio events
        if (audio) {
            audio.addEventListener('timeupdate', () => {
                const progress = document.getElementById('winamp-progress');
                const timeDisplay = document.getElementById('time-display');

                if (audio.duration) {
                    const percent = (audio.currentTime / audio.duration) * 100;
                    if (progress) progress.value = percent;

                    const current = this.formatTime(audio.currentTime);
                    const total = this.formatTime(audio.duration);
                    if (timeDisplay) timeDisplay.textContent = `${current} / ${total}`;
                }
            });

            audio.addEventListener('ended', () => {
                // Auto-play next track
                const next = (this.winampData.currentTrack + 1) % this.winampData.playlist.length;
                this.playWinampTrack(next);
            });

            // Set initial volume
            audio.volume = 0.7;
        }
    }

    playWinampTrack(index) {
        const { audio, playlist } = this.winampData;
        if (!playlist[index]) return;

        this.winampData.currentTrack = index;
        audio.src = playlist[index];
        audio.play();
        this.winampData.isPlaying = true;

        // Update display
        let filename = playlist[index].split('/').pop().replace(/\.(mp3|flac|ogg|wav)$/i, '');

        // Formatear "artista-titulo" a "Artista - Titulo"
        if (filename.includes('-')) {
            const parts = filename.split('-');
            const artist = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
            const title = parts.slice(1).join('-');
            filename = `${artist} - ${title.charAt(0).toUpperCase() + title.slice(1)}`;
        }

        this.updateWinampDisplay(`♫ ${filename}`, '00:00 / 00:00');

        // Update playlist selection
        document.querySelectorAll('.playlist-item').forEach((item, i) => {
            if (i === index) {
                item.style.background = '#1C2F26';
                item.style.color = '#00FF00';
            } else {
                item.style.background = 'transparent';
                item.style.color = '#DCE3F0';
            }
        });
    }

    updateWinampDisplay(title, time) {
        const trackInfo = document.getElementById('track-info');
        const timeDisplay = document.getElementById('time-display');
        if (trackInfo) trackInfo.textContent = title;
        if (timeDisplay) timeDisplay.textContent = time;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    startVisualizer() {
        const canvas = document.getElementById('winamp-visualizer');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const bars = 32;
        const barWidth = canvas.width / bars;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw bars
            for (let i = 0; i < bars; i++) {
                const height = this.winampData.isPlaying
                    ? Math.random() * canvas.height * 0.8
                    : 5;

                const x = i * barWidth;
                const y = canvas.height - height;

                // Gradient effect
                const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
                gradient.addColorStop(0, '#00FF00');
                gradient.addColorStop(0.5, '#00CC00');
                gradient.addColorStop(1, '#008800');

                ctx.fillStyle = gradient;
                ctx.fillRect(x + 1, y, barWidth - 2, height);
            }
        };

        // Animate at 30 FPS
        this.winampData.visualizerInterval = setInterval(draw, 33);
    }

    // ===== ABOUT ME TABS =====

    initAboutTabs(windowElement) {
        const tabs = windowElement.querySelectorAll('.xp-tab');
        const contents = windowElement.querySelectorAll('.xp-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Remove active from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                // Add active to clicked tab and corresponding content
                tab.classList.add('active');
                const targetContent = windowElement.querySelector(`#tab-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });

        // Add expandable functionality to device categories
        const categoryHeaders = windowElement.querySelectorAll('.category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const category = header.parentElement;
                const deviceList = category.querySelector('.device-list');
                const expandIcon = header.querySelector('.expand-icon');

                if (category.classList.contains('expanded')) {
                    category.classList.remove('expanded');
                    deviceList.style.display = 'none';
                    expandIcon.textContent = '+';
                } else {
                    category.classList.add('expanded');
                    deviceList.style.display = 'flex';
                    expandIcon.textContent = '−';
                }
            });
        });
    }

    // ===== CONTACT NOTEPAD =====

    initContactNotepad(windowElement) {
        // Set the current date
        const dateElement = windowElement.querySelector('#contact-date');
        if (dateElement) {
            dateElement.textContent = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    // ===== PROJECT TOOLTIPS =====

    initProjectTooltips(windowElement) {
        // Tooltips are now handled purely via CSS
        // This method is kept for potential future enhancements
    }

    // ===== SKILLS TABS =====

    initSkillsTabs(windowElement) {
        const tabs = windowElement.querySelectorAll('.xp-tab');
        const panels = windowElement.querySelectorAll('.xp-tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active from all
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                // Add active to clicked
                tab.classList.add('active');
                const tabName = tab.getAttribute('data-tab');
                const panel = windowElement.querySelector(`#tab-${tabName}`);
                if (panel) panel.classList.add('active');
            });
        });
    }

    loadContent() {
        // Any additional content loading can go here
    }
}

// Global instance for onclick handlers
let windowsXP;

// Initialize Windows XP when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    windowsXP = new WindowsXP();
});
