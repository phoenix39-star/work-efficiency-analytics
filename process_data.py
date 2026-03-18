import json, re, sys

# Raw data will be piped in as JSON
raw = json.load(sys.stdin)

NAME_MAP = {
    "Phoenix": "Phoenix",
    "Ivee dễ thương nhất trên đời": "Ivee",
    "Kashy": "Kashy",
    "Qui Ti": "Qui Ti",
    "Hưng": "Hưng",
    "Kairenz": "Kairenz"
}

def to_num(v):
    if isinstance(v, (int, float)):
        return v
    if not v:
        return 0
    return float(str(v).replace(',', '.') or 0) if str(v).strip() else 0

def normalize_date(d):
    if not d:
        return ''
    s = str(d).replace('-', '/')
    parts = s.split('/')
    if len(parts) == 3:
        day = parts[0].zfill(2)
        month = parts[1].zfill(2)
        year = parts[2]
        return f"{year}-{month}-{day}"
    return ''

members = {}
member_names = []

for sheet_name, display_name in NAME_MAP.items():
    if sheet_name not in raw:
        continue
    rows_raw = raw[sheet_name]
    if len(rows_raw) < 2:
        continue
    member_names.append(display_name)
    rows = []
    for row in rows_raw[1:]:  # skip header
        if not row or not row[0]:
            continue
        date = normalize_date(row[0])
        if not date:
            continue
        rows.append({
            "date": date,
            "task": str(row[1] if len(row) > 1 else ''),
            "description": str(row[2] if len(row) > 2 else ''),
            "startTime": str(row[3] if len(row) > 3 else ''),
            "endTime": str(row[4] if len(row) > 4 else ''),
            "hours": to_num(row[5] if len(row) > 5 else 0),
            "dayTotal": to_num(row[6] if len(row) > 6 else 0),
            "week": str(row[7] if len(row) > 7 else ''),
            "weekTotal": to_num(row[8] if len(row) > 8 else 0),
            "weekdayTotal": to_num(row[9] if len(row) > 9 else 0),
            "weekendTotal": to_num(row[10] if len(row) > 10 else 0),
            "weekCounted": to_num(row[11] if len(row) > 11 else 0),
        })
    members[display_name] = rows

output = {"members": members, "memberNames": member_names}
with open("/Users/aaaaa/Claude code/Work Efficiency/data.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=1)

print(f"Written data.json with {len(member_names)} members, {sum(len(v) for v in members.values())} total rows")
