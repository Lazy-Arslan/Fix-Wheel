package com.example.fixwheel;

import org.json.JSONObject;

public class BookingModel {
    public final String id;
    public final String customerName;
    public final String mechanicId;
    public final String mechanicName;
    public final String mechanicShop;
    public final double mechanicLat;
    public final double mechanicLng;
    public final String vehicle;
    public final String issueDisplay;
    public final double customerLat;
    public final double customerLng;
    public final int offerAmount;
    public final Integer mechanicCounter;
    public final Integer agreedPrice;
    public final int currentPrice;
    public final String status;
    public final String etaDisplay;
    public final boolean mechanicCompleted;
    public final boolean customerCompleted;

    public BookingModel(JSONObject b) throws Exception {
        id = b.getString("id");
        customerName = b.getString("customerName");
        mechanicId = b.getString("mechanicId");
        mechanicName = b.optString("mechanicName", "");
        mechanicShop = b.optString("mechanicShop", "");
        mechanicLat = b.optDouble("mechanicLat", 0);
        mechanicLng = b.optDouble("mechanicLng", 0);
        vehicle = b.optString("vehicle", "car");
        issueDisplay = b.optString("issueDisplay", b.optString("issue", ""));
        customerLat = b.optDouble("customerLat", 0);
        customerLng = b.optDouble("customerLng", 0);
        offerAmount = b.optInt("offerAmount", 0);
        if (b.isNull("mechanicCounter")) {
            mechanicCounter = null;
        } else {
            mechanicCounter = b.getInt("mechanicCounter");
        }
        if (b.isNull("agreedPrice")) {
            agreedPrice = null;
        } else {
            agreedPrice = b.getInt("agreedPrice");
        }
        currentPrice = b.optInt("currentPrice", offerAmount);
        status = b.optString("status", "pending");
        etaDisplay = b.optString("etaDisplay", "");
        mechanicCompleted = b.optBoolean("mechanicCompleted", false);
        customerCompleted = b.optBoolean("customerCompleted", false);
    }

    public boolean isActive() {
        return "pending".equals(status)
                || "countered".equals(status)
                || "confirmed".equals(status)
                || "completion_pending".equals(status);
    }
}
