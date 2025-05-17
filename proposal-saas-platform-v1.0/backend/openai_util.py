
import os
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_proposal_section(prompt, model="gpt-4", max_tokens=500):
    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                { "role": "system", "content": "You are a Shipley-aligned federal proposal writing assistant." },
                { "role": "user", "content": prompt }
            ],
            temperature=0.5,
            max_tokens=max_tokens
        )
        return response.choices[0].message["content"]
    except Exception as e:
        return f"Error generating content: {e}"
