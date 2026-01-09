import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
# We don't need the API Key while in Demo Mode, 
# but I'm keeping the structure here for your future use.
DEMO_MODE = True 

@app.route("/verify-assignment", methods=["POST"])
def verify_assignment():
    try:
        # 1. Simulate the check for incoming data
        # Even in Demo Mode, we should check if a file was sent
        if 'image' not in request.files:
            return jsonify({"error": "No image found in request"}), 400
            
        file = request.files['image']
        lesson_title = request.form.get("lessonTitle", "Unknown Lesson")

        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        # --- DEMO MODE BYPASS ---
        if DEMO_MODE:
            print(f"📦 RECEIVED: {file.filename} for {lesson_title}")
            return jsonify({
                "verified": True,
                "feedback": f"Handwritten summary for '{lesson_title}' verified successfully! Great job following the notes."
            })
        # -------------------------

        # (Your real Gemini code would go here once your quota resets)
        return jsonify({"error": "AI Mode is currently disabled."}), 503

    except Exception as e:
        print(f"❌ BACKEND ERROR: {str(e)}")
        return jsonify({"error": "Processing failed", "details": str(e)}), 500

if __name__ == "__main__":
    # Ensure you are running on the port your React app expects (e.g., 5001)
    app.run(port=5001, debug=True)