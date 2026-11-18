# PrintQueue 🖨️

### Smart Printing Queue Management and Waiting-Time Estimation System
**Campus Photocopy & Print Center · NIT Jamshedpur**

**PrintQueue** is a full-stack MERN application that solves the problem of long, uncertain waiting lines at campus printing and photocopy shops. It provides an automated, digital queue, waiting-time estimation calibrated against real fieldwork data, secure shopkeeper operations, and online document upload with server-side price calculation.

**GitHub Repository:** [anuragsharma2512/Print-Queue](https://github.com/anuragsharma2512/Print-Queue)

---

## 📌 Problem & Fieldwork Backing

Students at NIT Jamshedpur frequently experience unpredictable wait times, especially during morning peak rush (**8:30 AM – 9:30 AM**) and evening rush (**6:00 PM**). The shopkeeper previously managed counter walk-ins and incoming WhatsApp orders manually on paper or memory.

Fieldwork conducted on **17 November 2026** at the campus shop produced **20 real printing job records** (`data.csv`), establishing empirical baseline durations:
- **B&W Printout / Xerox:** ~69s – 76s
- **Colour Printout / Colour Xerox:** ~85s – 90s

---

## ✨ Features

### 🧑‍🎓 1. Student Portal
- **Live Queue & Wait Time:** Real-time visibility into the queue backlog and estimated wait.
- **Operating Hours Status:** Dynamic status display reflecting counter operating hours (**8:00 AM – 8:00 PM**).
- **Online Printing Order Submission:**
  - Direct PDF document upload (up to 10 MB).
  - Server-side PDF page count detection (powered by `pdf-parse`).
  - Selection of official campus printing types and copies.
  - Transparent price calculation breakdown before submission.
- **Mandatory Payment Agreement:** Required acknowledgement checkbox agreeing to offline payment upon print collection.
- **Order Tracking:** Track submitted jobs in real time with unique Order IDs (e.g. `PQ-021`).
- **Interactive Turnaround Calculator:** Simulate printing time before queuing.

### 🧑‍🔧 2. Shopkeeper Console (Protected)
- **Backend Authentication:** Enforced via `bcrypt` PIN hashing and 8-hour HttpOnly JWT cookies.
- **Session Protection:** Route guards with auto-session restoration on page refresh and explicit **"Lock Console & Switch to Student View"** logout.
- **Queue Dispatch:** Forward-only status controls (`Pending` $\rightarrow$ `Processing` $\rightarrow$ `Completed`).
- **Secure Document Download:** Authenticated streaming of student PDFs directly from server storage.
- **Counter Order Entry:** Quick entry for walk-in and WhatsApp requests.
- **Historical Records:** Complete log of completed orders with measured durations.

---

## 💵 Official Campus Printing Rates

Configured centrally on the backend in `server/services/pricingService.js`:

| Printing Type | Rate per Page |
|---|---:|
| **Xerox** | ₹2 |
| **Colour Xerox** | ₹5 |
| **Black & White Printout** | ₹3 |
| **Colour Printout** | ₹8 |

$$\text{Total Pages} = \text{PDF Pages} \times \text{Copies}$$
$$\text{Estimated Amount} = \text{Total Pages} \times \text{Price Per Page}$$

---

## 🔒 Security Architecture

- **PIN Security:** Stored as a salted `bcrypt` hash (`SHOPKEEPER_PIN_HASH`). Never stored in plain text or exposed to frontend code.
- **JWT & HttpOnly Cookies:** Authentication tokens are stored in `HttpOnly`, `SameSite=Lax` cookies, preventing XSS token theft.
- **Rate Limiting:** `express-rate-limit` prevents brute-force PIN guessing on `/api/auth/login` and spam on `/api/student-orders`.
- **HTTP Hardening:** `helmet` sets secure HTTP response headers.
- **Document Protection:** Uploaded PDFs are stored outside public web roots (`server/uploads/documents/`) and can only be downloaded by an authenticated shopkeeper.
- **File Validation:** Strict verification of MIME types (`application/pdf`) and file size limits (10 MB).

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
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # StudentOrderModal, TrackOrderModal, QueueTable, etc.
│   │   ├── context/             # AuthContext (central backend session state)
│   │   ├── pages/               # StudentPage, DashboardPage
│   │   ├── services/            # Axios API client with withCredentials: true
│   │   └── lib/                 # Status, hours, formatters, and style utilities
│   ├── index.html
│   └── vite.config.js           # Includes @tailwindcss/vite
│
├── server/                      # Node.js + Express backend
│   ├── config/                  # MongoDB connection (db.js)
│   ├── controllers/             # authController, studentOrderController, jobController, etc.
│   ├── middleware/              # authMiddleware, uploadMiddleware, rateLimitMiddleware
│   ├── models/                  # Job.js (Mongoose schema)
│   ├── routes/                  # authRoutes, studentOrderRoutes, jobRoutes, queueRoutes
│   ├── services/                # pricingService.js, pdfService.js, predictionService.js
│   ├── uploads/                 # Secure storage for uploaded student PDFs (git-ignored)
│   ├── seed.js                  # Database seeder from data.csv
│   ├── test_all_features.js     # Comprehensive 31-test automated suite
│   ├── test_api.js              # Standard API test runner
│   ├── server.js                # Server entry point
│   └── .env.example
│
├── data.csv                     # 20 real fieldwork records from NIT Jamshedpur
├── fieldwork.md                 # Fieldwork documentation and interview details
├── research.md                  # Problem research and solution analysis
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string.

### 1. Clone & Setup Backend
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
*(The default pin hash corresponds to PIN `1234`)*

Seed the 20 empirical fieldwork records:
```bash
npm run seed
```

Start backend development server:
```bash
npm run dev
```

### 2. Setup Frontend
In another terminal:
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing

The backend includes a comprehensive automated test suite verifying pricing calculations, authentication guards, PDF parsing, payment agreements, and status transitions:

```bash
cd server
npm run test:full
```

**Test Coverage Summary:**
- ✅ Official pricing formulas across Xerox, Colour Xerox, B&W Printout, and Colour Printout.
- ✅ Correct vs. incorrect PIN authentication and HttpOnly cookie generation.
- ✅ Route protection on all shopkeeper-only endpoints.
- ✅ PDF document upload validation and page-count detection.
- ✅ Server-side price calculation verification.
- ✅ Mandatory payment agreement enforcement.
- ✅ Public order tracking and privacy checks (no leaked file paths).
- ✅ Authenticated document download for shopkeeper vs. 401 for public.
- ✅ Queue management and forward-only status transitions.

---

## 📄 License
Developed for academic and educational purposes at NIT Jamshedpur.
