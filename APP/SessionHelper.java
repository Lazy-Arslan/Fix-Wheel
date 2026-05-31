package com.example.fixwheel;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public final class SessionHelper {

    public static final String PREFS_NAME = "FixWheelPrefs";

    private SessionHelper() {}

    public static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static boolean isLoggedIn(Context context) {
        return prefs(context).getBoolean("isLoggedIn", false);
    }

    public static String userType(Context context) {
        return prefs(context).getString("usertype", "");
    }

    public static String username(Context context) {
        return prefs(context).getString("username", "");
    }

    public static String userCnic(Context context) {
        return prefs(context).getString("usercnic", "");
    }

    public static boolean isCustomer(Context context) {
        return isLoggedIn(context) && "customer".equals(userType(context));
    }

    public static boolean isMechanic(Context context) {
        return isLoggedIn(context) && "mechanic".equals(userType(context));
    }

    public static void saveSession(Context context, String username, String cnic, String type) {
        prefs(context).edit()
                .putString("username", username)
                .putString("usercnic", cnic)
                .putString("usertype", type)
                .putBoolean("isLoggedIn", true)
                .apply();
    }

    public static void logout(Context context) {
        prefs(context).edit().clear().apply();
    }

    public static void requireCustomer(Context context) {
        if (!isCustomer(context)) {
            Intent i = new Intent(context, LoginActivity.class);
            i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(i);
            if (context instanceof android.app.Activity) {
                ((android.app.Activity) context).finish();
            }
        }
    }

    public static void requireMechanic(Context context) {
        if (!isMechanic(context)) {
            Intent i = new Intent(context, LoginActivity.class);
            i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(i);
            if (context instanceof android.app.Activity) {
                ((android.app.Activity) context).finish();
            }
        }
    }

    public static Intent homeIntent(Context context) {
        if (isMechanic(context)) {
            return new Intent(context, MechanicHomeActivity.class);
        }
        if (isCustomer(context)) {
            return new Intent(context, MapActivity.class);
        }
        return new Intent(context, LoginActivity.class);
    }
}
