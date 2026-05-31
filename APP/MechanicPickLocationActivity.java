package com.example.fixwheel;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONObject;
import org.osmdroid.config.Configuration;
import org.osmdroid.tileprovider.tilesource.TileSourceFactory;
import org.osmdroid.util.GeoPoint;
import org.osmdroid.views.MapView;
import org.osmdroid.views.overlay.Marker;

public class MechanicPickLocationActivity extends AppCompatActivity {

    public static final String EXTRA_LAT = "shopLat";
    public static final String EXTRA_LNG = "shopLng";
    public static final String EXTRA_ADDRESS = "shopAddress";

    private MapView map;
    private EditText searchET;
    private TextView addressTV;
    private Button confirmBtn;
    private Marker shopMarker;
    private GeoPoint selected;
    private String selectedAddress = "";
    private boolean confirmed;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Configuration.getInstance().load(getApplicationContext(),
                getSharedPreferences("osm_pref", MODE_PRIVATE));
        setContentView(R.layout.activity_mechanic_pick_location);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Shop Location");
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        map = findViewById(R.id.pickMap);
        searchET = findViewById(R.id.locationSearchET);
        addressTV = findViewById(R.id.selectedAddressTV);
        confirmBtn = findViewById(R.id.confirmShopLocationBtn);
        Button searchBtn = findViewById(R.id.searchLocationBtn);

        map.setTileSource(TileSourceFactory.MAPNIK);
        map.setMultiTouchControls(true);
        map.getController().setZoom(6.0);
        map.getController().setCenter(new GeoPoint(33.6844, 73.0479));
        Configuration.getInstance().setUserAgentValue(getPackageName());

        map.getOverlays().add(new org.osmdroid.views.overlay.MapEventsOverlay(
                new org.osmdroid.events.MapEventsReceiver() {
                    @Override
                    public boolean singleTapConfirmedHelper(GeoPoint p) {
                        setShopPoint(p.getLatitude(), p.getLongitude(), null);
                        return true;
                    }

                    @Override
                    public boolean longPressHelper(GeoPoint p) {
                        return false;
                    }
                }));

        searchBtn.setOnClickListener(v -> {
            String q = searchET.getText().toString().trim();
            if (q.length() < 2) {
                Toast.makeText(this, "Enter at least 2 characters", Toast.LENGTH_SHORT).show();
                return;
            }
            ApiClient.searchPlaces(q, new ApiClient.PlacesCallback() {
                @Override
                public void onSuccess(JSONArray suggestions) {
                    if (suggestions.length() == 0) {
                        Toast.makeText(MechanicPickLocationActivity.this,
                                "No results. Tap the map to set location.",
                                Toast.LENGTH_LONG).show();
                        return;
                    }
                    String[] labels = new String[suggestions.length()];
                    try {
                        for (int i = 0; i < suggestions.length(); i++) {
                            labels[i] = suggestions.getJSONObject(i).optString("description", "");
                        }
                    } catch (org.json.JSONException e) {
                        Toast.makeText(MechanicPickLocationActivity.this,
                                "Invalid search results", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    new AlertDialog.Builder(MechanicPickLocationActivity.this)
                            .setTitle("Select location")
                            .setAdapter(new ArrayAdapter<>(MechanicPickLocationActivity.this,
                                    android.R.layout.simple_list_item_1, labels),
                                    (d, which) -> {
                                        try {
                                            JSONObject s = suggestions.getJSONObject(which);
                                            setShopPoint(s.getDouble("lat"), s.getDouble("lng"),
                                                    s.optString("description", ""));
                                        } catch (Exception e) {
                                            Toast.makeText(MechanicPickLocationActivity.this,
                                                    "Invalid place", Toast.LENGTH_SHORT).show();
                                        }
                                    })
                            .show();
                }

                @Override
                public void onError(String message) {
                    Toast.makeText(MechanicPickLocationActivity.this, message, Toast.LENGTH_LONG).show();
                }
            });
        });

        confirmBtn.setOnClickListener(v -> {
            if (selected == null) {
                Toast.makeText(this, "Select a location first", Toast.LENGTH_SHORT).show();
                return;
            }
            confirmed = true;
            Intent data = new Intent();
            data.putExtra(EXTRA_LAT, selected.getLatitude());
            data.putExtra(EXTRA_LNG, selected.getLongitude());
            data.putExtra(EXTRA_ADDRESS, selectedAddress);
            setResult(RESULT_OK, data);
            finish();
        });
    }

    private void setShopPoint(double lat, double lng, String address) {
        selected = new GeoPoint(lat, lng);
        confirmed = false;
        if (shopMarker != null) {
            map.getOverlays().remove(shopMarker);
        }
        shopMarker = new Marker(map);
        shopMarker.setPosition(selected);
        shopMarker.setTitle("Your shop");
        map.getOverlays().add(shopMarker);
        map.getController().animateTo(selected);
        map.getController().setZoom(14.0);
        map.invalidate();

        if (address != null && !address.isEmpty()) {
            selectedAddress = address;
            addressTV.setText("Selected: " + address);
        } else {
            addressTV.setText("Resolving address…");
            ApiClient.reverseGeocode(lat, lng, new ApiClient.StringCallback() {
                @Override
                public void onSuccess(String text) {
                    selectedAddress = text;
                    addressTV.setText("Selected: " + text);
                }

                @Override
                public void onError(String message) {
                    selectedAddress = lat + ", " + lng;
                    addressTV.setText("Selected: " + selectedAddress);
                }
            });
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        map.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        map.onPause();
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
