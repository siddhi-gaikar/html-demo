const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const header = document.querySelector('header');
const toggleHeaderState = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 12);
};

toggleHeaderState();
window.addEventListener('scroll', toggleHeaderState, { passive: true });

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

const form = document.querySelector('.estimate-form');
if (form) {
  const output = form.querySelector('.estimate-output');

  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const pickup = (data.get('pickup') || '').toString().trim();
    const drop = (data.get('drop') || '').toString().trim();
    const distance = Number(data.get('distance'));
    const duration = Number(data.get('duration'));
    const categoryMultiplier = Number(data.get('category')) || 1;

    if (!pickup || !drop || distance <= 0 || duration <= 0) {
      if (output) {
        output.textContent = 'Add pickup, destination, distance, and ride time to estimate your fare.';
      }
      return;
    }

    const baseFare = Number(form.dataset.base || 0);
    const perKm = Number(form.dataset.perKm || 0);
    const perMin = Number(form.dataset.perMin || 0);

    const fare = (baseFare + distance * perKm + duration * perMin) * categoryMultiplier;
    const surge = duration > 40 || distance > 20 ? 1.12 : 1;
    const marketplaceFee = 1.25;
    const totalFare = Math.round((fare * surge + marketplaceFee) * 100) / 100;

    if (output) {
      const extras = [surge > 1 ? 'peak pricing' : null, marketplaceFee ? 'marketplace fee' : null]
        .filter(Boolean)
        .join(' + ');
      const extrasText = extras ? ` (includes ${extras})` : '';
      output.textContent = `${currency.format(totalFare)} from ${pickup} to ${drop}${extrasText}.`;
      output.classList.add('highlight');
      setTimeout(() => output.classList.remove('highlight'), 800);
    }
  });

  form.addEventListener('reset', () => {
    requestAnimationFrame(() => {
      if (output) {
        output.textContent = '';
      }
    });
  });
}