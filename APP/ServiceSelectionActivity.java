package com.example.fixwheel;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ServiceSelectionActivity extends AppCompatActivity {

    private Spinner issueSpinner;
    private TextView chargesTV, deliveryChargesTV, offerAmountTV;
    private Button searchBtn, increaseBtn, decreaseBtn;
    private RecyclerView mechanicsRV;
    private MechanicAdapter mechanicAdapter;
    private EditText customIssueET;

    private LinearLayout vehicleCar, vehicleBike, vehicleEbike, vehicleTruck, vehicleRickshaw;
    private String selectedVehicle = "car";

    private double userLat = 0.0, userLng = 0.0;
    private double servicePrice = 100.0;
    private final double deliveryPrice = 50.0;
    private double offerAmount = 150.0;
    private final double STEP = 50.0;
    private final double RADIUS_KM = 20.0;
    private static final String CUSTOM_ISSUE = "Custom issue (type below)";

    private Map<String, Double> issueCharges;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SessionHelper.requireCustomer(this);
        if (!SessionHelper.isCustomer(this)) return;

        setContentView(R.layout.activity_service_selection);
        if (getSupportActionBar() != null)
            getSupportActionBar().setTitle("FixWheel Services");

        if (getIntent().getExtras() != null) {
            userLat = getIntent().getExtras().getDouble("selectedLat", 0.0);
            userLng = getIntent().getExtras().getDouble("selectedLng", 0.0);
        }

        initViews();
        initIssueCharges();
        setupVehicleCards();
        setupIssueSpinner();
        setupOfferButtons();
        setupRecyclerView();

        searchBtn.setOnClickListener(v -> findNearbyMechanics());

        ApiClient.getActiveCustomerBooking(
                SessionHelper.username(this),
                SessionHelper.userCnic(this),
                new ApiClient.BookingCallback() {
                    @Override
                    public void onSuccess(BookingModel booking) {
                        if (booking != null && booking.isActive()) {
                            startActivity(new Intent(ServiceSelectionActivity.this, MapActivity.class));
                            finish();
                        }
                    }

                    @Override
                    public void onError(String message) { }
                });
    }

    private void initViews() {
        issueSpinner = findViewById(R.id.issueSpinner);
        chargesTV = findViewById(R.id.chargesTV);
        deliveryChargesTV = findViewById(R.id.deliveryChargesTV);
        offerAmountTV = findViewById(R.id.offerAmountTV);
        searchBtn = findViewById(R.id.searchMechanicsBtn);
        increaseBtn = findViewById(R.id.increaseBtn);
        decreaseBtn = findViewById(R.id.decreaseBtn);
        mechanicsRV = findViewById(R.id.mechanicsRecyclerView);
        customIssueET = findViewById(R.id.customIssueET);

        vehicleCar = findViewById(R.id.vehicleCar);
        vehicleBike = findViewById(R.id.vehicleBike);
        vehicleEbike = findViewById(R.id.vehicleEbike);
        vehicleTruck = findViewById(R.id.vehicleTruck);
        vehicleRickshaw = findViewById(R.id.vehicleRickshaw);
    }

    private void setupVehicleCards() {
        selectVehicle(vehicleCar, "car");
        vehicleCar.setOnClickListener(v -> selectVehicle(vehicleCar, "car"));
        vehicleBike.setOnClickListener(v -> selectVehicle(vehicleBike, "bike"));
        vehicleEbike.setOnClickListener(v -> selectVehicle(vehicleEbike, "ebike"));
        vehicleTruck.setOnClickListener(v -> selectVehicle(vehicleTruck, "truck"));
        vehicleRickshaw.setOnClickListener(v -> selectVehicle(vehicleRickshaw, "rickshaw"));
    }

    private void selectVehicle(LinearLayout card, String vehicleId) {
        selectedVehicle = vehicleId;
        List<LinearLayout> cards = new ArrayList<>();
        cards.add(vehicleCar);
        cards.add(vehicleBike);
        cards.add(vehicleEbike);
        cards.add(vehicleTruck);
        cards.add(vehicleRickshaw);
        for (LinearLayout c : cards) {
            c.setBackgroundResource(R.drawable.vehicle_card_unselected);
        }
        card.setBackgroundResource(R.drawable.vehicle_card_selected);
    }

    private void initIssueCharges() {
        issueCharges = new HashMap<>();
        issueCharges.put("Puncture", 100.0);
        issueCharges.put("Battery Issue", 300.0);
        issueCharges.put("Fuel Delivery", 500.0);
        issueCharges.put("Oil Change", 800.0);
        issueCharges.put("Engine Repair", 2500.0);
        issueCharges.put("Brake Service", 1200.0);
        issueCharges.put("Towing", 1500.0);
        issueCharges.put(CUSTOM_ISSUE, 0.0);
    }

    private void setupIssueSpinner() {
        String[] issues = {
                "Puncture", "Battery Issue", "Fuel Delivery",
                "Oil Change", "Engine Repair", "Brake Service", "Towing", CUSTOM_ISSUE
        };
        issueSpinner.setAdapter(new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, issues));
        issueSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> p, View v, int pos, long id) {
                String issue = p.getItemAtPosition(pos).toString();
                updateCharges(issue);
                if (customIssueET != null) {
                    customIssueET.setVisibility(CUSTOM_ISSUE.equals(issue) ? View.VISIBLE : View.GONE);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> p) {}
        });
    }

    private void updateCharges(String issue) {
        Double charge = issueCharges.get(issue);
        servicePrice = charge != null ? charge : 0;
        if (CUSTOM_ISSUE.equals(issue)) {
            servicePrice = 0;
        }
        offerAmount = Math.max(STEP, servicePrice + deliveryPrice);
        chargesTV.setText("Rs. " + (int) servicePrice);
        deliveryChargesTV.setText("Rs. " + (int) deliveryPrice);
        offerAmountTV.setText("Rs. " + (int) offerAmount);
    }

    private void setupOfferButtons() {
        increaseBtn.setOnClickListener(v -> {
            offerAmount += STEP;
            offerAmountTV.setText("Rs. " + (int) offerAmount);
        });
        decreaseBtn.setOnClickListener(v -> {
            if (offerAmount - STEP >= STEP) {
                offerAmount -= STEP;
                offerAmountTV.setText("Rs. " + (int) offerAmount);
            } else {
                Toast.makeText(this, "Minimum offer is Rs. 50", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void findNearbyMechanics() {
        if (userLat == 0.0 && userLng == 0.0) {
            Toast.makeText(this, "Location not available. Go back and confirm location.",
                    Toast.LENGTH_SHORT).show();
            return;
        }
        searchBtn.setEnabled(false);
        ApiClient.getMechanicsNearby(userLat, userLng, RADIUS_KM, new ApiClient.MechanicsCallback() {
            @Override
            public void onSuccess(List<MechanicModel> nearby) {
                searchBtn.setEnabled(true);
                if (nearby.isEmpty()) {
                    Toast.makeText(ServiceSelectionActivity.this,
                            "No registered mechanics found within 20 km.",
                            Toast.LENGTH_LONG).show();
                } else {
                    Toast.makeText(ServiceSelectionActivity.this,
                            nearby.size() + " mechanic(s) found!", Toast.LENGTH_SHORT).show();
                }
                mechanicAdapter.updateList(nearby);
            }

            @Override
            public void onError(String message) {
                searchBtn.setEnabled(true);
                Toast.makeText(ServiceSelectionActivity.this, message, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void bookMechanic(MechanicModel mechanic) {
        String issue = issueSpinner.getSelectedItem().toString();
        String customIssue = "";
        if (CUSTOM_ISSUE.equals(issue)) {
            customIssue = customIssueET != null ? customIssueET.getText().toString().trim() : "";
            if (customIssue.isEmpty()) {
                Toast.makeText(this, "Describe your issue", Toast.LENGTH_SHORT).show();
                return;
            }
        }
        try {
            JSONObject body = new JSONObject();
            body.put("customerName", SessionHelper.username(this));
            body.put("customerCnic", SessionHelper.userCnic(this));
            body.put("mechanicId", mechanic.getId());
            body.put("vehicle", selectedVehicle);
            body.put("issue", CUSTOM_ISSUE.equals(issue) ? customIssue : issue);
            body.put("customIssue", CUSTOM_ISSUE.equals(issue) ? customIssue : "");
            body.put("customerLat", userLat);
            body.put("customerLng", userLng);
            body.put("customerOffer", (int) offerAmount);

            ApiClient.createBooking(body, new ApiClient.BookingCallback() {
                @Override
                public void onSuccess(BookingModel booking) {
                    Toast.makeText(ServiceSelectionActivity.this,
                            "Booking sent to " + mechanic.getShopName(), Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(ServiceSelectionActivity.this, MapActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                    startActivity(intent);
                    finish();
                }

                @Override
                public void onError(String message) {
                    Toast.makeText(ServiceSelectionActivity.this, message, Toast.LENGTH_LONG).show();
                }
            });
        } catch (Exception e) {
            Toast.makeText(this, "Could not create booking", Toast.LENGTH_SHORT).show();
        }
    }

    private void setupRecyclerView() {
        mechanicsRV.setLayoutManager(new LinearLayoutManager(this));
        mechanicAdapter = new MechanicAdapter(new ArrayList<>(), this::bookMechanic);
        mechanicsRV.setAdapter(mechanicAdapter);
    }
}
