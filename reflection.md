# Project Reflection – PrintQueue

### 1. What I Got Wrong at the Start
When I started planning PrintQueue for the NIT Jamshedpur campus photocopy shop, I treated it primarily as a mathematical waiting-time prediction problem. I assumed that calculating average queue times would solve the issue. During fieldwork, I realized the real bottleneck was order management: students submitted multiple PDFs with different print types and copies, while the shopkeeper juggled WhatsApp messages and walk-in crowds. I also made security mistakes early on, relying on a simple frontend PIN check instead of backend authentication, and I initially overlooked the need for direct student document uploads with verified page counts and payment agreements.

### 2. What I Would Cut
If I started this project again, I would avoid building secondary features like the interactive turnaround calculator and extensive analytics in the first phase. I would keep the waiting-time logic simple and transparent, directly derived from our fieldwork averages (~70 seconds for B&W and ~90 seconds for Colour). Prioritizing a lean minimum viable product—consisting only of multi-PDF submission, live queue visibility, and a secure shopkeeper dispatch console—would have saved considerable development time.

### 3. Where AI Helped
AI was particularly useful for establishing a clean MERN project structure using MVC and a dedicated service layer. It helped me implement backend security features that I had less experience with, such as hashing PINs with bcrypt, managing HttpOnly JWT cookies, and writing authentication middleware. It also sped up boilerplate code for Multer uploads, pricing functions, and PDF page-parsing logic. It accelerated development, but every snippet still required careful testing against our campus requirements.

### 4. Where AI Wasted Time
AI often suggested unnecessary complexity, such as recommending full student user accounts or online payment gateways that did not fit a physical campus counter setup. At other times, it suggested frontend-only workarounds for backend security issues or generated outdated code for libraries like `pdf-parse`, which failed in our Node ESM environment and required manual debugging. Refining overcomplicated AI suggestions occasionally distracted from implementing and testing the core application.
