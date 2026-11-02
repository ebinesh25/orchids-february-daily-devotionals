import argparse
import json

# Load both files
parser = argparse.ArgumentParser()
parser.add_argument('--english', default='july-english.json')
parser.add_argument('--tamil', default='july-tamil.json')
parser.add_argument('--output', default='output.json')
args = parser.parse_args()

with open(args.tamil, 'r', encoding='utf-8') as f:
    tamil_data = json.load(f)

with open(args.english, 'r', encoding='utf-8') as f:
    english_data = json.load(f)

# Output structure
out = {}

# Assuming both lists are same length and aligned by index
for i, (en, ta) in enumerate(zip(english_data, tamil_data), start=1):
    day_key = f"day{i}"

    out[day_key] = {
        "english": {
            "title": en.get("title", ""),
            "data": en.get("description", "")
        },
        "tamil": {
            "title": ta.get("title", ""),
            "data": ta.get("description", "")
        }
    }

# Save output
with open(args.output, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print("✅ JSON merged successfully")
