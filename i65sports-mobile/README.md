# i65Sports Mobile App

React Native mobile app for i65Sports - where sports come alive through fan-created Hot Takes.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL and Clerk key

4. Start the development server:

```bash
npm start
```

5. Run on device:

- iOS: Press `i` or scan QR code with Expo Go
- Android: Press `a` or scan QR code with Expo Go

## Project Structure

```
src/
├── navigation/     # React Navigation setup
├── screens/        # App screens (Home, Camera, Profile)
├── services/       # API calls and backend integration
├── types/          # TypeScript type definitions
└── components/     # Reusable UI components (coming soon)
```

## Features

- 📹 60-second Hot Take recording with camera
- 🏀 Browse trending Hot Takes
- 👤 User profiles and stats
- 📍 Venue detection (coming soon)
- 💬 Comments and likes (coming soon)
- 🔔 Push notifications (coming soon)

## Tech Stack

- Expo SDK 51
- React Native 0.74
- TypeScript
- React Navigation
- Expo Camera
- Axios for API calls

