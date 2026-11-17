
# PrintQueue 🖨️

### Smart Printing Queue Management and Waiting-Time Estimation System

**PrintQueue** is a web-based application designed to help campus photocopy and printing shops manage printing orders and estimate student waiting times.

The project addresses a common problem faced by students: long and uncertain waiting times at printing shops, especially during peak hours. It aims to make order management more organized and provide students with an estimated waiting time based on queue information and historical printing records.

**GitHub Repository:** [anuragsharma2512/Print-Queue](https://github.com/anuragsharma2512/Print-Queue)

---

## 📌 Problem Statement

Students visiting campus printing shops often face long queues and uncertain waiting times. The problem becomes more noticeable during busy periods when several students submit printing requests simultaneously.

Printing shops may receive orders through walk-in requests, WhatsApp, or email. Managing these orders manually can become difficult when multiple documents and printing jobs arrive together.

Students may have to wait for a long time, and some may leave the shop after seeing a crowded queue.

PrintQueue aims to address this problem through digital queue management and data-based waiting-time estimation.

---

## 🎯 Project Objectives

- Organize printing orders in a digital queue.
- Help shopkeepers manage pending and ongoing printing jobs.
- Track the status of each printing job.
- Estimate waiting and completion times using job details and historical records.
- Store completed job records for future analysis.
- Reduce uncertainty for students waiting for their printing jobs.

---

## ✨ Planned Features

### 1. Student Interface

- View the current printing queue.
- Check pending printing jobs and their status.
- View estimated waiting and completion times.
- Understand the progress of printing orders.

### 2. Shopkeeper Dashboard

- Add new printing jobs.
- View and manage the printing queue.
- Update job status:
  - Pending
  - Processing
  - Completed
- Record job details such as printing type and number of pages.
- Maintain a history of completed jobs.

### 3. Waiting-Time Estimation

- Consider the number of jobs ahead in the queue.
- Consider the type of printing job and number of pages.
- Analyze historical service durations.
- Estimate waiting time and expected completion time.

---

## 🔍 Fieldwork and Research

Fieldwork was conducted at the campus printing shop at **NIT Jamshedpur** on **17 November 2026**.

The fieldwork included:

- Interviewing the shopkeeper.
- Observing the queue and multiple incoming WhatsApp orders.
- Collecting 20 or more actual printing job records.
- Taking photographs as supporting fieldwork evidence.

### Findings from the Shopkeeper Interview

- The shop generally experiences high demand between **8:30 AM and 9:30 AM**.
- Another busy period occurs around **6:00 PM**.
- Most students provide documents when they arrive at the shop.
- Some students send documents through WhatsApp or email before arriving.
- Multiple PDFs may be submitted by a student.
- WhatsApp orders are generally handled in the order received.
- Walk-in orders are managed according to the shopkeeper's judgment and the situation.
- Students sometimes leave and return to their hostel after seeing a long queue.
- The shopkeeper reported that printing a PDF takes approximately one minute on average, although actual time varies depending on the job.

---

## 📊 Dataset and Analysis

The project includes a dataset collected during fieldwork.

**Dataset:** `data/fieldwork_records.csv`

The dataset contains **20 actual printing job records** collected at the campus printing shop.

### Dataset Fields

| Field | Description |
|---|---|
| Job ID | Unique identifier for each job |
| Arrival Time | Time when the job arrived |
| Service Start Time | Time when processing started |
| Service End Time | Time when processing finished |
| Job Type | B&W Print, Colour Print, or B&W Photocopy |
| Number of Pages | Number of pages in the job |
| Submission Method | Walk-in or WhatsApp |
| Queue Ahead | Number of jobs ahead in the queue |
| Waiting Time (sec) | Time spent waiting before processing |
| Service Time (sec) | Time taken to process the job |

### Dataset Summary

| Measurement | Result |
|---|---:|
| Total job records | 20 |
| B&W Print jobs | 11 |
| Colour Print jobs | 5 |
| B&W Photocopy jobs | 4 |
| Walk-in submissions | 13 |
| WhatsApp submissions | 7 |
| Average waiting time | 66.55 seconds |
| Median waiting time | 30 seconds |
| Maximum waiting time | 232 seconds |
| Average service time | 74.45 seconds |
| Median service time | 70.5 seconds |

### Morning and Evening Comparison

| Period | Number of Jobs | Average Waiting Time | Maximum Waiting Time |
|---|---:|---:|---:|
| Morning (08:30–09:30) | 12 | 56.25 seconds | 192 seconds |
| Evening (around 18:00) | 8 | 82 seconds | 232 seconds |

In this collected sample, the evening records had a higher average waiting time than the morning records.

**Note:** These statistics describe the 20 records collected on the fieldwork date. They should not be treated as a complete representation of the shop's workload on every day.

---

## 🧮 Waiting-Time Estimation Approach

The initial estimation method will use historical job records and current queue information.

A basic estimate can be calculated as:

**Estimated Waiting Time = Remaining Time of Current Job + Estimated Service Times of Jobs Ahead**

The estimated completion time for a new job can then be calculated as:

**Estimated Completion Time = Current Time + Estimated Waiting Time + Estimated Service Time of New Job**

Historical average or median service durations can be used to estimate the service time of pending jobs.

The estimation method can be evaluated and improved as more real job records become available.

---

## 🛠️ Technology Stack

The project is planned using the **MERN stack**.

| Technology | Purpose |
|---|---|
| MongoDB | Database for printing jobs and job history |
| Express.js | Backend API framework |
| React.js | Frontend user interface |
| Node.js | Backend JavaScript runtime |
| Mongoose | MongoDB object modeling |
| Tailwind CSS (optional) | Frontend styling |
| Recharts (optional) | Charts and statistics |
| Axios (optional) | Frontend API communication |

---

## 📁 Project Structure

The planned project structure is:

```text
Print-Queue/
│
├── client/                     # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.jsx
│
├── server/                     # Node.js and Express backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── data.csv
│
├── evidence/
│
├── research.md
├── fieldwork.md
├── README.md
└── .gitignore
```

This is the proposed structure and may change during development.

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js
- npm
- MongoDB (local installation or MongoDB Atlas account)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/anuragsharma2512/Print-Queue.git
cd Print-Queue
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the backend:

```bash
npm run dev
```

### 3. Set Up the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend development URL will be displayed in the terminal.

**Note:** These commands describe the intended setup. The necessary dependencies and scripts must be configured in the respective `package.json` files during development.

---

## 🚀 Development Roadmap

- [x] Identify the real-world problem.
- [x] Conduct shopkeeper interview and fieldwork.
- [x] Collect 20 or more actual printing job records.
- [x] Prepare initial project research.
- [ ] Complete fieldwork documentation and organize evidence.
- [ ] Set up the React frontend.
- [ ] Set up the Node.js and Express backend.
- [ ] Connect the application to MongoDB.
- [ ] Create the printing job model and APIs.
- [ ] Build the shopkeeper dashboard.
- [ ] Implement queue management.
- [ ] Implement waiting-time estimation.
- [ ] Build the student interface.
- [ ] Test the application using collected job records.
- [ ] Document testing results and limitations.

---

## 📸 Fieldwork Evidence

Photographs and supporting fieldwork evidence are intended to be stored in:

```text
evidence/fieldwork/
```

These materials document the campus printing shop visit and support the problem identification process.

---

## 🔮 Future Improvements

- Real-time queue updates.
- Student order submission through the application.
- Notifications when a job is ready.
- Improved estimates using a larger historical dataset.
- Separate handling of walk-in and online orders.
- Daily and weekly workload analytics.
- Better estimation for different printing types and page counts.

---

## ⚠️ Limitations

- The initial dataset contains only 20 job records.
- Waiting-time estimates may become less accurate when the shop receives an unusually large number of orders.
- Printing time can vary depending on the printer, document, page count, and job type.
- The initial estimation method is a statistical baseline, not a guarantee of actual completion time.
- More data will be needed to evaluate and improve prediction accuracy.

---

## 👨‍💻 Project Information

| Detail | Information |
|---|---|
| Project Name | PrintQueue |
| Repository | [Print-Queue](https://github.com/anuragsharma2512/Print-Queue) |
| Project Type | Web Application |
| Domain | Queue Management and Printing Services |
| Technology | MERN Stack |
| Fieldwork Location | NIT Jamshedpur Campus Printing Shop |
| Fieldwork Date | 17 November 2026 |
| Dataset Size | 20 job records |

---

## 📄 License

This project is developed for academic and educational purposes.