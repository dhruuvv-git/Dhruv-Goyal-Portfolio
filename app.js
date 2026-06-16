document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Navbar Scrolled Effect
  const navbar = document.getElementById('navbar');
  const handleNavbarScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll(); // Initial check

  // 2. Creative Scroll Reveal & Stagger Animation with Clean Easing (Runs Every Time)
  const revealElements = document.querySelectorAll('.reveal-element');
  
  const revealOptions = {
    threshold: 0.08, // Trigger slightly earlier for footer reliability
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      const target = entry.target;
      const staggerItems = target.querySelectorAll('.about-card, .project-tile, .social-btn');
      
      if (entry.isIntersecting) {
        // Clear any pending reset/reveal timeouts
        if (target.revealTimeout) clearTimeout(target.revealTimeout);
        
        target.classList.remove('reveal-complete');
        target.classList.add('reveal-visible');
        
        staggerItems.forEach((item, index) => {
          const delay = index * 0.12; // Stagger factor
          
          item.style.animationDelay = `${delay}s`;
          
          const children = item.querySelectorAll('h3, p, .project-tile-header, .project-tile-short, .project-tile-full, span, svg, .btn-arrow');
          children.forEach(child => {
            child.style.animationDelay = `${delay + 0.45}s`;
          });
        });

        // Add 'reveal-complete' class once box build animation runs
        const maxStaggerDelay = staggerItems.length * 120;
        target.revealTimeout = setTimeout(() => {
          target.classList.add('reveal-complete');
          staggerItems.forEach(item => {
            item.style.animationDelay = '';
            const children = item.querySelectorAll('h3, p, .project-tile-header, .project-tile-short, .project-tile-full, span, svg, .btn-arrow');
            children.forEach(child => {
              child.style.animationDelay = '';
            });
          });
        }, 1300 + maxStaggerDelay);

      } else {
        // Clear timeouts on leave
        if (target.revealTimeout) clearTimeout(target.revealTimeout);
        
        // Instant reset state
        target.classList.remove('reveal-visible');
        target.classList.remove('reveal-complete');
        
        staggerItems.forEach(item => {
          item.style.animationDelay = '';
          const children = item.querySelectorAll('h3, p, .project-tile-header, .project-tile-short, .project-tile-full, span, svg, .btn-arrow');
          children.forEach(child => {
            child.style.animationDelay = '';
          });
        });
      }
    });
  }, revealOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // 3. Navigation Link Highlighting on Scroll (Intersection Observer)
  const sections = document.querySelectorAll('section, footer');
  const navItems = document.querySelectorAll('.nav-item');

  const sectionOptions = {
    threshold: 0.4,
    rootMargin: '-10% 0px -40% 0px'
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, sectionOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // 4. Smooth Anchor Link Navigation
  navItems.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // 5. 3D Tilt Effect for Project Tiles, About Cards, and Social Buttons
  const tiltElements = document.querySelectorAll('.project-tile, .about-card, .social-btn');
  
  tiltElements.forEach(el => {
    // Boost social button physics to make the movement highly noticeable
    const maxAngle = el.classList.contains('social-btn') ? 15 : 8;
    const scaleFactor = el.classList.contains('social-btn') ? 1.06 : 1.04;
    const liftZ = el.classList.contains('social-btn') ? 12 : 6;
    
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const rotateX = ((yc - y) / yc) * maxAngle;
      const rotateY = ((x - xc) / xc) * maxAngle;
      
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scaleFactor}) translateZ(${liftZ}px)`;
      el.style.transition = 'transform 0.1s ease-out, border-color 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease, background-color 0.4s ease';
    });
  });

  // 6. Project Tiles Mobile Touch Hover Support (Sibling Darkening)
  const projectTiles = document.querySelectorAll('.project-tile');
  projectTiles.forEach(tile => {
    tile.addEventListener('touchstart', function() {
      projectTiles.forEach(t => {
        if (t !== tile) t.style.opacity = '0.3';
      });
      tile.style.opacity = '1';
    });
    
    tile.addEventListener('touchend', function() {
      projectTiles.forEach(t => t.style.opacity = '');
    });
  });
});
