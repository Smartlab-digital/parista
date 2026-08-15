import './style.css';

document.querySelectorAll('.product-tabs button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.product-tabs button').forEach((tab) => { tab.classList.remove('active'); tab.setAttribute('aria-selected', 'false'); });
    button.classList.add('active'); button.setAttribute('aria-selected', 'true');
  });
});

document.querySelectorAll('.add-cart').forEach((button) => {
  button.addEventListener('click', () => { button.textContent = 'Добавлено ✓'; button.classList.add('added'); });
});

document.querySelector('.contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.createElement('p');
  message.className = 'form-message';
  message.textContent = 'Макет формы готов. Для отправки подключите обработчик и штатную проверку CAPTCHA Битрикс.';
  event.currentTarget.querySelector('.form-message')?.remove();
  event.currentTarget.append(message);
});
