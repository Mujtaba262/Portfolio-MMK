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
// Scroll reveal animation
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => io.observe(el));

// Robot follows cursor slightly
const robot = document.querySelector('.robot-stage');
if (robot) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    robot.style.transform = `translateY(calc(-50% + ${y}px)) translateX(${x}px)`;
  });
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