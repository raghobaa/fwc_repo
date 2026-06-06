#  Bulk Resume Screening App

A Flask-based application that:
- Extracts text from PDF/DOCX resumes
- Uses NLP to extract email addresses
- Screens candidates based on job description
- Auto-sends shortlist emails

##  Tech Stack
- Python, Flask
- spaCy NLP
- Sentence Transformers
- PDFMiner & docx2txt

##  Run Locally

```bash
git clone <repo-url>
cd your-project
pip install -r requirements.txt
python resume_screening_flask.py
