package com.example.fixwheel;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.ImageView;
import android.widget.TextView;
import android.view.animation.DecelerateInterpolator;
import androidx.appcompat.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        // Hide action bar for splash screen
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }

        // Get views
        ImageView watermark = findViewById(R.id.watermark);
        ImageView logo      = findViewById(R.id.splashLogo);
        TextView  title     = findViewById(R.id.splashTitle);
        TextView  tagline   = findViewById(R.id.splashTagline);

        // --- WATERMARK: gentle fade in to 8% opacity ---
        watermark.animate()
                .alpha(0.08f)
                .setDuration(2000)
                .setStartDelay(0)
                .start();

        // --- LOGO: slide up from bottom + fade in ---
        logo.animate()
                .translationY(0)
                .alpha(1f)
                .setDuration(700)
                .setStartDelay(100)
                .setInterpolator(new DecelerateInterpolator())
                .start();

        // --- APP NAME: slide in from left + fade in ---
        title.animate()
                .translationX(0)
                .alpha(1f)
                .setDuration(600)
                .setStartDelay(500)
                .setInterpolator(new DecelerateInterpolator())
                .start();

        // --- TAGLINE: slide in from right + fade in ---
        tagline.animate()
                .translationX(0)
                .alpha(1f)
                .setDuration(600)
                .setStartDelay(800)
                .setInterpolator(new DecelerateInterpolator())
                .withEndAction(new Runnable() {
                    @Override
                    public void run() {
                        // After last animation finishes, wait 1.5s then go to LoginActivity
                        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                Intent intent = SessionHelper.homeIntent(SplashActivity.this);
                                startActivity(intent);
                                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                                finish();
                            }
                        }, 2500);
                    }
                })
                .start();
    }
}