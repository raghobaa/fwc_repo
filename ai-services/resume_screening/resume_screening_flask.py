# filename: resume_screening_flask.py
from flask import Flask, request, render_template, jsonify
import os, re, smtplib, unicodedata
from pdfminer.high_level import extract_text as pdf_extract_text
import docx2txt
from email.message import EmailMessage
from sentence_transformers import SentenceTransformer, util
from dotenv import load_dotenv
import spacy
from flask_cors import CORS

# ---------------- Load Environment Variables ----------------
load_dotenv()
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
APP_PASSWORD = os.getenv("APP_PASSWORD")

# ---------------- Initialize Flask + NLP + Model ----------------
app = Flask(__name__)
CORS(app, origins=["https://fwc-ai-hrms-new.vercel.app"])  # Allow only your frontend origin

model = SentenceTransformer('all-MiniLM-L6-v2')
nlp = spacy.load("en_core_web_sm")

# ---------------- Helper Functions ----------------
def to_ascii(s):
    if not s:
        return ""
    s = s.replace('\xa0', ' ')
    return unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')

def extract_text(file_storage):
    filename = to_ascii(file_storage.filename.lower())
    file_bytes = file_storage.read()
    text = ""

    try:
        temp_path = f"temp_{filename}"
        with open(temp_path, "wb") as f:
            f.write(file_bytes)

        if filename.endswith(".pdf"):
            text = pdf_extract_text(temp_path)
        elif filename.endswith(".docx"):
            text = docx2txt.process(temp_path)
        else:
            text = file_bytes.decode("utf-8", errors="ignore")

        os.remove(temp_path)
    except Exception as e:
        print(f" Error reading {filename}: {e}")
        text = ""

    return to_ascii(text).strip()

def extract_email(text):
    if not text:
        return None

    text = text.replace("\n", " ").replace("\r", " ")
    text = text.replace("[at]", "@").replace("(at)", "@")
    text = text.replace("[dot]", ".").replace("(dot)", ".").lower()
    text = re.sub(r"\s+", " ", text)
    text = to_ascii(text)

    doc = nlp(text)
    for token in doc:
        if token.like_email:
            email = re.sub(r"[^a-zA-Z0-9@._+-]", "", token.text.strip())
            if "@" in email and "." in email.split("@")[-1]:
                print(f"Found email via spaCy: {email}")
                return email

    pattern = re.compile(r"([a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9.\-]+)", re.IGNORECASE)
    matches = re.findall(pattern, text)
    for email in matches:
        clean = email.strip().replace(" ", "").replace("|", "")
        if "@" in clean and not re.search(r"(example\.com|test\.com|email\.com)", clean):
            print(f"Found email via regex: {clean}")
            return clean

    print("No valid email found in this resume.")
    return None

def send_email(to_email, name):
    if not to_email or "@" not in to_email:
        print(f"Invalid email for {name}, skipping.")
        return

    name_ascii = to_ascii(name)
    subject_ascii = to_ascii("Shortlisted for Next Round!")
    body = f"""
Hi {name_ascii},

Congratulations! You have been shortlisted for the next round of our recruitment process.
Our HR team will reach out to you soon with further details.

Regards,
HR Team
"""
    body_ascii = to_ascii(body)

    msg = EmailMessage()
    msg["From"] = to_ascii(SENDER_EMAIL)
    msg["To"] = to_ascii(to_email)
    msg["Subject"] = subject_ascii
    msg.set_content(body_ascii)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.send_message(msg)
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

# ---------------- Routes ----------------
@app.route("/")
def home():
    return render_template("upload.html")

@app.route("/screen", methods=["POST"])
def screen_resumes():
    jd = request.form.get("jd", "").strip()
    cutoff = request.form.get("cutoff", "").strip()
    send_mails = request.form.get("send_mails") == "on"
    resumes = request.files.getlist("resumes[]")

    if not jd:
        return render_template("upload.html", error="Please provide a job description.")
    if not resumes or resumes[0].filename == "":
        return render_template("upload.html", error="Please upload at least one resume.")
    cutoff = float(cutoff) if cutoff else 0.5

    jd_embedding = model.encode(jd, convert_to_tensor=True)
    results = []
    print(f"Total resumes received: {len(resumes)}")

    for file in resumes:
        if not file or file.filename.strip() == "":
            continue

        filename_safe = to_ascii(file.filename)
        print(f"Processing: {filename_safe}")
        file.stream.seek(0)
        resume_text = extract_text(file)
        email = extract_email(resume_text)
        candidate_name = to_ascii(file.filename.rsplit('.', 1)[0])

        if not resume_text.strip():
            print(f"Skipping empty resume: {filename_safe}")
            continue

        resume_embedding = model.encode(resume_text, convert_to_tensor=True)
        score = float(util.cos_sim(jd_embedding, resume_embedding))

        result = {
            "filename": filename_safe,
            "name": candidate_name,
            "email": email or "Not Found",
            "score": round(score, 3),
            "status": "Shortlisted" if score >= cutoff else "❌ Not Shortlisted"
        }
        results.append(result)

        if send_mails and email and score >= cutoff:
            send_email(email, candidate_name)

    results.sort(key=lambda x: x["score"], reverse=True)
    print(f"Screening complete. {len(results)} resumes processed.")
    return render_template("results.html", results=results, cutoff=cutoff)

@app.route("/api/screen", methods=["POST"])
def api_screen_resumes():
    jd = request.form.get("jd", "").strip()
    cutoff = request.form.get("cutoff", "").strip()
    send_mails = request.form.get("send_mails") == "on"
    resumes = request.files.getlist("resumes[]")

    if not jd:
        return jsonify({"success": False, "message": "Job description is required"}), 400
    if not resumes or (resumes and resumes[0].filename == ""):
        return jsonify({"success": False, "message": "At least one resume is required"}), 400

    cutoff = float(cutoff) if cutoff else 0.5

    jd_embedding = model.encode(jd, convert_to_tensor=True)
    results = []

    for file in resumes:
        if not file or file.filename.strip() == "":
            continue

        filename_safe = to_ascii(file.filename)
        file.stream.seek(0)
        resume_text = extract_text(file)
        email = extract_email(resume_text)
        candidate_name = to_ascii(file.filename.rsplit('.', 1)[0])

        if not resume_text.strip():
            continue

        resume_embedding = model.encode(resume_text, convert_to_tensor=True)
        score = float(util.cos_sim(jd_embedding, resume_embedding))

        result = {
            "filename": filename_safe,
            "name": candidate_name,
            "email": email or "Not Found",
            "score": round(score, 3),
            "status": "Shortlisted" if score >= cutoff else "❌ Not Shortlisted"
        }
        results.append(result)

        if send_mails and email and score >= cutoff:
            send_email(email, candidate_name)

    results.sort(key=lambda x: x["score"], reverse=True)
    return jsonify({"success": True, "results": results, "cutoff": cutoff})

# ---------------- Run App ----------------
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
