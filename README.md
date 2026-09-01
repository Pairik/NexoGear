# NexoGear

NexoGear is a web-based e-commerce system developed as a university diploma project.

The application is focused on computer and gaming peripherals and demonstrates a complete full-stack e-commerce workflow, including user authentication, product management, shopping cart functionality, order processing, stock management and email notifications.

## Technologies

### Backend

- C#
- ASP.NET Core Web API
- MongoDB
- MongoDB .NET/C# Driver
- JWT Authentication
- BCrypt
- MailKit / SMTP
- OpenAPI / Swagger

### Frontend

- React
- JavaScript
- CSS
- Vite
- React Router
- Axios
- Context API

## Main Features

### Customer Features

- User registration
- Password confirmation during registration
- Secure login with JWT authentication
- Product catalog
- Product search
- Category filtering
- Product detail pages
- Product availability status
- Shopping cart
- Increase and decrease product quantity
- Automatic removal of products when quantity reaches zero
- Cart data stored in Local Storage
- Saved shipping address
- Shipping address editing
- Order creation
- Automatic stock validation
- Order history
- Order status tracking
- Short customer-friendly order numbers
- Email confirmation after successful order creation

### Administrator Features

- Administrator role
- Product administration
- Add new products
- Edit existing products
- Delete products
- Search products by name, brand or category
- Receive additional stock
- View current stock quantity
- View all customer orders
- Search orders by Order Number
- Change order status
- Prioritized order sorting

Order statuses:

- Pending
- Processing
- Completed
- Cancelled

Active orders are displayed before completed and cancelled orders to make order processing easier.

## Order Processing

When a customer creates an order, the backend performs several validations before the order is stored.

The system:

1. Verifies the authenticated user.
2. Loads the requested products from MongoDB.
3. Checks the available stock.
4. Reserves the requested quantities using conditional MongoDB updates.
5. Calculates product prices on the server.
6. Creates the order document.
7. Stores the shipping address with the order.
8. Sends an order confirmation email to the customer.
9. Sends a new order notification to the administrator.

Product prices sent by the frontend are not trusted. The backend retrieves the current prices directly from the database before calculating the total order value.

If one of the products cannot be reserved, quantities already reserved during the same operation are restored.

## Authentication and Authorization

NexoGear uses JSON Web Tokens (JWT) for authentication.

Two application roles are available:

- `User`
- `Admin`

New accounts are always registered with the `User` role.

Administrative API endpoints are protected on the backend using role-based authorization.

Passwords are never stored as plain text. BCrypt is used for password hashing.

## Database

The application uses MongoDB.

Default local database:

```text
OnlineStoreDB
```

Main collections:

```text
Users
Products
Orders
Categories
```

### User

A user contains information such as:

- First name
- Last name
- Email
- Password hash
- Role
- Phone number
- Shipping address
- Creation date

### Product

A product contains:

- Name
- Description
- Price
- Quantity
- Category
- Brand
- Image URL

### Order

An order contains:

- User ID
- Products
- Product quantities
- Product prices
- Product images
- Total price
- Shipping address
- Status
- Order date

Product information is also stored inside the order so that previous orders remain consistent even if a product is edited later.

## Project Structure

```text
NexoGear
│
├── backend
│   ├── Controllers
│   ├── Data
│   ├── DTOs
│   ├── Helpers
│   ├── Models
│   ├── Properties
│   ├── Services
│   ├── Settings
│   ├── Program.cs
│   └── OnlineStoreAPI.csproj
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   └── services
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## REST API

The backend provides REST API endpoints for authentication, products and orders.

### Authentication

```text
POST /api/Auth/register
POST /api/Auth/login
GET  /api/Auth/me
PUT  /api/Auth/address
```

### Products

```text
GET    /api/Products
GET    /api/Products/{id}
POST   /api/Products
PUT    /api/Products/{id}
DELETE /api/Products/{id}
PUT    /api/Products/{id}/stock
```

Product creation, editing, deletion and stock management require the `Admin` role.

### Orders

```text
POST /api/Orders
GET  /api/Orders/my
GET  /api/Orders
PUT  /api/Orders/{id}/status
```

Access to all orders and order status management requires the `Admin` role.

## Running the Project

### Requirements

Install:

- .NET SDK
- Node.js
- npm
- MongoDB
- MongoDB Compass (optional)
- Visual Studio or Visual Studio Code

## 1. Start MongoDB

The default local MongoDB connection is:

```text
mongodb://localhost:27017
```

The application uses:

```text
OnlineStoreDB
```

## 2. Configure the Backend

Before starting the backend, configure the required values in `appsettings.json` or through environment variables / user secrets.

Example configuration:

```json
{
  "MongoDBSettings": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "OnlineStoreDB",
    "UsersCollectionName": "Users",
    "ProductsCollectionName": "Products",
    "OrdersCollectionName": "Orders",
    "CategoriesCollectionName": "Categories"
  },

  "JwtSettings": {
    "Key": "YOUR_JWT_SECRET_KEY",
    "Issuer": "OnlineStoreAPI",
    "Audience": "OnlineStoreClient"
  },

  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": 587,
    "SenderName": "NexoGear",
    "SenderEmail": "YOUR_EMAIL",
    "Username": "YOUR_EMAIL",
    "Password": "YOUR_APP_PASSWORD",
    "AdminEmail": "YOUR_ADMIN_EMAIL"
  }
}
```

Do not commit real passwords, SMTP credentials or JWT secret keys to the repository.

## 3. Start the Backend

Open a terminal inside:

```text
backend
```

Run:

```bash
dotnet restore
dotnet run
```

During development, the API is configured to run locally.

Example:

```text
https://localhost:7206
```

Swagger UI can be opened at:

```text
https://localhost:7206/swagger
```

## 4. Start the Frontend

Open another terminal inside:

```text
frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

Both the frontend and backend must be running at the same time.

## Email Notifications

After a successful order, NexoGear sends:

- an order confirmation email to the customer;
- a new order notification email to the administrator.

The emails contain:

- NexoGear branding;
- short Order Number;
- ordered products;
- quantities;
- prices;
- total value;
- shipping address.

## Security

The project implements several security mechanisms:

- BCrypt password hashing
- JWT authentication
- Role-based authorization
- Server-side validation
- Protected administrative endpoints
- Server-side price calculation
- Stock validation
- CORS configuration

Sensitive information such as SMTP passwords and JWT secret keys should be stored using environment variables or secret storage in a production environment.

## Current Limitations

This project was developed as a local educational system.

The current version does not include:

- Online payment processing
- Courier service integration
- Cloud deployment
- Automatic invoice generation
- Automatic refunds
- Automatic stock restoration when an already-created order is cancelled

These features can be implemented as future extensions.

## Diploma Project

NexoGear was developed as part of a Bachelor's diploma project at the Technical University of Sofia.

**Topic:**  
Development of a Web-Based E-Commerce System

**Student:**  
Kristian Valchev

**Degree:**  
Bachelor's Degree in Computer and Software Engineering

**Technologies:**  
C#, ASP.NET Core Web API, React, JavaScript, CSS and MongoDB

## Author

**Kristian Valchev**

GitHub: [Paiirk](https://github.com/Paiirk)

---

This repository contains the source code of the NexoGear diploma project.
