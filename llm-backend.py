from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

LM_STUDIO_URL = 'http://127.0.0.1:1234/v1/chat/completions'
MODEL_ID = 'deepseek-r1-distill-qwen-7b'

@app.route('/analyze', methods=['POST'])
def analyze():
    print('Received /analyze request')
    req_data = request.get_json(silent=True)
    if not isinstance(req_data, dict):
        req_data = {}
    print('Request data:', req_data)
    parent_responses = req_data.get('parentResponses', {})
    child_responses = req_data.get('childResponses', {})
    system_prompt = req_data.get('systemPrompt', '')
    user_prompt = req_data.get('userPrompt', '')

    context_messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    data = {
        "model": MODEL_ID,
        "messages": context_messages,
        "temperature": 0.7,
        "max_tokens": 1000,
        "stream": False
    }
    headers = {"Content-Type": "application/json"}
    try:
        print('Sending request to LM Studio:', data)
        response = requests.post(LM_STUDIO_URL, headers=headers, json=data)
        response.raise_for_status()
        full_response = response.json()
        print('Response from LM Studio:', full_response)
        return jsonify(full_response)
    except Exception as e:
        print('Error in /analyze:', str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=4000) 