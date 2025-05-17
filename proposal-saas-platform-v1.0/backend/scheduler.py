
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import requests
import json
import os

def scan_samgov_periodically():
    print("Running scheduled SAM.gov scan...")
    onboarding_path = "onboarding/"
    for file in os.listdir(onboarding_path):
        if file.endswith("-profile.json"):
            tenant_id = file.split("-")[1]
            payload = { "tenant_id": tenant_id }
            try:
                res = requests.post("http://localhost:8000/scanner/samgov", json=payload)
                if res.status_code == 200:
                    print(f"✅ Scan complete for tenant {tenant_id}")
                else:
                    print(f"❌ Scan failed for tenant {tenant_id}: {res.status_code}")
            except Exception as e:
                print(f"🔥 Error scanning tenant {tenant_id}: {e}")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        scan_samgov_periodically,
        trigger=IntervalTrigger(hours=6),
        id='samgov_scan',
        name='Scan SAM.gov every 6 hours for all tenants',
        replace_existing=True
    )
    scheduler.start()
    print("🔄 Scheduler started: SAM.gov scanning every 6 hours")
