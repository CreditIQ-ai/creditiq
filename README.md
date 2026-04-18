# CreditIQ — Deployment Guide
### For complete beginners — follow every step exactly

---

## What you have (5 files)

```
creditiq/
├── vercel.json          ← tells Vercel how to run your app
├── package.json         ← project info
├── api/
│   └── score.js         ← BACKEND: handles AI credit scoring (secret)
└── public/
    ├── index.html       ← FRONTEND: the full website
    ├── style.css        ← FRONTEND: all the styling
    └── app.js           ← FRONTEND: makes the buttons work
```

---

## Step 1 — Get your tools (10 minutes)

1. Download and install **VS Code** (free): https://code.visualstudio.com
2. Download and install **Node.js** (free): https://nodejs.org → click "LTS" version
3. Create a free account on **GitHub**: https://github.com
4. Create a free account on **Vercel**: https://vercel.com (sign in with GitHub)

---

## Step 2 — Get your Anthropic API key (5 minutes)

1. Go to https://console.anthropic.com
2. Sign up for a free account
3. Click "API Keys" → "Create Key"
4. Copy the key — it starts with `sk-ant-...`
5. **Keep this secret — never share it or post it online**

---

## Step 3 — Put the project on GitHub (10 minutes)

1. Open VS Code
2. Click "File" → "Open Folder" → select your `creditiq` folder
3. Open the built-in Terminal: press Ctrl+` (backtick)
4. Type these commands one by one, pressing Enter after each:

```bash
git init
git add .
git commit -m "Initial commit — CreditIQ MVP"
```

5. Go to github.com → click the "+" button → "New repository"
6. Name it `creditiq` → click "Create repository"
7. Copy the commands GitHub shows you under "push an existing repository"
8. Paste them into your VS Code terminal and press Enter

---

## Step 4 — Deploy to Vercel (5 minutes)

1. Go to https://vercel.com and log in
2. Click "Add New Project"
3. Click "Import" next to your `creditiq` GitHub repository
4. Click "Deploy" — wait about 60 seconds
5. You now have a live URL like `creditiq-abc123.vercel.app` 🎉

---

## Step 5 — Add your API key (2 minutes)

Your API key must be added as a secret — never put it in the code files.

1. In Vercel, click on your project
2. Click "Settings" → "Environment Variables"
3. Add a new variable:
   - Name:  `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (your key from Step 2)
4. Click "Save"
5. Go to "Deployments" → click "Redeploy"

Your app is now fully live and working!

---

## How to make changes

1. Edit any file in VS Code
2. Save the file (Ctrl+S)
3. In the terminal:
```bash
git add .
git commit -m "describe what you changed"
git push
```
4. Vercel automatically updates your live site within 30 seconds

---

## Testing your app

Open your Vercel URL and try this test case:

- Business: Mehta Textiles Pvt Ltd
- Industry: Textile / Garments
- Years: 6
- Monthly revenue: 800000
- Monthly expenses: 550000
- GST: Always on time
- Rating: 4.5–5.0 stars
- Loan requested: 2000000

Expected: Score around 700–760, grade AA, verdict "Approved"

---

## Sharing with potential NBFC customers

Just send them your Vercel URL. That's it. No installation needed on their end.

Example message to send:
> "Hi [Name], I've built an AI credit scoring tool for SMEs. 
> You can try it free here: [your-url].vercel.app
> It takes 10 seconds to score any business. 
> Would love your feedback."

---

## Questions?

Come back to Claude and ask — I'll help you fix any issue step by step.
