"""Stamp searchable metadata into the resume PDF (title, author, subject, keywords).
Optional step run by build.sh when the 'pypdf' package is installed (pip install pypdf)."""
import sys
from pypdf import PdfReader, PdfWriter

path = sys.argv[1]
reader = PdfReader(path)
writer = PdfWriter()
writer.append(reader)
writer.add_metadata({
    "/Title": "Ravender Pratap Singh - Resume - Product Analyst, Product Owner, Software Developer",
    "/Author": "Ravender Pratap Singh",
    "/Subject": "Resume: Product Analyst, Product Owner, Software Developer, Operations",
    "/Keywords": "Product Analyst, Product Owner, Business Analyst, Software Developer, Go, Golang, Python, "
                 "FastAPI, React, TypeScript, SQL, PostgreSQL, Agile, Scrum, Scrumban, Jira, Playwright, "
                 "Selenium, Test Automation, LLM, Data Analysis, Stakeholder Management, Operations",
})
with open(path, "wb") as f:
    writer.write(f)
print("metadata stamped")
