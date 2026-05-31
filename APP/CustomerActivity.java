package com.example.fixwheel;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

public class CustomerActivity extends AppCompatActivity {

    private EditText nameET, cnicET, emailET, phoneET,
            cityET, bikeModelET, carModelET, addressET;
    private Button submitBtn;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_customer);

        if (getSupportActionBar() != null)
            getSupportActionBar().setTitle("Customer Registration");

        nameET      = findViewById(R.id.customerName);
        cnicET      = findViewById(R.id.customerCnic);
        emailET     = findViewById(R.id.customerEmail);
        phoneET     = findViewById(R.id.customerPhone);
        cityET      = findViewById(R.id.customerCity);
        bikeModelET = findViewById(R.id.customerBikeModel);
        carModelET  = findViewById(R.id.customerCarModel);
        addressET   = findViewById(R.id.customerAddress);
        submitBtn   = findViewById(R.id.customerSubmitBtn);

        submitBtn.setOnClickListener(v -> submitCustomerData());
    }

    private void submitCustomerData() {
        String name      = nameET.getText().toString().trim();
        String cnic      = cnicET.getText().toString().trim();
        String email     = emailET.getText().toString().trim();
        String phone     = phoneET.getText().toString().trim();
        String city      = cityET.getText().toString().trim();
        String bikeModel = bikeModelET.getText().toString().trim();
        String carModel  = carModelET.getText().toString().trim();
        String address   = addressET.getText().toString().trim();

        if (name.isEmpty() || cnic.isEmpty() || email.isEmpty()
                || phone.isEmpty() || city.isEmpty()) {
            Toast.makeText(this, "Please fill all required fields",
                    Toast.LENGTH_SHORT).show();
            return;
        }

        submitBtn.setEnabled(false);

        try {
            JSONObject body = new JSONObject();
            body.put("name", name);
            body.put("cnic", cnic.replaceAll("\\D", ""));
            body.put("email", email);
            body.put("phone", phone);
            body.put("city", city);
            body.put("bikeModel", bikeModel);
            body.put("carModel", carModel);
            body.put("address", address);

            ApiClient.registerCustomer(body, new ApiClient.SimpleCallback() {
                @Override
                public void onSuccess() {
                    submitBtn.setEnabled(true);
                    Toast.makeText(CustomerActivity.this,
                            "Registration successful! You can now login.",
                            Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(CustomerActivity.this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(intent);
                    finish();
                }

                @Override
                public void onError(String message) {
                    submitBtn.setEnabled(true);
                    Toast.makeText(CustomerActivity.this, message, Toast.LENGTH_LONG).show();
                }
            });
        } catch (Exception e) {
            submitBtn.setEnabled(true);
            Toast.makeText(this, "Invalid data", Toast.LENGTH_SHORT).show();
        }
    }
}
