# Library Rental Service - Frontend

Angular-based frontend application for managing library book rentals.

## Tech Stack

- **Framework:** Angular 19
- **UI Library:** Angular Material UI
- **Language:** TypeScript
- **Reactive Programming:** RxJS

## Features

- **Book Catalog Management:** Add, edit, delete books
- **Reader Registration:** Reader management system
- **Rental System:** Book rental and return functionality
- **Fine Calculation:** Automatic fine calculation for overdue books
- **Discount System:** Category-based discounts for different reader types

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Library-Rental-Service_Frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure the API endpoint:**

   Edit `src/environments/environment.ts`:

   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api'
   };
   ```

## Running the Application

In the terminal use this script:

```bash
ng serve
```

The application will be available at `http://localhost:4200`

---

**© Volodymyr Hrehul - 2025**