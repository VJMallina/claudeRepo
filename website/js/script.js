// Theme Toggle Functionality
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');

    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    }

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');

        // Update icon
        if (document.body.classList.contains('dark-theme')) {
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });
}

// Carousel Functionality
let currentSlideIndex = 0;
let autoPlayTimer;
const slides = document.querySelectorAll('.carousel-card');
const totalSlides = slides.length;

function initCarousel() {
    // Create dots
    const dotsContainer = document.getElementById('carouselDots');
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.onclick = () => goToSlide(i);
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dotsContainer.appendChild(dot);
    }

    // Start autoplay
    startAutoPlay();
}

function moveSlide(direction) {
    currentSlideIndex += direction;

    // Loop around
    if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlides - 1;
    } else if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = 0;
    }

    updateCarousel();
    resetAutoPlay();
}

function goToSlide(index) {
    currentSlideIndex = index;
    updateCarousel();
    resetAutoPlay();
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.carousel-dot');

    // Move the track
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

    // Update dots
    dots.forEach((dot, index) => {
        if (index === currentSlideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
        moveSlide(1);
    }, 4000); // Change slide every 4 seconds
}

function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
}

// Pause autoplay on hover
function setupCarouselHover() {
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', () => {
            clearInterval(autoPlayTimer);
        });

        carouselWrapper.addEventListener('mouseleave', () => {
            startAutoPlay();
        });
    }
}

// Toggle API Category - Make entire header clickable
function toggleCategory(button) {
    // Get the category header (could be the button or the header itself)
    const categoryHeader = button.classList.contains('category-header')
        ? button
        : button.parentElement;

    const categoryContent = categoryHeader.nextElementSibling;
    const toggleBtn = categoryHeader.querySelector('.toggle-btn');

    // Toggle content visibility
    categoryContent.classList.toggle('active');

    // Rotate button
    if (categoryContent.classList.contains('active')) {
        toggleBtn.style.transform = 'rotate(180deg)';
    } else {
        toggleBtn.style.transform = 'rotate(0deg)';
    }
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initTheme();

    // Initialize carousel
    if (document.querySelector('.carousel-card')) {
        initCarousel();
        setupCarouselHover();
    }

    // Make category headers clickable
    document.querySelectorAll('.category-header').forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function(e) {
            // Don't trigger if clicking the toggle button itself
            if (!e.target.classList.contains('toggle-btn')) {
                toggleCategory(this);
            }
        });
    });
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards and other elements
    const animatedElements = document.querySelectorAll('.feature-card, .integration-item, .screen-item, .step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Counter animation for stats
    function animateCounter(element, start, end, duration) {
        let startTime = null;

        function animate(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    // Animate hero stats when visible
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate savings
                    const savingsElement = document.querySelector('.stat-value');
                    if (savingsElement && savingsElement.textContent.includes('Cr')) {
                        // Already animated, skip
                    }
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(heroStats);
    }

    // Store button interactions
    const storeButtons = document.querySelectorAll('.store-button');
    storeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('PiggySave will be available soon on the App Store and Google Play Store!');
        });
    });

    // Feature card hover effect enhancement
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        });

        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.borderColor = '#e5e7eb';
            }
        });
    });

    // Phone mockup interactive demo
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
        // Add subtle 3D tilt effect on mouse move
        phoneMockup.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-20px)`;
        });

        phoneMockup.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    }

    // Add loading state to download buttons
    const downloadButtons = document.querySelectorAll('.download-buttons .btn-primary');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const originalText = this.textContent;
            this.textContent = 'Coming Soon...';
            this.style.opacity = '0.7';

            setTimeout(() => {
                this.textContent = originalText;
                this.style.opacity = '1';
            }, 2000);
        });
    });

    // Log page view (for analytics)
    console.log('%c🐷 PiggySave - Save Smart, Invest Smarter', 'color: #6366f1; font-size: 20px; font-weight: bold;');
    console.log('%cWebsite loaded successfully!', 'color: #10b981; font-size: 14px;');
    console.log('%cInterested in our API? Check out our documentation at /api/docs', 'color: #6b7280; font-size: 12px;');
});

// Prevent console warnings in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log = function() {};
    console.warn = function() {};
}

// Add easter egg
let clickCount = 0;
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', function() {
        clickCount++;
        if (clickCount === 5) {
            document.body.style.animation = 'rainbow 3s ease-in-out';
            setTimeout(() => {
                document.body.style.animation = '';
                clickCount = 0;
            }, 3000);
        }
    });
}

// Add rainbow animation for easter egg
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg); }
        50% { filter: hue-rotate(180deg); }
        75% { filter: hue-rotate(270deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Performance monitoring
window.addEventListener('load', function() {
    const loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;
    console.log(`%cPage loaded in ${loadTime}ms`, 'color: #6366f1; font-size: 12px;');
});

// Carousel functionality
let currentSlide = 0;
let autoPlayInterval;

function moveCarousel(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const totalSlides = slides.length;

    // Remove active class from current slide and indicator
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');

    // Calculate new slide index
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;

    // Add active class to new slide and indicator
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');

    // Reset auto-play
    resetAutoPlay();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');

    // Remove active class from current slide and indicator
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');

    // Set new slide
    currentSlide = index;

    // Add active class to new slide and indicator
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');

    // Reset auto-play
    resetAutoPlay();
}

function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        moveCarousel(1);
    }, 4000); // Change slide every 4 seconds
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
}

// Initialize carousel auto-play on page load
document.addEventListener('DOMContentLoaded', function() {
    // Start carousel autoplay
    startAutoPlay();

    // Pause autoplay when user hovers over carousel
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });

        carouselContainer.addEventListener('mouseleave', () => {
            startAutoPlay();
        });
    }

    // Add keyboard navigation for carousel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            moveCarousel(-1);
        } else if (e.key === 'ArrowRight') {
            moveCarousel(1);
        }
    });
});

// Add touch swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', function() {
    const carouselContainer = document.querySelector('.carousel-container');
    
    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carouselContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            moveCarousel(1);
        } else {
            // Swipe right - previous slide
            moveCarousel(-1);
        }
    }
}
