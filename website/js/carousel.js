// Simple Carousel - Guaranteed to Work
let currentSlide = 1; // Start with card 1 (index 1) as active
let autoplayInterval;
const TOTAL_SLIDES = 6;
const AUTOPLAY_DELAY = 4000; // 4 seconds

// Main function to update carousel
function updateCarousel() {
    const cards = document.querySelectorAll('.carousel-card');
    const dots = document.querySelectorAll('.pagination-dot');

    if (!cards.length) return;

    // Update cards
    cards.forEach((card, idx) => {
        const cardIndex = parseInt(card.getAttribute('data-index'));
        card.classList.remove('active', 'left', 'right', 'hidden');

        if (cardIndex === currentSlide) {
            card.classList.add('active');
        } else if (cardIndex === (currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES) {
            card.classList.add('left');
        } else if (cardIndex === (currentSlide + 1) % TOTAL_SLIDES) {
            card.classList.add('right');
        } else {
            card.classList.add('hidden');
        }
    });

    // Update dots
    dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Move to next slide
function nextSlide() {
    currentSlide = (currentSlide + 1) % TOTAL_SLIDES;
    updateCarousel();
}

// Move to previous slide
function prevSlide() {
    currentSlide = (currentSlide - 1 + TOTAL_SLIDES) % TOTAL_SLIDES;
    updateCarousel();
}

// Go to specific slide
function goToSlide(index) {
    if (index >= 0 && index < TOTAL_SLIDES) {
        currentSlide = index;
        updateCarousel();
        resetAutoplay();
    }
}

// Navigation functions for onclick handlers
function moveAppCarousel(direction) {
    if (direction > 0) {
        nextSlide();
    } else {
        prevSlide();
    }
    resetAutoplay();
}

function goToAppSlide(index) {
    goToSlide(index);
}

// Autoplay functions
function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
}

function stopAutoplay() {
    if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
    }
}

function resetAutoplay() {
    startAutoplay();
}

// Touch support
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
        resetAutoplay();
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    console.log('Carousel initializing...');

    // Initial setup
    updateCarousel();
    startAutoplay();

    // Hover pause
    const wrapper = document.querySelector('.app-carousel-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', stopAutoplay);
        wrapper.addEventListener('mouseleave', startAutoplay);

        // Touch events
        wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        wrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoplay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoplay();
        }
    });

    // Card click handlers
    document.querySelectorAll('.carousel-card').forEach(card => {
        card.addEventListener('click', function() {
            if (this.classList.contains('left')) {
                prevSlide();
                resetAutoplay();
            } else if (this.classList.contains('right')) {
                nextSlide();
                resetAutoplay();
            }
        });
    });

    console.log('Carousel initialized successfully!');
});
