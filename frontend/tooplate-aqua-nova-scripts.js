/*

Tooplate 2138 Aqua Nova

https://www.tooplate.com/view/2138-aqua-nova

*/

// JavaScript Document

// Underwater Background Animation
        const underwaterBg = document.getElementById('underwater-bg');
        
        // Simple bubble creation - Reduced number
        function createBubbles() {
            for (let i = 0; i < 6; i++) {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.style.width = Math.random() * 10 + 5 + 'px';
                bubble.style.height = bubble.style.width;
                bubble.style.left = Math.random() * 100 + '%';
                bubble.style.animationDelay = Math.random() * 10 + 's';
                bubble.style.animationDuration = Math.random() * 5 + 8 + 's';
                underwaterBg.appendChild(bubble);
            }
        }

        // Simple ocean particles
        function createOceanParticles() {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'ocean-particle';
                particle.style.width = Math.random() * 4 + 2 + 'px';
                particle.style.height = particle.style.width;
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = Math.random() * 5 + 12 + 's';
                underwaterBg.appendChild(particle);
            }
        }

        // Research Tabs Functionality - Fixed
        const researchTabs = document.querySelectorAll('.research-tab');
        const researchContents = document.querySelectorAll('.research-content');

        if (researchTabs.length > 0 && researchContents.length > 0) {
            researchTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // Remove active class from all tabs and contents
                    researchTabs.forEach(t => t.classList.remove('active'));
                    researchContents.forEach(c => c.classList.remove('active'));

                    // Add active class to clicked tab
                    tab.classList.add('active');

                    // Show corresponding content
                    const tabId = tab.getAttribute('data-tab');
                    const targetContent = document.getElementById(tabId);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                });
            });
        }

        // Simple initialization
        createBubbles();
        createOceanParticles();

        // Simple regeneration
        setInterval(createBubbles, 20000); // Every 20 seconds
        setInterval(createOceanParticles, 30000); // Every 30 seconds

        // Mobile menu toggle - Fixed
        const mobileToggle = document.getElementById('mobile-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on links
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // Smooth scroll - Fixed
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Navbar scroll effect - Fixed
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }

            // Fade in sections
            const sections = document.querySelectorAll('.fade-in');
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.8) {
                    section.classList.add('visible');
                }
            });
        });

        // API base - same origin, since the backend also serves this frontend.
        // If you ever host the frontend separately, change this to your API's full URL.
        const API_BASE = '';

        // Contact form submission - now sends real data to the backend
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const inputs = contactForm.querySelectorAll('input, textarea');
                const [nameInput, emailInput, orgInput, messageInput] = inputs;
                const submitBtn = contactForm.querySelector('.dive-btn');
                const originalBtnText = submitBtn ? submitBtn.textContent : '';

                const payload = {
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    organization: orgInput.value.trim(),
                    message: messageInput.value.trim()
                };

                try {
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Sending...';
                    }

                    const res = await fetch(`${API_BASE}/api/contact`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await res.json();

                    if (res.ok && data.ok) {
                        alert('Message sent successfully! 🌊 I will get back to you soon.');
                        contactForm.reset();
                    } else {
                        alert(data.error || 'Something went wrong. Please try again.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Could not reach the server. Please try again later.');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                }
            });
        }

        // Newsletter form submission - now sends real data to the backend
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = document.querySelector('.newsletter-input');
                const submitBtn = newsletterForm.querySelector('.newsletter-btn');
                const originalBtnText = submitBtn ? submitBtn.textContent : '';
                if (!emailInput || !emailInput.value) return;

                try {
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.textContent = '...';
                    }

                    const res = await fetch(`${API_BASE}/api/newsletter`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: emailInput.value.trim() })
                    });
                    const data = await res.json();

                    if (res.ok && data.ok) {
                        alert('Thank you for subscribing! 🐠 You will get updates on new projects.');
                        emailInput.value = '';
                    } else {
                        alert(data.error || 'Something went wrong. Please try again.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Could not reach the server. Please try again later.');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                }
            });
        }