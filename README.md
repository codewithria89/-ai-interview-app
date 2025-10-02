# AI-Powered Interview Assistant (Swipe Assignment)

**Goal:** An AI-powered application designed to simulate a full-stack (React/Node) job interview, featuring a Candidate Chat interface and an Interviewer Dashboard.

## 🚀 Live Demo
**[CLICK HERE TO VIEW THE LIVE APPLICATION]**
*(You will replace this line with your Vercel/Netlify link in Step 4)*

## ✨ Key Features Implemented

The application successfully meets all core requirements:

| Feature Area | Implementation Details |
| :--- | :--- |
| **Resume Handling** | Supports **PDF** and **DOCX** upload. Extracts **Name**, **Email**, and **Phone**. |
| **Missing Fields Flow** | Chatbot dynamically prompts for any missing fields before the interview starts. |
| **Interview Logic** | Runs a 6-question interview (2 Easy, 2 Medium, 2 Hard). Questions are generated dynamically for a Full-Stack role. |
| **Timers & Auto-Submit** | Easy: 20s, Medium: 60s, Hard: 120s. Answers auto-submit when the timer expires. |
| **Data Persistence** | Uses **[Your Persistence Method, e.g., Redux-Persist/IndexedDB]** for complete local data storage. |
| **Pause/Resume** | Sessions restore automatically upon refresh/reopening, displaying a "Welcome Back" modal. |
| **Interviewer Dashboard** | Lists all candidates ordered by **Final Score**. Includes **Search** and **Sort** functionality. |
| **Detailed View** | Clicking a candidate shows their profile, full chat history, and the **Final AI Summary**. |

## 🛠 Tech Stack

* **Frontend:** React (version **[Your React Version]**)
* **State Management & Persistence:** **[Your State Management, e.g., Redux/Zustand]** + **[Your Persistence Library, e.g., Redux-Persist]**
* **UI/Styling:** **[Your UI Library, e.g., Ant Design / shadcn / Tailwind CSS]**
* **Resume Parsing Logic:** *Briefly mention how you handled PDF/DOCX parsing (e.g., a specific library or a simulated/placeholder function).*

## ⚙️ Installation and Local Setup

Follow these steps to run the project on your local machine:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/YourUsername/ai-interview-new.git](https://github.com/YourUsername/ai-interview-new.git)
    cd ai-interview-new
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    # OR
    yarn install
    ```
3.  **Run the Application:**
    ```bash
    npm start
    # OR
    yarn start
    ```
    The application should open automatically at `http://localhost:3000`.

## 🧠 Design Decisions & Challenges (Optional but recommended)

* **Persistence:** We chose **[State Library]** because it simplifies the state structure, and **[Persistence Library]** made local storage seamless, ensuring timers and progress are never lost.
* **AI Simulation:** The AI logic is simulated using static/mock data for questions and judgment to focus on the core React architecture and state management required by the assignment.

---
