---
name: Android screen-time limits
description: Native Android requirements and honest capability boundaries for Pause Active.
---

Pause Active's Expo Go version does not read phone-wide usage statistics, lock other apps, or automatically analyze exercise videos. School quizzes run offline and award a bonus at the passing score. Recording push-ups alone does not award a bonus; physical rewards stay unavailable until pose detection is implemented.

**Why:** Android phone-wide usage and enforcement require native permissions and an enforcement approach that Expo Go does not provide. Automatic pose verification also needs a real on-device or server-side vision implementation.

**How to apply:** Do not describe the current preview as tracking or blocking the whole phone, or as automatically validating push-ups. Keep physical rewards disabled until an on-device pose counter is implemented and tested on Android.
