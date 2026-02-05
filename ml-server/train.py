import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader, random_split
import os
import time

def train_model():
    # 1. Configuration
    # Point directly to the existing folder structure
    DATA_DIR = os.path.join('datasets', 'category_classification')
    MODEL_SAVE_PATH = 'model.pth'
    NUM_EPOCHS = 10
    BATCH_SIZE = 32
    LEARNING_RATE = 0.001
    
    # Check if data exists
    if not os.path.exists(DATA_DIR):
        print(f"❌ Data directory '{DATA_DIR}' not found.")
        print("   Please ensure you have 'datasets/category_classification' with category folders.")
        return

    # --- NEW: Verify Images before starting ---
    print("🔍 Verifying dataset integrity...")
    valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.gif')
    bad_files = 0
    
    for root, dirs, files in os.walk(DATA_DIR):
        for file in files:
            if file.lower().endswith(valid_extensions):
                path = os.path.join(root, file)
                try:
                    # Try opening the file to check for permissions/corruption
                    with open(path, "rb") as f:
                        f.read(10) # Read a few bytes
                    
                    # Also try PIL open
                    from PIL import Image
                    with Image.open(path) as img:
                        img.verify() 
                        
                except (PermissionError, OSError, Exception) as e:
                    print(f"⚠️ Skipping corrupted/locked file: {file} ({e})")
                    # Rename bad file so ImageFolder ignores it
                    try:
                        new_path = path + ".bad"
                        if os.path.exists(new_path): os.remove(new_path)
                        os.rename(path, new_path)
                        bad_files += 1
                        print(f"   -> Renamed to {file}.bad")
                    except:
                        print(f"   -> Could not rename. Training might fail.")
    
    if bad_files > 0:
        print(f"🧹 Cleaned up {bad_files} problematic files.")
    else:
        print("✅ Dataset looks clean!")
    # ------------------------------------------

    # 2. Data Transformations
    # We use the same transform for both initially for simplicity in splitting a single dataset
    # Ideally, train gets augmentation and val gets only resize, but for auto-split 
    # on a small dataset, this robust transform set is acceptable.
    data_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.RandomHorizontalFlip(), # Basic augmentation
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # 3. Load and Split Data
    try:
        full_dataset = datasets.ImageFolder(DATA_DIR, transform=data_transforms)
        
        # Calculate split sizes (80% train, 20% validation)
        total_size = len(full_dataset)
        train_size = int(0.8 * total_size)
        val_size = total_size - train_size
        
        train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
        
        dataloaders = {
            'train': DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0),
            'val': DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
        }
        
        dataset_sizes = {'train': train_size, 'val': val_size}
        class_names = full_dataset.classes
        
        print(f"✅ Found {len(class_names)} classes: {class_names}")
        print(f"   Total images: {total_size}")
        print(f"   Training set: {train_size} images")
        print(f"   Validation set: {val_size} images")
        
        if total_size == 0:
            print("❌ No images found! Please add JPG/PNG images to the class folders.")
            return

    except Exception as e:
        print(f"❌ Error loading dataset: {e}")
        return

    # 4. Setup Model (Transfer Learning)
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"   Using device: {device}")

    model = models.mobilenet_v2(pretrained=True)
    
    # Freeze base layers
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace the head
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(class_names))
    
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=LEARNING_RATE)

    # 5. Training Loop
    print("\n🚀 Starting Training...")
    
    since = time.time()
    best_acc = 0.0

    for epoch in range(NUM_EPOCHS):
        print(f'Epoch {epoch + 1}/{NUM_EPOCHS}')
        print('-' * 10)

        for phase in ['train', 'val']:
            if phase == 'train':
                model.train()
            else:
                model.eval()

            running_loss = 0.0
            running_corrects = 0

            for inputs, labels in dataloaders[phase]:
                inputs = inputs.to(device)
                labels = labels.to(device)

                optimizer.zero_grad()

                with torch.set_grad_enabled(phase == 'train'):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                    if phase == 'train':
                        loss.backward()
                        optimizer.step()

                running_loss += loss.item() * inputs.size(0)
                running_corrects += torch.sum(preds == labels.data)

            epoch_loss = running_loss / dataset_sizes[phase]
            epoch_acc = running_corrects.double() / dataset_sizes[phase]

            print(f'{phase} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

            if phase == 'val' and epoch_acc > best_acc:
                best_acc = epoch_acc
                torch.save(model.state_dict(), MODEL_SAVE_PATH)

    time_elapsed = time.time() - since
    print(f'\n🏁 Training complete in {time_elapsed // 60:.0f}m {time_elapsed % 60:.0f}s')
    print(f'   Best val Acc: {best_acc:4f}')
    print(f"💾 Model saved to: {os.path.abspath(MODEL_SAVE_PATH)}")

if __name__ == '__main__':
    train_model()
