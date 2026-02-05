# 🎓 Ultimate Project Guide: Training & Testing

This guide covers everything from "Zero Knowledge" to "Fully Automated AI System".

---

## Part 1: Training Your AI (The Brain) 🧠

I have **already created the empty folders** for you. You just need to fill them.

### Step 1: Add Images
Go to your project folder: `miniproject-1/ml-server/data`

1.  Open the **`train`** folder.
2.  You will see folders like `Chair`, `Bench`, `Socket`, etc.
3.  **Drag and drop** at least **20 photos** of real items into their matching folders.
    *   *Example: Put 20 photos of your campus chairs into `data/train/Chair`.*
4.  (Optional) Do the same for the **`val`** (validation) folder with different photos (about 5 each) to test accuracy.

### Step 2: Run the Training
1.  Open your **ML Terminal** (where `main.py` runs).
2.  Stop the server (`Ctrl+C`).
3.  Run this command:
    ```bash
    python train.py
    ```
4.  **Wait**: You will see it printing "Epoch 1/10...", "Epoch 2/10...".
    *   *It might take 5-10 minutes.*
    *   When finished, it will say: `🎉 Training complete... Model saved to: model.pth`.

### Step 3: Activate the New Brain
1.  Start the server again:
    ```bash
    python main.py
    ```
2.  Look for this message in the logs:
    > `🎉 Loaded CUSTOM TRAINED weights from model.pth`

---

## Part 2: Testing the Full System (End-to-End) 🧪

Now that your AI is smart, let's test the whole flow.

### Prerequisites (Check these are running)
*   **Terminal 1 (Backend)**: `npm run dev` (Port 5000)
*   **Terminal 2 (Frontend)**: `npm start` (Port 3000)
*   **Terminal 3 (ML Server)**: `python main.py` (Port 8000)

### The Test Flow
1.  **Open App**: Go to `http://localhost:3000`.
2.  **Login**: Log in as a user (or Admin).
3.  **New Complaint**: Click "Submit New Complaint".
4.  **Select Image**: Pick a photo of a **Chair** (one you didn't use for training).
5.  **Watch the Magic**:
    *   The "Scanning..." overlay should appear immediately.
    *   **Result**: The "Category" box should auto-lock to "Chair".
    *   **Result**: The "Priority" should be auto-assigned (e.g., Medium).
    *   **Result**: A description should be generated ("Damaged chair...").
6.  **Submit**: Click Submit.
7.  **Verify Admin**:
    *   Go to the Admin Dashboard.
    *   You should see the new chair complaint in the list and the charts updated.

---

## 🆘 Common Issues

| Issue | Solution |
| :--- | :--- |
| `directory not found` | I just fixed this! The folders are now there. |
| `model.pth not found` | You haven't run `python train.py` yet. |
| `Accuracy is low` | You need more images! 20 is the minimum, 50 is better. |
| `Server error 500` | Restart the specific terminal giving the error. |
