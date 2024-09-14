from flask import Flask, request, jsonify, render_template
import numpy as np
import cv2
import base64
import io
from PIL import Image, ImageDraw
from tensorflow.keras.models import load_model

app = Flask(__name__)

# Load your trained model
model = load_model('model.h5')  # Ensure the model path is correct

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json['image']
    
    # Process the image
    image_data = data.split(',')[1]
    image = base64.b64decode(image_data)
    np_image = np.frombuffer(image, np.uint8)
    
    # Decode the image using OpenCV
    img = cv2.imdecode(np_image, cv2.IMREAD_GRAYSCALE)
    
    # Check if the image is None
    if img is None:
        return jsonify({'error': 'Could not decode the image'}), 400

    # Resize the image to (28, 28)
    img = cv2.resize(img, (28, 28))  # Resize to fit model input
    img = img.reshape(1, 28, 28, 1) / 255.0  # Normalize and reshape

    # Predict the digit and bounding box
    y_pred_classification, y_pred_localization = model.predict(img)

    # Get the predicted digit
    predicted_digit = np.argmax(y_pred_classification)
    
    # Prepare the bounding box
    predicted_box = y_pred_localization[0].tolist()  # Convert to list for JSON serialization
    
    
    
    return jsonify({'digit': int(predicted_digit), 'bounding_box': predicted_box})

if __name__ == '__main__':
    app.run(debug=True)