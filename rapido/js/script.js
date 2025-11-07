const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const header = document.querySelector('header');
const toggleHeaderState = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 10);
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
  { threshold: 0.18 }
);

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

const form = document.querySelector('.estimate-form');
if (form) {
  const output = form.querySelector('.estimate-output');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

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
        output.textContent = 'Add valid pickup, drop, distance, and ride time to estimate your fare.';
      }
      return;
    }

    const baseFare = Number(form.dataset.base || 0);
    const perKm = Number(form.dataset.perKm || 0);
    const perMin = Number(form.dataset.perMin || 0);

    const fare = (baseFare + distance * perKm + duration * perMin) * categoryMultiplier;
    const surge = distance > 10 && duration > 25 ? 1.08 : 1;
    const totalFare = Math.round(fare * surge);

    if (output) {
      const surgeText = surge > 1 ? ' (includes high-demand adjustment)' : '';
      output.textContent = `${formatCurrency(totalFare)} from ${pickup} to ${drop}${surgeText}.`;
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