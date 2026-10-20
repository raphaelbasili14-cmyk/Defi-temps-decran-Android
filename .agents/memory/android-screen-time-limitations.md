---
name: Android screen-time limits
description: Native Android requirements and honest capability boundaries for Pause Active.
---

Pause Active's Expo Go version does not read phone-wide usage statistics, lock other apps, or automatically analyze exercise videos. Its settings and challenge bonuses are stored locally; filmed challenges are reviewed and confirmed by the user.

**Why:** Android phone-wide usage and enforcement require native permissions and an enforcement approach that Expo Go does not provide. Automatic pose verification also needs a real on-device or server-side vision implementation.

**How to apply:** Do not describe the current preview as tracking or blocking the whole phone, or as automatically validating push-ups. Keep the distinction visible until those native capabilities are implemented and tested on Android.
