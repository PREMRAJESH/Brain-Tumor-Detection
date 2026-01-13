"""
Brain Tumor Detection - Flask Web Application
Provides a web interface for uploading MRI scans and getting predictions
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import numpy as np
from pathlib import Path
from werkzeug.utils import secure_filename
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import json

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)

# Configuration
BASE_DIR = Path(__file__).parent
UPLOAD_FOLDER = BASE_DIR / 'uploads'
STATIC_FOLDER = BASE_DIR / 'static'
MODEL_PATH = BASE_DIR / 'brain_tumor_model.h5'  # Use checkpoint model

UPLOAD_FOLDER.mkdir(exist_ok=True)
STATIC_FOLDER.mkdir(exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
IMG_SIZE = (224, 224)

# Class names (order matters - must match training)
CLASS_NAMES = ['glioma_tumor', 'meningioma_tumor', 'no_tumor', 'pituitary_tumor']

# Load model at startup
print("Loading model...")
if not MODEL_PATH.exists():
    print(f"❌ Model not found: {MODEL_PATH}")
    print("Please run train_model.py first!")
    model = None
else:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully!")

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def prepare_image(img_path):
    """Prepare image for prediction"""
    img = image.load_img(img_path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # Normalize
    return img_array

def get_friendly_name(class_name):
    """Convert class name to user-friendly format"""
    names = {
        'glioma_tumor': 'Glioma Tumor',
        'meningioma_tumor': 'Meningioma Tumor',
        'no_tumor': 'No Tumor Detected',
        'pituitary_tumor': 'Pituitary Tumor'
    }
    return names.get(class_name, class_name)

@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory(STATIC_FOLDER, 'index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory(STATIC_FOLDER, filename)

@app.route('/api/predict', methods=['POST'])
def predict():
    """Handle prediction requests"""
    if model is None:
        return jsonify({
            'error': 'Model not loaded. Please train the model first.'
        }), 500
    
    # Check if file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Please upload JPG, JPEG, or PNG'}), 400
    
    try:
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = UPLOAD_FOLDER / filename
        file.save(filepath)
        
        # Prepare image and make prediction
        img_array = prepare_image(filepath)
        predictions = model.predict(img_array, verbose=0)
        
        # Get prediction results
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = CLASS_NAMES[predicted_class_idx]
        confidence = float(predictions[0][predicted_class_idx])
        
        # Get all probabilities
        all_probabilities = {
            get_friendly_name(CLASS_NAMES[i]): float(predictions[0][i])
            for i in range(len(CLASS_NAMES))
        }
        
        # Sort by probability
        all_probabilities = dict(sorted(
            all_probabilities.items(),
            key=lambda x: x[1],
            reverse=True
        ))
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'prediction': get_friendly_name(predicted_class),
            'confidence': confidence,
            'all_probabilities': all_probabilities
        })
    
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("🧠 Brain Tumor Detection - Web Application")
    print("=" * 60)
    print("\n🚀 Starting server...")
    print(f"📂 Upload folder: {UPLOAD_FOLDER}")
    print(f"🤖 Model loaded: {'Yes' if model else 'No'}")
    print("\n🌐 Open your browser and go to: http://localhost:5000")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
