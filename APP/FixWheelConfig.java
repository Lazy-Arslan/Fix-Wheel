package com.example.fixwheel;

/**
 * Base URL of the FixWheel web API (Next.js server).
 *
 * Android Emulator → http://10.0.2.2:3000
 * Physical phone (same Wi‑Fi as PC) → http://YOUR_PC_IP:3000
 * Deployed web app → https://your-app.vercel.app
 */
public final class FixWheelConfig {

    private FixWheelConfig() {}

    /** Change this to your running web server URL. */
    public static final String API_BASE_URL = "http://10.0.2.2:3000";
}
