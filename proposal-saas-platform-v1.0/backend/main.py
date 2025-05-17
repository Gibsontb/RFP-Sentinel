
from scheduler import start_scheduler
start_scheduler()

from middleware import TenantMiddleware
app.add_middleware(TenantMiddleware)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PARAMS = {
    'dbname': os.getenv('POSTGRES_DB'),
    'user': os.getenv('POSTGRES_USER'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'host': 'db',
    'port': 5432
}

@app.post("/onboard")
async def onboard(request: Request):
    data = await request.json()
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO tenants (
            name, email, uei, cage_code, naics, psc, keywords,
            sam_api_key, fedconnect_user, gsabuy_email,
            itar, cleared, vehicles, certifications, teaming, partners,
            plan, max_users, region
        ) VALUES (
            %(name)s, %(email)s, %(uei)s, %(cage_code)s, %(naics)s, %(psc)s, %(keywords)s,
            %(sam_api_key)s, %(fedconnect_user)s, %(gsabuy_email)s,
            %(itar)s, %(cleared)s, %(vehicles)s, %(certifications)s, %(teaming)s, %(partners)s,
            %(plan)s, %(max_users)s, %(region)s
        )
    """, {
        'name': data.get('name'),
        'email': data.get('email'),
        'uei': data.get('uei'),
        'cage_code': data.get('cage_code'),
        'naics': data.get('naics').split(','),
        'psc': data.get('psc').split(','),
        'keywords': data.get('keywords'),
        'sam_api_key': data.get('sam_api_key'),
        'fedconnect_user': data.get('fedconnect_user'),
        'gsabuy_email': data.get('gsabuy_email'),
        'itar': data.get('itar'),
        'cleared': data.get('cleared'),
        'vehicles': data.get('vehicles').split(','),
        'certifications': data.get('certifications').split(','),
        'teaming': data.get('teaming'),
        'partners': data.get('partners'),
        'plan': data.get('plan'),
        'max_users': data.get('max_users'),
        'region': data.get('region')
    })
    conn.commit()
    cur.close()
    conn.close()
    return {"message": f"Tenant {data.get('name')} onboarded and stored."}

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.hash import bcrypt
import psycopg2
import os
import datetime

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

SECRET_KEY = "super-secret-key"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

DB_PARAMS = {
    'dbname': os.getenv('POSTGRES_DB'),
    'user': os.getenv('POSTGRES_USER'),
    'password': os.getenv('POSTGRES_PASSWORD'),
    'host': 'db',
    'port': 5432
}

def get_db():
    return psycopg2.connect(**DB_PARAMS)

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/register")
async def register(request: Request):
    data = await request.json()
    hashed = bcrypt.hash(data["password"])
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO users (tenant_id, name, email, password_hash, role, position, phone, extension)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data["tenant_id"], data["name"], data["email"], hashed, data["role"],
        data.get("position"), data.get("phone"), data.get("extension")
    ))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "User registered successfully."}
@app.post("/login")
async def login(request: Request):
    data = await request.json()
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, password_hash, tenant_id, role FROM users WHERE email=%s", (data["email"],))
    user = cur.fetchone()
    cur.close()
    conn.close()
    if not user or not bcrypt.verify(data["password"], user[1]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"user_id": user[0], "tenant_id": user[2], "role": user[3]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
async def me(user=Depends(verify_token)):
    return {"user": user}

from fastapi import Path

@app.get("/users")
async def get_users(user=Depends(verify_token)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, role, is_active FROM users WHERE tenant_id = %s", (user["tenant_id"],))
    users = cur.fetchall()
    cur.close()
    conn.close()
    return {"users": [{"id": u[0], "name": u[1], "email": u[2], "role": u[3], "is_active": u[4]} for u in users]}

@app.post("/user/{user_id}/toggle")
async def toggle_user(user_id: int = Path(...), user=Depends(verify_token)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT tenant_id, is_active FROM users WHERE id = %s", (user_id,))
    record = cur.fetchone()
    if not record or record[0] != user["tenant_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    new_status = not record[1]
    cur.execute("UPDATE users SET is_active = %s WHERE id = %s", (new_status, user_id))
    conn.commit()
    cur.close()
    conn.close()
    return {"status": "updated", "active": new_status}

@app.get("/tenant/license")
async def get_license_info(user=Depends(verify_token)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT max_users FROM tenants WHERE id = %s", (user["tenant_id"],))
    max_users = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM users WHERE tenant_id = %s", (user["tenant_id"],))
    active_users = cur.fetchone()[0]
    cur.close()
    conn.close()
    return {"active_users": active_users, "max_users": max_users}

@app.get("/tenant/profile")
async def get_tenant_profile(user=Depends(verify_token)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT name, uei, cage_code, naics, psc, keywords, sam_api_key, 
               fedconnect_user, gsabuy_email, itar, cleared, vehicles, 
               certifications, teaming, partners, region, profile_complete
        FROM tenants WHERE id = %s
    """, (user["tenant_id"],))
    profile = cur.fetchone()
    cur.close()
    conn.close()
    return {"profile": profile}

@app.post("/tenant/profile")
async def update_tenant_profile(request: Request, user=Depends(verify_token)):
    data = await request.json()
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        UPDATE tenants SET
            name = %s, uei = %s, cage_code = %s, naics = %s, psc = %s, keywords = %s,
            sam_api_key = %s, fedconnect_user = %s, gsabuy_email = %s,
            itar = %s, cleared = %s, vehicles = %s, certifications = %s,
            teaming = %s, partners = %s, region = %s, profile_complete = TRUE
        WHERE id = %s
    """, (
        data["name"], data["uei"], data["cage_code"], data["naics"].split(","), data["psc"].split(","), data["keywords"],
        data["sam_api_key"], data["fedconnect_user"], data["gsabuy_email"],
        data["itar"], data["cleared"], data["vehicles"].split(","), data["certifications"].split(","),
        data["teaming"], data["partners"], data["region"], user["tenant_id"]
    ))
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Business profile updated successfully."}

from fastapi import UploadFile, File, Form

@app.post("/rfp/intake")
async def rfp_intake(
    title: str = Form(...),
    solicitation_number: str = Form(None),
    agency: str = Form(...),
    due_date: str = Form(...),
    naics: str = Form(None),
    psc: str = Form(None),
    contract_type: str = Form(None),
    submission_method: str = Form(None),
    notes: str = Form(None),
    go_no_go: str = Form(...),
    files: list[UploadFile] = File([]),
    user=Depends(verify_token)
):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO rfps (
            tenant_id, title, solicitation_number, agency, due_date,
            naics, psc, contract_type, submission_method, notes, go_no_go
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
    """, (
        user["tenant_id"], title, solicitation_number, agency, due_date,
        naics, psc, contract_type, submission_method, notes, go_no_go
    ))
    conn.commit()
    cur.close()
    conn.close()

    # Handle files later (future S3/MinIO integration)
    return {"message": "RFP intake recorded."}

@app.get("/rfps")
async def list_rfps(user=Depends(verify_token)):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, title, agency, due_date, go_no_go, contract_type, created_at
        FROM rfps WHERE tenant_id = %s
        ORDER BY created_at DESC
    """, (user["tenant_id"],))
    rfps = cur.fetchall()
    cur.close()
    conn.close()
    return {"rfps": [
        {
            "id": r[0], "title": r[1], "agency": r[2],
            "due_date": r[3].isoformat(), "go_no_go": r[4],
            "contract_type": r[5], "created_at": r[6].isoformat()
        } for r in rfps
    ]}

import shutil

@app.post("/rfp/intake")
async def rfp_intake(
    title: str = Form(...),
    solicitation_number: str = Form(None),
    agency: str = Form(...),
    due_date: str = Form(...),
    naics: str = Form(None),
    psc: str = Form(None),
    contract_type: str = Form(None),
    submission_method: str = Form(None),
    notes: str = Form(None),
    go_no_go: str = Form(...),
    files: list[UploadFile] = File([]),
    user=Depends(verify_token)
):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO rfps (
            tenant_id, title, solicitation_number, agency, due_date,
            naics, psc, contract_type, submission_method, notes, go_no_go
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        ) RETURNING id
    """, (
        user["tenant_id"], title, solicitation_number, agency, due_date,
        naics, psc, contract_type, submission_method, notes, go_no_go
    ))
    rfp_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    dir_path = f"modules/01_RFP_Intake_Portal/{user['tenant_id']}/rfp-{rfp_id}"
    os.makedirs(dir_path, exist_ok=True)

    for file in files:
        with open(os.path.join(dir_path, file.filename), "wb") as f_out:
            shutil.copyfileobj(file.file, f_out)

    return {"message": "RFP intake recorded and files saved."}

@app.get("/rfp/{rfp_id}/files")
async def get_rfp_files(rfp_id: int, user=Depends(verify_token)):
    folder = f"modules/01_RFP_Intake_Portal/{user['tenant_id']}/rfp-{rfp_id}"
    if not os.path.exists(folder):
        raise HTTPException(status_code=404, detail="RFP folder not found")
    return {"files": os.listdir(folder)}

from fastapi.responses import JSONResponse

@app.post("/rfp/{rfp_id}/archive")
def archive_rfp(rfp_id: int, user=Depends(verify_token)):
    tenant_id = str(user["tenant_id"])
    source_dir = f"modules/01_RFP_Intake_Portal/{tenant_id}/rfp-{rfp_id}"
    archive_dir = f"modules/08_Proposal_Archive/{tenant_id}"
    archive_zip_path = f"{archive_dir}/rfp-{rfp_id}.zip"

    if not os.path.exists(source_dir):
        raise HTTPException(status_code=404, detail="RFP folder not found")

    os.makedirs(archive_dir, exist_ok=True)
    shutil.make_archive(archive_zip_path[:-4], 'zip', root_dir=source_dir)

    # Optionally update status in DB
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE rfps SET go_no_go = %s WHERE id = %s", ("archived", rfp_id))
    conn.commit()
    cur.close()
    conn.close()

    return JSONResponse(content={"message": f"RFP {rfp_id} archived successfully."})

@app.post("/rfp/{rfp_id}/status")
async def update_rfp_status(rfp_id: int, request: Request, user=Depends(verify_token)):
    data = await request.json()
    new_status = data.get("status")
    if new_status not in ["In Review", "Planning", "Submitted", "Archived"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE rfps SET status = %s WHERE id = %s AND tenant_id = %s", (new_status, rfp_id, user["tenant_id"]))
    conn.commit()
    cur.close()
    conn.close()

    return {"message": f"RFP {rfp_id} status updated to {new_status}"}

from fastapi import UploadFile
import mimetypes

@app.post("/ai/capability/upload")
async def upload_capability(file: UploadFile = File(...), user=Depends(verify_token)):
    tenant_id = str(user["tenant_id"])
    dest_dir = f"modules/03_Capture_Strategy_Repository/{tenant_id}"
    os.makedirs(dest_dir, exist_ok=True)

    file_path = os.path.join(dest_dir, file.filename)
    with open(file_path, "wb") as f_out:
        shutil.copyfileobj(file.file, f_out)

    # Mock AI keyword extraction (normally use LangChain or OpenAI here)
    keywords = ["cloud", "security", "AI", "data", "compliance", "analytics"]

    # Load mock contracts
    with open("ai_engine/mock_contracts.json") as f:
        contracts = json.load(f)

    def score(contract):
        matches = set(contract["keywords"]) & set(keywords)
        return len(matches)

    results = sorted(contracts, key=score, reverse=True)
    top_matches = results[:3]

    return {"message": f"File uploaded and matched. Top results ready.", "matches": top_matches}

@app.get("/ai/matches")
async def get_ai_matches(user=Depends(verify_token)):
    # Simulate pulling last match results based on user
    with open("ai_engine/mock_contracts.json") as f:
        contracts = json.load(f)

    # Simulate returning top 3 AI match results again
    keywords = ["cloud", "security", "AI", "data", "compliance", "analytics"]
    def score(contract):
        matches = set(contract["keywords"]) & set(keywords)
        return len(matches)

    results = sorted(contracts, key=score, reverse=True)
    return {"matches": results[:3]}

@app.post("/templates/upload")
async def upload_template(file: UploadFile = File(...), user=Depends(verify_token)):
    tenant_id = str(user["tenant_id"])
    dest_dir = f"modules/04_Template_Library/{tenant_id}"
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, file.filename)

    with open(dest_path, "wb") as f_out:
        shutil.copyfileobj(file.file, f_out)

    return {"message": "Template uploaded successfully."}

@app.get("/templates")
async def list_templates(user=Depends(verify_token)):
    tenant_id = str(user["tenant_id"])
    dir_path = f"modules/04_Template_Library/{tenant_id}"
    if not os.path.exists(dir_path):
        return {"templates": []}
    files = os.listdir(dir_path)
    return {"templates": [{"name": f, "type": f.split('.')[-1], "url": f"/modules/04_Template_Library/{tenant_id}/{f}"} for f in files]}

@app.get("/templates/categories")
async def list_template_categories():
    root = "modules/04_Template_Library"
    categories = [d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d))]
    return {"categories": categories}

@app.post("/templates/category")
async def create_template_category(data: dict):
    name = data["name"]
    path = os.path.join("modules/04_Template_Library", name)
    os.makedirs(path, exist_ok=True)
    return {"message": f"Category '{name}' created."}

@app.delete("/templates/category")
async def delete_template_category(data: dict):
    name = data["name"]
    path = os.path.join("modules/04_Template_Library", name)
    if os.path.exists(path) and not os.listdir(path):
        os.rmdir(path)
        return {"message": f"Category '{name}' deleted."}
    raise HTTPException(status_code=400, detail="Category not empty or doesn't exist.")

@app.post("/templates/upload")
async def upload_template(category: str = Form(...), file: UploadFile = File(...)):
    dest = os.path.join("modules/04_Template_Library", category)
    os.makedirs(dest, exist_ok=True)
    file_path = os.path.join(dest, file.filename)
    with open(file_path, "wb") as f_out:
        shutil.copyfileobj(file.file, f_out)
    return {"message": f"File '{file.filename}' uploaded to '{category}'."}

@app.get("/templates/{category}")
async def list_templates_in_category(category: str):
    path = os.path.join("modules/04_Template_Library", category)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"files": os.listdir(path)}

@app.delete("/templates/{category}/{filename}")
async def delete_template_file(category: str, filename: str):
    file_path = os.path.join("modules/04_Template_Library", category, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"File '{filename}' deleted from '{category}'."}
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/pastperformance")
async def get_past_performance():
    path = "modules/09_Past_Performance_Library/contracts.json"
    with open(path) as f:
        contracts = json.load(f)
    return {"contracts": contracts}

from fastapi import Request

@app.post("/ai/proposal/chat")
async def ai_proposal_chat(request: Request):
    body = await request.json()
    user_input = body.get("message", "").lower()

    mock_response = "Based on our capability in cloud migration and past performance with the US Army, we propose..."

    if "summary" in user_input:
        mock_response = "Section 3.4 of the PWS requires cloud system hardening and compliance with RMF. We meet these through..."

    elif "win theme" in user_input:
        mock_response = "A strong win theme here could emphasize rapid deployment, proven FedRAMP High delivery, and zero downtime migration."

    elif "rewrite" in user_input:
        mock_response = "Here's a refined version: 'Our approach leverages proven cloud migration success to deliver secure, scalable outcomes within 90 days.'"

    return {"response": mock_response}

@app.get("/reviews/{rfp_id}")
async def get_reviews(rfp_id: str):
    path = f"modules/07_Review_Workflow_Tracker/rfp-{rfp_id}-reviews.json"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="No reviews found")
    with open(path) as f:
        return json.load(f)

@app.post("/reviews/{rfp_id}/add")
async def add_review_comment(rfp_id: str, data: dict):
    section = data["section"]
    reviewer = data["reviewer"]
    note = data["note"]
    status = data.get("status")

    path = f"modules/07_Review_Workflow_Tracker/rfp-{rfp_id}-reviews.json"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Review file not found")

    with open(path) as f:
        review_data = json.load(f)

    section_data = review_data["sections"].get(section, {"status": "Draft", "comments": []})
    section_data["comments"].append({"reviewer": reviewer, "note": note})
    if status:
        section_data["status"] = status

    review_data["sections"][section] = section_data

    with open(path, "w") as f:
        json.dump(review_data, f, indent=2)

    return {"message": "Comment added successfully."}

@app.get("/archive/proposals")
async def get_archived_proposals():
    path = "modules/08_Proposal_Archive/submitted_proposals.json"
    with open(path) as f:
        return json.load(f)

@app.get("/lessons")
async def get_lessons():
    path = "modules/10_Lessons_Learned/lessons.json"
    with open(path) as f:
        return json.load(f)

@app.post("/lessons/add")
async def add_lesson(data: dict):
    path = "modules/10_Lessons_Learned/lessons.json"
    with open(path) as f:
        lessons = json.load(f)

    lessons.append(data)

    with open(path, "w") as f:
        json.dump(lessons, f, indent=2)

    return {"message": "Lesson added successfully."}

@app.post("/scanner/samgov")
async def scan_samgov(data: dict):
    tenant_id = data.get("tenant_id", "001")
    profile_path = f"onboarding/tenant-{tenant_id}-profile.json"
    if not os.path.exists(profile_path):
        raise HTTPException(status_code=404, detail="Profile not found")

    with open(profile_path) as f:
        profile = json.load(f)

    # Normally here you'd call https://api.sam.gov/prod/opportunities/v1/search with API key
    # Example response placeholder:
    matches = [
        {
            "source": "SAM.gov",
            "id": "FA8224-24-R-0015",
            "title": "DevSecOps Software Modernization",
            "agency": "Department of the Air Force",
            "naics": "541512",
            "psc": "D307",
            "match_score": 93,
            "summary": "Solicitation for a modern software pipeline with Kubernetes, RMF, and CI/CD alignment.",
            "url": "https://sam.gov/opp/FA8224-24-R-0015"
        }
    ]

    output_path = "modules/03_Capture_Strategy_Repository/matched_opportunities.json"
    with open(output_path, "w") as f:
        json.dump(matches, f, indent=2)

    return {"message": f"SAM.gov scan complete for tenant {tenant_id}", "matches": matches}

from openai_util import generate_proposal_section

@app.post("/ai/proposal/chat/openai")
async def ai_proposal_openai(request: Request):
    body = await request.json()
    prompt = body.get("message", "")
    result = generate_proposal_section(prompt)
    return {"response": result}

from fastapi.responses import FileResponse
from export_util import export_csv

@app.get("/export/lessons")
def export_lessons():
    source = "modules/10_Lessons_Learned/lessons.json"
    headers = ["rfp_id", "date", "team", "lesson", "tags"]
    fields = ["rfp_id", "date", "team", "lesson", "tags"]
    output = "modules/10_Lessons_Learned/lessons_export.csv"
    export_csv(source, headers, fields, output)
    return FileResponse(output, media_type='text/csv', filename="lessons_export.csv")

@app.get("/export/pastperformance")
def export_past_performance():
    source = "modules/09_Past_Performance_Library/contracts.json"
    headers = ["id", "title", "customer", "status", "period", "tags", "summary"]
    fields = headers
    output = "modules/09_Past_Performance_Library/past_perf_export.csv"
    export_csv(source, headers, fields, output)
    return FileResponse(output, media_type='text/csv', filename="past_performance_export.csv")
