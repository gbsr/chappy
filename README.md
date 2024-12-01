# Chappy - Real-Time Chat Application

Chappy is a modern, full-stack chat application built with TypeScript, React, Express, and MongoDB. It features real-time messaging, user authentication, and channel-based communication.

> ⚠️ **Note**: This project is currently in active development. Some features are still being implemented and bugs should be expected.

## Features

### Current Features

-   Real-time messaging
-   User authentication with JWT
-   Channel-based communication
-   Direct messaging between users
-   Modern UI with Radix UI components
-   TypeScript support throughout the stack
-   MongoDB database integration
-   RESTful API architecture

### Planned Features & Improvements

-   Real-time messaging with Socket.IO integration
-   Fix user visibility in channel lists
-   UI/UX improvements and bug fixes
-   Enhanced error handling
-   Improved mobile responsiveness

## Prerequisites

-   Node.js (v18 or higher)
-   MongoDB
-   npm or yarn

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd chappy
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
PORT=1338
CONNECTION_STRING=your_mongodb_connection_string
MONGODB_DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

## Development

Run the development server:

```bash
# Run frontend development server
npm run dev

# Run backend development server
npm run build-backend
npm run start-backend
```

## Production Build

```bash
# Build frontend
npm run build-frontend

# Build backend
npm run build-backend

# Start the production server
npm start
```

## API Documentation

### Authentication Endpoints

#### POST /api/users/login

Login with existing credentials.

Request body:

```json
{
	"email": "user@example.com",
	"password": "password123"
}
```

Response:

```json
{
	"message": "Login successful",
	"token": "jwt_token",
	"user": {
		"id": "user_id",
		"email": "user@example.com",
		"userName": "username",
		"isAdmin": false
	}
}
```

#### POST /api/users/add

Register a new user.

Request body:

```json
{
	"userName": "username",
	"email": "user@example.com",
	"password": "password123",
	"isAdmin": false
}
```

### Channel Endpoints

#### GET /api/channels

Get all available channels.

Headers:

```
Authorization: Bearer your_jwt_token
```

#### POST /api/channels/add

Create a new channel.

Headers:

```
Authorization: Bearer your_jwt_token
```

Request body:

```json
{
	"name": "channel-name",
	"description": "Channel description"
}
```

### Message Endpoints

#### GET /api/messages/channels/:channelId/messages

Get all messages in a channel.

Headers:

```
Authorization: Bearer your_jwt_token
```

#### POST /api/messages

Send a new message.

Headers:

```
Authorization: Bearer your_jwt_token
```

Request body:

```json
{
	"content": "Message content",
	"channelId": "channel_id",
	"userId": "user_id"
}
```

#### GET /api/messages/direct/:id

Get direct messages between users.

Headers:

```
Authorization: Bearer your_jwt_token
```

## Error Handling

The API uses standard HTTP status codes:

-   200: Success
-   201: Created
-   400: Bad Request
-   401: Unauthorized
-   403: Forbidden
-   404: Not Found
-   409: Conflict
-   500: Internal Server Error

Error responses follow this format:

```json
{
	"message": "Error description",
	"error": "Detailed error message"
}
```

## Security

-   All passwords are hashed using bcrypt
-   JWT tokens are used for authentication
-   Environment variables are used for sensitive data
-   CORS is enabled for secure cross-origin requests

## Tech Stack

-   **Frontend**: React, TypeScript, Radix UI
-   **Backend**: Express.js, TypeScript
-   **Database**: MongoDB
-   **Authentication**: JWT, bcrypt
-   **Development**: Vite, ESLint
-   **Styling**: Tailwind CSS

## Project Structure

```
chappy/
├── backendSrc/          # Backend source code
│   ├── auth/            # Authentication logic
│   ├── crud/            # Database operations
│   ├── data/            # Database connection
│   └── routes/          # API routes
├── src/                 # Frontend source code
├── shared/              # Shared interfaces and types
├── public/              # Static files
└── dist/               # Production build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
