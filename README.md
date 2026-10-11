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

> **Screenshot placeholder:** `docs/screenshots/01-login.png`

### 2. Registration Page

New users register with their name, email, and a password that includes an uppercase letter, a lowercase letter, and a number.

> **Screenshot placeholder:** `docs/screenshots/02-register.png`

### 3. Home / Dashboard

The main landing page after login or guest entry. Users can review their lists, search and filter them, view summary counts, and open, edit, or delete a list.

> **Screenshot placeholder:** `docs/screenshots/03-home-dashboard.png`

### 4. Create Shopping List

Users enter a required title, optionally add a store, target date, budget, and notes, and choose products from the catalog. The page calculates item and list totals.

> **Screenshot placeholder:** `docs/screenshots/04-create-list.png`

### 5. Edit Shopping List

Users reopen an existing list to change its details, adjust quantities, add products, or remove products before saving the changes.

> **Screenshot placeholder:** `docs/screenshots/05-edit-list.png`

### 6. Shopping List Details

Shows a saved list, item purchase controls, progress, estimated cost, remaining cost, purchased spending, and available export/print actions.

> **Screenshot placeholder:** `docs/screenshots/06-list-details.png`

### 7. Product Catalog

Users browse the available products, search by text, filter by category, and view the current catalog price and unit.

> **Screenshot placeholder:** `docs/screenshots/07-products.png`

### 8. Shopping Analytics

Registered users choose a month to review spending from purchased items in completed lists, including totals by day and category and purchase history.

> **Screenshot placeholder:** `docs/screenshots/08-analytics.png`

### 9. Profile Page

Registered users edit their display name, view their read-only email, and change their password.

> **Screenshot placeholder:** `docs/screenshots/09-profile.png`

### 10. Admin Product and Category Management

Administrators create, edit, and delete catalog products and manage dynamic categories. Categories assigned to products cannot be deleted until those products are reassigned or removed.

> **Screenshot placeholder:** `docs/screenshots/10-admin-catalog.png`

### 11. About Page

Explains CheckLit, its purpose, and the main features of the application.

> **Screenshot placeholder:** `docs/screenshots/11-about.png`

### 12. Not Found Page

Displays a friendly message for invalid routes and provides navigation back to the application.

> **Screenshot placeholder:** `docs/screenshots/12-not-found.png`

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
