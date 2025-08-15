# 🚀 GitHub Pages Setup Instructions

## Enable GitHub Pages (One-Time Setup)

1. **Go to your repository settings:**
   https://github.com/Robertg761/boreal-smoke-nl/settings/pages

2. **Configure GitHub Pages:**
   - Source: **Deploy from a branch**
   - Branch: **gh-pages**
   - Folder: **/ (root)**
   - Click **Save**

3. **Wait 2-5 minutes for deployment**

4. **Your API is now live at:**
   - Main Page: https://robertg761.github.io/boreal-smoke-nl/
   - Data API: https://robertg761.github.io/boreal-smoke-nl/data.json
   - Metadata: https://robertg761.github.io/boreal-smoke-nl/metadata.json

## 📊 Test Your Live Data Endpoints

Open these URLs in your browser to verify they're working:

1. **API Documentation Page:**
   https://robertg761.github.io/boreal-smoke-nl/

2. **Main Data Feed (JSON):**
   https://robertg761.github.io/boreal-smoke-nl/data.json

3. **Metadata:**
   https://robertg761.github.io/boreal-smoke-nl/metadata.json

## 🔄 Setting Up Automatic Updates

### Option 1: Manual Updates (For Testing)
```bash
cd backend
python update_data.py
```

### Option 2: Windows Task Scheduler (Automated)

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Boreal Smoke NL Data Update"
4. Trigger: Daily, repeat every 30 minutes
5. Action: Start a program
6. Program: `powershell.exe`
7. Arguments: `-ExecutionPolicy Bypass -File "G:\Projects\NL Wildfire & Air Quality Tracker\backend\run_update.ps1"`

### Option 3: GitHub Actions (Cloud-Based)

Create `.github/workflows/update-data.yml`:

```yaml
name: Update Data
on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: |
          pip install -r backend/requirements.txt
          python backend/update_data.py
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## 🧪 Test the Mobile App Integration

Create a test React Native component:

```javascript
// TestDataFetch.js
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

const TestDataFetch = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('https://robertg761.github.io/boreal-smoke-nl/data.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);
  
  return (
    <View>
      <Text>Wildfires: {data?.wildfires?.length || 0}</Text>
      <Text>Last Update: {data?.timestamp}</Text>
    </View>
  );
};
```

## 📱 Mobile App Next Steps

1. **Initialize React Native app:**
```bash
cd mobile-app
npx react-native init BorealSmokeNL
npm install react-native-maps
```

2. **Use the data service example:**
   - Copy `example-data-service.js` to your app
   - Update endpoints to use your GitHub Pages URLs
   - Implement map interface

## ✅ Verification Checklist

- [ ] GitHub Pages is enabled in repository settings
- [ ] https://robertg761.github.io/boreal-smoke-nl/ shows the API page
- [ ] https://robertg761.github.io/boreal-smoke-nl/data.json returns JSON
- [ ] Python environment is set up in backend/
- [ ] Dependencies installed: `pip install -r requirements.txt`
- [ ] Test data update: `python backend/update_data.py`

## 🎉 Success!

Your API is now live and ready for the mobile app to consume! The infrastructure supports thousands of users at virtually no cost.
