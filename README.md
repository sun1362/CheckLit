# CheckLit

This is the React frontend for CheckLit, a shopping-list and budget-tracking web application.

## Group Members

Carl Michael Toribio - Backend (Handled Express and Connection to React).
Shawn Allen Rubin - Frontend (Handled React and Made UI).

Replace these placeholders with the actual group members and their contributions before submission.

## Project Concept

CheckLit helps users plan shopping trips, organize grocery products, estimate list costs, set a budget, record purchased items, and review spending. The Home page is the main landing/dashboard page users see after logging in or entering guest mode.

## What the Application Does and What Data It Processes

The frontend communicates with the CheckLit Express API. It displays products and dynamic categories, creates and edits shopping lists, calculates item subtotals and list totals, tracks list status, and presents monthly purchase analytics.

The application processes:

- Account name, email, role, and authentication token.
- Product names, categories, prices, units, icons, and descriptions.
- Shopping-list titles, optional store and target date, budget, notes, product quantities, purchase checkboxes, purchase dates, calculated totals, and status.
- Monthly summaries grouped by purchase date and product category.

Passwords are sent to the backend only for authentication or password changes. The backend hashes passwords before storing them. Guest shopping lists are temporary and stored in the browser's session storage; guest lists are not saved to MongoDB.

## Main Features

- Login, registration, and guest browsing.
- Create, edit, search, filter, and delete shopping lists.
- Select products from the backend catalog and calculate subtotals and total cost.
- Track purchased items and automatically calculate list status.
- Export list details to CSV or print/save as PDF from the list-details screen.
- Browse products by backend-managed categories.
- Admin management for products and categories.
- Monthly spending analytics for completed shopping lists with recorded purchase dates.
- Profile-name editing and password changes.

## Screenshots

Add real screenshots of the running application to `docs/screenshots/`. For each numbered page below, save your screenshot using the suggested filename, then replace the screenshot placeholder with a Markdown image link. Example: `![Login page](docs/screenshots/01-login.png)`.

### 1. Login Page

Users enter their email and password to access their account. The page also offers the guest-mode entry point.

<img width="1907" height="940" alt="image" src="https://github.com/user-attachments/assets/f59d036b-ee17-4024-82b0-97b5bb66109d" />


### 2. Registration Page

New users register with their name, email, and a password that includes an uppercase letter, a lowercase letter, and a number.

<img width="1908" height="940" alt="image" src="https://github.com/user-attachments/assets/3a4c1fed-b184-4285-a6bc-a76c25783a83" />


### 3. Home / Dashboard

The main landing page after login or guest entry. Users can review their lists, search and filter them, view summary counts, and open, edit, or delete a list.

<img width="1910" height="943" alt="image" src="https://github.com/user-attachments/assets/fbeda81f-1ac8-4152-a8d3-dc4534bfb49d" />


### 4. Create Shopping List

Users enter a required title, optionally add a store, target date, budget, and notes, and choose products from the catalog. The page calculates item and list totals.

<img width="1892" height="945" alt="image" src="https://github.com/user-attachments/assets/0d845e9d-a8d3-4a4c-9ae3-7ca317c3fc7e" />


### 5. Edit Shopping List

Users reopen an existing list to change its details, adjust quantities, add products, or remove products before saving the changes.

<img width="1893" height="944" alt="image" src="https://github.com/user-attachments/assets/d41acf1e-cc9d-40e1-96c4-4a41fcb08830" />


### 6. Shopping List Details

Shows a saved list, item purchase controls, progress, estimated cost, remaining cost, purchased spending, and available export/print actions.

<img width="1894" height="944" alt="image" src="https://github.com/user-attachments/assets/fb7d5e5a-4c3d-4ba9-b5a3-108496a9f53c" />

### 7. Product Catalog

Users browse the available products, search by text, filter by category, and view the current catalog price and unit.

<img width="1888" height="941" alt="image" src="https://github.com/user-attachments/assets/7a5b98fd-f76d-4809-b950-072fefca6fcd" />


### 8. Shopping Analytics

Registered users choose a month to review spending from purchased items in completed lists, including totals by day and category and purchase history.

<img width="1892" height="943" alt="image" src="https://github.com/user-attachments/assets/b15555c5-002c-43be-81a4-40c984dd3236" />


### 9. Profile Page

Registered users edit their display name, view their read-only email, and change their password.

<img width="1893" height="938" alt="image" src="https://github.com/user-attachments/assets/f8860c18-d91c-47c3-9928-bf3476697f22" />


### 10. Admin Product and Category Management

Administrators create, edit, and delete catalog products and manage dynamic categories. Categories assigned to products cannot be deleted until those products are reassigned or removed.

<img width="1891" height="939" alt="image" src="https://github.com/user-attachments/assets/36ffa1ea-7e28-48e8-95d4-d6fa7f790538" />
<img width="1889" height="903" alt="image" src="https://github.com/user-attachments/assets/804cc176-6f50-44c6-accf-41575a398ce4" />


### 11. About Page

Explains CheckLit, its purpose, and the main features of the application.

<img width="1889" height="939" alt="image" src="https://github.com/user-attachments/assets/2a9d717f-8c26-4a0f-b61b-934b0b345592" />


### 12. Not Found Page

Displays a friendly message for invalid routes and provides navigation back to the application.

<img width="1904" height="939" alt="image" src="https://github.com/user-attachments/assets/b8593aec-63fe-4187-a6fb-af8808216af0" />


## Technologies

- React with TypeScript and Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Zod with `@hookform/resolvers`

## Setup Instructions

### Requirements

- Node.js and npm
- The CheckLit Express backend running locally or at an accessible API URL
- MongoDB configured for the backend

### 1. Install dependencies

From the repository root:

```bash
cd checklit-Web
npm install
```

### 2. Configure the frontend API URL

Create `checklit-Web/.env` and add:

```env
VITE_API_URL=http://localhost:8000/api
```

`VITE_API_URL` is optional; if omitted, the frontend uses `http://localhost:8000/api` by default. Restart Vite after changing this variable.

### 3. Start the frontend

```bash
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

### 4. Build for production

```bash
npm run build
```

### 5. Start the backend

Follow the setup instructions in the CheckLit backend repository. The backend needs `MONGO_URI` and `JWT_SECRET`; the seed script also needs `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

## API Documentation

The frontend uses one configured Axios instance. The local API base URL is `http://localhost:8000/api` unless `VITE_API_URL` is set. Protected routes receive the token in the `Authorization: Bearer <token>` header.

| Method | Path | Purpose | Sample request | Sample response |
|---|---|---|---|---|
| POST | `/api/auth/register` | Create a regular user account | `{"name":"Alex User","email":"alex@example.com","password":"SecurePass123"}` | `{"message":"Registration successful.","token":"<jwt>","user":{"id":"<id>","name":"Alex User","email":"alex@example.com","role":"user"}}` |
| POST | `/api/auth/login` | Log in and receive a token | `{"email":"alex@example.com","password":"SecurePass123"}` | `{"message":"Login successful.","token":"<jwt>","user":{"id":"<id>","name":"Alex User","email":"alex@example.com","role":"user"}}` |
| GET | `/api/products` | Load the product catalog | None | `[{"_id":"<id>","name":"Fresh Tomato","category":"Vegetables","unitPrice":85,"unit":"kg"}]` |
| GET | `/api/categories` | Load dynamic categories | None | `[{"_id":"<id>","name":"Vegetables","description":"Fresh vegetables and greens"}]` |
| GET | `/api/lists` | Load lists belonging to the signed-in user | Bearer token | `[{"id":"<id>","title":"Weekly Groceries","budget":1500,"totalCost":170,"status":"Pending","items":[]}]` |
| POST | `/api/lists` | Create a list | `{"title":"Weekly Groceries","budget":1500,"items":[{"productId":"<product-id>","quantity":2,"completed":false}]}` | `{"id":"<id>","title":"Weekly Groceries","budget":1500,"totalCost":170,"status":"Pending","items":[...]}` |
| GET | `/api/lists/:id` | Load one owned list | Bearer token | `{"id":"<id>","title":"Weekly Groceries","totalCost":170,"status":"Pending","items":[...]}` |
| PUT | `/api/lists/:id` | Update an owned list | `{"title":"Updated List","budget":2000}` | `{"id":"<id>","title":"Updated List","budget":2000,"totalCost":170,"status":"Pending","items":[...]}` |
| DELETE | `/api/lists/:id` | Delete an owned list | Bearer token | `{"message":"Shopping list deleted successfully.","id":"<id>"}` |
| GET | `/api/profile` | Load current profile | Bearer token | `{"id":"<id>","name":"Alex User","email":"alex@example.com","role":"user"}` |
| PUT | `/api/profile` | Update display name | `{"name":"Alex U."}` | `{"message":"Profile updated successfully.","user":{"id":"<id>","name":"Alex U.","email":"alex@example.com","role":"user"}}` |
| PATCH | `/api/profile/password` | Change password | `{"currentPassword":"OldPass123","newPassword":"NewPass456"}` | `{"message":"Password changed successfully."}` |
| POST | `/api/products` | Admin creates a catalog product | `{"name":"Frozen Peas","category":"Other","unitPrice":120,"unit":"pack"}` | `{"_id":"<id>","name":"Frozen Peas","category":"Other","unitPrice":120,"unit":"pack"}` |
| POST | `/api/categories` | Admin creates a category | `{"name":"Frozen Foods","description":"Frozen groceries"}` | `{"_id":"<id>","name":"Frozen Foods","description":"Frozen groceries"}` |

See the backend README for the complete endpoint list and error/status-code details.

## Known Limitations

- Guest lists are stored in browser session storage and are not synchronized to MongoDB or transferred to a registered account.
- Analytics only includes purchased items that have a purchase date and belong to completed lists.
- Product categories and prices depend on the backend catalog and its seeded data.
- The frontend's default development API URL is local; a different deployment URL must be configured with `VITE_API_URL`.
- Screenshots in this README are placeholders until actual images are added.

## Related Repository

CheckLit Express backend: https://github.com/toribiocc/CheckLit-server
