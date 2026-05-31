package com.example.fixwheel;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SearchView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;

import org.json.JSONArray;
import org.json.JSONObject;
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Marker;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class MapActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 100;
    private static final double MAP_RADIUS_KM = 8.0;
    private static final long POLL_MS = 8000;

    private MapView map;
    private SearchView searchView;
    private TextView locationText, mechanicCountTV, bookingTitleTV, bookingDetailTV, counterOfferTV;
    private LinearLayout noBookingPanel, layerYouBtn, layerMechanicsBtn, layerBookedBtn;
    private ScrollView bookingPanel;
    private View counterOfferPanel, customerCompleteBtn;
    private Button confirmLocationBtn, useGpsBtn, acceptCounterBtn, customerCounterBtn, cancelBookingBtn;

    private FusedLocationProviderClient fusedLocationClient;
    private GeoPoint selectedLocation;
    private Marker serviceMarker;
    private final List<Marker> mechanicMarkers = new ArrayList<>();
    private Marker bookedMarker;

    private BookingModel activeBooking;
    private List<MechanicModel> mapMechanics = new ArrayList<>();
    private String mapFocus = "you";
    private final Handler pollHandler = new Handler(Looper.getMainLooper());
    private final Runnable pollRunnable = new Runnable() {
        @Override
        public void run() {
            loadActiveBooking();
            pollHandler.postDelayed(this, POLL_MS);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SessionHelper.requireCustomer(this);
        if (!SessionHelper.isCustomer(this)) return;

        Configuration.getInstance().load(getApplicationContext(),
                getSharedPreferences("osm_pref", MODE_PRIVATE));
        Locale.setDefault(Locale.ENGLISH);
        setContentView(R.layout.activity_map);
        if (getSupportActionBar() != null) getSupportActionBar().hide();

        bindViews();
        setupMap();
        setupSearch();
        setupButtons();
        setupLayers();

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        requestLocationPermission();
        loadActiveBooking();
    }

    private void bindViews() {
        map = findViewById(R.id.map);
        searchView = findViewById(R.id.mapSearchView);
        locationText = findViewById(R.id.locationText);
        mechanicCountTV = findViewById(R.id.mechanicCountTV);
        confirmLocationBtn = findViewById(R.id.confirmLocationBtn);
        useGpsBtn = findViewById(R.id.useGpsBtn);
        noBookingPanel = findViewById(R.id.noBookingPanel);
        bookingPanel = findViewById(R.id.bookingPanel);
        bookingTitleTV = findViewById(R.id.bookingTitleTV);
        bookingDetailTV = findViewById(R.id.bookingDetailTV);
        counterOfferPanel = findViewById(R.id.counterOfferPanel);
        counterOfferTV = findViewById(R.id.counterOfferTV);
        acceptCounterBtn = findViewById(R.id.acceptCounterBtn);
        customerCounterBtn = findViewById(R.id.customerCounterBtn);
        customerCompleteBtn = findViewById(R.id.customerCompleteBtn);
        cancelBookingBtn = findViewById(R.id.cancelBookingBtn);
        layerYouBtn = findViewById(R.id.layerYouBtn);
        layerMechanicsBtn = findViewById(R.id.layerMechanicsBtn);
        layerBookedBtn = findViewById(R.id.layerBookedBtn);
        findViewById(R.id.logoutBtn).setOnClickListener(v -> {
            SessionHelper.logout(this);
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });
    }

    private void setupMap() {
        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);
        map.getController().setZoom(14.0);
        Configuration.getInstance().setUserAgentValue(getPackageName());
        map.getOverlays().add(new org.osmdroid.views.overlay.MapEventsOverlay(
                new org.osmdroid.events.MapEventsReceiver() {
                    @Override
                    public boolean singleTapConfirmedHelper(GeoPoint p) {
                        if (activeBooking == null) {
                            setServiceLocation(p.getLatitude(), p.getLongitude(), null);
                        }
                        return true;
                    }

                    @Override
                    public boolean longPressHelper(GeoPoint p) {
                        return false;
                    }
                }));
    }

    private void setupSearch() {
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                searchPlaces(query);
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                return false;
            }
        });
    }

    private void setupButtons() {
        confirmLocationBtn.setOnClickListener(v -> {
            if (selectedLocation == null) {
                Toast.makeText(this, "Select a location first", Toast.LENGTH_SHORT).show();
                return;
            }
            Intent intent = new Intent(this, ServiceSelectionActivity.class);
            intent.putExtra("selectedLat", selectedLocation.getLatitude());
            intent.putExtra("selectedLng", selectedLocation.getLongitude());
            startActivity(intent);
        });

        useGpsBtn.setOnClickListener(v -> getCurrentLocation());

        acceptCounterBtn.setOnClickListener(v -> patchBooking("accept", null));
        customerCounterBtn.setOnClickListener(v -> promptCounterPrice());
        customerCompleteBtn.setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                    .setTitle("Confirm completion")
                    .setMessage("Confirm that your issue is resolved?")
                    .setPositiveButton("Yes", (d, w) -> patchBooking("complete", null))
                    .setNegativeButton("Cancel", null)
                    .show();
        });
        cancelBookingBtn.setOnClickListener(v -> {
            if (activeBooking == null) return;
            new AlertDialog.Builder(this)
                    .setTitle("Cancel booking")
                    .setMessage("Cancel this booking?")
                    .setPositiveButton("Yes", (d, w) ->
                            ApiClient.cancelBooking(activeBooking.id,
                                    SessionHelper.username(this),
                                    SessionHelper.userCnic(this),
                                    new ApiClient.SimpleCallback() {
                                        @Override
                                        public void onSuccess() {
                                            Toast.makeText(MapActivity.this,
                                                    "Booking cancelled", Toast.LENGTH_SHORT).show();
                                            activeBooking = null;
                                            refreshBookingUi();
                                            loadMapMechanics();
                                        }

                                        @Override
                                        public void onError(String message) {
                                            Toast.makeText(MapActivity.this, message, Toast.LENGTH_LONG).show();
                                        }
                                    }))
                    .setNegativeButton("No", null)
                    .show();
        });
    }

    private void setupLayers() {
        layerYouBtn.setOnClickListener(v -> {
            mapFocus = "you";
            highlightLayers();
            if (selectedLocation != null) {
                map.getController().animateTo(selectedLocation);
            }
        });
        layerMechanicsBtn.setOnClickListener(v -> {
            mapFocus = "mechanics";
            highlightLayers();
            loadMapMechanics();
        });
        layerBookedBtn.setOnClickListener(v -> {
            if (activeBooking == null) {
                Toast.makeText(this, "Book a mechanic first", Toast.LENGTH_SHORT).show();
                return;
            }
            mapFocus = "booked";
            highlightLayers();
            showBookedOnMap();
        });
        highlightLayers();
    }

    private void highlightLayers() {
        layerYouBtn.setAlpha("you".equals(mapFocus) ? 1f : 0.55f);
        layerMechanicsBtn.setAlpha("mechanics".equals(mapFocus) ? 1f : 0.55f);
        layerBookedBtn.setAlpha("booked".equals(mapFocus) ? 1f : 0.55f);
        refreshMapMarkers();
    }

    private void requestLocationPermission() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            getCurrentLocation();
        } else {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    PERMISSION_REQUEST_CODE);
        }
    }

    private void getCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) return;
        fusedLocationClient.getLastLocation().addOnSuccessListener(location -> {
            if (location != null && activeBooking == null) {
                setServiceLocation(location.getLatitude(), location.getLongitude(), null);
            }
        });
    }

    private void setServiceLocation(double lat, double lng, String address) {
        selectedLocation = new GeoPoint(lat, lng);
        updateServiceMarker();
        map.getController().animateTo(selectedLocation);
        if (address != null && !address.isEmpty()) {
            locationText.setText(address);
            loadMapMechanics();
        } else {
            locationText.setText("Resolving address…");
            ApiClient.reverseGeocode(lat, lng, new ApiClient.StringCallback() {
                @Override
                public void onSuccess(String text) {
                    locationText.setText(text);
                }

                @Override
                public void onError(String message) {
                    locationText.setText(String.format(Locale.ENGLISH, "%.5f, %.5f", lat, lng));
                }
            });
            loadMapMechanics();
        }
    }

    private void searchPlaces(String query) {
        ApiClient.searchPlaces(query, new ApiClient.PlacesCallback() {
            @Override
            public void onSuccess(JSONArray suggestions) {
                if (suggestions.length() == 0) {
                    Toast.makeText(MapActivity.this, "No results. Tap the map.", Toast.LENGTH_SHORT).show();
                    return;
                }
                String[] labels = new String[suggestions.length()];
                try {
                    for (int i = 0; i < suggestions.length(); i++) {
                        labels[i] = suggestions.getJSONObject(i).optString("description", "");
                    }
                } catch (org.json.JSONException e) {
                    Toast.makeText(MapActivity.this, "Invalid search results", Toast.LENGTH_SHORT).show();
                    return;
                }
                new AlertDialog.Builder(MapActivity.this)
                        .setTitle("Select location")
                        .setAdapter(new android.widget.ArrayAdapter<>(MapActivity.this,
                                android.R.layout.simple_list_item_1, labels),
                                (d, which) -> {
                                    try {
                                        JSONObject s = suggestions.getJSONObject(which);
                                        setServiceLocation(s.getDouble("lat"), s.getDouble("lng"),
                                                s.optString("description", ""));
                                    } catch (Exception e) {
                                        Toast.makeText(MapActivity.this, "Invalid place",
                                                Toast.LENGTH_SHORT).show();
                                    }
                                })
                        .show();
            }

            @Override
            public void onError(String message) {
                Toast.makeText(MapActivity.this, message, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void loadMapMechanics() {
        double lat, lng;
        if (activeBooking != null) {
            lat = activeBooking.customerLat;
            lng = activeBooking.customerLng;
        } else if (selectedLocation != null) {
            lat = selectedLocation.getLatitude();
            lng = selectedLocation.getLongitude();
        } else {
            return;
        }
        ApiClient.getMechanicsForMap(lat, lng, MAP_RADIUS_KM, new ApiClient.MechanicsCallback() {
            @Override
            public void onSuccess(List<MechanicModel> mechanics) {
                mapMechanics = mechanics;
                if (activeBooking == null) {
                    mechanicCountTV.setText(mechanics.isEmpty()
                            ? "No mechanics nearby"
                            : mechanics.size() + " mechanic(s) nearby");
                }
                refreshMapMarkers();
            }

            @Override
            public void onError(String message) {
                mechanicCountTV.setText("Could not load mechanics");
            }
        });
    }

    private void loadActiveBooking() {
        ApiClient.getActiveCustomerBooking(
                SessionHelper.username(this),
                SessionHelper.userCnic(this),
                new ApiClient.BookingCallback() {
                    @Override
                    public void onSuccess(BookingModel booking) {
                        if (booking != null && "completed".equals(booking.status)) {
                            booking = null;
                        }
                        activeBooking = booking;
                        refreshBookingUi();
                        if (activeBooking != null) {
                            selectedLocation = new GeoPoint(
                                    activeBooking.customerLat, activeBooking.customerLng);
                            updateServiceMarker();
                            loadMapMechanics();
                        }
                    }

                    @Override
                    public void onError(String message) {
                        Toast.makeText(MapActivity.this, message, Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void refreshBookingUi() {
        boolean hasBooking = activeBooking != null && activeBooking.isActive();
        noBookingPanel.setVisibility(hasBooking ? View.GONE : View.VISIBLE);
        bookingPanel.setVisibility(hasBooking ? View.VISIBLE : View.GONE);
        layerBookedBtn.setVisibility(hasBooking ? View.VISIBLE : View.GONE);
        searchView.setEnabled(!hasBooking);
        confirmLocationBtn.setEnabled(!hasBooking);

        if (!hasBooking) return;

        bookingTitleTV.setText(activeBooking.mechanicShop);
        StringBuilder detail = new StringBuilder();
        detail.append(activeBooking.mechanicName).append("\n");
        detail.append(activeBooking.issueDisplay).append("\n");
        detail.append("Rs. ").append(activeBooking.currentPrice).append(" · ").append(activeBooking.status);
        if (activeBooking.etaDisplay != null && !activeBooking.etaDisplay.isEmpty()) {
            detail.append("\nETA ").append(activeBooking.etaDisplay);
        }
        bookingDetailTV.setText(detail.toString());

        boolean countered = "countered".equals(activeBooking.status);
        counterOfferPanel.setVisibility(countered ? View.VISIBLE : View.GONE);
        if (countered && activeBooking.mechanicCounter != null) {
            counterOfferTV.setText("Mechanic offered Rs. " + activeBooking.mechanicCounter);
            acceptCounterBtn.setText("Accept Rs. " + activeBooking.mechanicCounter);
        }

        boolean showComplete = "confirmed".equals(activeBooking.status)
                || "completion_pending".equals(activeBooking.status);
        customerCompleteBtn.setVisibility(
                showComplete && !activeBooking.customerCompleted ? View.VISIBLE : View.GONE);

        refreshMapMarkers();
    }

    private void patchBooking(String action, Integer counterPrice) {
        if (activeBooking == null) return;
        try {
            JSONObject body = new JSONObject();
            body.put("action", action);
            body.put("actor", "customer");
            body.put("actorName", SessionHelper.username(this));
            body.put("actorCnic", SessionHelper.userCnic(this));
            if (counterPrice != null) body.put("counterPrice", counterPrice);
            ApiClient.patchBooking(activeBooking.id, body, new ApiClient.BookingCallback() {
                @Override
                public void onSuccess(BookingModel booking) {
                    if (booking == null || "completed".equals(booking.status)) {
                        Toast.makeText(MapActivity.this,
                                "Issue solved. Booking closed.", Toast.LENGTH_LONG).show();
                        activeBooking = null;
                    } else {
                        activeBooking = booking;
                    }
                    refreshBookingUi();
                    loadActiveBooking();
                }

                @Override
                public void onError(String message) {
                    Toast.makeText(MapActivity.this, message, Toast.LENGTH_LONG).show();
                }
            });
        } catch (Exception e) {
            Toast.makeText(this, "Invalid request", Toast.LENGTH_SHORT).show();
        }
    }

    private void promptCounterPrice() {
        final android.widget.EditText input = new android.widget.EditText(this);
        input.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        input.setHint("Your price (Rs.)");
        new AlertDialog.Builder(this)
                .setTitle("Counter price")
                .setView(input)
                .setPositiveButton("OK", (d, w) -> {
                    try {
                        int p = Integer.parseInt(input.getText().toString().trim());
                        if (p < 50) {
                            Toast.makeText(this, "Minimum Rs. 50", Toast.LENGTH_SHORT).show();
                            return;
                        }
                        patchBooking("counter", p);
                    } catch (NumberFormatException e) {
                        Toast.makeText(this, "Enter a valid amount", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void updateServiceMarker() {
        if (selectedLocation == null) return;
        if (serviceMarker != null) map.getOverlays().remove(serviceMarker);
        serviceMarker = new Marker(map);
        serviceMarker.setPosition(selectedLocation);
        serviceMarker.setTitle("Service location");
        serviceMarker.setIcon(resizeIcon(R.drawable.gps_icon, 30, 30));
        map.getOverlays().add(serviceMarker);
        map.invalidate();
    }

    private void refreshMapMarkers() {
        for (Marker m : mechanicMarkers) map.getOverlays().remove(m);
        mechanicMarkers.clear();
        if (bookedMarker != null) {
            map.getOverlays().remove(bookedMarker);
            bookedMarker = null;
        }

        String bookedId = activeBooking != null ? activeBooking.mechanicId : null;

        if ("booked".equals(mapFocus) && activeBooking != null) {
            showBookedOnMap();
            return;
        }

        if ("you".equals(mapFocus)) {
            map.invalidate();
            return;
        }

        for (MechanicModel mech : mapMechanics) {
            if (mech.getLat() == 0 && mech.getLng() == 0) continue;
            if (bookedId != null && bookedId.equals(mech.getId())) continue;
            Marker marker = new Marker(map);
            marker.setPosition(new GeoPoint(mech.getLat(), mech.getLng()));
            marker.setTitle(mech.getShopName());
            marker.setIcon(resizeIcon(R.drawable.mechanic_icon, 30, 30));
            marker.setOnMarkerClickListener((m, mapView) -> {
                showMechanicDialog(mech);
                return true;
            });
            map.getOverlays().add(marker);
            mechanicMarkers.add(marker);
        }
        map.invalidate();
    }

    private void showBookedOnMap() {
        if (activeBooking == null) return;
        for (Marker m : mechanicMarkers) map.getOverlays().remove(m);
        mechanicMarkers.clear();
        bookedMarker = new Marker(map);
        bookedMarker.setPosition(new GeoPoint(activeBooking.mechanicLat, activeBooking.mechanicLng));
        bookedMarker.setTitle(activeBooking.mechanicName);
        bookedMarker.setIcon(resizeIcon(R.drawable.mechanic_icon, 34, 34));
        map.getOverlays().add(bookedMarker);
        if (selectedLocation != null) {
            map.getController().animateTo(selectedLocation);
        }
        map.invalidate();
    }

    private void showMechanicDialog(MechanicModel mech) {
        String phone = mech.getPhone() != null ? mech.getPhone() : "";
        new AlertDialog.Builder(this)
                .setTitle(mech.getShopName())
                .setMessage(mech.getName() + "\n" + mech.getDistance() + "\n" + mech.getSpecialty()
                        + (phone.isEmpty() ? "" : "\nPhone: " + phone))
                .setPositiveButton(phone.isEmpty() ? "OK" : "Call", (d, w) -> {
                    if (!phone.isEmpty()) {
                        Intent intent = new Intent(Intent.ACTION_DIAL,
                                android.net.Uri.parse("tel:" + phone.replaceAll("\\D", "")));
                        startActivity(intent);
                    }
                })
                .setNegativeButton("Close", null)
                .show();
    }

    private Drawable resizeIcon(int res, int wDp, int hDp) {
        float d = getResources().getDisplayMetrics().density;
        Bitmap bmp = BitmapFactory.decodeResource(getResources(), res);
        Bitmap scaled = Bitmap.createScaledBitmap(bmp, (int) (wDp * d), (int) (hDp * d), true);
        return new BitmapDrawable(getResources(), scaled);
    }

    @Override
    protected void onResume() {
        super.onResume();
        map.onResume();
        pollHandler.post(pollRunnable);
    }

    @Override
    protected void onPause() {
        super.onPause();
        map.onPause();
        pollHandler.removeCallbacks(pollRunnable);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE && grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            getCurrentLocation();
        }
    }
}
