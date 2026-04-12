ADMIN ACOUNT ==> email - admin@gmail.com   ,   Password - admin@1
USER ACCOUNT ==> email - user1@gmail.com   ,   Password - user@1
Please register with valid email id to test the project, so you can able to check the forgot password functionality by getting the email for the forgot password

# 🚀 NexCart: Final Evaluation Project

**NexCart** is a high-performance, full-stack e-commerce system developed as the final capstone for professional internship evaluation. This project integrates complex business logic, advanced security protocols, and a unified architecture where a single Node.js process serves both the **TypeORM/Express API** and the **Angular 18 Frontend**.

---

## 🛠️ Key Technical Implementations

### 1. Advanced Session & Security
* **Dual-Token Authentication:** Implemented using **Access** and **Refresh Tokens** stored in **HTTP-only, Secure Cookies**. This approach mitigates XSS and CSRF risks while providing a seamless user experience.
* **Real-time Account Locking:** Sessions are tracked in a server-side **In-Memory Map**. When an admin locks a customer, their specific session is invalidated immediately, forcing an logout on their very next request via the Angular HTTP Interceptor.
* **RBAC (Role-Based Access Control):** Strict enforcement of Guest, Customer, and Admin roles across both the UI (Angular Guards) and the API (Express Middleware).

### 2. Professional Forgot Password Flow
* **Tokenized Reset Links:** Instead of a simple mock code, this project implements a production-standard flow:
    1.  User requests a reset; the backend generates a **secure, time-limited Reset Token**.
    2.  An email is dispatched via **Nodemailer** containing a unique link (e.g., `/reset-password?token=xyz`).
    3.  The Angular application captures the token from the URL and validates it against the backend before allowing the password change.

### 3. Sophisticated Product Taxonomy
* **Four-Level Relational Depth:** The database schema correctly maps the hierarchy of **Type ➔ Category ➔ Sub-Category ➔ Product**.
* **Cross-Taxonomy Search:** A unified search engine that queries across multiple levels. A search for "Table" will correctly aggregate products from both "Furniture" and "Stationery" types in a single paginated result set.

### 4. Data Integrity & Transactions
* **ACID-Compliant Checkout:** Manual transaction management using TypeORM’s `QueryRunner`. This ensures that inventory reduction and order creation either both succeed or both fail, preventing data corruption.
* **Price Snapshots:** Each `OrderItem` records the price at the moment of purchase, ensuring that historical orders remain accurate even if product prices are updated later.

---

## 📂 Project Architecture

```text
├── server-f/                # Unified Node.js Server
│   ├── src/
│   │   ├── entities/        # DB Schema (User, Product, Order, Category, etc.)
│   │   ├── migrations/      # Version-controlled DB evolution
│   │   ├── controllers/     # Transactional controllers
│   │   └── middleware/      # Auth, RBAC, and Account Locking logic
└── client/                  # Built Angular Application
    ├── src/app/
    │   ├── core/            # Interceptors, Auth Guards, & API Services
    │   ├── shared/          # Generic Search, Pipes, & Directives
    │   └── features/        # Admin (Lazy-loaded), Cart, & Checkout
```

---

## ⚙️ Installation & Deployment

### 1. Backend Initialization
```bash
cd server
npm install
# Initialize the SQLite database via TypeORM migrations
npm run typeorm migration:run -- -d src/configs/data-sourse.ts
npm start
```

### 2. Frontend Build
```bash
cd ../client
npm install
ng build  # Build output is served statically by the Express server
ng serve
```

### 3. Launching the System
```bash
cd ../server
ng serve
```
The application will be available at `http://localhost:4200`.

---

## ✅ Final Evaluation Checklist
* **Security:** Bcrypt hashing, SQL Injection prevention, and sanitized inputs.
* **UI/UX:** Pure CSS design (no frameworks), custom Image Fallback directive, and a "Share Button" for deep-linking products.
* **Optimization:** Lazy loading of the Admin module and efficient RxJS search streams (`switchMap`, `debounceTime`).
* **Integrity:** Static image serving via `express.static` with database path referencing.

---