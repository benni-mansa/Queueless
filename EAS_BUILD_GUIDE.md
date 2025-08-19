# EAS Android Build Guide - Hospital Queue App

## Prerequisites

Before building your standalone Android app, ensure you have:

1. **Node.js** (v18 or higher)
2. **Expo CLI** installed globally: `npm install -g @expo/cli`
3. **EAS CLI** installed: `npm install -g eas-cli`
4. **Expo account** (create one at [expo.dev](https://expo.dev))
5. **Android Studio** (for local development and testing)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Login to Expo

```bash
eas login
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Initialize EAS Project (First Time Only)

```bash
eas build:configure
```

## Build Commands

### Preview Build (APK - Recommended for Testing)

This creates an APK file that can be directly installed on Android devices:

```bash
npm run build:android-preview
```

Or directly:
```bash
eas build --platform android --profile preview
```

### Production Build (AAB - For Play Store)

This creates an Android App Bundle for Play Store submission:

```bash
npm run build:android-production
```

Or directly:
```bash
eas build --platform android --profile production
```

### Development Build

For development with custom native code:

```bash
eas build --platform android --profile development
```

## Build Profiles

### Preview Profile
- **Build Type**: APK
- **Distribution**: Internal
- **Use Case**: Testing, sharing with stakeholders
- **File Size**: Larger than AAB
- **Installation**: Direct APK installation

### Production Profile
- **Build Type**: AAB (Android App Bundle)
- **Distribution**: Internal (can be changed to store)
- **Use Case**: Play Store submission
- **File Size**: Optimized
- **Installation**: Play Store only

## Build Process

1. **Upload**: Your code is uploaded to EAS Build servers
2. **Build**: Native Android app is compiled in the cloud
3. **Download**: Build artifacts are available for download
4. **Install**: APK can be directly installed on Android devices

## Build Time

- **First Build**: 15-25 minutes
- **Subsequent Builds**: 10-15 minutes
- **Build Queue**: Varies based on server load

## Installing the APK

### Method 1: Direct Download
1. Download the APK from the build link
2. Enable "Install from Unknown Sources" in Android settings
3. Open the APK file and install

### Method 2: ADB Installation
```bash
adb install path/to/your-app.apk
```

### Method 3: QR Code (if using Expo Go)
Scan the QR code from the build page

## Troubleshooting

### Common Build Errors

1. **Environment Variables Missing**
   - Ensure `.env` file exists
   - Check variable names match `app.config.js`

2. **Build Fails**
   - Check build logs for specific errors
   - Verify all dependencies are installed
   - Ensure app.config.js is valid

3. **APK Won't Install**
   - Check Android version compatibility
   - Verify APK file integrity
   - Enable unknown sources installation

### Performance Tips

1. **Clean Builds**: Use `eas build --clear-cache` for fresh builds
2. **Parallel Builds**: Run multiple builds simultaneously if needed
3. **Build History**: Monitor build times and optimize accordingly

## Next Steps

After successful build:

1. **Test the APK** on various Android devices
2. **Gather Feedback** from test users
3. **Iterate** based on testing results
4. **Prepare for Production** when ready

## Support

- **EAS Documentation**: [docs.expo.dev/eas](https://docs.expo.dev/eas)
- **Expo Discord**: [discord.gg/expo](https://discord.gg/expo)
- **GitHub Issues**: Report bugs in the project repository

## Build Status

- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] EAS project initialized
- [ ] Preview build completed
- [ ] APK tested on device
- [ ] Production build ready
