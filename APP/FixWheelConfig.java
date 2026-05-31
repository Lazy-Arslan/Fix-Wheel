package com.example.fixwheel;

/**
 * Base URL of the FixWheel web API (Next.js server).
 *
 * Set per build type in {@code android/app/build.gradle.kts}:
 * debug → http://10.0.2.2:3000 (emulator + local dev)
 * release → FIXWHEEL_API_URL (your Vercel deployment)
 */
public final class FixWheelConfig {

    private FixWheelConfig() {}

    public static final String API_BASE_URL = BuildConfig.API_BASE_URL;
}
