const sections = document.querySelectorAll('.section-home');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('section-home-true');
      entry.target.classList.remove('section-home-false');
    } else {
      entry.target.classList.remove('section-home-true');
      entry.target.classList.add('section-home-false');
    }
  });
}, {
  threshold: 0.2
});

sections.forEach(section => {
  section.classList.add('section-home-false'); // Começa invisível
  observer.observe(section);
});