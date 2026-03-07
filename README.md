# 💬 Nex-Chat — Real-Time Messaging App

A full-stack real-time chat application built with React, Node.js, Socket.io, and MongoDB. Supports direct messaging, group channels, file sharing, and live updates — all secured with JWT authentication.

---

## ✨ Features

- **Real-time messaging** — Instant send/receive via WebSockets (Socket.io)
- **Direct messages** — Search users and start one-on-one conversations
- **Group channels** — Create and manage multi-user channels
- **File sharing** — Upload and send files in chat
- **User authentication** — Secure register/login with JWT & bcrypt
- **Profile management** — Set avatars and update personal info
- **Live contact updates** — Real-time notifications for new messages and contacts

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js + Vite | UI framework & build tool |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible, composable UI components |
| Zustand | Global state management |
| Socket.io-client | Real-time communication |
| Axios | HTTP client |
| Lottie | Animations |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | Server & REST API |
| Socket.io | WebSocket server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcrypt | Password hashing |
| Multer | File uploads |

---

## 📁 Project Structure

```
.
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── components/         # Shared components (shadcn/ui + custom)
│       ├── context/            # SocketContext for real-time events
│       ├── pages/
│       │   ├── auth/           # Login & registration
│       │   ├── chat/           # Main chat UI
│       │   │   └── components/
│       │   │       ├── chat_container/     # Message view, header, input bar
│       │   │       ├── contacts-container/ # Sidebar: DMs, channels, profile
│       │   │       └── contact-info-panel/ # Contact details panel
│       │   └── profile/        # User profile editor
│       ├── routes/             # AuthRoute & PrivateRoute guards
│       ├── store/              # Zustand slices (auth, chat)
│       └── lib/                # API client & utilities
│
└── server/                     # Node.js backend
    ├── controllers/            # Auth, Channel, Contacts, Message logic
    ├── middlewares/            # JWT auth middleware
    ├── models/                 # Mongoose schemas (User, Message, Channel)
    ├── routes/                 # Express route definitions
    ├── socket.js               # Socket.io event handlers
    └── server.js               # Entry point
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB instance (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/Harsh-Kumar-Pandit/Nex-Chat-Real-Time-Chatting.git
cd Nex-Chat-Real-Time-Chatting
```

### 2. Configure environment variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ORIGIN=http://localhost:5173
```

### 3. Start the backend
```bash
cd server
npm install
npm start
```

### 4. Start the frontend
```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🚀 Usage

1. **Register** a new account or **log in** with existing credentials
2. **Search for users** to start a direct message conversation
3. **Create a channel** for group conversations via the sidebar
4. **Send messages** by typing in the message bar and pressing Enter
5. **Share files** using the attachment button in the message bar
6. **Update your profile** — set a display name and avatar from the profile page

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

## 📬 Contact

For questions or suggestions, feel free to open an issue on [GitHub](https://github.com/Harsh-Kumar-Pandit/Nex-Chat-Real-Time-Chatting/issues).
