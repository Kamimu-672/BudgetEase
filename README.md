# BudgetEase

## Overview

BudgetEase is a web-based application designed to help users manage their expenses and track their budget efficiently. The application provides features to set a total budget, add and manage expenses, and visualize spending through a dynamic pie chart. It uses MongoDB for data storage and Chart.js for charting.

## Features

- **Total Budget Management**: Set and update your total budget.
- **Expense Management**: Add, edit, and delete expenses.
- **Dynamic Pie Chart**: Visualize your expenses and remaining balance with a responsive pie chart.
- **Real-Time Updates**: See instant updates to your budget and expenses.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Charting**: Chart.js
- **Styling**: Custom CSS

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/BudgetEase.git
   cd BudgetEase

## Install Dependencies

. npm install

## Create a .env File

- Create a .env file in the root directory and add your MongoDB connection URI:
  MONGO_URI=your_mongo_connection_string
  PORT=3000

## Start the Server

. node server.js

- The application will run on http://localhost:3000

## Usage

. Set Total Budget: Enter your total budget amount and click "Set Budget".

. Add Expense: Enter the expense amount and title, then click "Add Expense".

. Edit Expense: Click the edit button next to an expense item to update its deta  ils.

. Delete Expense: Click the delete button next to an expense item to remove it.

. Reset All Expenses: Click "Reset All Expenses" to clear all data and reset the  budget.

## API Endpoints

- GET /api/expenses: Retrieve all expenses.

- POST /api/expenses: Add a new expense.

- PUT /api/expenses/: Update an existing expense.

- DELETE /api/expenses/: Delete an expense by ID.

- DELETE /api/expenses: Delete all expenses.

## Example Usage

. Set Budget

- Enter an amount in the "Total Budget" field and click "Set Budget".

## Add Expense

- Enter the amount and title of the expense, then click "Add Expense".

## Edit/Delete Expenses

- Use the edit or delete buttons next to each expense item to manage them.

## View Pie Chart

. The pie chart updates dynamically based on the expenses and budget.

## Contributing

- If you would like to contribute to BudgetEase, please fork the repository and   submit a pull request. Contributions are welcome!

## Acknowledgements

- Chart.js: For the dynamic pie chart visualization.

- MongoDB: For database management.

- Express.js: For building the backend API.

## Contact

-  Developed by Christine Mwaniki.






