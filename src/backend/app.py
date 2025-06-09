from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ✅ Load model
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
except Exception as e:
    model = None
    print("Failed to load model:", e)

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.get_json()

        # ✅ Prepare input features
        features = [
            float(data['pregnancies']),
            float(data['glucose']),
            float(data['bloodPressure']),
            float(data['skinThickness']),
            float(data['insulin']),
            float(data['bmi']),
            float(data['diabetesPedigreeFunction']),
            float(data['age'])
        ]

        # ✅ Predict class and probability
        prediction = model.predict([features])[0]
        probability = model.predict_proba([features])[0][int(prediction)]

        return jsonify({
            "prediction": int(prediction),
            "confidence": round(probability * 100, 2)  # convert to percentage
        })

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": "Prediction failed", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)










