
import csv
import json
import os
from fastapi.responses import FileResponse

def export_csv(source_path, headers, fields, output_path):
    with open(source_path) as f:
        data = json.load(f)

    with open(output_path, "w", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=headers)
        writer.writeheader()
        for entry in data:
            row = {field: entry.get(field, "") for field in fields}
            writer.writerow(row)

    return output_path
