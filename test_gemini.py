import os
import urllib.request
import json
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("GCP_API_KEY")

models = [
    "gemini-1.0-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.5-flash-latest"
]

data = {
    "contents": [{"parts": [{"text": "Say hi"}]}]
}
body = json.dumps(data).encode('utf-8')

for model in models:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
    req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            print(f"[SUCCESS] {model}: {res['candidates'][0]['content']['parts'][0]['text'].strip()}")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode()
        print(f"[FAILED] {model}: {e.code} - {err_msg[:100]}...")
    except Exception as e:
        print(f"[FAILED] {model}: {str(e)}")
