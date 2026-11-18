
# Fieldwork Documentation – PrintQueue

## Fieldwork Details

- **Project Name:** PrintQueue
- **Person Name:** Ajay Kumar
- **Role:** Shopkeeper Worker
- **Location:** Campus Photocopy and Printing Shop, NIT Jamshedpur
- **Date of Visit:** 17 November 2026
- **Person Interviewed:** Shopkeeper Worker
- **Fieldwork Method:** Shopkeeper interview, collection of printing job records, observation of queue and WhatsApp orders, and photography
- **Number of Job Records Collected:** 20
- **Photographs:** Taken during the fieldwork visit

## Purpose of Fieldwork

The purpose of this fieldwork was to understand the difficulties students and shopkeepers face when handling printing and photocopying orders, particularly during busy hours.

The main objectives were:

1. To understand how students currently submit printing documents.
2. To identify the busiest periods at the shop.
3. To understand how the shopkeeper manages multiple printing orders.
4. To investigate why students sometimes have to wait for a long time.
5. To collect real printing job records for analyzing service times and estimating waiting times.
6. To gather information that could help design the PrintQueue system.

## Shopkeeper Interview

I visited the campus printing shop at NIT Jamshedpur on 17 November 2026 and interviewed the shopkeeper about the problems faced while managing printing orders.

### Questions and Responses

**Q1. During which times does the shop experience the highest rush?**

The shopkeeper explained that the busiest periods are generally:
- Morning: 8:30 AM to 9:30 AM
- Evening: Around 6:00 PM

**Q2. How do students usually submit their printing documents?**

Students generally visit the shop and provide their documents at that time. Some students send documents through WhatsApp or email before arriving, but only a few do so in advance.

**Q3. How are printing orders currently managed?**

Orders received through WhatsApp are generally processed in the order in which they arrive. For students who visit the shop directly, the shopkeeper manages the orders based on the situation and his own judgment.

**Q4. What is the approximate time required to print a PDF?**

The shopkeeper reported that printing a PDF takes approximately one minute on average. This is an estimate provided during the interview and may vary depending on the document and printing requirements.

**Q5. Do you face difficulties managing orders during busy hours?**

Yes. The shopkeeper explained that many students arrive or send documents during busy periods. Some students send multiple PDFs, increasing the number of orders that need to be handled.

**Q6. What happens when the shop becomes crowded?**

Students sometimes have to wait for a long time. Some students leave the shop and return to their hostel after seeing the rush or queue.

## Field Observations

During the fieldwork, I observed the queue at the shop and multiple printing orders arriving through WhatsApp. I also collected 20 or more actual printing job records and took photographs as supporting fieldwork evidence.

The following points summarize the information gathered:

1. The shop experiences higher demand during the morning period of approximately 8:30 AM to 9:30 AM.
2. Another busy period occurs around 6:00 PM.
3. Most students generally provide their documents when they arrive at the shop.
4. A smaller number of students send documents through WhatsApp or email before arriving.
5. Multiple PDFs may be submitted by the same student.
6. WhatsApp orders are generally handled in the order received.
7. Walk-in orders are managed according to the shopkeeper's judgment and the situation at the shop.
8. The queue and incoming WhatsApp orders can contribute to a high workload during busy periods.
9. Students may have to wait for a long time.
10. Some students leave and return to their hostel when they see a long queue.

**Note:** The peak-hour timings, order-handling practices, and approximate PDF printing time were reported by the shopkeeper during the interview. The queue and multiple WhatsApp orders were also observed during the fieldwork visit.

## Collection of Real Printing Job Records

I collected 20 or more actual printing job records during my fieldwork. These records will be used to understand the printing workload and analyze the time required to process different jobs.

The records can help identify relationships between:
- Number of pages
- Type of printing job
- Number of jobs ahead in the queue
- Waiting time before processing
- Time taken to complete a job

### Suggested Data Structure

The following fields can be used to organize the collected records:

| Field | Description |
|---|---|
| Job ID | Unique identifier for each job |
| Arrival Time | Time when the order was received |
| Service Start Time | Time when printing began |
| Service End Time | Time when printing was completed |
| Job Type | Black and white, colour, photocopy, etc. |
| Number of Pages | Total pages in the job |
| Queue Ahead | Number of jobs ahead, if recorded |
| Waiting Time | Time between arrival and service start |
| Service Time | Time between service start and completion |

**Data integrity note:** Only enter values that were actually recorded or can be calculated from your original records. If a field was not collected, mark it as "Not recorded" rather than estimating it.

## Photographic Evidence

Photographs were taken during the fieldwork visit on 17 November 2026.

The photographs serve as supporting evidence of the fieldwork conducted at the campus printing shop.

Add the actual photographs to your project repository in a folder such as:

`evidence/fieldwork/`

Suggested captions (use only where they accurately describe the photograph):

- Photograph 1: Campus printing shop visited during fieldwork.
- Photograph 2: Queue at the printing shop.
- Photograph 3: Printing orders or shop workflow.

Do not include private customer documents, phone numbers, or personal information in publicly shared photographs.

## Problems Identified

Based on the shopkeeper interview, field observations, and collected job records, the following problems were identified:

### 1 High Workload During Peak Hours

The shop receives a large number of printing requests during certain periods, especially in the morning and evening.

### 2 Multiple Incoming Orders

Students may submit multiple PDFs through WhatsApp, adding to the number of jobs the shopkeeper must manage.

### 3 Manual Order Management

The shopkeeper manages orders using their received order and personal judgment. This can become difficult when many walk-in and digital orders arrive close together.

### 4 Uncertain Waiting Time

Students may not know how long they will need to wait before their printing is completed.

### 5 Students Leaving Due to Long Queues

Some students leave the shop and return to their hostel after seeing the rush or queue. This indicates that long and uncertain waiting times affect the student experience.

## How Fieldwork Influenced the PrintQueue Solution

The fieldwork helped me understand that the problem is not simply the time taken to print a document. Managing several orders during busy periods is also a major challenge.

Based on the findings, I decided to develop **PrintQueue**, a web-based printing queue and waiting-time estimation system using the MERN stack.

The proposed system will include:

1. **Order Management:** Allow the shopkeeper to add and manage printing jobs.
2. **Queue Tracking:** Display the current jobs and their processing status.
3. **Status Updates:** Track jobs as Pending, Processing, or Completed.
4. **Waiting-Time Estimation:** Estimate waiting and completion times using recorded job information and historical service durations.
5. **Job History:** Store completed job records for future analysis and improvement.

The actual job records collected during fieldwork will be used to develop and evaluate the estimation logic.

## Expected Benefits

- Students can get a clearer idea of their expected waiting time.
- The shopkeeper can view and manage pending printing jobs more systematically.
- Completed job records can help analyze printing patterns.
- Historical service times can improve future waiting-time estimates.
- Students may be able to avoid unnecessary waiting at the shop.

## Personal Learning and Reflection

This fieldwork helped me understand how a real-world problem can be identified by interacting with the people who experience it.

The interview with the shopkeeper showed me that printing shops face difficulties when many students submit orders during peak hours. I also learned that different order-submission methods, such as walk-in requests and WhatsApp orders, make order management more challenging.

Collecting actual printing job records gave me a practical basis for analyzing the problem instead of relying only on assumptions.

The fieldwork helped me connect the problem to a software solution. I understood that a useful system should address the actual workflow of the shopkeeper and provide meaningful information to students.

## Conclusion

The fieldwork conducted at the NIT Jamshedpur campus printing shop on 17 November 2026 helped identify challenges related to peak-hour workload, multiple printing orders, manual order management, and uncertain waiting times.

The shopkeeper interview, direct observations of the queue and WhatsApp orders, collection of 20 or more job records, and photographs provided practical information for the PrintQueue project.

These findings will guide the development of a MERN-based system that helps manage printing orders and estimate waiting times using real job data.
