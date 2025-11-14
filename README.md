# Marble

Marble is an Expo React Native application that mirrors the minimal look of iOS Mail to surface only the newsletters in your Gmail inbox.

## Features

- Google OAuth with Gmail Modify scope for archiving
- Newsletter detection powered by GPT-4o mini via your OpenAI API key
- Offline-ready reading with cached HTML assets and remembered scroll positions
- Archive actions that mirror Gmail so your inbox stays tidy everywhere

## Configuration

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a Google OAuth Client ID** with the Gmail Modify scope and add it to your environment:
   ```bash
   export EXPO_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   ```
3. **Provide an OpenAI API key** in-app (Settings → OpenAI API Key) to enable newsletter classification.

## Running Marble

- Start the dev server: `npm start`
- iOS simulator: `npm run ios`
- Android emulator: `npm run android`
- Web preview: `npm run web`

## Project Structure

```
src/
  components/   // UI primitives styled after iOS Mail
  context/      // Auth, settings, and newsletter state containers
  hooks/        // Google OAuth request helper
  screens/      // Feed, reader, sign-in, and settings experiences
  utils/        // Gmail, OpenAI, caching, and storage helpers
```

Cached newsletter data lives in the app's document directory under `marble/` to support offline reading.

## App Metadata

- Bundle identifier: `com.ajuhasz.marble`
- App display name: `Marble`
- Deep link scheme: `marble://`

Ensure you review and comply with App Store guidelines when distributing this app.
