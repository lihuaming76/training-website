// ===================================
// Header Scroll Effect
// ===================================
const header = document.getElementById('header');
const floatingCta = document.getElementById('floatingCta');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;

    // Add scrolled class to header after 100px
    if (scrollPosition > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Show floating CTA after scrolling past hero section
    const heroHeight = document.querySelector('.hero').offsetHeight;
    if (scrollPosition > heroHeight - 200) {
        floatingCta.classList.add('visible');
    } else {
        floatingCta.classList.remove('visible');
    }
});

// ===================================
// Smooth Scrolling Navigation
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const nav = document.getElementById('nav');
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        }
    });
});

// ===================================
// Hamburger Menu Toggle
// ===================================
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('active');
    }
});

// ===================================
// Cases Section - Tab Switching
// ===================================
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.case-tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        const targetContent = document.getElementById(`tab-${targetTab}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });
});

// ===================================
// Deliverables Carousel
// ===================================
const carouselTrack = document.querySelector('.carousel-track');
const carouselPrev = document.querySelector('.carousel-prev');
const carouselNext = document.querySelector('.carousel-next');
const indicators = document.querySelectorAll('.indicator');
const deliverableCards = document.querySelectorAll('.deliverable-card');

let currentIndex = 0;
const cardWidth = 350 + 32; // card width + gap
let autoPlayInterval;

function updateCarousel() {
    const offset = -currentIndex * cardWidth;
    carouselTrack.style.transform = `translateX(${offset}px)`;

    // Update indicators
    indicators.forEach((indicator, index) => {
        if (index === currentIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % deliverableCards.length;
    updateCarousel();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + deliverableCards.length) % deliverableCards.length;
    updateCarousel();
}

function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

// Event listeners for carousel controls
carouselNext.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
});

carouselPrev.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
});

indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        goToSlide(index);
        resetAutoPlay();
    });
});

// Auto-play functionality
function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
}

// Start auto-play on page load
startAutoPlay();

// Pause auto-play when hovering over carousel
const carouselWrapper = document.querySelector('.carousel-wrapper');
carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
carouselWrapper.addEventListener('mouseleave', startAutoPlay);

// ===================================
// Responsive Carousel Adjustment
// ===================================
function adjustCarouselForViewport() {
    const viewportWidth = window.innerWidth;

    if (viewportWidth <= 768) {
        // Mobile: card width 280px + gap 32px
        cardWidth = 280 + 32;
    } else if (viewportWidth <= 1024) {
        // Tablet: card width 350px + gap 32px
        cardWidth = 350 + 32;
    } else {
        // Desktop: card width 350px + gap 32px
        cardWidth = 350 + 32;
    }

    updateCarousel();
}

// Adjust on load and resize
window.addEventListener('load', adjustCarouselForViewport);
window.addEventListener('resize', adjustCarouselForViewport);

// ===================================
// Copy to Clipboard (WeChat ID)
// ===================================
const copyableElements = document.querySelectorAll('.copyable');

copyableElements.forEach(element => {
    element.addEventListener('click', () => {
        const textToCopy = element.textContent;

        // Create temporary textarea for copying
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');

            // Show feedback
            const originalText = element.textContent;
            element.textContent = '已复制！';
            element.style.color = '#10B981'; // Green color

            setTimeout(() => {
                element.textContent = originalText;
                element.style.color = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        document.body.removeChild(textarea);
    });

    // Add cursor pointer style
    element.style.cursor = 'pointer';
});

// ===================================
// Scroll Animations - Intersection Observer
// ===================================
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// ===================================
// Initialize on DOM Load
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Training website loaded successfully!');

    // Set initial carousel position
    updateCarousel();

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-right, .reveal-left, .reveal-scale').forEach(el => {
        observer.observe(el);
    });
});
