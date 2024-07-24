document.addEventListener('DOMContentLoaded', () => {
  const totalAmountInput = document.getElementById('total-amount');
  const totalAmountButton = document.getElementById('total-amount-button');
  const userAmountInput = document.getElementById('user-amount');
  const productTitleInput = document.getElementById('product-title');
  const checkAmountButton = document.getElementById('check-amount');
  const resetButton = document.getElementById('reset-button');
  const amountSpan = document.getElementById('amount');
  const expenditureValueSpan = document.getElementById('expenditure-value');
  const balanceAmountSpan = document.getElementById('balance-amount');
  const expenditurePercentageSpan = document.getElementById('expenditure-percentage');
  const balancePercentageSpan = document.getElementById('balance-percentage');
  const listContainer = document.getElementById('list');
  const pieChartCanvas = document.getElementById('pie-chart');
  let expenses = {};
  let totalBudget = 0;

  const colors = {
    rent: '#FF6384',
    fuel: '#36A2EB',
    groceries: '#FFCE56',
    utilities: '#4BC0C0',
    others: '#9966FF',
    balance: '#FF9F40'
  };

  // Fetch expenses from server on load
  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      expenses = data.reduce((acc, expense) => {
        acc[expense.title.toLowerCase()] = expense.amount;
        return acc;
      }, {});
      renderExpenseList();
      updateTotals();
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const updateChart = () => {
    const ctx = pieChartCanvas.getContext('2d');
    const data = {
      labels: Object.keys(expenses).concat(['Balance']),
      datasets: [{
        data: Object.values(expenses).concat([totalBudget - Object.values(expenses).reduce((a, b) => a + b, 0)]),
        backgroundColor: Object.keys(expenses).map(key => colors[key] || '#000000').concat([colors.balance]),
      }]
    };

    if (window.pieChart) {
      window.pieChart.destroy();
    }

    window.pieChart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || '';
                if (label) {
                  label += ': $' + context.raw.toFixed(2);
                }
                return label;
              }
            }
          }
        }
      }
    });
  };

  const updateTotals = () => {
    const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
    const balance = totalBudget - totalExpenses;

    amountSpan.textContent = totalBudget.toFixed(2);
    expenditureValueSpan.textContent = totalExpenses.toFixed(2);
    balanceAmountSpan.textContent = balance.toFixed(2);

    const expenditurePercentage = totalBudget > 0 ? (totalExpenses / totalBudget * 100).toFixed(2) + '%' : '0%';
    const balancePercentage = totalBudget > 0 ? (balance / totalBudget * 100).toFixed(2) + '%' : '0%';

    expenditurePercentageSpan.textContent = expenditurePercentage;
    balancePercentageSpan.textContent = balancePercentage;

    updateChart();
  };

  const addExpense = async () => {
    const title = productTitleInput.value.trim().toLowerCase();
    const amount = parseFloat(userAmountInput.value);

    if (title && amount && !isNaN(amount)) {
      try {
        const response = await fetch('/api/expenses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, amount })
        });
        const newExpense = await response.json();
        expenses[title] = (expenses[title] || 0) + amount;
        renderExpenseList();
        updateTotals();
        productTitleInput.value = '';
        userAmountInput.value = '';
      } catch (error) {
        console.error('Error adding expense:', error);
      }
    }
  };

  const renderExpenseList = () => {
    listContainer.innerHTML = '';

    Object.keys(expenses).forEach(title => {
      const expense = expenses[title];
      const expenseItem = document.createElement('div');
      expenseItem.className = 'sublist-content';
      expenseItem.setAttribute('data-title', title); // Use data attribute to store title
      expenseItem.innerHTML = `
              <div class="expense-details">
                  <span class="product">${title.charAt(0).toUpperCase() + title.slice(1)}</span>
                  <span class="amount">$${expense.toFixed(2)}</span>
              </div>
              <div class="icons-container">
                  <button class="edit" aria-label="Edit">✎</button>
                  <button class="delete" aria-label="Delete">🗑️</button>
              </div>
          `;
      listContainer.appendChild(expenseItem);
    });

    addEventListenersToButtons(); // Re-add event listeners after rendering
  };

  const handleEdit = async (title) => {
    const newTitle = prompt('Edit expense title:', title);
    if (newTitle !== null && newTitle.trim()) {
      const newAmount = parseFloat(prompt('Enter new amount:', expenses[title].toFixed(2)));
      if (!isNaN(newAmount) && newAmount >= 0) {
        try {
          const expenseId = Object.keys(expenses).find(key => key === title);
          const response = await fetch(`/api/expenses/${expenseId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: newTitle.trim().toLowerCase(), amount: newAmount })
          });
          const updatedExpense = await response.json();
          delete expenses[title];
          expenses[newTitle.trim().toLowerCase()] = newAmount;
          renderExpenseList();
          updateTotals();
        } catch (error) {
          console.error('Error editing expense:', error);
        }
      }
    }
  };

  const handleDelete = async (title) => {
    if (confirm(`Are you sure you want to delete the expense: ${title}?`)) {
      try {
        const expenseId = Object.keys(expenses).find(key => key === title);
        await fetch(`/api/expenses/${expenseId}`, {
          method: 'DELETE'
        });
        delete expenses[title];
        renderExpenseList();
        updateTotals();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const addEventListenersToButtons = () => {
    document.querySelectorAll('.edit').forEach(button => {
      button.addEventListener('click', () => {
        const title = button.closest('.sublist-content').getAttribute('data-title');
        handleEdit(title);
      });
    });

    document.querySelectorAll('.delete').forEach(button => {
      button.addEventListener('click', () => {
        const title = button.closest('.sublist-content').getAttribute('data-title');
        handleDelete(title);
      });
    });
  };

  const resetAll = async () => {
    if (confirm('Are you sure you want to reset all expenses?')) {
      try {
        await fetch('/api/expenses', {
          method: 'DELETE'
        });
        expenses = {};
        totalBudget = 0;
        totalAmountInput.value = '';
        userAmountInput.value = '';
        productTitleInput.value = '';
        renderExpenseList();
        updateTotals();
      } catch (error) {
        console.error('Error resetting all expenses:', error);
      }
    }
  };

  totalAmountButton.addEventListener('click', () => {
    totalBudget = parseFloat(totalAmountInput.value);
    if (!isNaN(totalBudget)) {
      updateTotals();
    }
  });

  checkAmountButton.addEventListener('click', addExpense);

  resetButton.addEventListener('click', resetAll);

  // Initial fetch of expenses
  fetchExpenses();
});

