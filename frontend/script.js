document.addEventListener('DOMContentLoaded', () => {
  // Fetch and render expenses on page load
  fetchExpenses();

  // Event delegation for handling edit and delete actions
  document.getElementById('list').addEventListener('click', handleListClick);

  // Event listener for setting the budget
  document.getElementById('total-amount-button').addEventListener('click', setBudget);

  // Event listener for adding or updating expenses
  document.getElementById('check-amount').addEventListener('click', addOrUpdateExpense);

  // Event listener for resetting all expenses
  document.getElementById('reset-button').addEventListener('click', resetExpenses);

  // Event listener for setting reminders
  document.getElementById('set-reminder').addEventListener('click', setReminder);
});

// Function to fetch and render expenses
function fetchExpenses() {
  fetch('/api/expenses')
    .then(response => response.json())
    .then(expenses => {
      expenses.forEach(expense => listCreator(expense._id, expense.title, expense.amount));
      updateBalance();
      updatePieChart();
    })
    .catch(error => console.error('Error fetching expenses:', error));
}

// Event handler for edit and delete actions
function handleListClick(event) {
  if (event.target.classList.contains('edit')) {
    handleEdit(event.target.closest('.sublist-content'));
  } else if (event.target.classList.contains('delete')) {
    handleDelete(event.target.closest('.sublist-content'));
  }
}

// Event handler for setting the budget
function setBudget() {
  const tempAmount = parseFloat(document.getElementById('total-amount').value);
  if (isNaN(tempAmount) || tempAmount < 0) {
    document.getElementById('budget-error').classList.remove('hide');
  } else {
    document.getElementById('budget-error').classList.add('hide');
    document.getElementById('amount').innerText = tempAmount.toFixed(2);
    updateBalance();
    document.getElementById('total-amount').value = '';
    updatePieChart();
  }
}

// Event handler for adding or updating expenses
function addOrUpdateExpense() {
  const title = document.getElementById('product-title').value.trim() || ''; // Default to empty string
  const amount = parseFloat(document.getElementById('user-amount').value.trim()) || 0; // Default to 0
  const id = document.getElementById('update-id').value;

  if (!title || isNaN(amount) || amount < 0) {
    document.getElementById('product-title-error').classList.remove('hide');
    return;
  }

  const url = id ? `/api/expenses/${id}` : '/api/expenses';
  const method = id ? 'PUT' : 'POST';
  const body = JSON.stringify({ title, amount });

  fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: body
  })
    .then(response => response.json())
    .then(expense => {
      if (id) {
        // Update existing expense
        const expenseElement = document.querySelector(`[data-id="${id}"]`);
        expenseElement.querySelector('.product').textContent = expense.title;
        expenseElement.querySelector('.amount').textContent = `$${expense.amount.toFixed(2)}`;
      } else {
        // Add new expense
        listCreator(expense._id, expense.title, expense.amount);
      }
      resetForm();
    })
    .catch(error => console.error('Error adding/updating expense:', error));
}

// Event handler for resetting all expenses
function resetExpenses() {
  fetch('/api/expenses', {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(() => {
      // Reset values
      document.getElementById('total-amount').value = '';
      document.getElementById('amount').innerText = '0';
      document.getElementById('expenditure-value').innerText = '0';
      document.getElementById('balance-amount').innerText = '0';
      document.getElementById('list').innerHTML = '';
      document.getElementById('expenditure-percentage').innerText = '0%';
      document.getElementById('balance-percentage').innerText = '0%';
      updatePieChart();
    })
    .catch(error => console.error('Error resetting expenses:', error));
}

// Event handler for setting reminders
function setReminder() {
  const reminderDate = document.getElementById('shopping-reminder').value;
  if (reminderDate) {
    document.getElementById('reminder-message').textContent = `Shopping reminder set for ${reminderDate}`;
    document.getElementById('reminder-message').classList.remove('hide');

    fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: reminderDate })
    })
      .then(response => response.json())
      .then(reminder => console.log('Reminder saved:', reminder))
      .catch(error => console.error('Error saving reminder:', error));
  }
}

// Function to create and append a new expense item
function listCreator(id, title, amount) {
  // Check if amount is a default value (e.g., 100) and set to 0 if true
  if (amount === 100) {
    amount = 0;
  }

  const list = document.getElementById('list');
  const item = document.createElement('div');
  item.className = 'sublist-content';
  item.setAttribute('data-id', id);
  item.innerHTML = `
    <div class="expense-details">
      <span class="product">${title}</span>
      <span class="amount">$${amount.toFixed(2)}</span>
    </div>
    <div class="icons-container">
      <button class="edit" aria-label="Edit">✎</button>
      <button class="delete" aria-label="Delete">🗑️</button>
    </div>
  `;
  list.appendChild(item);
  updateBalance();
  updatePieChart();
}

// Function to handle editing an expense
function handleEdit(expenseElement) {
  const id = expenseElement.dataset.id;
  const title = expenseElement.querySelector('.product').textContent;
  const amount = expenseElement.querySelector('.amount').textContent.replace('$', '');

  document.getElementById('product-title').value = title;
  document.getElementById('user-amount').value = amount;
  document.getElementById('update-id').value = id;
  document.getElementById('check-amount').textContent = 'Update Expense';
}

// Function to handle deleting an expense
function handleDelete(expenseElement) {
  if (confirm('Are you sure you want to delete this expense?')) {
    const id = expenseElement.dataset.id;
    fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(() => {
        expenseElement.remove();
        updateBalance();
        updatePieChart();
      })
      .catch(error => console.error('Error deleting expense:', error));
  }
}

// Function to reset the form
function resetForm() {
  document.getElementById('product-title').value = ''; // Default to empty
  document.getElementById('user-amount').value = ''; // Clear amount
  document.getElementById('update-id').value = ''; // Clear update ID
  document.getElementById('check-amount').textContent = 'Add Expense'; // Reset button text
}

// Function to update balance values
function updateBalance() {
  const totalAmount = parseFloat(document.getElementById('amount').innerText) || 0;

  // Collect and sum up only non-default amounts
  const expenditure = Array.from(document.querySelectorAll('.amount'))
    .reduce((sum, el) => {
      const amount = parseFloat(el.textContent.replace('$', ''));
      return amount === 100 ? sum : sum + amount; // Exclude default amount
    }, 0);

  const balance = totalAmount - expenditure;

  document.getElementById('expenditure-value').innerText = expenditure.toFixed(2);
  document.getElementById('balance-amount').innerText = balance.toFixed(2);

  // Update percentages
  const expenditurePercentage = totalAmount ? (expenditure / totalAmount * 100).toFixed(2) : 0;
  const balancePercentage = totalAmount ? (balance / totalAmount * 100).toFixed(2) : 0;

  document.getElementById('expenditure-percentage').innerText = `${expenditurePercentage}%`;
  document.getElementById('balance-percentage').innerText = `${balancePercentage}%`;
}

// Function to update the pie chart
let pieChart;

function updatePieChart() {
  const ctx = document.getElementById('pie-chart').getContext('2d');
  const labels = Array.from(document.querySelectorAll('.product')).map(el => el.textContent);
  const data = Array.from(document.querySelectorAll('.amount')).map(el => parseFloat(el.textContent.replace('$', '')));
  const totalAmount = parseFloat(document.getElementById('amount').innerText) || 0;
  const expenditure = data.reduce((sum, value) => value === 100 ? sum : sum + value, 0); // Exclude default values

  // Draw the pie chart
  if (pieChart) {
    pieChart.destroy();
  }

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#E4E4E4', '#9C27B0'],
        borderColor: '#FFFFFF',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return `${tooltipItem.label}: $${tooltipItem.raw.toFixed(2)}`;
            }
          }
        }
      }
    }
  });
}

