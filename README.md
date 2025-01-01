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
- reprompt feature:
  - user can click on their preferred webpage response card
    - selected card moves to center, all other cards disappear
  - a new prompt text box appears (underneath?) where the user can iterate upon their chosen response card
  - loop this


frontend:
- fine-tune llama-3.3-70b-versatile for coding
  - train it on good design principles such as those from [refactoringUI eBook](https://www.refactoringui.com/)
- implement stylistic choices

### Final Steps

- model toggle (at the app's header bar?)
  - toggle between 2 models (1 strong but slow, 1 weaker but fast; llama-3.3-70b-versatile & llama3-8b-8192?)
- _secure_ text box prompt for the user to input their Groq API key before using the app