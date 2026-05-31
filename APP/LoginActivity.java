package com.example.fixwheel;

import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class LoginActivity extends AppCompatActivity {

    private EditText nameET, cnicET;
    private Button loginBtn;
    private TextView registerTV;
    private SharedPreferences sharedPreferences;
    private static final String PREFS_NAME = "FixWheelPrefs";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        if (getSupportActionBar() != null)
            getSupportActionBar().hide();

        sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        if (SessionHelper.isLoggedIn(this)) {
            startActivity(SessionHelper.homeIntent(this));
            finish();
            return;
        }

        nameET     = findViewById(R.id.loginName);
        cnicET     = findViewById(R.id.loginPhone);
        loginBtn   = findViewById(R.id.loginBtn);
        registerTV = findViewById(R.id.registerNow);

        loginBtn.setOnClickListener(v -> validateAndLogin());

        registerTV.setOnClickListener(v ->
                startActivity(new Intent(LoginActivity.this, MainActivity.class)));
    }

    private void validateAndLogin() {
        String name = nameET.getText().toString().trim();
        String cnic = cnicET.getText().toString().trim();

        if (name.isEmpty()) {
            nameET.setError("Please enter your name");
            nameET.requestFocus();
            return;
        }
        if (cnic.isEmpty()) {
            cnicET.setError("Please enter your CNIC");
            cnicET.requestFocus();
            return;
        }

        loginBtn.setEnabled(false);

        ApiClient.login(name, cnic, new ApiClient.LoginCallback() {
            @Override
            public void onSuccess(String userType, String username, String usercnic) {
                loginBtn.setEnabled(true);

                SessionHelper.saveSession(LoginActivity.this, username, usercnic, userType);

                Toast.makeText(LoginActivity.this,
                        "Welcome back, " + username + "!", Toast.LENGTH_SHORT).show();

                if (userType.equals("mechanic")) {
                    startActivity(new Intent(LoginActivity.this, MechanicHomeActivity.class));
                } else {
                    startActivity(new Intent(LoginActivity.this, MapActivity.class));
                }
                finish();
            }

            @Override
            public void onNotFound() {
                loginBtn.setEnabled(true);
                new AlertDialog.Builder(LoginActivity.this)
                        .setTitle("Account Not Found")
                        .setMessage("No account found with this Name and CNIC.\n\nPlease register first to continue.")
                        .setPositiveButton("Register Now", (dialog, which) ->
                                startActivity(new Intent(LoginActivity.this, MainActivity.class)))
                        .setNegativeButton("Try Again", (dialog, which) -> dialog.dismiss())
                        .setCancelable(false)
                        .show();
            }

            @Override
            public void onError(String message) {
                loginBtn.setEnabled(true);
                Toast.makeText(LoginActivity.this, message, Toast.LENGTH_LONG).show();
            }
        });
    }
}
