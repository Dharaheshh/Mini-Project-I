# 🧠 How to Train Your Custom AI Model

You now have a fully automated training system! Follow these steps to feed your AI with data.

## 1. Gather Data (The Fuel)
Create a folder structure inside `ml-server/data/train` like this:

```
ml-server/
└── data/
    └── train/
        ├── Chair/      (put 20+ photos of chairs here)
        ├── Bench/      (put 20+ photos of benches here)
        ├── Projector/  (put 20+ photos of projectors here)
        ├── Socket/     (put 20+ photos of sockets here)
        ├── Pipe/       (put 20+ photos of pipes here)
        └── Other/      (put 20+ photos of random stuff here)
```

> **Tip**: The more photos, the smarter it gets. Try to get different angles and lighting!

## 2. Train the Brain
Open your ML Terminal (where `main.py` runs) and run:

```bash
# Stop the server first (Ctrl+C)
python train.py
```

It will:
1.  Read all your images.
2.  Fine-tune the MobileNetV2 engine.
3.  Save a new file called **`model.pth`**.

## 3. Activate
Just start the server again:
```bash
python main.py
```

The system will detect `model.pth` and say: 
> `🎉 Loaded CUSTOM TRAINED weights from model.pth`

Now your AI is no longer guessing—it's **knowing**! 🚀
