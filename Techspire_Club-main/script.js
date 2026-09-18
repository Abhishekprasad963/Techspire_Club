/* ============================================================
   TechNova — Cyberpunk Tech Club Interactive Animations
   ============================================================
   Performant, accessible, and clean. Respects prefers-reduced-motion.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced-motion preference once
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initParticleBackground();
  initGatewayFlowBackground();
  initGalleryAtmosphere();
  initCustomCursor();
  initNavbar();
  initTeamSocialLinks();
  initTypewriter();
  initScrollReveal();
  initCounters();
  initTiltCards();
  initSpotlightCards();
  initMagneticButtons();
  initContactForm();

  /* ----------------------------------------------------------
     0. Particle Background (Anti-Gravity Physics)
     Converted from 21st.dev React component to vanilla JS.
     ---------------------------------------------------------- */
  function initParticleBackground() {
    const canvas = document.getElementById('particle-canvas');
    const container = document.getElementById('hero-bg');
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- Configuration ---
    const PARTICLE_DENSITY = 0.00015;
    const BG_PARTICLE_DENSITY = 0.00005;
    const MOUSE_RADIUS = 180;
    const RETURN_SPEED = 0.08;
    const DAMPING = 0.90;
    const REPULSION_STRENGTH = 1.2;

    // --- State ---
    let particles = [];
    let bgParticles = [];
    let mouse = { x: -1000, y: -1000, isActive: false };
    let animFrameId = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;

    // --- Helpers ---
    function randomRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    // --- Initialize Particles ---
    function initParticles(width, height) {
      // Main interactive particles
      const count = Math.floor(width * height * PARTICLE_DENSITY);
      particles = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        particles.push({
          x, y,
          originX: x,
          originY: y,
          vx: 0, vy: 0,
          size: randomRange(1, 2.5),
          // Mixed accent particles for premium feel
          color: Math.random() > 0.92 ? '#e2a94b' : Math.random() > 0.85 ? '#7ca7c7' : '#f1eee7',
          angle: Math.random() * Math.PI * 2
        });
      }

      // Background ambient particles (stars / dust)
      const bgCount = Math.floor(width * height * BG_PARTICLE_DENSITY);
      bgParticles = [];
      for (let i = 0; i < bgCount; i++) {
        bgParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: randomRange(0.5, 1.5),
          alpha: randomRange(0.1, 0.4),
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    // --- Resize Handler ---
    function handleResize() {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvasWidth = rect.width;
      canvasHeight = rect.height;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    }

    // --- Animation Loop ---
    function animate(time) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // ---- Background Effects ----

      // 1. Pulsating radial glow
      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      const pulseOpacity = Math.sin(time * 0.0008) * 0.035 + 0.085;
      const gradient = ctx.createRadialGradient(
        cx, cy, 0,
        cx, cy, Math.max(canvasWidth, canvasHeight) * 0.7
      );
      gradient.addColorStop(0, 'rgba(226, 169, 75, ' + (pulseOpacity * 0.65) + ')');
      gradient.addColorStop(0.5, 'rgba(124, 167, 199, ' + (pulseOpacity * 0.2) + ')');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 2. Background drifting stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < bgParticles.length; i++) {
        const p = bgParticles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvasWidth;
        if (p.x > canvasWidth) p.x = 0;
        if (p.y < 0) p.y = canvasHeight;
        if (p.y > canvasHeight) p.y = 0;

        // Twinkle
        const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
        ctx.globalAlpha = p.alpha * (0.3 + 0.7 * twinkle);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // ---- Foreground Particle Physics ----

      // Phase 1: Apply forces (mouse repulsion + spring return)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (mouse.isActive && distance < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
          const repulsion = force * REPULSION_STRENGTH;
          p.vx -= (dx / distance) * repulsion * 5;
          p.vy -= (dy / distance) * repulsion * 5;
        }

        // Spring force (return to origin)
        p.vx += (p.originX - p.x) * RETURN_SPEED;
        p.vy += (p.originY - p.y) * RETURN_SPEED;
      }

      // Phase 2: Inter-particle collisions
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const cdx = p2.x - p1.x;
          const cdy = p2.y - p1.y;
          const distSq = cdx * cdx + cdy * cdy;
          const minDist = p1.size + p2.size;

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.01) {
              const nx = cdx / dist;
              const ny = cdy / dist;

              // Push apart
              const overlap = minDist - dist;
              p1.x -= nx * overlap * 0.5;
              p1.y -= ny * overlap * 0.5;
              p2.x += nx * overlap * 0.5;
              p2.y += ny * overlap * 0.5;

              // Elastic collision
              const dvx = p1.vx - p2.vx;
              const dvy = p1.vy - p2.vy;
              const velAlongNormal = dvx * nx + dvy * ny;

              if (velAlongNormal > 0) {
                const m1 = p1.size;
                const m2 = p2.size;
                const restitution = 0.85;
                const impulse = (-(1 + restitution) * velAlongNormal) / (1 / m1 + 1 / m2);

                p1.vx += (impulse * nx) / m1;
                p1.vy += (impulse * ny) / m1;
                p2.vx -= (impulse * nx) / m2;
                p2.vy -= (impulse * ny) / m2;
              }
            }
          }
        }
      }

      // Phase 3: Integrate velocity & draw
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        // Velocity-based opacity (brighter when moving fast)
        const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const opacity = Math.min(0.3 + velocity * 0.1, 1);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color === '#f1eee7'
          ? 'rgba(241, 238, 231, ' + opacity + ')'
          : p.color;
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(animate);
    }

    // --- Mouse Events ---
    container.addEventListener('mousemove', function(e) {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isActive = true;
    }, { passive: true });

    container.addEventListener('mouseleave', function() {
      mouse.isActive = false;
    });

    // --- Start ---
    window.addEventListener('resize', handleResize);
    handleResize();

    // Skip animation if user prefers reduced motion
    if (!prefersReducedMotion) {
      animFrameId = requestAnimationFrame(animate);
    }
  }

    /* ----------------------------------------------------------
      0b. Gateway Flow background
      Static-site port of the supplied converging-path effect.
      ---------------------------------------------------------- */
  function initGatewayFlowBackground() {
    const canvas = document.getElementById('team-flow-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let paths = [];
    let explosions = [];
    let animationFrame = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pathCount = 80;
      paths = Array.from({ length: pathCount }, (_, index) => ({
        isLeft: index % 2 === 0,
        startY: (index / pathCount) * height * 1.4 - height * 0.2,
        particle: {
          t: Math.random(),
          speed: 0.0015 + Math.random() * 0.002,
        },
      }));
    }

    function bezierPoint(t, start, controlOne, controlTwo, end) {
      const inverse = 1 - t;
      return {
        x:
          inverse ** 3 * start.x +
          3 * inverse ** 2 * t * controlOne.x +
          3 * inverse * t ** 2 * controlTwo.x +
          t ** 3 * end.x,
        y:
          inverse ** 3 * start.y +
          3 * inverse ** 2 * t * controlOne.y +
          3 * inverse * t ** 2 * controlTwo.y +
          t ** 3 * end.y,
      };
    }

    function render(time) {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const center = { x: centerX, y: centerY };

      explosions.forEach((explosion) => {
        explosion.radius += 15;
        explosion.life -= 0.015;
      });
      explosions = explosions.filter((explosion) => explosion.life > 0);

      paths.forEach((path) => {
        const start = { x: path.isLeft ? 0 : width, y: path.startY };
        const controlOne = {
          x: path.isLeft ? centerX * 0.5 : width - centerX * 0.5,
          y: path.startY,
        };
        const controlTwo = {
          x: path.isLeft ? centerX * 0.8 : width - centerX * 0.8,
          y: centerY,
        };

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.bezierCurveTo(
          controlOne.x,
          controlOne.y,
          controlTwo.x,
          controlTwo.y,
          center.x,
          center.y,
        );
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.58)';
        ctx.lineWidth = 1.35;
        ctx.setLineDash([1, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const particleState = path.particle;
        particleState.t += particleState.speed;
        if (particleState.t > 1) {
          particleState.t = 0;
          path.startY += (Math.random() - 0.5) * 10;
        }

        const particleT = particleState.t;
        const particlePosition = bezierPoint(
          particleT,
          start,
          controlOne,
          controlTwo,
          center,
        );

        let offsetX = 0;
        let offsetY = 0;
        explosions.forEach((explosion) => {
          const deltaX = particlePosition.x - explosion.x;
          const deltaY = particlePosition.y - explosion.y;
          const distance = Math.hypot(deltaX, deltaY);
          if (distance < explosion.radius + 120 && distance > explosion.radius - 120) {
            const force =
              (1 - Math.abs(distance - explosion.radius) / 120) * explosion.life;
            if (distance > 0) {
              offsetX += (deltaX / distance) * force * 80;
              offsetY += (deltaY / distance) * force * 80;
            }
          }
        });

        particlePosition.x += offsetX;
        particlePosition.y += offsetY;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(particlePosition.x - 1.5, particlePosition.y - 1.5, 3, 3);
      });

      animationFrame = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('click', (event) => {
      explosions.push({ x: event.clientX, y: event.clientY, radius: 0, life: 1 });
    });
    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(render);
    } else {
      render(0);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }

  /* ----------------------------------------------------------
     0c. Gallery atmosphere
     Orbiting memory nodes create a playful photo-wall backdrop.
     ---------------------------------------------------------- */
  function initGalleryAtmosphere() {
    const canvas = document.getElementById('gallery-atmosphere-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes = Array.from({ length: window.innerWidth < 600 ? 28 : 48 }, (_, index) => ({
      angle: (index / 48) * Math.PI * 2,
      distance: 0.18 + Math.random() * 0.34,
      speed: (Math.random() - 0.5) * 0.00016,
      size: 1.2 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
    }));
    let width = 0;
    let height = 0;
    let mouseX = 0;
    let mouseY = 0;
    let animationFrame = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function render(time) {
      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2 + mouseX * 18;
      const centerY = height / 2 + mouseY * 18;
      const orbitScale = Math.min(width, height);
      const positions = [];

      nodes.forEach((node, index) => {
        node.angle += node.speed;
        const orbit = node.distance * orbitScale;
        const x = centerX + Math.cos(node.angle) * orbit;
        const y = centerY + Math.sin(node.angle * 1.35) * orbit * 0.58;
        positions.push({ x, y });

        if (index > 0) {
          const previous = positions[index - 1];
          const distance = Math.hypot(x - previous.x, y - previous.y);
          if (distance < orbitScale * 0.23) {
            ctx.strokeStyle = `rgba(124, 167, 199, ${0.11 - distance / orbitScale * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(previous.x, previous.y);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }

        const pulse = Math.sin(time * 0.0015 + node.phase) * 0.5 + 0.5;
        ctx.fillStyle = index % 3 === 0
          ? `rgba(226, 169, 75, ${0.38 + pulse * 0.35})`
          : `rgba(175, 197, 211, ${0.25 + pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, node.size + pulse * 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = 'rgba(226, 169, 75, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, orbitScale * 0.28, orbitScale * 0.15, -0.2, 0, Math.PI * 2);
      ctx.stroke();

      if (!prefersReducedMotion) animationFrame = requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (event) => {
      mouseX = event.clientX / window.innerWidth - 0.5;
      mouseY = event.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    resize();
    render(0);
    if (!prefersReducedMotion) animationFrame = requestAnimationFrame(render);
  }

  /* ----------------------------------------------------------
     1. Custom Cursor
     ---------------------------------------------------------- */
  function initCustomCursor() {
    // Skip on touch devices or small viewports
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || window.innerWidth < 768) return;

    // Create cursor elements
    const dot = document.createElement('div');
    dot.classList.add('cursor-dot');

    const outline = document.createElement('div');
    outline.classList.add('cursor-outline');

    document.body.appendChild(dot);
    document.body.appendChild(outline);

    // Track positions
    let mouseX = -100;
    let mouseY = -100;
    let outlineX = -100;
    let outlineY = -100;

    // Lerp factor — lower = smoother trail
    const lerpFactor = 0.15;

    // Update mouse position on move (passive for performance)
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Dot follows instantly
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    // Animate outline with lerp via requestAnimationFrame
    function animateOutline() {
      outlineX += (mouseX - outlineX) * lerpFactor;
      outlineY += (mouseY - outlineY) * lerpFactor;
      outline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
      requestAnimationFrame(animateOutline);
    }
    requestAnimationFrame(animateOutline);

    // Scale up outline on hover over interactive elements
    const interactiveSelectors = 'a, button, [role="button"], input[type="submit"], .magnetic-btn, .tilt-card';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        outline.classList.add('cursor-outline--hover');
      });
      el.addEventListener('mouseleave', () => {
        outline.classList.remove('cursor-outline--hover');
      });
    });

    // Hide cursor elements when mouse leaves viewport
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      outline.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      outline.style.opacity = '1';
    });
  }

  /* ----------------------------------------------------------
     2. Navbar Scroll Effect
     ---------------------------------------------------------- */
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdownItems = document.querySelectorAll('.nav-item--dropdown');

    if (!navbar) return;

    // Add/remove 'scrolled' class based on scroll position
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Set initial state
    handleScroll();

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: 'smooth' });

          // Close mobile nav after click
          if (navLinks) navLinks.classList.remove('nav-active');
          if (navToggle) navToggle.classList.remove('active');
        }
      });
    });

    dropdownItems.forEach((item) => {
      const trigger = item.querySelector('.nav-dropdown-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', (event) => {
        if (window.innerWidth <= 768) {
          event.preventDefault();
        }

        const isOpen = item.classList.contains('open');
        dropdownItems.forEach((dropdownItem) => dropdownItem.classList.remove('open'));

        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-item--dropdown')) {
        dropdownItems.forEach((item) => item.classList.remove('open'));
      }
    });

    // Mobile nav toggle
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        navToggle.classList.toggle('active');
      });
    }
  }

  function initTeamSocialLinks() {
    const cards = document.querySelectorAll('.spotlight-card');
    const linkedInIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>';
    const githubIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>';
    const profiles = {
      'Om Sharma': ['https://www.linkedin.com/in/omsharma2005', 'https://github.com/Epicbracelet221'],
      'Abhay Kumar': ['https://www.linkedin.com/in/abhay-kumar-gamedev', 'https://github.com/abhaykrdev'],
      'Abhishek Prasad': ['https://www.linkedin.com/in/abhishek-prasad-a74651280', 'https://github.com/Abhishekprasad963'],
      'Mihir Mahato': ['https://www.linkedin.com/in/mihir-mahato-btech?utm_source=share_via&utm_content=profile&utm_medium=member_android', 'https://github.com/MIHIR-1304'],
      'Parmvir Singh': ['https://www.linkedin.com/in/parmvir-singh-pandit-9b9255296', 'https://github.com/Parmvir2345'],
      'Sumit Kumar CSE': ['https://www.linkedin.com/search/results/all/?keywords=Sumit%20Kumar', 'https://github.com/Sumit-kr'],
      'Sujit Kumar Mandal': ['https://www.linkedin.com/in/sujit-kumar404', 'https://github.com/SujitKumar404'],
      'Laxmi Rani Kar': ['https://www.linkedin.com/in/laxmi-rani-kar-774196314', 'https://github.com/whylaxmi'],
      'Shubham Chouhan': ['https://www.linkedin.com/in/shubham-chouhan-501403296', 'https://github.com/shubham-116'],
      'Neha Kumari': ['https://www.linkedin.com/in/neha-kumari-817nk/', 'https://github.com/why-nehaa'],
      'VEDANT KUMAR CSE': ['https://www.linkedin.com/in/vedant-kumar-49785b294', null],
      'Nikhil Kumar Rajak': ['https://www.linkedin.com/in/nikhil-kumar-rajak-ba9b80318', null],
      'Sajal Mahato': ['https://www.linkedin.com/in/sajal-mahato-12a68b294', 'https://github.com/Sajalmahato278'],
      'Abhay Kumar Singh': ['https://www.linkedin.com/search/results/all/?keywords=Abhay%20Kumar%20Singh', 'https://github.com/ruthloscorp'],
      'Mohammad Zishan Alam': ['https://www.linkedin.com/in/mohammad-zishan-alam-6ba779254', 'https://github.com/MohammadZishanAlam'],
      'Rahul Banerjee': ['https://www.linkedin.com/in/rahul-banerjee-a4b82435b', 'https://github.com/rahulbro960'],
      'Rishabh Dey': ['https://www.linkedin.com/in/rishabh-dey-68039a264', 'https://github.com/deyrishabh630-svg'],
      'Muzammil raza': ['https://www.linkedin.com/in/muzammil-raza-5699a3391', 'https://github.com/razercode-git'],
      'Muskan': ['https://www.linkedin.com/in/muskan-kumari-072843386', 'https://github.com/mk123san-web'],
      'Chiranjit Mondal': ['https://www.linkedin.com/in/chiranjit-mondal-775673379', 'https://github.com/ChiranjitMondal2007'],
      'Nischal Pandey': ['https://www.linkedin.com/search/results/all/?keywords=Nischal%20Pandey', 'https://github.com/Nischal154'],
      'Md Sarwar': ['https://www.linkedin.com/in/md-sarwar-60151031a/', null],
      'Priti prasad': ['https://www.linkedin.com/in/prity-prasad-0a5a8b329', 'https://github.com/Prityprasad365-cpu']
    };

    cards.forEach((card) => {
      const nameElement = card.querySelector('.team-name');
      const name = nameElement ? nameElement.textContent.trim() : '';
      const profile = profiles[name];
      const existingSocials = card.querySelector('.team-socials');

      if (existingSocials) {
        const existingLinks = existingSocials.querySelectorAll('.team-social-link');
        existingLinks.forEach((link) => {
          const label = link.getAttribute('aria-label');
          const profileUrl = profile && label === 'LinkedIn' ? profile[0] : profile && label === 'GitHub' ? profile[1] : null;
          if (profileUrl) link.href = profileUrl;
        });
        if (!profile || existingSocials.querySelectorAll('.team-social-link').length >= 2) return;
      }

      const socials = existingSocials || document.createElement('div');
      socials.className = 'team-socials';

      const socialLinks = [
        {
          href: profile && profile[0] ? profile[0] : 'https://www.linkedin.com',
          label: 'LinkedIn',
          icon: linkedInIcon
        },
        {
          href: profile && profile[1] ? profile[1] : 'https://github.com',
          label: 'GitHub',
          icon: githubIcon
        }
      ];

      socialLinks.forEach((social) => {
        if (existingSocials && existingSocials.querySelector(`[aria-label="${social.label}"]`)) return;
        if (social.label === 'GitHub' && profile && !profile[1]) return;
        const link = document.createElement('a');
        link.href = social.href;
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.className = 'team-social-link';
        link.setAttribute('aria-label', social.label);
        link.innerHTML = social.icon;
        socials.appendChild(link);
      });

      if (!existingSocials) card.appendChild(socials);
    });
  }

  /* ----------------------------------------------------------
     3. Typewriter Effect
     ---------------------------------------------------------- */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    // If reduced motion is preferred, just show the first word statically
    if (prefersReducedMotion) {
      el.textContent = 'Web Developers';
      return;
    }

    const words = ['Web Developers', 'AI Enthusiasts', 'Cloud Builders', 'Open-Source Contributors', 'Innovators'];
    const typeSpeed = 80;    // ms per character typed
    const deleteSpeed = 50;  // ms per character deleted
    const pauseAfterType = 2000;
    const pauseAfterDelete = 500;

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function tick() {
      const currentWord = words[wordIndex];

      if (!isDeleting) {
        // Typing forward
        charIndex++;
        el.textContent = currentWord.substring(0, charIndex);

        if (charIndex === currentWord.length) {
          // Finished typing — pause then start deleting
          isDeleting = true;
          setTimeout(tick, pauseAfterType);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        // Deleting backward
        charIndex--;
        el.textContent = currentWord.substring(0, charIndex);

        if (charIndex === 0) {
          // Finished deleting — move to next word
          isDeleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(tick, pauseAfterDelete);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    // Kick off the typewriter loop
    tick();
  }

  /* ----------------------------------------------------------
     4. Scroll Reveal
     ---------------------------------------------------------- */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    if (!reveals.length) return;

    // If reduced motion, reveal everything immediately
    if (prefersReducedMotion) {
      reveals.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target); // Only reveal once
          }
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------------
     5. Counter Animation
     ---------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    // easeOutQuad easing function for natural deceleration
    function easeOutQuad(t) {
      return t * (2 - t);
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'), 10);
          if (isNaN(target)) return;

          obs.unobserve(counter); // Only animate once

          // If reduced motion, just set the value instantly
          if (prefersReducedMotion) {
            counter.textContent = target + '+';
            return;
          }

          const duration = 2000; // ms
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuad(progress);
            const currentValue = Math.floor(easedProgress * target);

            counter.textContent = currentValue;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              // Final value with '+' suffix
              counter.textContent = target + '+';
            }
          }

          requestAnimationFrame(updateCounter);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------------
     6. 3D Tilt Cards
     ---------------------------------------------------------- */
  function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    if (!cards.length || prefersReducedMotion) return;

    const maxTilt = 10; // degrees

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        // Calculate offset from center (-1 to 1)
        const offsetX = (e.clientX - cardCenterX) / (rect.width / 2);
        const offsetY = (e.clientY - cardCenterY) / (rect.height / 2);

        // rotateY follows X offset, rotateX follows inverted Y offset
        const rotateY = offsetX * maxTilt;
        const rotateX = -offsetY * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        // Smoothly reset — transition is handled in CSS
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      });
    });
  }

  /* ----------------------------------------------------------
     7. Spotlight Glow Cards
     ---------------------------------------------------------- */
  function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    if (!cards.length || prefersReducedMotion) return;

    cards.forEach((card) => {
      const overlay = card.querySelector('.spotlight-overlay');
      if (!overlay) return;

      // Use premium indigo glow

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Set radial gradient centered at cursor position
        overlay.style.background = `radial-gradient(
          600px circle at ${x}px ${y}px,
          rgba(226, 169, 75, 0.12),
          rgba(168, 85, 247, 0.06) 40%,
          transparent 60%
        )`;
      });

      card.addEventListener('mouseenter', () => {
        overlay.style.opacity = '1';
      });

      card.addEventListener('mouseleave', () => {
        overlay.style.opacity = '0';
      });
    });
  }

  /* ----------------------------------------------------------
     8. Magnetic Buttons
     ---------------------------------------------------------- */
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    if (!buttons.length || prefersReducedMotion) return;

    const dampening = 3; // Divisor for the pull effect

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const offsetX = (e.clientX - btnCenterX) / dampening;
        const offsetY = (e.clientY - btnCenterY) / dampening;

        btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        // Reset with smooth transition (handled in CSS)
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ----------------------------------------------------------
     9. Contact Form Demo
     ---------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const endpoint = form.dataset.formEndpoint || form.action;
      const submission = {
        sheet: 'Contact',
        type: 'contact',
        timestamp: new Date().toLocaleString(),
        name: form.querySelector('[name="name"]')?.value.trim() || '',
        email: form.querySelector('[name="email"]')?.value.trim() || '',
        message: form.querySelector('[name="message"]')?.value.trim() || '',
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      const existingError = form.querySelector('.form-error');
      if (existingError) existingError.style.display = 'none';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(submission),
          signal: controller.signal,
        });
      } catch (error) {
        console.error('Contact submission failed:', error);

        if (error.name === 'AbortError') {
          let successMsg = form.querySelector('.form-success');
          if (!successMsg) {
            successMsg = document.createElement('div');
            successMsg.classList.add('form-success');
            form.appendChild(successMsg);
          }
          successMsg.textContent = '✓ Message submitted. Google Sheets may take a moment to update.';
          successMsg.style.display = 'block';
          successMsg.style.opacity = '1';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }
          form.reset();
          return;
        }

        let errorMsg = form.querySelector('.form-error');
        if (!errorMsg) {
          errorMsg = document.createElement('div');
          errorMsg.classList.add('form-error');
          form.appendChild(errorMsg);
        }
        errorMsg.textContent = 'Message could not be sent. Please try again.';
        errorMsg.style.display = 'block';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
        return;
      } finally {
        clearTimeout(timeoutId);
      }

      // Find or create the success message element
      let successMsg = form.querySelector('.form-success');
      if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.classList.add('form-success');
        successMsg.textContent = '✓ Message sent successfully!';
        form.appendChild(successMsg);
      }

      // Show the success message
      successMsg.style.display = 'block';
      successMsg.style.opacity = '1';

      // Disable submit button briefly
      // Reset form and hide message after 2 seconds
      setTimeout(() => {
        form.reset();
        successMsg.style.opacity = '0';
        setTimeout(() => {
          successMsg.style.display = 'none';
        }, 300); // Allow fade-out transition
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      }, 2000);
    });
  }
});
