from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import ask_bot

app = Flask(__name__)
CORS(app)  # ✅ CORS added

# Route for the chatbot
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    print("Incoming data:", data)  # 👈 DEBUG LINE

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    if data.get("source") != "student_dashboard":
        return jsonify({"error": "Access denied"}), 403

    user_message = data.get("message", "")
    reply = ask_bot(user_message)
    return jsonify({"reply": reply})


# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
