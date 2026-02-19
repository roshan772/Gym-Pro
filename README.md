#  GymPro Admin Management System

A professional gym management desktop application built with **Electron**, **React**, **SQLite**, and **Hikvision** fingerprint device integration.



##  Features

### 👥 Member Management
-  Add, edit, and delete members
-  Track membership types (1 month, 3 months, 1 year)
-  Automatic expiry date calculation
-  Member search and filtering
-  Fingerprint ID assignment

###  Access Control
-  Admin and Sub-Admin roles
-  Permission-based access control
-  Secure login with bcrypt encryption

### 📍 Attendance Tracking
-  Fingerprint-based check-in/check-out
-  Automatic duration calculation
-  Real-time attendance monitoring
-  Hikvision DS-K1T8003EF integration

###  Payment Management
-  Record membership payments
-  Track renewal payments
-  Payment type categorization
-  Daily and monthly revenue tracking

###  Reports & Analytics
-  Dashboard with key metrics
-  Revenue charts (last 6 months)
-  Member statistics
-  Attendance reports
-  Monthly financial reports

###  Expired Member Alerts
-  Automatic member blocking on expiry
-  WhatsApp notification system (manual)
-  Pre-written reminder messages
-  One-click message copy

## 🚀 Tech Stack

- **Frontend:** React 18, React Router
- **Desktop:** Electron, Electron Forge
- **Database:** SQLite (better-sqlite3)
- **Styling:** Tailwind CSS v4, Custom CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Authentication:** bcrypt.js
- **Build Tool:** Vite

##  Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/gym-management-system.git
cd gym-management-system
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development:**
```bash
npm start
```

4. **Build for production:**
```bash
npm run make
```

The built app will be in the `out/` folder.

##  Default Login
```
Email: admin@gym.com
Password: admin123
```

 

3. **Enable real-time polling:**
   - Device automatically sends scan events
   - App blocks access for expired members
   - Attendance logged automatically

### API Used
- **ISAPI HTTP API** for device communication
- **Automatic event polling** every 3 seconds
- **Access control** via HTTP REST API

## 👥 User Roles
 Full access to all features
 Manage sub-admins
 View all reports and revenue
 Access settings

### Sub-Admin
 Add members
 Add payments
 View attendance
 Scan fingerprints
 View reports
 Manage settings
 Delete members

## 📁 Project Structure
```
gym-management-system/
├── src/
│   ├── components/        # React components
│   │   ├── Modal.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatCard.jsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── database/          # Database logic
│   │   ├── db.js          # SQLite operations
│   │   ├── hikvision.js   # Device integration
│   │   └── attendancePoller.js
│   ├── pages/             # App pages
│   │   ├── Dashboard.jsx
│   │   ├── Members.jsx
│   │   ├── AddMember.jsx
│   │   ├── MemberDetail.jsx
│   │   ├── Attendance.jsx
│   │   ├── Payments.jsx
│   │   ├── Reports.jsx
│   │   ├── Settings.jsx
│   │   ├── AdminManagement.jsx
│   │   ├── ExpiredAlerts.jsx
│   │   └── Login.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── main.js            # Electron main process
│   ├── preload.js
│   └── renderer.jsx
├── forge.config.js
├── package.json
└── vite.*.config.mjs
```

## 🎨 Features Preview

### Dashboard
- Real-time member statistics
- Revenue charts
- Quick action buttons
- Recent members list

### Member Management
- Advanced search and filtering
- Status badges (Active/Expired/Blocked)
- One-click renewal
- Fingerprint assignment

### Attendance System
- Live fingerprint scanning
- Entry/Exit tracking
- Duration calculation
- Filter by date

### Payment Tracking
- Multiple payment types
- Automatic receipt generation
- Revenue analytics
- Export capabilities

##  Security

-  Passwords hashed with bcrypt (10 rounds)
-  Role-based access control (RBAC)
-  SQL injection prevention (prepared statements)
-  Session-based authentication
-  Secure IPC communication (contextIsolation)

## 📄 Database Schema
```sql
admins (id, name, email, password, role, created_at)
members (id, full_name, phone, address, membership_type, start_date, 
         expiry_date, membership_fee, fingerprint_id, status, blocked, 
         notification_sent, deleted, created_at)
attendance (id, member_id, date, entry_time, exit_time, duration_minutes)
payments (id, member_id, amount, payment_date, payment_type, notes)
```

##  Known Issues

- Fingerprint device requires local network access
- Database file stored in AppData (backup manually)
- WhatsApp notifications are manual (no Twilio integration)

##  Future Enhancements

- [ ] Automated WhatsApp API integration
- [ ] Cloud backup system
- [ ] Mobile app companion
- [ ] Biometric photo capture
- [ ] Multi-gym branch support
- [ ] Member mobile app for self-check-in
- [ ] Equipment tracking
- [ ] Trainer scheduling

##  License

This project is private and proprietary.

##  Developer

**Roshan**  


---

 **Star this repo if you found it useful!**