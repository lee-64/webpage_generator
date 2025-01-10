# [ForgeUI](https://useforgeui.vercel.app)
Instantly generate and render modern React and Tailwind CSS components. Powered by Groq, creating and shipping front-end web apps has never been easier.

ForgeUI is:
>3.8x faster than Anthropic’s Claude 3.5 Sonnet  
>Capable of rendering generated code in-browser, setting it apart from OpenAI's ChatGPT  
>Accessible to all, no coding experience required  

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

export GROQ_API_KEY=______  # or, optionally create a .env file

python -m generator
```

## Next Steps

backend:
- ability to include photos in llama's response; one way could be to have a dozen images in the repository that llama can pull from


frontend:
- implement a simple way to clear the current chat
