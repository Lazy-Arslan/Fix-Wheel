package com.example.fixwheel;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONObject;

public class MechanicActivity extends AppCompatActivity {

    private static final int REQUEST_SHOP_LOCATION = 401;

    private EditText nameET, cnicET, emailET, phoneET,
            cityET, shopNameET, licenseET, experienceET, addressET;
    private Spinner specializationSpinner;
    private Button submitBtn, pickLocationBtn;
    private TextView shopLocationTV;

    private double mechanicLat = 0.0, mechanicLng = 0.0;
    private boolean shopLocationConfirmed = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (SessionHelper.isLoggedIn(this) && SessionHelper.isMechanic(this)) {
            startActivity(new Intent(this, MechanicHomeActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.activity_mechanic);
        if (getSupportActionBar() != null)
            getSupportActionBar().setTitle("Mechanic Registration");

        nameET = findViewById(R.id.mechanicName);
        cnicET = findViewById(R.id.mechanicCnic);
        emailET = findViewById(R.id.mechanicEmail);
        phoneET = findViewById(R.id.mechanicPhone);
        cityET = findViewById(R.id.mechanicCity);
        shopNameET = findViewById(R.id.shopName);
        licenseET = findViewById(R.id.licenseNumber);
        experienceET = findViewById(R.id.yearsExperience);
        addressET = findViewById(R.id.shopAddress);
        specializationSpinner = findViewById(R.id.specializationSpinner);
        submitBtn = findViewById(R.id.mechanicSubmitBtn);
        pickLocationBtn = findViewById(R.id.pickShopLocationBtn);
        shopLocationTV = findViewById(R.id.shopLocationStatusTV);

        pickLocationBtn.setOnClickListener(v ->
                startActivityForResult(
                        new Intent(this, MechanicPickLocationActivity.class),
                        REQUEST_SHOP_LOCATION));

        submitBtn.setOnClickListener(v -> submitMechanicData());
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_SHOP_LOCATION && resultCode == RESULT_OK && data != null) {
            mechanicLat = data.getDoubleExtra(MechanicPickLocationActivity.EXTRA_LAT, 0);
            mechanicLng = data.getDoubleExtra(MechanicPickLocationActivity.EXTRA_LNG, 0);
            String addr = data.getStringExtra(MechanicPickLocationActivity.EXTRA_ADDRESS);
            shopLocationConfirmed = mechanicLat != 0 || mechanicLng != 0;
            shopLocationTV.setText(shopLocationConfirmed ? "✓ " + addr : "Location not set");
            if (addr != null && !addr.isEmpty() && addressET.getText().toString().trim().isEmpty()) {
                addressET.setText(addr);
            }
        }
    }

    private void submitMechanicData() {
        String name = nameET.getText().toString().trim();
        String cnic = cnicET.getText().toString().trim();
        String email = emailET.getText().toString().trim();
        String phone = phoneET.getText().toString().trim();
        String city = cityET.getText().toString().trim();
        String shopName = shopNameET.getText().toString().trim();
        String license = licenseET.getText().toString().trim();
        String experience = experienceET.getText().toString().trim();
        String address = addressET.getText().toString().trim();
        String specialization = specializationSpinner.getSelectedItem().toString();

        if (name.isEmpty()) { nameET.setError("Name is required"); return; }
        if (cnic.isEmpty()) { cnicET.setError("CNIC is required"); return; }
        if (email.isEmpty()) { emailET.setError("Email is required"); return; }
        if (phone.isEmpty()) { phoneET.setError("Phone is required"); return; }
        if (city.isEmpty()) { cityET.setError("City is required"); return; }
        if (shopName.isEmpty()) { shopNameET.setError("Shop name is required"); return; }
        if (license.isEmpty()) { licenseET.setError("License is required"); return; }
        if (!shopLocationConfirmed || (mechanicLat == 0 && mechanicLng == 0)) {
            Toast.makeText(this,
                    "Set and confirm your shop location on the map",
                    Toast.LENGTH_LONG).show();
            return;
        }
        if ("Select Specialization".equals(specialization)) {
            Toast.makeText(this, "Select a specialization", Toast.LENGTH_SHORT).show();
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
            body.put("shopName", shopName);
            body.put("license", license);
            body.put("specialization", specialization);
            body.put("experience", experience);
            body.put("address", address);
            body.put("lat", mechanicLat);
            body.put("lng", mechanicLng);

            ApiClient.registerMechanic(body, new ApiClient.SimpleCallback() {
                @Override
                public void onSuccess() {
                    submitBtn.setEnabled(true);
                    Toast.makeText(MechanicActivity.this,
                            "Registration successful! Your shop is now listed.",
                            Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(MechanicActivity.this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(intent);
                    finish();
                }

                @Override
                public void onError(String message) {
                    submitBtn.setEnabled(true);
                    Toast.makeText(MechanicActivity.this, message, Toast.LENGTH_LONG).show();
                }
            });
        } catch (Exception e) {
            submitBtn.setEnabled(true);
            Toast.makeText(this, "Invalid data", Toast.LENGTH_SHORT).show();
        }
    }
}
