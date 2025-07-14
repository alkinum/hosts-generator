# 🌐 Hosts Generator

A modern, terminal-inspired web application for **circumventing DNS pollution and domain blocking** by resolving domain names to their actual IP addresses using secure DNS over HTTPS (DoH) providers.

**Perfect for bypassing regional restrictions, DNS censorship, and network-level domain blocking.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

## 🚀 Why Hosts Generator?

### 🔓 **Bypass DNS Pollution & Censorship**
- **DNS Pollution**: When ISPs or governments return false IP addresses for blocked domains
- **Regional Restrictions**: Access services that are geographically blocked
- **Corporate Firewalls**: Bypass network-level domain blocking
- **ISP Censorship**: Circumvent DNS-based content filtering

### 🛡️ **Secure DNS Resolution**
- Uses **DNS over HTTPS (DoH)** to prevent DNS tampering
- Multiple trusted providers: Cloudflare, Google, Quad9, Brave DNS
- Encrypted DNS queries to avoid interception
- Direct IP resolution bypasses local DNS servers

### 🎯 **Common Use Cases**
- **Microsoft Services**: Office 365, Xbox Live, OneDrive, Teams
- **GitHub & Development**: GitHub, GitLab, npm, Docker Hub
- **Gaming Platforms**: Steam, Epic Games, PlayStation Network
- **Social Media**: Twitter, Facebook, Instagram (in restricted regions)
- **Cloud Services**: AWS, Google Cloud, Azure
- **Communication Tools**: Discord, Slack, Zoom

## ✨ Features

### 🔥 **Anti-Censorship & DNS Pollution Bypass**
- **Secure DNS Resolution**: Uses DNS over HTTPS (DoH) to prevent DNS tampering and pollution
- **Multiple DoH Providers**: Cloudflare, Google, Quad9, and Brave DNS for reliability
- **Direct IP Mapping**: Generate hosts files that bypass local DNS entirely
- **Regional Unlock**: Access geo-blocked services and websites
- **Corporate Bypass**: Circumvent workplace network restrictions

### 🚀 **Core Functionality**
- **Real-time DNS Resolution**: Resolve blocked domains to their actual IP addresses
- **Hosts File Generation**: Create properly formatted hosts files for immediate use
- **Batch Processing**: Resolve multiple domains concurrently with progress tracking
- **Domain Validation**: Comprehensive validation for domain names and hosts file entries
- **Export Options**: Download hosts files or copy to clipboard for easy deployment

### 🎨 User Interface
- **Terminal-Inspired UI**: Retro terminal aesthetic with animated typing effects
- **Dark Theme**: Modern dark theme with green terminal colors
- **Responsive Design**: Works on desktop and mobile devices
- **Minimizable Window**: macOS-style window controls with minimize functionality
- **Real-time Progress**: Live terminal output showing resolution progress

### 📋 Data Management
- **Preset System**: Load domain lists from external JSON sources
- **History Tracking**: Save and browse previous resolution sessions
- **IndexedDB Storage**: Client-side storage for history and settings
- **Export Options**: Download hosts files or copy to clipboard

### 🌍 Internationalization
- **Multi-language Support**: Built-in i18n with language detection
- **Customizable Settings**: User preferences and configuration options

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Storage**: IndexedDB for client-side data persistence
- **Validation**: Zod for schema validation
- **Icons**: Lucide React
- **Testing**: Vitest with React Testing Library
- **DNS Resolution**: DNS over HTTPS (DoH) with multiple provider support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/alkinum/hosts-generator.git
cd hosts-generator

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser and navigate to http://localhost:5173
```

### Build for Production

```bash
# Build the application
npm run build

# Preview the built application
npm run preview
```

## 📖 Usage

### 🔓 **Bypassing DNS Pollution & Censorship**
1. **Enter Blocked Domains**: Type or paste domains that are blocked or polluted (e.g., `github.com`, `microsoft.com`, `xbox.com`)
2. **Select Trusted DNS Provider**: Choose a secure DoH provider (Cloudflare recommended for reliability)
3. **Resolve Real IPs**: Click "Resolve Domains" to get actual IP addresses bypassing local DNS
4. **Generate Hosts File**: Download the generated hosts file with direct IP mappings
5. **Deploy**: Add the hosts file to your system to bypass DNS pollution

### 🛠️ **System Integration**
- **Windows**: Place hosts file in `C:\Windows\System32\drivers\etc\hosts`
- **macOS/Linux**: Place hosts file in `/etc/hosts`
- **Android** (root): `/system/etc/hosts`
- **iOS** (jailbreak): `/etc/hosts`

### 📋 **Quick Start for Common Blocked Services**
```
# Example domains to resolve
github.com
microsoft.com
xbox.com
office.com
outlook.com
teams.microsoft.com
login.microsoftonline.com
```

### Advanced Features

#### Using Presets
1. Go to Settings (gear icon in header)
2. Enter a preset source URL (see [Preset Source Documentation](./docs/PRESET_SOURCE.md))
3. Select presets from the dropdown in the input panel

#### Managing History
1. Click the history icon in the header
2. Browse previous resolution sessions
3. Load previous inputs or download previous results
4. Clear history when needed

#### Customization Options
- **Include Localhost**: Add standard localhost entries to hosts file
- **Remove Comments**: Generate clean hosts file without comments
- **Provider Selection**: Choose from Cloudflare, Google, Quad9, or Brave DNS

## 🔧 Configuration

### Supported DNS Providers
- **Cloudflare**: `https://cloudflare-dns.com/dns-query`
- **Google**: `https://dns.google/resolve`
- **Quad9**: `https://dns.quad9.net:5053/dns-query`
- **Brave DNS**: `https://dns.brave.com/dns-query`

### Domain Input Formats
The application supports multiple input formats:
- **Plain domains**: `example.com`
- **Hosts file entries**: `127.0.0.1 example.com`
- **Mixed formats**: Combine both in the same input
- **Comments**: Lines starting with `#` are ignored

### Validation Rules
- Domains must be valid according to RFC standards
- No pure numbers (e.g., `123`)
- No domains starting with numbers
- Maximum domain length: 253 characters
- Proper hostname format required

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run linting
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── BackgroundEffects.tsx
│   ├── HeaderBar.tsx
│   ├── InputPanel.tsx
│   ├── PresetDropdown.tsx
│   ├── PreviewSection.tsx
│   ├── SettingsModal.tsx
│   ├── TerminalOutput.tsx
│   └── HistorySidebar.tsx
├── hooks/              # Custom React hooks
│   ├── useDNSResolver.ts
│   └── useTerminal.ts
├── utils/              # Utility functions
│   ├── constants.ts
│   ├── indexedDB.ts
│   ├── presets.ts
│   ├── settings.ts
│   └── validation.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── test/               # Test files
│   ├── validation.test.ts
│   ├── indexedDB.test.ts
│   └── HeaderBar.test.tsx
└── App.tsx             # Main application component
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by classic terminal interfaces
- Icons provided by [Lucide React](https://lucide.dev/)
- DNS over HTTPS providers for secure DNS resolution

## 📚 Documentation

- [Preset Source Documentation](./docs/PRESET_SOURCE.md) - Learn how to create and use preset sources
- [API Reference](./docs/API.md) - Detailed API documentation (coming soon)

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/alkinum/hosts-generator/issues) to report bugs or request features.

---

Made with ❤️ by [Alkinum](https://github.com/alkinum)