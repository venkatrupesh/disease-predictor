from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os

app = Flask(__name__)
CORS(app, origins=["https://jocular-stroopwafel-8aade1.netlify.app"])



# Load model
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    model = None
    print("Model loading failed:", e)

@app.route('/')
def home():
    return "✅ Disease Prediction API is running."


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.get_json()
        features = [
            float(data['pregnancies']),
            float(data['glucose']),
            float(data['bloodPressure']),
            float(data['skinThickness']),
            float(data['insulin']),
            float(data['bmi']),
            float(data['diabetesPedigreeFunction']),
            float(data['age']),
        ]
        prediction = model.predict([features])[0]
        probability = model.predict_proba([features])[0][int(prediction)]

        return jsonify({
            "prediction": int(prediction),
            "confidence": round(probability * 100, 2)
        })

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": "Prediction failed", "message": str(e)}), 400
    
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)












