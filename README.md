# WhatsApp Chatbot Service

A WhatsApp chatbot service.

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Business logic controllers
├── services/        # External services
├── models/          # Data models
├── routes/          # API routes
├── utils/           # Utility functions
├── app.ts           # Main application
└── server.ts        # Server entry point
```

## Installation

```bash
npm install
```

## Running the Service

```bash
npm run dev
```

## API Endpoints

### Health Check

- **GET** `/health` - Check WhatsApp client status

### Simple Chat (No WhatsApp)

- **POST** `/simple-chat` - Simple chat without WhatsApp

### Send Chat via WhatsApp

- **POST** `/send-chat` - Send chat message via WhatsApp with AI response

### Auto-Reply Control

- **POST** `/auto-reply` - Enable/disable auto-reply feature
- **GET** `/auto-reply` - Get current auto-reply status

## Configuration

Edit `src/config/app.config.ts` to configure:

- Port number
- WhatsApp client settings

## Features

- **WhatsApp Integration**: Send and receive messages via WhatsApp
- **Auto-Reply**: Automatic response to incoming WhatsApp messages
- **REST API**: Full API control over chatbot functionality

## Usage Examples

### Simple Chat

```bash
curl -X POST http://localhost:3005/simple-chat \
-H "Content-Type: application/json" \
-d '{"message": "Halo, apa kabar?"}'
```

### Send Chat via WhatsApp

```bash
curl -X POST http://localhost:3005/send-chat \
-H "Content-Type: application/json" \
-d '{"phoneNumber": "6281234567890", "message": "Halo, apa kabar?"}'
```

### Enable Auto-Reply

```bash
curl -X POST http://localhost:3005/auto-reply \
-H "Content-Type: application/json" \
-d '{"enabled": true}'
```

## Requirements

- Node.js 18+
- TypeScript
- WhatsApp account for authentication
