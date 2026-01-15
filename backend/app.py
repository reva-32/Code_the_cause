from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os  
import time

# Attempt to import your custom chatbot logic
try:
    from chatbot import ask_bot
except ImportError:
    def ask_bot(msg, is_blind=False):
        return "Chatbot module not found. Please check chatbot.py"

app = Flask(__name__)
# CORS Configuration
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# --- 1. CONFIGURATION ---
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

# Define directory structure
BASE_UPLOAD_FOLDER = 'uploads'
EXAM_PAPERS_FOLDER = os.path.join(BASE_UPLOAD_FOLDER, 'exams')
STUDENT_ANSWERS_FOLDER = os.path.join(BASE_UPLOAD_FOLDER, 'submissions')
# ✅ ADDED: Specific folder for lesson notes
NOTES_FOLDER = os.path.join(BASE_UPLOAD_FOLDER, 'notes')

# Automatically create all necessary folders
for folder in [BASE_UPLOAD_FOLDER, EXAM_PAPERS_FOLDER, STUDENT_ANSWERS_FOLDER, NOTES_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder, exist_ok=True)

# --- 2. HELPERS ---

def allowed_file(filename):
    """Check if the uploaded file has a permitted extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_exam_dir(subject, student_type):
    """Create and return path: uploads/exams/Maths/Blind/"""
    path = os.path.join(EXAM_PAPERS_FOLDER, subject, student_type)
    os.makedirs(path, exist_ok=True)
    return path

# --- 3. STUDENT ROUTES ---

@app.route("/chat", methods=["POST"])
def chat():
    """Handles AI Doubt Solver requests from the Student Dashboard."""
    data = request.get_json()
    if not data or data.get("source") != "student_dashboard":
        return jsonify({"error": "Access denied"}), 403

    user_message = data.get("message", "")
    is_blind = data.get("is_blind", False) 

    reply = ask_bot(user_message, is_blind=is_blind)
    return jsonify({"reply": reply})

# --- 4. GUARDIAN ROUTES ---

@app.route('/api/guardian/upload-answers', methods=['POST'])
def upload_answer_sheet():
    """Endpoint for Guardian to upload the student's completed exam."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    student_name = request.form.get('studentName')
    
    if file.filename == '' or not student_name:
        return jsonify({"error": "Missing file or student name"}), 400

    if file and allowed_file(file.filename):
        timestamp = int(time.time())
        safe_student_name = secure_filename(student_name)
        filename = f"{safe_student_name}_{timestamp}_AnswerSheet.pdf"
        
        save_path = os.path.join(STUDENT_ANSWERS_FOLDER, filename)
        file.save(save_path)
        
        return jsonify({
            "message": "Upload successful", 
            "status": "submitted",
            "filename": filename 
        }), 200
    
    return jsonify({"error": "Invalid file type"}), 400

# --- 5. ADMIN ROUTES ---

# ✅ ADDED: Route to handle Admin Lesson Notes Upload
@app.route('/api/admin/upload-notes', methods=['POST'])
def admin_upload_notes():
    """Endpoint to save PDF study notes for lessons."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(NOTES_FOLDER, filename)
        file.save(save_path)
        return jsonify({
            "message": "Notes uploaded successfully",
            "filename": filename
        }), 200
    
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/admin/upload-exam', methods=['POST'])
def admin_upload_exam():
    """Endpoint for Admin to upload Question Papers categorized by subject and type."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    class_level = request.form.get('classLevel') 
    subject = request.form.get('subject')        
    student_type = request.form.get('studentType') 

    if not all([file.filename, class_level, subject, student_type]):
        return jsonify({"error": "Missing required fields"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    clean_class = class_level.replace(" ", "_")
    filename = secure_filename(f"{clean_class}_Final_Exam.pdf")
    
    target_folder = get_exam_dir(subject, student_type)
    save_path = os.path.join(target_folder, filename)
    
    file.save(save_path)
    return jsonify({"message": f"Successfully published {subject} exam for {class_level}!"}), 200

@app.route('/api/admin/submissions', methods=['GET'])
def get_submissions():
    submissions = []
    if os.path.exists(STUDENT_ANSWERS_FOLDER):
        for filename in os.listdir(STUDENT_ANSWERS_FOLDER):
            submissions.append({
                "filename": filename,
                "url": f"http://localhost:5000/uploads/submissions/{filename}"
            })
    return jsonify(submissions)

@app.route('/api/admin/delete-submission/<filename>', methods=['DELETE', 'OPTIONS'])
def delete_submission(filename):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    try:
        safe_filename = secure_filename(filename)
        file_path = os.path.join(STUDENT_ANSWERS_FOLDER, safe_filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"message": "Submission cleared"}), 200
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/grade-exam', methods=['POST'])
def grade_exam():
    data = request.json
    result = data.get('result')  
    current_class = data.get('currentClass')

    class_map = {
        "Class 1": "Class 2",
        "Class 2": "Class 3",
        "Class 3": "Class 4",
        "Class 4": "Class 5",
        "Class 5": "Graduated"
    }

    if result == "pass":
        next_class = class_map.get(current_class, current_class)
        return jsonify({
            "status": "success",
            "result": "pass",
            "nextClass": next_class
        }), 200
    
    return jsonify({"status": "success", "result": "fail", "nextClass": current_class}), 200

# --- 6. FILE SERVING (ROBUST VERSION) ---

@app.route('/uploads/exams/<subject>/<group>/<filename>')
def serve_exam(subject, group, filename):
    """Explicitly serve exam papers from subject/group subfolders"""
    try:
        # Get the absolute path to the backend folder
        root_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Combine to get: C:/.../backend/uploads/exams/Maths/Standard/
        directory = os.path.join(root_dir, 'uploads', 'exams', subject, group)
        
        print(f"DEBUG: Looking for file in: {directory}") # Look at your terminal/cmd
        return send_from_directory(directory, filename)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/uploads/notes/<filename>')
def serve_notes(filename):
    """Serve lesson notes from uploads/notes"""
    root_dir = os.path.dirname(os.path.abspath(__file__))
    directory = os.path.join(root_dir, 'uploads', 'notes')
    return send_from_directory(directory, filename)

@app.route('/uploads/submissions/<filename>')
def serve_submissions(filename):
    """Serve student answer sheets"""
    root_dir = os.path.dirname(os.path.abspath(__file__))
    directory = os.path.join(root_dir, 'uploads', 'submissions')
    return send_from_directory(directory, filename)
        
if __name__ == "__main__":
    app.run(debug=True, port=5000)