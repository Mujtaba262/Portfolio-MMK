// ---------- GSAP availability check (falls back to plain CSS/JS if CDN is blocked) ----------
const hasGSAP = typeof gsap !== 'undefined';
const hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';
if (hasGSAP) {
  document.body.classList.add('gsap-ready');
  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);
}

// ---------- Custom Cursor + Spotlight + Magnetic + Ripple (desktop only) ----------
(function initTrendyInteractions() {
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isFinePointer) return;

  document.body.classList.add('cursor-active');

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const spotlight = document.getElementById('cursorSpotlight');

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

  // GSAP's x/y transform is absolute pixels, so pin xPercent/yPercent once
  // to keep the dot and ring centered on the cursor point (matches the
  // translate(-50%,-50%) centering the fallback path applies manually).
  if (hasGSAP) {
    if (dot) gsap.set(dot, { xPercent: -50, yPercent: -50 });
    if (ring) gsap.set(ring, { xPercent: -50, yPercent: -50 });
  }

  // GSAP gives the ring a buttery, physically-eased trail instead of a linear lerp
  const ringXTo = hasGSAP ? gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }) : null;
  const ringYTo = hasGSAP ? gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' }) : null;
  let ringX = mouseX, ringY = mouseY; // used only for the non-GSAP fallback loop

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (dot) {
      if (hasGSAP) gsap.set(dot, { x: mouseX, y: mouseY });
      else dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }
    if (hasGSAP && ring) { ringXTo(mouseX); ringYTo(mouseY); }

    if (spotlight) {
      spotlight.style.setProperty('--sx', `${(mouseX / window.innerWidth) * 100}%`);
      spotlight.style.setProperty('--sy', `${(mouseY / window.innerHeight) * 100}%`);
    }
  });

  // Fallback trailing ring (only runs if GSAP failed to load)
  if (!hasGSAP) {
    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ring) ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();
  }

  // Grow cursor ring on hoverable elements
  const hoverTargets = document.querySelectorAll(
    'a, button, .project-card, .contact-card, .marquee-track span, .dot, input, textarea'
  );
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => ring && ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring && ring.classList.remove('hovered'));
  });

  document.addEventListener('mousedown', () => ring && ring.classList.add('clicked'));
  document.addEventListener('mouseup', () => ring && ring.classList.remove('clicked'));

  // Hide native-style cursor visuals on window blur/leave
  document.addEventListener('mouseleave', () => {
    if (dot) dot.style.opacity = '0';
    if (ring) ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (dot) dot.style.opacity = '1';
    if (ring) ring.style.opacity = '1';
  });

  // ---------- Magnetic buttons (GSAP quickTo = smooth spring-back, no jank) ----------
  document.querySelectorAll('.magnetic').forEach((btn) => {
    const magXTo = hasGSAP ? gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' }) : null;
    const magYTo = hasGSAP ? gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' }) : null;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = (e.clientX - rect.left - rect.width / 2) * 0.35;
      const relY = (e.clientY - rect.top - rect.height / 2) * 0.35;
      if (hasGSAP) { magXTo(relX); magYTo(relY); }
      else btn.style.transform = `translate(${relX}px, ${relY}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      if (hasGSAP) { magXTo(0); magYTo(0); }
      else btn.style.transform = '';
    });
  });

  // ---------- Project card 3D tilt + glow-follow ----------
  document.querySelectorAll('.project-card').forEach((card) => {
    const tiltXTo = hasGSAP ? gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power2' }) : null;
    const tiltYTo = hasGSAP ? gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power2' }) : null;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2, cy = rect.height / 2;
      const rotY = ((x - cx) / cx) * 5;
      const rotX = -((y - cy) / cy) * 5;

      if (hasGSAP) {
        gsap.set(card, { transformPerspective: 900, y: -8 });
        tiltXTo(rotX);
        tiltYTo(rotY);
      } else {
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
      }
      card.style.setProperty('--px', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--py', `${(y / rect.height) * 100}%`);
    });
    card.addEventListener('mouseleave', () => {
      if (hasGSAP) gsap.to(card, { rotationX: 0, rotationY: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' });
      else card.style.transform = '';
    });
  });
})();

// ---------- GSAP hero entrance + scroll-triggered reveals ----------
if (hasGSAP) {
  // Hero timeline — richer stagger with blur-to-focus + gentle rise, replacing the CSS keyframes
  gsap.set(['.eyebrow.rise', 'h1.name', '.role.rise', '.poem.rise', '.cta-row.rise', '.resume-row.rise', '.card-wrap.rise'], {
    opacity: 0, y: 28, filter: 'blur(6px)'
  });

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .to('.eyebrow.rise', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7 }, 0.1)
    .to('h1.name', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9 }, 0.3)
    .to('.role.rise', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, 0.55)
    .to('.poem.rise', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, 0.7)
    .to('.cta-row.rise', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, 0.95)
    .to('.resume-row.rise', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 }, 1.05)
    .to('.card-wrap.rise', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'back.out(1.4)' }, 0.75);

  if (hasScrollTrigger) {
    // Project cards — staggered rise-in as the grid enters view
    gsap.utils.toArray('.project-card.reveal').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 70, scale: 0.94 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out',
          delay: (i % 2) * 0.08,
          scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' }
        }
      );
    });

    // Contact block
    gsap.fromTo('.contact-wrap.reveal',
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-wrap', start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );

    // Section headings slide up into place as each section arrives
    gsap.utils.toArray('.heading').forEach((h) => {
      gsap.fromTo(h,
        { opacity: 0, y: 34 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: h, start: 'top 90%', toggleActions: 'play none none reverse' }
        }
      );
    });

    // Section labels (small eyebrow tags above each heading)
    gsap.utils.toArray('.section-label').forEach((label) => {
      gsap.fromTo(label,
        { opacity: 0, x: -20 },
        {
          opacity: 1, x: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: label, start: 'top 92%', toggleActions: 'play none none reverse' }
        }
      );
    });

    // Reviews slider fades and lifts in
    gsap.fromTo('.reviews-slider',
      { opacity: 0, y: 45 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.reviews-slider', start: 'top 88%', toggleActions: 'play none none reverse' }
      }
    );

    // Tech marquee gently fades up as it enters view
    gsap.fromTo('.marquee',
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.marquee', start: 'top 95%', toggleActions: 'play none none reverse' }
      }
    );

    // Section dividers (the "· · · 01 — Projects · · ·" markers) fade in
    gsap.utils.toArray('.section-divider').forEach((div) => {
      gsap.fromTo(div,
        { opacity: 0 },
        {
          opacity: 1, duration: 0.8, ease: 'power1.out',
          scrollTrigger: { trigger: div, start: 'top 95%', toggleActions: 'play none none reverse' }
        }
      );
    });
  }
}

// ---------- Ripple click effect on buttons ----------
document.querySelectorAll('.cta, .cta-ghost, .big-cta, .slider-btn, .resume-btn').forEach((el) => {
  el.classList.add('ripple-el');
  el.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const wave = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    wave.className = 'ripple-wave';
    wave.style.width = wave.style.height = `${size}px`;
    wave.style.left = `${e.clientX - rect.left - size / 2}px`;
    wave.style.top = `${e.clientY - rect.top - size / 2}px`;
    this.appendChild(wave);
    setTimeout(() => wave.remove(), 650);
  });
});

// ---------- Scroll progress bar ----------
const scrollProgressEl = document.getElementById('scrollProgress');
function updateScrollProgress() {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
  const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  if (scrollProgressEl) scrollProgressEl.style.width = `${progress}%`;
}
window.addEventListener('scroll', updateScrollProgress);
updateScrollProgress();

// 3D tilt card effect
const card = document.getElementById('tiltCard');
if (card) {
  const wrap = card.parentElement;
  const maxTilt = 14;
  
  wrap.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    const rotY = ((x - cx) / cx) * maxTilt;
    const rotX = -((y - cy) / cy) * maxTilt;
    card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    
    const glow = card.querySelector('.card-glow');
    if (glow) {
      glow.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
      glow.style.setProperty('--my', `${(y / rect.height) * 100}%`);
    }
  });
  
  wrap.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
}
 // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
 
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
 
    // Close menu when link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
 
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
 
    // Smooth scroll for navigation
    navLinks.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
 
    // Active link highlighting on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.style.color = 'var(--ink-dim)';
            if (link.getAttribute('href').slice(1) === current) {
                link.style.color = 'var(--primary)';
            }
        });
    });
// Scroll reveal animation — only needed when GSAP/ScrollTrigger didn't load,
// since the GSAP block above already handles .reveal elements with richer motion.
if (!hasScrollTrigger) {
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => io.observe(el));
}

// Robot follows cursor slightly — kept as direct style writes (not GSAP x/y)
// because .robot-stage relies on a CSS translateY(-50%) for vertical centering,
// and GSAP's transform shorthand would silently override that centering.
const robot = document.querySelector('.robot-stage');
if (robot) {
  let robotTargetX = 0, robotTargetY = 0, robotCurX = 0, robotCurY = 0;
  document.addEventListener('mousemove', (e) => {
    robotTargetX = (e.clientX / window.innerWidth - 0.5) * 20;
    robotTargetY = (e.clientY / window.innerHeight - 0.5) * 20;
  });

  // Smooth easing toward the target position every frame (GSAP ticker if available, RAF otherwise)
  function stepRobot() {
    robotCurX += (robotTargetX - robotCurX) * 0.08;
    robotCurY += (robotTargetY - robotCurY) * 0.08;
    robot.style.transform = `translateY(calc(-50% + ${robotCurY}px)) translateX(${robotCurX}px)`;
  }
  if (hasGSAP) gsap.ticker.add(stepRobot);
  else (function raf() { stepRobot(); requestAnimationFrame(raf); })();
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '#!' ) return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Lazy load images with animation
const images = document.querySelectorAll('.image-placeholder');
images.forEach(img => {
  img.style.opacity = '0';
  img.style.animation = 'none';
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.animation = 'imageFloat 6s ease-in-out infinite';
        }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  observer.observe(img);
});

// Project card hover effects
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card, index) => {
  card.style.animationDelay = `${index * 0.1}s`;
});

// Add click handlers for demo buttons (you can replace these with actual URLs)
document.querySelectorAll('.project-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    if (this.href === '#') {
      e.preventDefault();
      alert('Add your live preview URL here!');
    }
  });
});

// Smooth page load animation
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
});

document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

setTimeout(() => {
  document.body.style.opacity = '1';
}, 100);

// Add active navigation link on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').slice(1) === current) {
      link.classList.add('active');
    }
  });
});

// Enhance tech tags with hover effect
const techTags = document.querySelectorAll('.tech-tag');
techTags.forEach((tag, index) => {
  tag.style.transitionDelay = `${index * 0.05}s`;
});

// Project images interactive enhancement
document.querySelectorAll('.image-placeholder').forEach(el => {
  el.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.02)';
  });
  
  el.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
  });
});

console.log('✨ Portfolio loaded successfully! All animations active.');

// Client Reviews Slider
let currentSlideIndex = 1;

function changeSlide(n) {
  showSlide(currentSlideIndex += n);
}

function currentSlide(n) {
  showSlide(currentSlideIndex = n);
}

function showSlide(n) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  
  if (n > slides.length) {
    currentSlideIndex = 1;
  }
  if (n < 1) {
    currentSlideIndex = slides.length;
  }
  
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  slides[currentSlideIndex - 1].classList.add('active');
  dots[currentSlideIndex - 1].classList.add('active');
}

// Auto-rotate slides every 8 seconds
setInterval(() => {
  changeSlide(1);
}, 8000);