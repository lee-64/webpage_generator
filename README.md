## Running our app


#### Setting up frontend 

```bash
cd frontend

npm install

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

#### Setting up backend

Then, in a new terminal window run the backend 


```bash
cd backend

# create a virtual environment
python3.11 -m venv .venv

# install requirements
pip install -r requirements.txt

# run the app
cd app

export GROQ_API_KEY=______

python -m generator
```

## Next Steps

backend:
- ability to include photos in llama's response; one way could be to have a dozen images in the repository that llama can pull from


frontend:
- implement a simple way to clear the current chat (probably don't need to "create a new chat" like chatgpt or claude--I think I'm okay with this app being a one-page, no-storage app that doesn't save your chat history once you navigate away if you are)


other:
- Make GitHub repo public and have it linked somewhere with an option to give it a Star
- “advanced settings/look inside!” to modify system prompt, etc.
- model toggle (at the app's header bar?)
  - toggle between 2 models (1 strong but slow, 1 weaker but fast; llama-3.3-70b-versatile & llama3-8b-8192?)
