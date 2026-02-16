# 🛡️ Smart Attendance-Record System (Biometric-V1.2)

An enterprise-grade, biometric-first attendance tracking system designed for high-security environments. Featuring real-time facial verification, anti-spoofing liveness detection, and geofenced access protocols.

## 🚀 Vision
To provide a seamless, un-spoofable attendance experience that ensures personnel are physically present at the office while accurately tracking performance metrics and automating financial distribution.

---

## ✨ Core Features

### 1. Biometric Scanner & Identity HUD
*   **Automatic Identification**: Instantly identifies personnel as they enter the scanner frame.
*   **Liveness Detection**: Anti-spoofing technology requiring a deliberate blink to confirm human presence.
*   **Biometric HUD**: High-tech telemetry display showing EAR (Eye Aspect Ratio) and scanner status in real-time.

### 2. Secure Access Protocols
*   **Geofencing**: Restricts check-ins and check-outs to specifically defined office coordinates (Cambodia HQ).
*   **Identity Document Card**: A futuristic dashboard card displaying official employee records, photos, and designations.

### 3. Operational Intelligence
*   **Cross-Day Logic**: Intelligent handling of overnight shifts (Night Shifts) and "forgotten" check-outs.
*   **Auto-Cleanup**: Automatically closes stale sessions from previous days at 23:59:59 to maintain report integrity.
*   **Workforce Analytics**: Advanced metrics on system efficiency, workforce activity, and departmental compliance.

### 4. Financial & localized Systems
*   **Cambodia Sync**: Entire system (Backend & Frontend) synchronized to `Asia/Phnom_Penh` (ICT) timezone.
*   **Payroll Liquidity**: Automated batch disbursement and payslip generation.
*   **Intelligence Export**: Professional PDF and CSV report generation for all attendance and financial data.

---

## 🛠️ Tech Stack

### Frontend (Next.js 14 + TS)
- **Styling**: Tailwind CSS (Glassmorphism & Cyber-vibrant aesthetic).
- **Animations**: Framer Motion & Lucide React.
- **Biometrics**: Face-api.js for client-side face detection and descriptor extraction.
- **State Management**: React Hooks with real-time Socket.IO synchronization.

### Backend (Node.js + Express)
- **Database**: MongoDB (Mongoose) for persistent records.
- **Caching**: Redis for session speed and rate-limiting.
- **Security**: JWT Authentication, Helmet, and aggressive CORS enforcement.
- **Face API**: Custom high-performance `fast-face-api` wrapper for server-side verification.

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB & Redis instances running.

### Installation
1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    # Configure .env with MONGO_URI, REDIS_URL, etc.
    npm run dev
    ```

3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 🔍 Verification Protocol Logic
The system follows a three-step security handshake:
1.  **Detection**: Face is located and ID is retrieved from the biometric database.
2.  **Liveness**: User must perform a 'Blink' (EAR < 0.25) to satisfy the sub-dermal pulse check.
3.  **Geofence**: The system cross-references GPS telemetry against office boundaries before finalizing the record.

---

## 📄 License
Secure Access Protocol - Internal Use Only.
Designed with ❤️ in Cambodia.
