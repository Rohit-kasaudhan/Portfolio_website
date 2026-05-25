import os
import re
from bs4 import BeautifulSoup
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    print("Error: Missing SUPABASE_URL, SUPABASE_KEY, or GEMINI_API_KEY in environment variables.")
    exit(1)

# Configure clients
genai.configure(api_key=GEMINI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_embedding(text: str) -> list:
    """Generate a 768-dimensional embedding vector for a given text chunk using Gemini API."""
    try:
        response = genai.embed_content(
            model="models/gemini-embedding-2",
            content=text,
            task_type="retrieval_document",
            output_dimensionality=768
        )
        return response['embedding']
    except Exception as e:
        print(f"Error generating embedding for: {text[:50]}... Error: {e}")
        return []

def parse_portfolio_html(filepath: str) -> list:
    """Parse index.html and extract text chunks for bio, skills, services, and projects."""
    if not os.path.exists(filepath):
        print(f"Error: HTML portfolio file not found at {filepath}")
        return []

    with open(filepath, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    chunks = []

    # 1. Extract Hero Title and Tagline
    hero_title = "Rohit Kasaudhan"
    tagline = ""
    hero_tag = soup.find(class_="hero-tag")
    if hero_tag:
        tagline = hero_tag.get_text(strip=True)
    
    hero_sub = soup.find(class_="hero-sub")
    subtext = ""
    if hero_sub:
        subtext = hero_sub.get_text(strip=True)
        
    hero_chunk = f"Name: {hero_title}\nTagline/Role: {tagline}\nIntro: {subtext}"
    chunks.append({
        "content": hero_chunk,
        "metadata": {"section": "hero", "source": "index.html"}
    })

    # 2. Extract About text
    about_text = ""
    about_texts = soup.find_all(class_="about-text")
    for at in about_texts:
        about_text += at.get_text(strip=True) + "\n"
    if about_text:
        chunks.append({
            "content": f"About Rohit Kasaudhan:\n{about_text.strip()}",
            "metadata": {"section": "about", "source": "index.html"}
        })

    # 3. Extract Skills list
    skills = []
    skill_spans = soup.find_all(class_="skill")
    for span in skill_spans:
        skills.append(span.get_text(strip=True))
    if skills:
        skills_chunk = "Rohit's Technical Skills & Core Competencies:\n" + ", ".join(skills)
        chunks.append({
            "content": skills_chunk,
            "metadata": {"section": "skills", "source": "index.html"}
        })

    # 4. Extract Services/Expertise
    svc_items = soup.find_all(class_="svc-item")
    for svc in svc_items:
        name_div = svc.find(class_="svc-name")
        desc_div = svc.find(class_="svc-desc")
        if name_div and desc_div:
            svc_title = name_div.get_text(strip=True)
            svc_desc = desc_div.get_text(strip=True)
            chunks.append({
                "content": f"Rohit's Expertise Area - {svc_title}:\n{svc_desc}",
                "metadata": {"section": "services", "source": "index.html", "service": svc_title}
            })

    # 5. Extract Projects
    wcards = soup.find_all(class_="wcard")
    for card in wcards:
        cat_div = card.find(class_="wcard-cat")
        title_div = card.find(class_="wcard-title")
        desc_div = card.find(class_="wcard-desc")
        github_href = card.get("href", "")

        if title_div and desc_div:
            title = title_div.get_text(strip=True)
            desc = desc_div.get_text(strip=True)
            category = cat_div.get_text(strip=True) if cat_div else "Project"
            project_chunk = (
                f"Project Title: {title}\n"
                f"Category: {category}\n"
                f"Description: {desc}\n"
                f"GitHub Link: {github_href}"
            )
            chunks.append({
                "content": project_chunk,
                "metadata": {"section": "projects", "source": "index.html", "project": title}
            })

    return chunks

def get_manual_chunks() -> list:
    """Generate supplemental data chunks for contact details, FAQ, and credentials."""
    chunks = [
        {
            "content": "Rohit Kasaudhan Contact Information & Links:\n"
                       "- Email: ksdrohit28@gmail.com\n"
                       "- GitHub Profile: https://github.com/Rohit-kasaudhan\n"
                       "- LinkedIn Profile: https://www.linkedin.com/in/rohit-kasaudhan/\n"
                       "- Resume / CV Download: https://drive.google.com/file/d/1DKam_WIf827Ise-tznI5jaURlvZ12QwY/view?usp=sharing",
            "metadata": {"section": "contact", "source": "manual"}
        },
        {
            "content": "FAQ - How to hire or recruit Rohit Kasaudhan?\n"
                       "You can hire Rohit by emailing him at ksdrohit28@gmail.com, sending an inquiry on LinkedIn, "
                       "or checking his project works on GitHub. He is open to internships, full-time roles, "
                       "and open-source ML collaborations.",
            "metadata": {"section": "faq", "source": "manual"}
        },
        {
            "content": "FAQ - What B.Tech course is Rohit Kasaudhan pursuing?\n"
                       "Rohit is pursuing a B.Tech degree in Computer Science & Engineering (CSE) from "
                       "KIIT University (Kalinga Institute of Industrial Technology), located in Bhubaneswar, Odisha, India.",
            "metadata": {"section": "education", "source": "manual"}
        },
        {
            "content": "FAQ - Tell me about the Email Spam Detection project.\n"
                       "This is a machine learning web app developed by Rohit in 2024 that classifies email and SMS messages "
                       "as either Spam or Ham (Legitimate). It uses a Multinomial Naive Bayes classifier and TF-IDF "
                       "vectorization for text representation, wrapped in a clean, interactive Streamlit GUI. "
                       "GitHub Repo: https://github.com/Rohit-kasaudhan/Email_Spam_Detection",
            "metadata": {"section": "projects", "source": "manual", "project": "Email Spam Detection"}
        },
        {
            "content": "FAQ - Tell me about the Research Paper Q&A Agent.\n"
                       "It is a conversational AI agent designed by Rohit in 2024 that answers questions from AI/ML research papers. "
                       "It uses Retrieval-Augmented Generation (RAG), ChromaDB vector database, and the Gemini 2.5 Flash API. "
                       "It utilizes LangGraph state-charts to coordinate agent reasoning flow and Streamlit for the user dashboard. "
                       "GitHub Repo: https://github.com/Rohit-kasaudhan/Research-Paper-Q-A-Agent",
            "metadata": {"section": "projects", "source": "manual", "project": "Research Paper Q&A Agent"}
        },
        {
            "content": "FAQ - Tell me about the Attend-X Face Recognition Attendance System.\n"
                       "It is a desktop application developed by Rohit in 2024 for student attendance. It utilizes "
                       "computer vision and the Local Binary Patterns Histograms (LBPH) face recognition algorithm via OpenCV. "
                       "It features an interactive GUI built with Tkinter and stores attendance records in a MySQL database. "
                       "GitHub Repo: https://github.com/Rohit-kasaudhan/Attend-X-Face-Recognition-Attendance-System-",
            "metadata": {"section": "projects", "source": "manual", "project": "Attend-X"}
        },
        {
            "content": "FAQ - Tell me about the NEPSE Stock Price Notifier.\n"
                       "It is an automated scraper notification script built by Rohit in 2023. It tracks stock price fluctuations "
                       "on the Nepal Stock Exchange (NEPSE) in real time using web scraping techniques. It triggers alert emails "
                       "via SMTP whenever configured buy/sell threshold values are crossed. "
                       "GitHub Repo: https://github.com/Rohit-kasaudhan/NEPSE-Stock-Price-Notifier",
            "metadata": {"section": "projects", "source": "manual", "project": "NEPSE Stock Price Notifier"}
        }
    ]
    return chunks

def main():
    print("Starting portfolio data ingestion...")
    
    # 1. Clear existing database rows
    print("Clearing existing records from public.portfolio_embeddings...")
    try:
        supabase.table("portfolio_embeddings").delete().neq("id", 0).execute()
        print("Existing database rows cleared successfully.")
    except Exception as e:
        print(f"Notice: Failed to clear old database rows (or database is already empty): {e}")

    # 2. Extract chunks from index.html
    html_path = os.path.join("..", "website", "index.html")
    print(f"Reading and parsing {html_path}...")
    html_chunks = parse_portfolio_html(html_path)
    
    # 3. Get manual faq chunks
    manual_chunks = get_manual_chunks()
    
    all_chunks = html_chunks + manual_chunks
    print(f"Total chunks to process: {len(all_chunks)}")

    # 4. Generate embeddings and insert into Supabase
    success_count = 0
    for idx, chunk in enumerate(all_chunks):
        text = chunk["content"]
        metadata = chunk["metadata"]
        
        print(f"Ingesting chunk {idx+1}/{len(all_chunks)}: {text[:45]}...")
        
        # Get vector embedding
        embedding = get_embedding(text)
        if not embedding:
            print("Skipping chunk due to embedding generation failure.")
            continue
            
        # Write to Supabase
        try:
            supabase.table("portfolio_embeddings").insert({
                "content": text,
                "metadata": metadata,
                "embedding": embedding
            }).execute()
            success_count += 1
        except Exception as e:
            print(f"Database insertion failed for chunk: {e}")

    print(f"Ingestion complete! Successfully indexed {success_count}/{len(all_chunks)} chunks in Supabase pgvector.")

if __name__ == "__main__":
    main()
