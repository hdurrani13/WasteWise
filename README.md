# WasteWise

A waste-collection app that shows your pickup calendar, reminds you before pickup day, and tells you which bin an item goes in.

![WasteWise screens](docs/preview.png)

> Student project based on a UX redesign from DESN 240 at MacEwan University. Not affiliated with any city. Schedules are sample data.

## Features

- **Calendar:** month view with coloured dots for garbage, recycling, food scraps and yard waste. Filter by type and tap a day for details.
- **Reminders:** an activity feed with pickup reminders and announcements
- **What Goes Where:** search an item to find its bin. If it isn't listed, a machine-learning model makes a guess.
- **Accounts or guest mode**, plus dark mode and 4 languages

## Built with

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI, PostgreSQL
- **ML:** scikit-learn
- **DevOps:** Docker, GitHub Actions, Terraform (AWS)

## Run it locally

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and try the address `10365 111 St NW`.

## Credits

UX research and Figma design by Hamza Durrani, Julia, Teagan and Tarik (DESN 240). App built by Hamza Durrani.
