# 🧠 Brain Tumor Detection System

## 📁 Project Structure

```
b/
├── brain_tumor_detection.ipynb    # Main Jupyter notebook with full tutorial
├── app.py                          # Flask web application
├── requirements.txt                # Python dependencies
├── brain_tumor_dataset/            # MRI image dataset
│   ├── Training/                   # Training images
│   └── Testing/                    # Testing images
└── static/                        # Web interface files
    ├── index.html                  # Frontend HTML
    ├── style.css                   # Styling
    └── script.js                   # JavaScript logic
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the Model (Jupyter Notebook)
Open and run `brain_tumor_detection.ipynb` in Jupyter:
```bash
jupyter notebook brain_tumor_detection.ipynb
```

The notebook includes:
- Data exploration & visualization
- Model architecture explanation
- Training process
- Performance evaluation
- Grad-CAM visualizations

### 3. Run Web Application
After training, start the web app:
```bash
python app.py
```

Open http://localhost:5000 in your browser to upload MRI scans and get predictions.

## 📊 Dataset

- **Source:** [Kaggle - Brain Tumor MRI Dataset](https://www.kaggle.com/datasets/masoudnickparvar/brain-tumor-mri-dataset)
- **Classes:** 4 (Glioma, Meningioma, Pituitary, No Tumor)
- **Total Images:** ~5,700 training + ~1,300 testing

## 🎯 Model Performance

- **Architecture:** Custom CNN with 4 convolutional blocks
- **Expected Accuracy:** 85-95%
- **Training Time:** ~10-15 minutes (depends on hardware)

## 🌐 Web Interface Features

- Drag-and-drop image upload
- Real-time predictions
- Confidence scores
- Professional medical-themed design
- Mobile responsive

## 💡 Usage

1. **For Learning:** Use the Jupyter notebook to understand the complete ML pipeline
2. **For Deployment:** Use the Flask web app for production predictions

## 📝 Files Explained

| File | Purpose |
|------|---------|
| `brain_tumor_detection.ipynb` | Complete ML tutorial with explanations |
| `app.py` | Flask backend for web predictions |
| `static/` | Frontend files (HTML/CSS/JS) |
| `requirements.txt` | Python package dependencies |

## ⚕️ Disclaimer

This is for educational and research purposes only. Always consult qualified medical professionals for actual diagnosis and treatment.
