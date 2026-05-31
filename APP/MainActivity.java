package com.example.fixwheel;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private Button customerBtn, mechanicBtn;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize buttons
        customerBtn = findViewById(R.id.customerBtn);
        mechanicBtn = findViewById(R.id.mechanicBtn);

        // Customer button click listener
        customerBtn.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, CustomerActivity.class);
            startActivity(intent);
        });

        // Mechanic button click listener
        mechanicBtn.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, MechanicActivity.class);
            startActivity(intent);
        });
    }
}