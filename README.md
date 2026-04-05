# team-chai
something something health fitness app

## Setup

### Frontend

React Native + Expo (TypeScript)

#### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Android Studio](https://developer.android.com/studio)
- [Expo Go](https://expo.dev/go) installed on your phone

#### Android Studio Setup

1. Open Android Studio → **More Actions** → **SDK Manager**
   - Note: older docs refer to a "Configure" button — this has been renamed in newer versions
2. Under **SDK Platforms**, install **Android 15 (VanillaIceCream)** (API 35)
3. Under **SDK Tools**, ensure these are checked: Android SDK Build-Tools, Android Emulator, Android SDK Platform-Tools
4. Set environment variables:
   - `ANDROID_HOME` = `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
   - Add to `Path`: `%ANDROID_HOME%\platform-tools`

Full guide: https://reactnative.dev/docs/set-up-your-environment

#### Setup

```bash
cd frontend
npm install
```

### Backend

FastAPI (Python 3.13+)

#### Prerequisites

- Python 3.13+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (recommended) or pip

#### Option 1: uv (recommended)

```bash
cd backend
uv sync
```

#### Option 2: pip

```bash
cd backend
python -m venv .venv
```

Windows:
```bash
.venv\Scripts\activate
```

Mac/Linux:
```bash
source .venv/bin/activate
```

Then:
```bash
pip install -r requirements.txt
```

## Running the applications

### Frontend

```bash
cd frontend
npx expo start
```

Then scan the QR code with the Expo Go app on your phone. Your phone and computer must be on the same WiFi network.

Press `a` to open on an Android emulator, or `w` for the web browser.

### Backend

uv:
```bash
cd backend
uv run fastapi dev main.py
```

pip (with venv activated):
```bash
cd backend
fastapi dev main.py
```