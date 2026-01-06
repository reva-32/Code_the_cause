from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import ask_bot

app = Flask(__name__)
CORS(app)  # ✅ CORS added

# Route for the chatbot
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    print("Incoming data:", data) 

    if not data or data.get("source") != "student_dashboard":
        return jsonify({"error": "Access denied"}), 403

    user_message = data.get("message", "")
    # ✅ Grab the flag from the frontend request
    is_blind = data.get("is_blind", False) 

    reply = ask_bot(user_message, is_blind=is_blind)
    return jsonify({"reply": reply})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
