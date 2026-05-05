/* eslint-disable */
import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import testingLibrary from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import addTaskForm from '../src/index.js';

const { screen, waitFor } = testingLibrary;
nock.disableNetConnect();

let elements;

beforeEach(() => {
  nock('http://localhost')
    .post('/tasks')
    .reply(200, {
      message: 'Task added successfully'
    });

  const pathToFixture = path.join('__tests__', '__fixtures__', 'index.html');
  const initHtml = fs.readFileSync(pathToFixture).toString();
  document.body.innerHTML = initHtml;
  addTaskForm();

  elements = {
    submit: screen.getByText(/Добавить задачу/),
    taskInput: screen.getByPlaceholderText(/Введите задачу/),
    deadlineInput: screen.getByPlaceholderText(/Введите дату и время/),
  };
});

test('step1', async () => {
  const formContainer = document.querySelector('.container');
  expect(formContainer.querySelector('form')).not.toBeNull();
  expect(formContainer.querySelector('form').querySelector('input#task')).not.toBeNull();
  expect(formContainer.querySelector('form').querySelector('input#deadline')).not.toBeNull();
});

test('step2', async () => {
  await userEvent.clear(elements.taskInput);
  await userEvent.clear(elements.deadlineInput);
  await userEvent.type(elements.taskInput, 'Test Task');
  await userEvent.type(elements.deadlineInput, '25.12.2024 14:30');

  await userEvent.click(elements.submit);

  await waitFor(() => {
    const modal = document.getElementById('successModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    expect(modal).toBeInTheDocument();
    expect(modalBackdrop).toBeInTheDocument();
    expect(modalBackdrop.style.display).toBe('block');
    expect(modal).toHaveClass('show');
    expect(modal).toHaveClass('fade');
    expect(modal).toHaveClass('modal');
  });

  await waitFor(() => {
    const modal = document.getElementById('successModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    expect(modalBackdrop.style.display).toBe('none');
    expect(modal).toBeInTheDocument();
    expect(modal).not.toHaveClass('show');
  }, { timeout: 3000 });
});

test('step3', async () => {
  await userEvent.clear(elements.taskInput);
  await userEvent.clear(elements.deadlineInput);

  await userEvent.type(elements.taskInput, 'task');
  await userEvent.click(elements.submit);

  await waitFor(() => {
    expect(elements.taskInput).toHaveClass('input-invalid');
    expect(elements.taskInput).not.toHaveClass('input-valid');
    expect(elements.deadlineInput).not.toHaveClass('input-valid');
  });


  await userEvent.clear(elements.taskInput);
  await userEvent.clear(elements.deadlineInput);
  await userEvent.type(elements.taskInput, 'Valid Task');
  await userEvent.type(elements.deadlineInput, 'invalid date');
  await userEvent.click(elements.submit);

  await waitFor(() => {
    expect(elements.taskInput).toHaveClass('input-valid');
    expect(elements.deadlineInput).toHaveClass('input-invalid');
    expect(elements.taskInput).not.toHaveClass('input-invalid');
    expect(elements.deadlineInput).not.toHaveClass('input-valid');
  });

  await userEvent.clear(elements.taskInput);
  await userEvent.clear(elements.deadlineInput);
  await userEvent.type(elements.taskInput, 'Вalid Task');
  await userEvent.type(elements.deadlineInput, '25.12.2024 14:30');
  await userEvent.click(elements.submit);

  await waitFor(() => {
    expect(elements.taskInput).toHaveClass('input-valid');
    expect(elements.deadlineInput).toHaveClass('input-valid');
    expect(elements.taskInput).not.toHaveClass('input-invalid');
    expect(elements.deadlineInput).not.toHaveClass('input-invalid');
  });
});


test('step4', async () => {
  await userEvent.clear(elements.taskInput);
  await userEvent.clear(elements.deadlineInput);
  await userEvent.type(elements.taskInput, 'Task');
  await userEvent.type(elements.deadlineInput, 'invalid date');
  await userEvent.click(elements.submit);
  await waitFor(() => {
    expect(elements.submit).not.toHaveClass('bounce-animation');
  });

  await userEvent.clear(elements.taskInput);
  await userEvent.clear(elements.deadlineInput);
  await userEvent.type(elements.taskInput, 'Valid Task');
  await userEvent.type(elements.deadlineInput, '25.12.2024 14:30');
  await userEvent.click(elements.submit);
  await waitFor(() => {
    expect(elements.submit).toHaveClass('bounce-animation');
  });
});
