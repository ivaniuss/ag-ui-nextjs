# Real-time Chat with OpenAI and RxJS

A real-time chat application that uses Server-Sent Events (SSE) for real-time communication using AG-UI protocol, integrating OpenAI for intelligent responses.

## 🚀 Key Features

- **Real-time Chat**: Bidirectional communication using Server-Sent Events
- **OpenAI Integration**: AI-generated responses using the OpenAI API
- **Reactive Programming**: RxJS for handling asynchronous data streams
- **Type Safety**: Built with TypeScript for enhanced security and maintainability

## 🛠️ Technologies Used

### Backend
- **Node.js** with **Express**
- **TypeScript** for static typing
- **OpenAI API** for response generation
- **Server-Sent Events** for real-time communication
- **AG UI** for protocol encoding

### Frontend
- **Next.js** with **React**
- **RxJS** for reactive programming
- **TypeScript** for static typing
- **Server-Sent Events** for real-time updates

## 🏗️ Project Structure

```
counter-sse/
├── back/               # Backend
│   ├── server.ts       # Main server
│   ├── package.json    # Dependencies
│   └── ...
├── client/             # Frontend
│   ├── app/            # Routes
│   ├── components/     # React components
│   ├── lib/            # Utilities
│   └── ...
└── README.md          # Documentation
```

## 🚀 Installation

1. Clone the repository
   ```bash
   git clone [REPOSITORY_URL]
   cd counter-sse
   ```

2. export OPENAI_API_KEY=your_openai_api_key

3. Install dependencies
   ```bash
   # Install backend dependencies
   cd back
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

4. Start the servers
   ```bash
   # In one terminal (backend)
   cd back
   npm start
   
   # In another terminal (frontend)
   cd client
   npm run dev
   ```

5. Open in your browser
   ```
   http://localhost:3000
   ```
