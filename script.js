// Modern Portfolio Website JavaScript

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });

  // Close menu when clicking on a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
}

// Smooth Scrolling for Navigation Links
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

// Scroll Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
    }
  });
}, observerOptions);

// Observe all elements with animate-on-scroll class
document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});

// Navbar Background on Scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
  }
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero-content');
  const shapes = document.querySelectorAll('.floating-shape');
  
  if (hero) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    hero.style.opacity = 1 - (scrolled / 700);
  }
  
  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.3;
    shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
  });
});

// Typing Animation for Hero Title (Optional)
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = '';
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Active Navigation Link on Scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    if (window.pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// Cursor Trail Effect (Optional - for desktop)
if (window.innerWidth > 768) {
  const coords = { x: 0, y: 0 };
  const circles = document.querySelectorAll('.circle');
  
  document.addEventListener('mousemove', (e) => {
    coords.x = e.clientX;
    coords.y = e.clientY;
  });
}

// Button Ripple Effect
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// Lazy Loading Images
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Preloader (Optional)
window.addEventListener('load', () => {
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }
});

// Nhost GraphQL Integration for Writings
const GRAPHQL_ENDPOINT = "https://kqfrdgkibjtxscsdyojc.hasura.eu-central-1.nhost.run/v1/graphql";

// First, let's check what tables are available
async function checkAvailableTables() {
  const introspectionQuery = `
    {
      __schema {
        queryType {
          fields {
            name
          }
        }
      }
    }
  `;
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: introspectionQuery })
    });
    
    const result = await response.json();
    console.log('Available GraphQL tables/queries:', result.data.__schema.queryType.fields.map(f => f.name));
    return result.data.__schema.queryType.fields.map(f => f.name);
  } catch (error) {
    console.error('Error checking tables:', error);
    return [];
  }
}

async function fetchEssays() {
  // First check what's available
  const availableTables = await checkAvailableTables();
  
  
  const query = `
    query GetWritings {
      writings(where: {published: {_eq: true}}, order_by: {created_at: desc}) {
        id
        title
        slug
        content
        created_at
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    console.log("GraphQL Result: ", result);
    
    if (result.data && result.data.writings) {
      renderEssays(result.data.writings);
    } else if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
      console.log('%c🔍 TROUBLESHOOTING:', 'font-weight: bold; font-size: 14px;');
      console.log('1️⃣ Your "writings" table is NOT tracked in Hasura GraphQL');
      console.log('2️⃣ Go to: https://app.nhost.io → Your Project → Database');
      console.log('3️⃣ Find "writings" table and click "Track" button');
      console.log('4️⃣ Go to Permissions tab → Add role "public"');
      console.log('5️⃣ Enable "select" permission with these columns: id, title, slug, content, created_at, published');
      console.log('6️⃣ Add row filter: {"published": {"_eq": true}}');
      console.log('%c📋 Available tables in your GraphQL:', 'font-weight: bold;');
      console.log(availableTables.filter(t => !t.startsWith('__')));
      showEssaysError();
    } else {
      console.error('No writings data found:', result);
      showEssaysError();
    }
  } catch (error) {
    console.error('Error fetching writings:', error);
    showEssaysError();
  }
}

function renderEssays(essays) {
  const container = document.getElementById('essays-container');
  
  if (!container) return;
  
  if (essays.length === 0) {
    container.innerHTML = `
      <div class="essay-card animate-on-scroll">
        <div class="essay-content">
          <p style="color: var(--text-secondary); font-style: italic;">No essays published yet. Check back soon!</p>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = essays.map(essay => {
    const date = new Date(essay.created_at);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    // Extract excerpt from content (first 150 characters)
    const excerpt = essay.content 
      ? essay.content.substring(0, 150).trim() + '...' 
      : 'Read more...';
    
    return `
      <div class="essay-card animate-on-scroll">
        <div class="essay-content">
          <span class="essay-date">${formattedDate}</span>
          <h3>
            <a href="writing.html?slug=${essay.slug}" style="color: var(--text-primary); text-decoration: none;">
              ${essay.title}
            </a>
          </h3>
          <p>${excerpt}</p>
        </div>
      </div>
    `;
  }).join('');
  
  // Re-observe new elements for scroll animations
  document.querySelectorAll('#essays-container .animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

function showEssaysError() {
  const container = document.getElementById('essays-container');
  if (container) {
    container.innerHTML = `
      <div class="essay-card animate-on-scroll">
        <div class="essay-content">
          <p style="color: var(--text-secondary);">Unable to load essays. Please try again later.</p>
        </div>
      </div>
    `;
  }
}

// Load essays when page loads
window.addEventListener('DOMContentLoaded', () => {
  fetchEssays();
});

// Console Welcome Message
console.log('%c👋 Hello! Thanks for checking out my portfolio!', 'font-size: 16px; color: #6366f1; font-weight: bold;');
console.log('%cInterested in how this was built? Let\'s connect!', 'font-size: 14px; color: #8b5cf6;');

// Performance Optimization
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register service worker for offline functionality (optional)
    // navigator.serviceWorker.register('/sw.js');
  });
}