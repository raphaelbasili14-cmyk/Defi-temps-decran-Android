---
name: Android screen-time limits
description: Native Android requirements and honest capability boundaries for Pause Active.
---

Pause Active has an Android-only Expo native module that reads daily app foreground time through UsageStatsManager after the user grants the special Usage Access setting. It is unavailable in Expo Go, which has a different Android package identity. This reports app-usage statistics; it does not lock other apps or automatically analyze exercise videos. School quizzes run offline and award a bonus at the passing score. Recording push-ups alone does not award a bonus; physical rewards stay unavailable until pose detection is implemented.

**Why:** Android UsageStatsManager requires a standalone app with a stable package ID and explicit user approval in Settings. Reading usage is separate from enforcing a limit. Automatic pose verification also needs a real on-device or server-side vision implementation.

**How to apply:** Distinguish Expo Go from the installed APK. Describe UsageStats as app foreground-time reporting, not app blocking or perfect device-screen-on measurement. Keep physical rewards disabled until an on-device pose counter is implemented and tested on Android.
