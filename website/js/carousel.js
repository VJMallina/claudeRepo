// App Carousel Functionality
let currentAppSlide = 1; // Start with index 1 (Savings Wallet as center)
let appAutoPlayInterval;
const totalAppSlides = 6;

// Initialize carousel on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeAppCarousel();
    startAppAutoPlay();

    // Pause autoplay when user hovers over carousel
    const carouselWrapper = document.querySelector('.app-carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', () => {
            clearInterval(appAutoPlayInterval);
        });

        carouselWrapper.addEventListener('mouseleave', () => {
            startAppAutoPlay();
        });
    }

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        const carouselInView = isElementInViewport(document.querySelector('.app-carousel-wrapper'));
        if (carouselInView) {
            if (e.key === 'ArrowLeft') {
                moveAppCarousel(-1);
            } else if (e.key === 'ArrowRight') {
                moveAppCarousel(1);
            }
        }
    });

    // Add touch swipe support
    addTouchSupport();
});

// Initialize carousel with proper classes
function initializeAppCarousel() {
    const cards = document.querySelectorAll('.carousel-card');
    const dots = document.querySelectorAll('.pagination-dot');

    cards.forEach((card, index) => {
        card.classList.remove('active', 'left', 'right', 'hidden');

        const dataIndex = parseInt(card.getAttribute('data-index'));
        if (dataIndex === currentAppSlide) {
            card.classList.add('active');
        } else if (dataIndex === (currentAppSlide - 1 + totalAppSlides) % totalAppSlides) {
            card.classList.add('left');
        } else if (dataIndex === (currentAppSlide + 1) % totalAppSlides) {
            card.classList.add('right');
        } else {
            card.classList.add('hidden');
        }
    });

    // Update pagination dots
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentAppSlide) {
            dot.classList.add('active');
        }
    });
}

// Move carousel in a direction (-1 for previous, 1 for next)
function moveAppCarousel(direction) {
    currentAppSlide = (currentAppSlide + direction + totalAppSlides) % totalAppSlides;
    updateCarouselPositions();
    resetAppAutoPlay();
}

// Go to specific slide by index
function goToAppSlide(index) {
    if (index >= 0 && index < totalAppSlides) {
        currentAppSlide = index;
        updateCarouselPositions();
        resetAppAutoPlay();
    }
}

// Update all card positions and pagination
function updateCarouselPositions() {
    const cards = document.querySelectorAll('.carousel-card');
    const dots = document.querySelectorAll('.pagination-dot');

    cards.forEach((card) => {
        const dataIndex = parseInt(card.getAttribute('data-index'));

        // Remove all position classes
        card.classList.remove('active', 'left', 'right', 'hidden');

        // Calculate relative position
        const relativePosition = (dataIndex - currentAppSlide + totalAppSlides) % totalAppSlides;

        if (relativePosition === 0) {
            // Current slide
            card.classList.add('active');
        } else if (relativePosition === totalAppSlides - 1) {
            // Previous slide (to the left)
            card.classList.add('left');
        } else if (relativePosition === 1) {
            // Next slide (to the right)
            card.classList.add('right');
        } else {
            // Hidden slides
            card.classList.add('hidden');
        }
    });

    // Update pagination dots
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentAppSlide) {
            dot.classList.add('active');
        }
    });
}

// Auto-play functionality
function startAppAutoPlay() {
    appAutoPlayInterval = setInterval(() => {
        moveAppCarousel(1);
    }, 5000); // Change slide every 5 seconds
}

function resetAppAutoPlay() {
    clearInterval(appAutoPlayInterval);
    startAppAutoPlay();
}

// Touch swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

function addTouchSupport() {
    const carouselWrapper = document.querySelector('.app-carousel-wrapper');

    if (carouselWrapper) {
        carouselWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carouselWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            moveAppCarousel(1);
        } else {
            // Swipe right - previous slide
            moveAppCarousel(-1);
        }
    }
}

// Helper function to check if element is in viewport
function isElementInViewport(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add click handlers to carousel cards
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.carousel-card');

    cards.forEach((card) => {
        card.addEventListener('click', function() {
            const dataIndex = parseInt(this.getAttribute('data-index'));

            // If clicking a left or right card, navigate to it
            if (this.classList.contains('left')) {
                moveAppCarousel(-1);
            } else if (this.classList.contains('right')) {
                moveAppCarousel(1);
            }
            // Active card click could trigger some action in the future
        });
    });
});
