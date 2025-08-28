<div align="center">

# ✈️ AIRNAV Aircraft Tracker DUMMY

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=24&duration=3000&pause=1000&color=0EA5E9&center=true&vCenter=true&multiline=true&width=700&height=100&lines=Real-time+Aircraft+Surveillance+System;Admin+Panel+%26+Flight+Tracker+Integration" alt="Typing SVG" />

[![Deploy Status](https://img.shields.io/badge/Deploy-v1.1-success?style=for-the-badge&logo=rocket)](https://github.com/ihsanlanavalenza/Interasi-migrate-Plane-Tracker-DUMMY-)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Built with](https://img.shields.io/badge/Built%20with-❤️-red?style=for-the-badge)](https://github.com/ihsanlanavalenza)

</div>

---

## 🚀 About This DUMMY Project

> **⚠️ DISCLAIMER: This is a DUMMY/SIMULATION project for educational and demonstration purposes only.**

This project is a **merged integration** of two aviation systems:
- 🛡️ **Admin Panel** - User management and system administration
- ✈️ **Flight Tracker** - Real-time aircraft surveillance and monitoring

**What makes it DUMMY:**
- 📡 Uses simulated aircraft data (no real radar connection)
- 🌐 WebSocket connections to mock data sources
- 🎯 Designed for learning, testing, and portfolio demonstration
- 🔒 Authentication system with dummy credentials
- 📊 Sample airspace data for Indonesian FIR/TMA/CTR zones

## 🛠️ Tech Stack

<div align="center">

### Frontend Framework
<img src="https://img.shields.io/badge/Nuxt.js-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white" alt="Nuxt.js" />
<img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />

### Styling & UI
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />

### State Management & Data
<img src="https://img.shields.io/badge/Pinia-FFD859?style=for-the-badge&logo=vue.js&logoColor=black" alt="Pinia" />
<img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=websocket&logoColor=white" alt="WebSocket" />

### Maps & Visualization
<img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet" />
<img src="https://img.shields.io/badge/Cesium-48B14C?style=for-the-badge&logo=cesium&logoColor=white" alt="Cesium" />
<img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />

### Development Tools
<img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git" />
<img src="https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="VSCode" />

</div>

## 📁 Project Structure

```
🏗️ AIRNAV-DUMMY/
├── 🎨 assets/css/                 # Stylesheets & animations
├── 🧩 components/
│   ├── adm-*.vue                  # Admin panel components
│   ├── trk-*.vue                  # Tracker components
│   ├── icons/                     # SVG icons
│   └── skeleton/                  # Loading skeletons
├── 🔧 composables/
│   ├── useAuth.ts                 # Authentication logic
│   ├── useTrk-*.js               # Tracker utilities
│   └── useAirspace.js            # Airspace management
├── 🎯 layouts/
│   ├── adm-auth.vue              # Auth layout
│   └── adm-default.vue           # Main layout
├── 📄 pages/
│   ├── admin/                     # Admin routes
│   ├── tracker/                   # Tracker routes
│   └── index.vue                  # Landing page
├── 🔌 plugins/                    # Nuxt plugins
├── 📊 public/data/               # Dummy airspace data
├── 🎮 stores/                    # Pinia stores
└── ⚙️ server/api/                # API endpoints
```

## 🚀 Quick Start

### Prerequisites
<img src="https://img.shields.io/badge/Node.js-v18+-43853D?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/NPM-v8+-CB3837?style=flat-square&logo=npm&logoColor=white" alt="NPM" />

### Installation

```bash
# 📥 Clone the repository
git clone https://github.com/ihsanlanavalenza/Interasi-migrate-Plane-Tracker-DUMMY-.git

# 📂 Navigate to project directory
cd Interasi-migrate-Plane-Tracker-DUMMY-

# 📦 Install dependencies
npm install
# or
pnpm install
# or
yarn install

# 🔧 Setup environment variables
cp .env.example .env
```

### Environment Configuration

Create a `.env` file in the root directory:

```bash
# 🌐 API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:4000
NUXT_PUBLIC_WS_BASE=ws://localhost:4000/socket

# 📡 Mock Data Sources (DUMMY)
TCP_HOST=172.20.57.156
TCP_PORT=30003
AMQP_HOST=localhost
AMQP_PORT=5673

# 🔒 Security (DUMMY credentials)
API_SECRET=dummy-secret-key

# 🎯 Application
NUXT_PUBLIC_APP_NAME=AIRNAV Aircraft Tracker DUMMY
NUXT_PUBLIC_APP_DESCRIPTION=A dummy aircraft tracking system
```

### 🏃‍♂️ Running the Application

```bash
# 🔥 Development mode
npm run dev

# 🏗️ Build for production
npm run build

# 🚀 Start production server
npm run start

# 📊 Generate static site
npm run generate
```

Visit `http://localhost:3000` to see the application in action! 🎉

## 🎯 Features

<div align="center">

| Feature | Status | Description |
|---------|--------|-------------|
| 🛡️ **Admin Dashboard** | ✅ | User management and system administration |
| ✈️ **Flight Tracker** | ✅ | Real-time aircraft monitoring (simulated) |
| 🗺️ **2D/3D Maps** | ✅ | Leaflet & Cesium integration |
| 📊 **Airspace Data** | ✅ | Indonesian FIR/TMA/CTR visualization |
| 🔒 **Authentication** | ✅ | JWT-based auth system |
| 📱 **Responsive UI** | ✅ | Mobile-friendly interface |
| 🌐 **WebSocket** | ✅ | Real-time data streaming |
| 🎨 **Animations** | ✅ | Smooth transitions and effects |

</div>

## 🔐 Dummy Authentication

**Default Login Credentials:**
- **Username:** `admin@airnav.dummy`
- **Password:** `dummy123`

> ⚠️ **Note:** These are dummy credentials for demonstration only.

## 📊 Sample Data

The application includes dummy data for:
- ✈️ Aircraft positions and flight paths
- 🗺️ Indonesian airspace boundaries (FIR, TMA, CTR, etc.)
- 📡 Radar coverage simulation
- 👥 User accounts and roles
- 📈 Flight statistics and metrics

## 🤝 Contributing

Contributions are welcome! This dummy project can be extended with:

1. 🔀 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🎯 **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🛡️ Indonesian AIRNAV for airspace data inspiration
- 🗺️ OpenStreetMap for map tiles
- ✈️ Aviation community for technical insights
- 🎨 Tailwind CSS for beautiful styling

---

<div align="center">

**⚠️ REMEMBER: This is a DUMMY project for educational purposes only!**

Made with ❤️ for learning and demonstration

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=16&duration=2000&pause=1000&color=0EA5E9&center=true&vCenter=true&width=500&lines=Happy+Coding!+%F0%9F%9A%80;Keep+Learning!+%F0%9F%93%9A;Build+Amazing+Things!+%E2%9C%A8" alt="Footer Typing SVG" />

</div>
