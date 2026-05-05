import axios from 'axios';

export default function initForm() {
  // Находим контейнер и элемент h2
  const container = document.querySelector('.container');
  const h2Element = container.querySelector('h2');
  
  // Создаем форму
  const form = document.createElement('form');
  form.innerHTML = `
    <div class="mb-3">
      <label for="task" class="form-label">Задача</label>
      <input autocomplete="off" type="text" name="task" class="form-control" id="task" placeholder="Введите задачу">
    </div>
    <div class="mb-3">
      <label for="deadline" class="form-label">Крайний срок</label>
      <input autocomplete="off" type="text" name="deadline" class="form-control" id="deadline" placeholder="Введите дату и время">
    </div>
    <button type="submit" class="btn btn-primary" id="submit-btn">Добавить задачу</button>
  `;
  
  // Вставляем форму после h2
  h2Element.insertAdjacentElement('afterend', form);
  
  // Получаем элементы формы
  const taskInput = form.querySelector('#task');
  const deadlineInput = form.querySelector('#deadline');
  const submitBtn = form.querySelector('#submit-btn');
  
  // Получаем элементы модального окна и backdrop
  const modal = document.querySelector('#successModal');
  const modalBackdrop = document.querySelector('#modalBackdrop');
  
  // Функция валидации задачи
  function validateTask(value) {
    if (!value) return false;
    // Любой текст, начинающийся с заглавной буквы
    return /^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё\s]*$/.test(value);
  }
  
  // Функция валидации даты и времени
  function validateDeadline(value) {
    if (!value) return false;
    // Формат: ДД.ММ.ГГГГ ЧЧ:ММ
    const regex = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
    if (!regex.test(value)) return false;
    
    const [, day, month, year, hours, minutes] = value.match(regex);
    
    // Проверяем корректность даты
    const date = new Date(year, month - 1, day, hours, minutes);
    return date.getFullYear() === parseInt(year) &&
           date.getMonth() === parseInt(month) - 1 &&
           date.getDate() === parseInt(day) &&
           date.getHours() === parseInt(hours) &&
           date.getMinutes() === parseInt(minutes);
  }
  
  // Функция проверки валидности всех полей
  function isFormValid() {
    const isTaskValid = taskInput.value && validateTask(taskInput.value);
    const isDeadlineValid = deadlineInput.value && validateDeadline(deadlineInput.value);
    return isTaskValid && isDeadlineValid;
  }
  
  // Функция обновления стилей инпутов
  function updateInputStyles() {
    // Валидация задачи
    if (!taskInput.value) {
      taskInput.classList.remove('input-valid', 'input-invalid');
    } else if (validateTask(taskInput.value)) {
      taskInput.classList.add('input-valid');
      taskInput.classList.remove('input-invalid');
    } else {
      taskInput.classList.add('input-invalid');
      taskInput.classList.remove('input-valid');
    }
    
    // Валидация даты
    if (!deadlineInput.value) {
      deadlineInput.classList.remove('input-valid', 'input-invalid');
    } else if (validateDeadline(deadlineInput.value)) {
      deadlineInput.classList.add('input-valid');
      deadlineInput.classList.remove('input-invalid');
    } else {
      deadlineInput.classList.add('input-invalid');
      deadlineInput.classList.remove('input-valid');
    }
    
    // Обновляем анимацию кнопки
    updateButtonAnimation();
  }
  
  // Функция обновления анимации кнопки
  function updateButtonAnimation() {
    if (isFormValid()) {
      submitBtn.classList.add('bounce-animation');
    } else {
      submitBtn.classList.remove('bounce-animation');
    }
  }
  
  // Функция показа модального окна
  function showModal() {
    // Показываем модальное окно
    modal.classList.add('show');
    modal.style.display = 'block';
    
    // Показываем backdrop
    if (modalBackdrop) {
      modalBackdrop.classList.add('show');
      modalBackdrop.style.display = 'block';
    }
    
    // Автоматически закрываем через 3 секунды
    setTimeout(() => {
      modal.classList.remove('show');
      modal.style.display = 'none';
      
      if (modalBackdrop) {
        modalBackdrop.classList.remove('show');
        modalBackdrop.style.display = 'none';
      }
    }, 3000);
  }
  
  // Обработчик сабмита формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const task = taskInput.value;
    const deadline = deadlineInput.value;
    
    // Проверяем валидацию перед отправкой
    if (!validateTask(task) || !validateDeadline(deadline)) {
      return; // Не отправляем, если данные невалидны
    }
    
    try {
      // Отправляем POST запрос
      const response = await axios.post('/tasks', {
        task: task,
        deadline: deadline
      });
      
      // При успешном ответе показываем модальное окно
      if (response.status === 200 || response.status === 201) {
        showModal();
        
        // Очищаем форму после успешной отправки
        taskInput.value = '';
        deadlineInput.value = '';
        
        // Очищаем классы стилей
        taskInput.classList.remove('input-valid', 'input-invalid');
        deadlineInput.classList.remove('input-valid', 'input-invalid');
        
        // Обновляем анимацию кнопки
        updateButtonAnimation();
      }
    } catch (error) {
      console.error('Ошибка при отправке данных:', error);
    }
  });
  
  // Добавляем обработчики событий для полей ввода
  taskInput.addEventListener('input', updateInputStyles);
  deadlineInput.addEventListener('input', updateInputStyles);
}