// 3D tilt
  const card = document.getElementById('tiltCard');
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
    glow.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
    glow.style.setProperty('--my', `${(y / rect.height) * 100}%`);
  });
  wrap.addEventListener('mouseleave', () => card.style.transform = '');

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // Robot follows cursor slightly
  const robot = document.querySelector('.robot-stage');
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    robot.style.transform = `translateY(calc(-50% + ${y}px)) translateX(${x}px)`;
  });
