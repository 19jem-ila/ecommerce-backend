# Optics E-commerce Backend

A full-stack e-commerce backend built with Node.js, Express.js, MongoDB, and WebSocket support for real-time features.

## 🚀 Features

- **Full E-commerce Functionality**: Products, orders, users, payments
- **Real-time Updates**: WebSocket integration for live preview and notifications
- **Authentication**: Firebase Authentication integration
- **Payment Integration**: PayPal and Telebirr support
- **RESTful API**: Well-structured endpoints with validation
- **MongoDB Atlas**: Cloud database with Mongoose ODM
- **Security**: JWT tokens, input validation, CORS protection

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: Firebase + JWT
- **Real-time**: WebSocket (ws)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Morgan

## 📁 Project Structure

```
optics-backend/
├── models/           # Database models
│   ├── Product.js    # Product schema
│   ├── User.js       # User schema
│   └── Order.js      # Order schema
├── routes/           # API routes
│   ├── products.js   # Product endpoints
│   ├── users.js      # User management
│   ├── orders.js     # Order processing
│   ├── auth.js       # Authentication
│   └── payments.js   # Payment integration
├── websocket/        # WebSocket server
│   └── websocketServer.js
├── server.js         # Main server file
├── package.json      # Dependencies
└── env.example       # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Firebase project
- PayPal/Telebirr developer accounts

### Installation

1. **Clone the repository**
   ```bash
   cd optics-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   FIREBASE_PROJECT_ID=your_firebase_project_id
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   TELEBIRR_MERCHANT_ID=your_telebirr_merchant_id
   TELEBIRR_SECRET_KEY=your_telebirr_secret_key
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:5000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search/:query` - Search products
- `GET /api/products/featured/featured` - Get featured products
- `GET /api/products/sale/onsale` - Get products on sale

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/:id/tracking` - Get order tracking
- `GET /api/orders/admin/all` - Get all orders (Admin)

### Payments
- `POST /api/payments/paypal/create-payment` - Create PayPal payment
- `POST /api/payments/paypal/capture-payment` - Capture PayPal payment
- `POST /api/payments/telebirr/create-payment` - Create Telebirr payment
- `POST /api/payments/telebirr/callback` - Telebirr callback
- `POST /api/payments/cash-on-delivery` - Cash on delivery
- `GET /api/payments/status/:orderId` - Get payment status
- `POST /api/payments/refund` - Request refund

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get user dashboard
- `PUT /api/users/preferences` - Update user preferences
- `POST /api/users/address` - Add address
- `PUT /api/users/address/:id` - Update address
- `DELETE /api/users/address/:id` - Delete address
- `GET /api/users/wishlist` - Get user wishlist
- `POST /api/users/wishlist/:productId` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist

## 🔌 WebSocket Events

### Connection Events
- `connection` - User connects to WebSocket
- `user_joined` - User joins a room
- `user_left` - User leaves a room

### Product Events
- `product_created` - New product created
- `product_updated` - Product updated
- `product_deleted` - Product deleted
- `product_viewed` - Product viewed
- `product_list_update` - Product list updated

### Order Events
- `order_created` - New order created
- `order_status_updated` - Order status changed
- `order_cancelled` - Order cancelled

### Payment Events
- `payment_initiated` - Payment started
- `payment_completed` - Payment successful
- `payment_failed` - Payment failed
- `refund_requested` - Refund requested

### User Events
- `user_registered` - New user registered
- `user_logged_in` - User logged in
- `user_logged_out` - User logged out
- `profile_updated` - Profile updated
- `preferences_updated` - Preferences updated

### Notification Events
- `notification` - User notification
- `announcement` - System announcement

## 🗄️ Database Models

### Product Schema
- Basic info: name, category, price, description
- Images: main image + additional images
- Inventory: stock quantity, availability
- Features: colors, prescription eligibility, lens inclusion
- Marketing: featured, on sale, discount percentage
- Analytics: rating, review count, recent sales

### User Schema
- Authentication: Firebase UID, email
- Profile: display name, photo, phone
- Addresses: multiple addresses with types
- Preferences: favorite categories, newsletter settings
- Activity: last login, account status

### Order Schema
- Items: products, quantities, prices, prescription details
- Financial: subtotal, tax, shipping, total
- Addresses: shipping and billing addresses
- Payment: method, status, transaction IDs
- Status: order lifecycle tracking
- Metadata: tracking, delivery estimates, notes

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Request data validation
- **CORS Protection**: Cross-origin request handling
- **Helmet**: Security headers
- **Rate Limiting**: API request throttling
- **Environment Variables**: Sensitive data protection

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `PORT` | Server port | No (default: 5000) |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `PAYPAL_CLIENT_ID` | PayPal client ID | No |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | No |
| `TELEBIRR_MERCHANT_ID` | Telebirr merchant ID | No |
| `TELEBIRR_SECRET_KEY` | Telebirr secret key | No |
| `FRONTEND_URL` | Frontend application URL | No |
| `BACKEND_URL` | Backend application URL | No |

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Setup
1. Set up MongoDB Atlas cluster
2. Configure Firebase project
3. Set up payment provider accounts
4. Configure environment variables
5. Deploy to your preferred hosting platform

## 📝 API Documentation

### Request Format
All API requests should include:
- `Content-Type: application/json` header
- `Authorization: Bearer <token>` header for protected routes

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

## 🔧 Development

### Adding New Routes
1. Create route file in `routes/` directory
2. Add route to `server.js`
3. Implement validation and error handling
4. Add WebSocket integration if needed

### Adding New Models
1. Create model file in `models/` directory
2. Define schema with validation
3. Add indexes for performance
4. Update related routes

### WebSocket Integration
1. Use `global.wsServer` to broadcast events
2. Implement proper error handling
3. Add authentication checks
4. Handle connection cleanup

## 🧪 Testing

### Manual Testing
- Use Postman or similar tool
- Test all endpoints with valid/invalid data
- Verify WebSocket connections
- Test authentication flows

### Automated Testing
```bash
# Add test scripts to package.json
npm test
```

## 📊 Monitoring

### Health Check
- Endpoint: `GET /api/health`
- Returns server status and timestamp

### Logging
- Morgan for HTTP request logging
- Console logging for errors and events
- WebSocket connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review error logs
- Test with Postman
- Check MongoDB Atlas status
- Verify environment variables

## 🔄 Updates

### Version 1.0.0
- Initial release
- Basic e-commerce functionality
- WebSocket integration
- Firebase authentication
- Payment integration

### Future Features
- Admin dashboard
- Analytics and reporting
- Email notifications
- SMS integration
- Multi-language support
- Advanced search filters
- Recommendation engine
