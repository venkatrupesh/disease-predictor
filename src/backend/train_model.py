# backend/train_model.py
# backend/train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import pickle
import os

# Load CSV (more robust path)
df = pd.read_csv(os.path.join(os.path.dirname(__file__), "diabetes.csv"))

# Prepare data
X = df.drop('Outcome', axis=1)
y = df['Outcome']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"🎯 Accuracy: {accuracy * 100:.2f}%")

# Save model
os.makedirs("backend", exist_ok=True)
with open("backend/model.pkl", "wb") as f:
    pickle.dump(model, f)


    pickle.dump(model, f)

print("✅ Model trained and saved to backend/model.pkl")

