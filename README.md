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

python -m generate.py
```