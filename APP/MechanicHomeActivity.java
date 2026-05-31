package com.example.fixwheel;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import org.json.JSONObject;

import java.util.List;

public class MechanicHomeActivity extends AppCompatActivity {

    private static final long POLL_MS = 8000;

    private TextView shopNameTV, ownerNameTV, detailsTV, pendingAlertTV, waitingCustomerTV;
    private ScrollView bookingDetailPanel;
    private Button acceptOfferBtn, changePriceBtn, completeServiceBtn, logoutBtn;
    private MechanicBookingAdapter bookingAdapter;
    private BookingModel selectedBooking;
    private final Handler pollHandler = new Handler(Looper.getMainLooper());
    private final Runnable pollRunnable = new Runnable() {
        @Override
        public void run() {
            loadBookings();
            pollHandler.postDelayed(this, POLL_MS);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SessionHelper.requireMechanic(this);
        if (!SessionHelper.isMechanic(this)) return;

        setContentView(R.layout.activity_mechanic_home);
        if (getSupportActionBar() != null) getSupportActionBar().hide();

        shopNameTV = findViewById(R.id.shopNameTV);
        ownerNameTV = findViewById(R.id.ownerNameTV);
        detailsTV = findViewById(R.id.detailsTV);
        pendingAlertTV = findViewById(R.id.pendingAlertTV);
        waitingCustomerTV = findViewById(R.id.waitingCustomerTV);
        bookingDetailPanel = findViewById(R.id.bookingDetailPanel);
        acceptOfferBtn = findViewById(R.id.acceptOfferBtn);
        changePriceBtn = findViewById(R.id.changePriceBtn);
        completeServiceBtn = findViewById(R.id.completeServiceBtn);
        logoutBtn = findViewById(R.id.logoutBtn);

        RecyclerView rv = findViewById(R.id.bookingsRecyclerView);
        rv.setLayoutManager(new LinearLayoutManager(this));
        bookingAdapter = new MechanicBookingAdapter(this::showBookingDetail);
        rv.setAdapter(bookingAdapter);

        logoutBtn.setOnClickListener(v -> {
            SessionHelper.logout(this);
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        acceptOfferBtn.setOnClickListener(v -> patchBooking("accept", null));
        changePriceBtn.setOnClickListener(v -> promptCounterPrice());
        completeServiceBtn.setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                    .setTitle("Service completed")
                    .setMessage("Notify customer to confirm the issue is resolved?")
                    .setPositiveButton("Yes", (d, w) -> patchBooking("complete", null))
                    .setNegativeButton("Cancel", null)
                    .show();
        });

        loadProfile();
        loadBookings();
    }

    private void loadProfile() {
        ApiClient.getMechanicProfile(
                SessionHelper.username(this),
                SessionHelper.userCnic(this),
                new ApiClient.ProfileCallback() {
                    @Override
                    public void onSuccess(JSONObject profile) {
                        shopNameTV.setText(profile.optString("shopName", "FixWheel Partner"));
                    }

                    @Override
                    public void onError(String message) {
                        shopNameTV.setText("FixWheel Partner");
                    }
                });
    }

    private void loadBookings() {
        ApiClient.getMechanicBookings(
                SessionHelper.username(this),
                SessionHelper.userCnic(this),
                new ApiClient.BookingsCallback() {
                    @Override
                    public void onSuccess(List<BookingModel> bookings) {
                        bookingAdapter.setList(bookings);
                        int pending = 0;
                        for (BookingModel b : bookings) {
                            if ("pending".equals(b.status)) pending++;
                        }
                        if (pending > 0) {
                            pendingAlertTV.setVisibility(View.VISIBLE);
                            pendingAlertTV.setText("🔔 " + pending + " new booking(s) — respond below");
                        } else {
                            pendingAlertTV.setVisibility(View.GONE);
                        }
                        if (selectedBooking != null) {
                            for (BookingModel b : bookings) {
                                if (b.id.equals(selectedBooking.id)) {
                                    selectedBooking = b;
                                    showBookingDetail(b);
                                    break;
                                }
                            }
                        }
                    }

                    @Override
                    public void onError(String message) {
                        Toast.makeText(MechanicHomeActivity.this, message, Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void showBookingDetail(BookingModel b) {
        selectedBooking = b;
        bookingAdapter.setSelected(b);
        bookingDetailPanel.setVisibility(View.VISIBLE);
        ownerNameTV.setText(b.customerName);
        StringBuilder sb = new StringBuilder();
        sb.append("Vehicle: ").append(b.vehicle).append("\n");
        sb.append("Issue: ").append(b.issueDisplay).append("\n");
        sb.append("Offer: Rs. ").append(b.offerAmount).append("\n");
        if (b.mechanicCounter != null) sb.append("Your counter: Rs. ").append(b.mechanicCounter).append("\n");
        if (b.agreedPrice != null) sb.append("Agreed: Rs. ").append(b.agreedPrice).append("\n");
        if (b.etaDisplay != null && !b.etaDisplay.isEmpty()) {
            sb.append("ETA: ").append(b.etaDisplay).append("\n");
        }
        sb.append("Location: ").append(String.format("%.5f, %.5f", b.customerLat, b.customerLng));
        detailsTV.setText(sb.toString());

        boolean pending = "pending".equals(b.status);
        boolean confirmed = "confirmed".equals(b.status) || "completion_pending".equals(b.status);

        acceptOfferBtn.setVisibility(pending ? View.VISIBLE : View.GONE);
        changePriceBtn.setVisibility(pending ? View.VISIBLE : View.GONE);
        if (pending) {
            acceptOfferBtn.setText("Accept Rs. " + b.offerAmount);
        }

        boolean canComplete = confirmed && !b.mechanicCompleted;
        completeServiceBtn.setVisibility(canComplete ? View.VISIBLE : View.GONE);

        if (b.mechanicCompleted && !b.customerCompleted) {
            waitingCustomerTV.setVisibility(View.VISIBLE);
            waitingCustomerTV.setText("Waiting for customer to confirm issue is resolved.");
        } else if (b.customerCompleted && !b.mechanicCompleted) {
            waitingCustomerTV.setVisibility(View.VISIBLE);
            waitingCustomerTV.setText("Customer confirmed — mark service complete to close.");
        } else {
            waitingCustomerTV.setVisibility(View.GONE);
        }
    }

    private void patchBooking(String action, Integer counterPrice) {
        if (selectedBooking == null) return;
        try {
            JSONObject body = new JSONObject();
            body.put("action", action);
            body.put("actor", "mechanic");
            body.put("actorName", SessionHelper.username(this));
            body.put("actorCnic", SessionHelper.userCnic(this));
            if (counterPrice != null) body.put("counterPrice", counterPrice);
            ApiClient.patchBooking(selectedBooking.id, body, new ApiClient.BookingCallback() {
                @Override
                public void onSuccess(BookingModel booking) {
                    if (booking != null && "completed".equals(booking.status)) {
                        Toast.makeText(MechanicHomeActivity.this,
                                "Issue solved. Booking closed.", Toast.LENGTH_LONG).show();
                        selectedBooking = null;
                        bookingDetailPanel.setVisibility(View.GONE);
                    } else {
                        selectedBooking = booking;
                        if (booking != null) showBookingDetail(booking);
                    }
                    loadBookings();
                }

                @Override
                public void onError(String message) {
                    Toast.makeText(MechanicHomeActivity.this, message, Toast.LENGTH_LONG).show();
                }
            });
        } catch (Exception e) {
            Toast.makeText(this, "Invalid request", Toast.LENGTH_SHORT).show();
        }
    }

    private void promptCounterPrice() {
        final android.widget.EditText input = new android.widget.EditText(this);
        input.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        if (selectedBooking != null) {
            input.setText(String.valueOf(selectedBooking.offerAmount + 50));
        }
        new AlertDialog.Builder(this)
                .setTitle("Your price (Rs.)")
                .setView(input)
                .setPositiveButton("Send", (d, w) -> {
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

    @Override
    protected void onResume() {
        super.onResume();
        pollHandler.post(pollRunnable);
    }

    @Override
    protected void onPause() {
        super.onPause();
        pollHandler.removeCallbacks(pollRunnable);
    }
}
