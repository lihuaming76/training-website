// ===================================
// Header Scroll Effect
// ===================================
const header = document.getElementById('header');
const floatingCta = document.getElementById('floatingCta');

// Function to check and update floating CTA visibility
function updateFloatingCtaVisibility() {
    const interactiveSection = document.getElementById('interactive');
    const heroSection = document.querySelector('.hero');

    if (interactiveSection && heroSection) {
        const interactiveRect = interactiveSection.getBoundingClientRect();
        const heroRect = heroSection.getBoundingClientRect();

        // Check if interactive section is in viewport
        const isInteractiveInView = interactiveRect.top < window.innerHeight && interactiveRect.bottom > 0;

        // Check if past hero section
        const isPastHero = heroRect.bottom < 0;

        if (isInteractiveInView) {
            floatingCta.classList.remove('visible');
        } else if (isPastHero) {
            floatingCta.classList.add('visible');
        } else {
            floatingCta.classList.remove('visible');
        }
    }
}

// Scrollspy functionality
function updateActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const headerHeight = header.offsetHeight;
    const scrollPosition = window.scrollY + headerHeight + 100;

    // If at top of page, activate home link
    if (window.scrollY < 100) {
        navLinks.forEach(link => link.classList.remove('active'));
        const homeLink = document.querySelector('.nav-link[href="#hero"]');
        if (homeLink) homeLink.classList.add('active');
        return;
    }

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));

            // Group diagnosis and solution-process under "落地定位"
            if (sectionId === 'diagnosis' || sectionId === 'solution-process') {
                const diagnosisLink = document.querySelector('.nav-link[href="#diagnosis"]');
                if (diagnosisLink) diagnosisLink.classList.add('active');
            } else {
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        }
    });
}

// Set initial active state on page load
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNavLink();
});

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;

    // Add scrolled class to header after 100px
    if (scrollPosition > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Update floating CTA visibility
    updateFloatingCtaVisibility();

    // Update active nav link
    updateActiveNavLink();
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
            // Hide floating CTA immediately if going to interactive section
            if (targetId === '#interactive') {
                floatingCta.classList.remove('visible');
            }

            // 手动计算精确滚动位置（scroll-padding-top已设为0，完全由JS控制）
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 98;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - headerHeight + 25;  // 加25px让section向上移动消除gap

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Update floating CTA after scroll completes
            setTimeout(updateFloatingCtaVisibility, 800);

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

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-right, .reveal-left, .reveal-scale').forEach(el => {
        observer.observe(el);
    });

    // Set dynamic copyright year
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Update floating CTA visibility on load
    updateFloatingCtaVisibility();

    // Observe interactive section for nav minimization
    const interactiveSection = document.getElementById('interactive');
    const navCta = document.querySelector('.nav-cta');
    if (interactiveSection && navCta) {
        const interactiveObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    header.classList.add('nav-minimal');
                } else {
                    header.classList.remove('nav-minimal');
                    navCta.textContent = '预约15分钟诊断对话';
                    navCta.setAttribute('href', '#interactive');
                }
            });
        }, { threshold: 0.2 });

        interactiveObserver.observe(interactiveSection);
    }

    // New minimal CTA entry
    const ctaOptions = document.querySelectorAll('.cta-option');
    const ctaEntryBtn = document.getElementById('ctaEntryBtn');
    const ctaEntry = document.getElementById('ctaEntry');
    const ctaContact = document.getElementById('ctaContact');
    const ctaCloseBtn = document.getElementById('ctaCloseBtn');

    if (ctaCloseBtn) {
        ctaCloseBtn.addEventListener('click', () => {
            document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    ctaOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            ctaOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            if (ctaEntryBtn) { ctaEntryBtn.disabled = false; }
        });
    });

    if (ctaEntryBtn) {
        ctaEntryBtn.addEventListener('click', () => {
            if (ctaEntryBtn.disabled) return;
            ctaEntry.style.display = 'none';
            ctaContact.style.display = 'block';
        });
    }

    const ctaBackBtn = document.getElementById('ctaBackBtn');
    if (ctaBackBtn) {
        ctaBackBtn.addEventListener('click', () => {
            ctaContact.style.display = 'none';
            ctaEntry.style.display = 'block';
        });
    }

    const bookPhoneBtn2 = document.getElementById('bookPhoneBtn2');
    const phoneBookingModal = document.getElementById('phoneBookingModal');
    if (bookPhoneBtn2 && phoneBookingModal) {
        bookPhoneBtn2.addEventListener('click', () => { phoneBookingModal.style.display = 'flex'; });
    }

    // Privacy Policy Modal
    const privacyLink = document.getElementById('privacyPolicyLink');
    const privacyModal = document.getElementById('privacyPolicyModal');

    if (privacyLink && privacyModal) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            privacyModal.style.display = 'block';
        });

        // Close modal when clicking outside
        privacyModal.addEventListener('click', (e) => {
            if (e.target === privacyModal) {
                privacyModal.style.display = 'none';
            }
        });
    }

// ===================================
// Intelligence Core Visual (Service 3)
// ===================================
const canvas = document.getElementById('intelligenceCore');
if (canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Network nodes with business terms
    const nodes = [
        { x: 0.2, y: 0.3, label: '库存熔断预警', phase: 0 },
        { x: 0.35, y: 0.2, label: '渠道ROI对标', phase: 0.3 },
        { x: 0.5, y: 0.15, label: '下发动作指令', phase: 0.6 },
        { x: 0.65, y: 0.25, label: '门店异常归因', phase: 0.9 },
        { x: 0.8, y: 0.35, label: '价格策略修正', phase: 1.2 },
        { x: 0.25, y: 0.55, label: '调拨建议验证', phase: 1.5 },
        { x: 0.45, y: 0.5, label: '毛利波动解释', phase: 1.8 },
        { x: 0.55, y: 0.6, label: '促销效果回收', phase: 2.1 },
        { x: 0.7, y: 0.55, label: '最佳实践固化', phase: 2.4 },
        { x: 0.4, y: 0.75, label: '角色任务分发', phase: 2.7 }
    ];

    const connections = [
        [0,1], [1,2], [2,3], [3,4], [0,5], [1,6], [2,6], [3,8], [5,6], [6,7], [7,8], [6,9]
    ];

    let time = 0;

    function draw() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);

        // Draw connections
        ctx.strokeStyle = 'rgba(0, 166, 212, 0.15)';
        ctx.lineWidth = 1;
        connections.forEach(([i, j]) => {
            const n1 = nodes[i];
            const n2 = nodes[j];
            ctx.beginPath();
            ctx.moveTo(n1.x * w, n1.y * h);
            ctx.lineTo(n2.x * w, n2.y * h);
            ctx.stroke();
        });

        // Draw nodes
        nodes.forEach((node, i) => {
            const pulse = Math.sin(time * 0.5 + node.phase) * 0.3 + 0.7;
            const x = node.x * w;
            const y = node.y * h;

            // Node circle
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 166, 212, ${pulse * 0.6})`;
            ctx.fill();

            // Label
            ctx.font = '9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.5})`;
            ctx.textAlign = 'center';
            ctx.fillText(node.label, x, y - 8);
        });

        time += 0.02;
        requestAnimationFrame(draw);
    }

    draw();
}
});
