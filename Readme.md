# PrintQueue 🖨️

### Smart Printing Queue Management and Waiting-Time Estimation System
**Campus Photocopy & Print Center · NIT Jamshedpur**

**PrintQueue** is a full-stack MERN application designed to eliminate long, unpredictable waiting lines and chaotic manual order handling at college printing and photocopy shops. It provides a real-time digital queue, waiting-time estimations calibrated from empirical fieldwork data, secure shopkeeper operations, multi-document student order submissions with server-side PDF page detection, and transparent price calculations.

**GitHub Repository:** [anuragsharma2512/Print-Queue](https://github.com/anuragsharma2512/Print-Queue)

---

## 🎬 Project Demo Video

> 📺 **Watch the Full Walkthrough & Demonstration:**  
> **Video Link:** [Click here to watch the PrintQueue Demo Video](https://drive.google.com/file/d/1iLxRTe_S4gEFME7GHHCIO7VBVTcoSlBK/view?usp=drive_link)
>

---

## 📌 Problem & Fieldwork Backing

Students at NIT Jamshedpur frequently experience unpredictable wait times, particularly during peak class-rush hours (**8:30 AM – 9:30 AM** before morning lectures and **6:00 PM** in the evening). The campus photocopy shopkeeper traditionally managed counter walk-ins and incoming WhatsApp orders manually on paper or by memory, leading to lost documents, unclear turnarounds, and overcrowded counters.

Fieldwork conducted on **17 November 2026** at the campus shop produced **20 real printing job records** (`data.csv`), establishing empirical baseline durations:
- **B&W Printout / Xerox:** ~69s – 76s
- **Colour Printout / Colour Xerox:** ~85s – 90s
- **Counter Operating Hours:** 8:00 AM – 8:00 PM daily

---

## ✨ Features

### 🧑‍🎓 1. Student Portal (Public Interface)
- **Live Queue & Wait Time:** Real-time visibility into the queue backlog, currently printing orders, and estimated wait times.
- **Operating Hours Status:** Dynamic status badges reflecting counter hours (**8:00 AM – 8:00 PM**), alerting students when the shop is open, closing soon, or after hours.
- **Multi-Document Printing Order Submission:**
  - Submit multiple PDF documents in a single consolidated order (up to 10 files per batch).
  - Direct PDF file upload with drag-and-drop and "+ Add Another PDF" capability.
  - Server-side PDF page-count detection powered by `pdf-parse`.
  - Independent customization per document: select printing type (*Xerox*, *Colour Xerox*, *B&W Printout*, *Colour Printout*) and copies.
- **Student Identification & Privacy:**
  - Enter Student Name and WhatsApp / Contact Number for counter pickup coordination.
  - Privacy-preserving public tracking: student phone numbers are automatically masked (`******3210`) so personal details are never exposed to public onlookers.
- **Transparent Price Calculation:**
  - Itemized subtotal per document and consolidated grand total before submission.
  - Mandatory offline payment agreement acknowledging the exact amount payable at the shop counter.
- **Post-Submission Receipt & Tracking:**
  - Unique Master Order ID (e.g. `PQ-050`) generated with one-click copy.
  - Options to immediately **"+ Submit Another Printing Order"** or **"Done & View Queue"**.
  - Real-time order tracking modal to check status from submission through completion.
- **Interactive Turnaround Calculator:**
  - Simulate printing turnaround before queuing based on job type and page count.

---

### 🧑‍🔧 2. Shopkeeper Console (Protected Management Portal)
- **Backend Authentication & Security:**
  - Protected with `bcrypt` PIN hashing (`SHOPKEEPER_PIN_HASH`) and 8-hour HttpOnly JWT cookies.
  - Route guards on all sensitive APIs and client-side routes.
  - Session restoration on browser refresh via `/api/auth/me`.
  - Explicit **"Lock Dashboard & Switch to Student View"** action that invalidates the session cookie before returning to the student interface.
- **Zero-Drag Responsive Queue Table:**
  - Full-width modern table layout (`max-w-7xl`) engineered so the shopkeeper can view the **entire row at a glance without horizontal scrolling or dragging**.
  - Displays Position `#`, Job ID, Student Name & Phone, Itemized Documents with individual PDF download buttons, Total Pages, Payment Status (`PENDING`/`PAID`), Channel, Arrival Time, Status Badge, and Immediate Action Controls.
- **Forward-Only Queue Dispatch:**
  - Step-by-step job progress lifecycle (`Pending` $\rightarrow$ `Processing` $\rightarrow$ `Completed`) preventing accidental state reversal.
- **Secure Multi-Document Download:**
  - Authenticated streaming of student PDFs directly from server storage (`/api/student-orders/:jobId/document/:fileIndex`). Public access is strictly forbidden (HTTP 401).
- **Counter & Walk-in Order Entry:**
  - Fast-entry form for counter walk-ins and direct WhatsApp requests.
- **Completed Records History:**
  - Dedicated historical audit log recording actual service durations and completion timestamps.

---

## 💵 Official Campus Printing Rates

Configured centrally on the backend in `server/services/pricingService.js`:

| Printing Type | Rate per Page |
|---|---:|
| **Xerox** | ₹2 |
| **Colour Xerox** | ₹5 |
| **Black & White Printout** | ₹3 |
| **Colour Printout** | ₹8 |

$$\text{Item Total Pages} = \text{PDF Pages} \times \text{Copies}$$
$$\text{Item Price} = \text{Item Total Pages} \times \text{Price Per Page}$$
$$\text{Consolidated Grand Total} = \sum \text{Item Price}$$

---

## 🔒 Security Architecture

- **PIN Security:** The shopkeeper PIN is never stored in plain text or hardcoded. It is verified using salted `bcrypt` hashes (`SHOPKEEPER_PIN_HASH`) on the backend.
- **JWT & HttpOnly Cookies:** Authentication tokens are stored in `HttpOnly`, `SameSite=Lax` cookies, preventing XSS-based token theft.
- **API Protection:** All management endpoints (`/api/jobs/*`, `/api/student-orders/:jobId/document/*`) require the `protectShopkeeper` middleware.
- **Brute-Force Rate Limiting:** `express-rate-limit` prevents brute-force PIN guessing on `/api/auth/login` and spam submissions on `/api/student-orders`.
- **HTTP Hardening:** `helmet` sets secure HTTP response headers against clickjacking, sniffing, and cross-site injections.
- **Document Protection:** Uploaded PDFs are stored outside public web roots (`server/uploads/documents/`) with randomized filenames. Only authenticated shopkeepers can stream or download files.
- **Input Validation:** Strict verification of MIME types (`application/pdf`), file size limits (10 MB), and phone number formats.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, Axios.
- **Backend:** Node.js, Express.js (MVC + Service Layer Architecture).
- **Database:** MongoDB & Mongoose.
- **Security:** bcryptjs, jsonwebtoken, cookie-parser, express-rate-limit, helmet.
- **Document Processing:** multer, pdf-parse.

---

## 📁 Repository Structure

```text
Print-Queue/
├── client/                      # React frontend application
│   ├── src/
│   │   ├── components/          # StudentOrderModal, TrackOrderModal, QueueTable, etc.
│   │   ├── context/             # AuthContext (backend-verified session state)
│   │   ├── pages/               # StudentPage, DashboardPage
│   │   ├── services/            # Axios API client with withCredentials: true
│   │   └── lib/                 # Shop hours, status logic, formatters, and utilities
│   ├── index.html
│   └── vite.config.js           # Vite configuration with @tailwindcss/vite
│
├── server/                      # Node.js + Express backend application
│   ├── config/                  # MongoDB connection (db.js)
│   ├── controllers/             # authController, studentOrderController, jobController, etc.
│   ├── middleware/              # authMiddleware, uploadMiddleware, rateLimitMiddleware
│   ├── models/                  # Job.js (Mongoose schema with multi-item support)
│   ├── routes/                  # authRoutes, studentOrderRoutes, jobRoutes, queueRoutes
│   ├── services/                # pricingService.js, pdfService.js, predictionService.js
│   ├── uploads/                 # Secure storage for uploaded student PDFs (git-ignored)
│   ├── seed.js                  # Database seeder using data.csv
│   ├── test_all_features.js     # Comprehensive 45-test automated verification suite
│   ├── server.js                # Server entry point
│   └── .env.example             # Template for environment variables
│
├── data.csv                     # 20 real fieldwork records from NIT Jamshedpur
├── fieldwork.md                 # Fieldwork documentation and interview details
├── research.md                  # Problem research and solution analysis
├── reflection.md                # Personal project reflection and learning experience
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI.

### 1. Backend Setup
```bash
cd server
npm install
```

Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/printqueue
SHOPKEEPER_PIN_HASH=$2b$10$kXyvSNGgKy4gshRT.s8CJ.Kgzpmrn2k.MvDSVLbHnfpei8PejSKkq
JWT_SECRET=your_random_64_char_jwt_secret_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(The default pin hash in the example corresponds to PIN `1234`)*

Seed the 20 empirical fieldwork records:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
In a separate terminal:
```bash
cd client
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Automated Testing & Verification

The backend includes a comprehensive automated test suite verifying pricing calculations, authentication guards, multi-material uploads, phone masking, and status lifecycles:

```bash
cd server
npm run test:full
```

### Test Suite Results (45 / 45 Passed):
- ✅ **Official Pricing Tests:** Verified rates across Xerox, Colour Xerox, B&W Printout, and Colour Printout with various page counts and copies.
- ✅ **Backend Authentication:** Incorrect PIN rejection (401), valid login session (200), HttpOnly cookie issuance, session check (`/api/auth/me`), and logout.
- ✅ **Route Guards:** Unauthenticated access to `/api/jobs` blocked (401) vs. authenticated access allowed (200).
- ✅ **Single & Multi-PDF Processing:** Server page detection via `pdf-parse`, MIME validation, and non-PDF rejection.
- ✅ **Student Identity:** Student name and phone number storage, validation, and privacy masking (`******3210`) on public tracking.
- ✅ **Multi-Document Orders:** Multiple PDFs in a single order, itemized pricing, consolidated grand total, and individual document streaming (`/api/student-orders/:jobId/document/:fileIndex`).
- ✅ **Secure Document Storage:** Public document download blocked (401); authenticated shopkeeper download allowed (200 PDF).
- ✅ **Queue Lifecyle:** Forward-only state transitions (`Pending` $\rightarrow$ `Processing` $\rightarrow$ `Completed`).

---

## 📄 License
Developed for academic and educational purposes at NIT Jamshedpur.
