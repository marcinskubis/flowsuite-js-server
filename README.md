# FlowSuite Server

📌 **Backend of FlowSuite - A Task Management Application**

## 🚀 Getting Started

Follow these steps to set up and run the server:

### 📦 Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/flowsuite-server.git
   cd flowsuite-server
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and configure:

   ```env
    MONGO_URI=mongodb+srv://your-connection-string

    GOOGLE_CLIENT_ID=your_google_client_id

    GOOGLE_CLIENT_SECRET=your_google_client_secret

    JWT_SECRET=your-secret-key
   ```

### ▶️ Running the Server

```sh
npm run start
```

The API will be available at: [http://localhost:3000/](http://localhost:3000/)

### 🛠 Tech Stack

- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **Validation:** Express Validator

### 🏗 Project Structure

```
flowsuite-server/
│── src/
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Auth and validation middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # Express routes
│   ├── utils/        # Helper functions
│── .env              # Environment variables
│── package.json      # Dependencies and scripts
│── server.js         # Main entry point
```

### 📝 Features

✅ User Authentication (JWT)  
✅ Role-Based Access Control  
✅ RESTful API with CRUD Operations  
✅ WebSocket Support for Real-Time Updates

## 🔗 Deployment

- **Client:** Coming Soon
- **API:** Coming Soon

---
