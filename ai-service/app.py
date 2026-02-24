"""
EduPulse AI – Flask Microservice Entry Point
Exposes a /predict endpoint consumed by the Node.js backend.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict

app = Flask(__name__)
CORS(app)  # Allow requests from Node.js backend


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "OK", "service": "EduPulse AI Service"}), 200


@app.route('/predict', methods=['POST'])
def predict_performance():
    """
    Accepts JSON:
    {
        "avg_marks": float,       # 0–100
        "attendance": float,      # 0–100
        "improvement_rate": float # 0–100
    }

    Returns JSON:
    {
        "performance_score": float,
        "learner_category": str,
        "risk_level": str,
        "recommendation": str
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    # Validate required fields
    required = ["avg_marks", "attendance", "improvement_rate"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        avg_marks = float(data["avg_marks"])
        attendance = float(data["attendance"])
        improvement_rate = float(data["improvement_rate"])
    except (ValueError, TypeError):
        return jsonify({"error": "All fields must be numeric"}), 400

    # Validate ranges
    for name, val in [
        ("avg_marks", avg_marks),
        ("attendance", attendance),
        ("improvement_rate", improvement_rate),
    ]:
        if not (0 <= val <= 100):
            return jsonify({"error": f"{name} must be between 0 and 100"}), 400

    result = predict(avg_marks, attendance, improvement_rate)
    return jsonify(result), 200


if __name__ == '__main__':
    print("🤖 EduPulse AI Service running on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
