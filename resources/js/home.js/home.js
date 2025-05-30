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


const sectionsdocard = document.querySelectorAll('.section-card');

const observercard = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const cards = entry.target.querySelectorAll('.row');

    if (entry.isIntersecting) {
      console.log('Seção visível:', entry.target); // Log para depuração
      cards.forEach(card => {
        card.classList.add('animate-cards-right'); // Animação de entrada
      });
      entry.target.classList.add('section-card-true');
      entry.target.classList.remove('section-card-false');
    } else {
      console.log('Seção não visível:', entry.target); // Log para depuração
      cards.forEach(card => {
        card.classList.remove('animate-cards-right'); // Remove a animação
      });
      entry.target.classList.remove('section-card-true');
      entry.target.classList.add('section-card-false');
    }
  });
}, {
  threshold: 0.2
});

sectionsdocard.forEach(section => {
  section.classList.add('section-card-false'); // Começa invisível
  observercard.observe(section);
});




