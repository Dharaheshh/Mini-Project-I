# 🚀 How to Run the Full Project (Step-by-Step)

Don't worry! Follow these exact steps to get everything running. You will need **3 separate terminals** (Command Prompts or PowerShell windows).

---

### ✅ Prerequisite Check
Before starting, make sure you have:
1.  **Node.js** installed.
2.  **Python** installed.
3.  **MongoDB** running locally OR a valid connection string in your `.env`.

---

### 🖥️ Terminal 1: The Backend (The Brain)
 this handles the database and users.

1.  Open a new terminal.
2.  Navigate to the backend folder:
    ```bash
    cd "c:\Users\Dharaheshh V\OneDrive\Desktop\miniproject-1\backend"
    ```
3.  Install dependencies (only need to do this once):
    ```bash
    npm install
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    > **Success?** You should see: `🚀 Server running on port 5000` and `✅ MongoDB Connected`.

---

### 🎨 Terminal 2: The Frontend (The Face)
This is what you see in the browser.

1.  Open a **second** terminal.
2.  Navigate to the frontend folder:
    ```bash
    cd "c:\Users\Dharaheshh V\OneDrive\Desktop\miniproject-1\frontend"
    ```
3.  Install dependencies (only need to do this once):
    ```bash
    npm install
    ```
4.  Start the react app:
    ```bash
    npm start
    ```
    > **Success?** It should automatically open `http://localhost:3000` in your browser.

---

### 🤖 Terminal 3: The AI Server (The Intelligence)
This handles the image scanning and predictions.

1.  Open a **third** terminal.
2.  Navigate to the ML server folder:
    ```bash
    cd "c:\Users\Dharaheshh V\OneDrive\Desktop\miniproject-1\ml-server"
    ```
3.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
4.  Install Python libraries (only need to do this once):
    ```bash
    pip install -r requirements.txt
    ```
5.  Start the ML/AI server:
    ```bash
    python main.py
    ```
    > **Success?** You should see: `Uvicorn running on http://0.0.0.0:8000`.

---

## 🔍 How to Verify Everything is Connected
1.  Go to `http://localhost:3000` in Chrome/Edge.
2.  **Log in** (if you don't have an account, Register one).
3.  Click **"+ New Complaint"**.
4.  Upload an image.
5.  Wait for the **"Get AI Predictions"** button to appear (if it's not there, check Terminal 3).
6.  Click it. If you see the **Scanning Animation**, congratulations! All 3 parts are talking to each other.

---

## 🆘 Troubleshooting
*   **"MongoDB Connection Error"**: Make sure MongoDB Compass is open and connected, or run `mongod` in a 4th terminal if you use local mongo.
*   **"Module not found"**: You probably forgot to run `npm install` or `pip install`.
*   **"Port already in use"**: You might have another terminal running the project. Close all terminals and start over.
