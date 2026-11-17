# Problem Statement
Students visiting college photocopy and printing shops often face uncertainty about how long their printing jobs will take. Waiting time varies depending on the number of customers in the queue, number of pages, type of printing, and printer availability. Shopkeepers usually estimate waiting times based on their experience, which may not always be accurate. This can result in students spending unnecessary time waiting or returning later. To address this problem, PrintQueue aims to develop a system that analyzes previous printing-job records and predicts the expected waiting and completion times for new customers.

## Existing Solutions

### Solution 1: Manual Queue Management and Waiting-Time Estimation

Most small photocopy and printing shops manage customer orders manually. Students visit the shop, explain their printing requirements, and wait for their turn. The shopkeeper handles the jobs one by one and provides an approximate waiting time based on the number of customers waiting and their experience with previous printing jobs.

**Limitations:**
- Waiting-time estimates are mostly based on the shopkeeper's experience rather than historical data.
- The number of customers alone does not indicate how long the queue will take because different printing jobs require different amounts of time.
- Students may have to wait longer than the estimated time.
- There is no systematic analysis of previous printing jobs to improve future waiting-time estimates.

### Solution 2: Sending Printing Materials Through WhatsApp

Many students use WhatsApp to send their printing materials, such as PDFs, assignments, notes, and other documents, directly to the photocopy shopkeeper. The shopkeeper receives the documents, prints them, and keeps them ready for collection. Students can then visit the shop and collect their printed materials without spending time waiting for the printing process.

**Limitations:**
- Students do not know exactly when their printing materials will be ready.
- If multiple students send documents simultaneously, the shopkeeper may take longer to complete all the orders.
- There is no dedicated system to track the current status of a printing request.
- Students may need to contact the shopkeeper repeatedly to ask whether their documents are ready.



## Proposed Solution: PrintQueue

PrintQueue is a MERN stack-based web application designed to estimate waiting and completion times at college photocopy and printing shops.

The application will collect and analyze historical printing-job records, considering factors such as printing type, number of pages, service duration, and current queue workload.

Students will be able to check the current queue and receive estimated waiting and completion times. Shopkeepers will have a dashboard to manage printing jobs, update their status, and record actual job timings.

The system aims to reduce uncertainty for students and help shopkeepers provide more realistic waiting-time estimates.

## How PrintQueue Improves Existing Solutions

| Existing Solution | Limitation | PrintQueue Improvement |
|-------------------|------------|------------------------|
| WhatsApp ordering | No reliable waiting-time prediction | Provides estimated completion time |
| Manual queue management | Depends on the shopkeeper's experience | Uses historical printing-job data |
| Manual status checking | Students repeatedly contact the shopkeeper | Provides job status through a web interface |

## Technology Stack

- **MongoDB:** Stores printing-job records and historical data.
- **Express.js:** Handles backend APIs and application requests.
- **React.js:** Provides the student interface and shopkeeper dashboard.
- **Node.js:** Runs the backend application.
- **Tailwind CSS:** Provides responsive user-interface styling.
- **Recharts:** Displays printing statistics and analytics.

## Expected Outcome

- Estimate waiting and completion times for printing jobs.
- Help students make better decisions about when to visit or collect their documents.
- Help shopkeepers manage printing orders more efficiently.
- Maintain historical records of printing jobs.
- Analyze printing patterns and evaluate prediction accuracy.