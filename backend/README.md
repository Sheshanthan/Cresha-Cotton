# Backend Server

This is the backend server for the ITP project, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
MONGO_URI=mongodb+srv://admin:root@cluster0.zwqqj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
```

## Installation

```bash
npm install
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## Available Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## Server Information

- **Port**: 5000 (configurable via PORT environment variable)
- **Database**: MongoDB Atlas
- **Framework**: Express.js
- **ORM**: Mongoose

## Features

- ✅ MongoDB connection with error handling
- ✅ CORS enabled
- ✅ JSON body parsing
- ✅ Environment variable configuration
- ✅ Health check endpoint
- ✅ Structured project layout 