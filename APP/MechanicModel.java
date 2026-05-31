package com.example.fixwheel;

import org.json.JSONObject;

public class MechanicModel {
    private String id;
    private String name;
    private String shopName;
    private String phone;
    private double rating;
    private String distance;
    private String specialty;
    private double lat;
    private double lng;

    public MechanicModel(JSONObject m) throws Exception {
        id = m.optString("id", "");
        name = m.optString("name", "");
        shopName = m.getString("shopName");
        phone = m.optString("phone", "");
        rating = m.optDouble("rating", 4.5);
        distance = m.optString("distance", "");
        specialty = m.optString("specialty", "");
        lat = m.optDouble("lat", 0);
        lng = m.optDouble("lng", 0);
    }

    public MechanicModel(String shopName, double rating, String distance, String specialty) {
        this.shopName = shopName;
        this.rating = rating;
        this.distance = distance;
        this.specialty = specialty;
        this.lat = 0;
        this.lng = 0;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getShopName() { return shopName; }
    public String getPhone() { return phone; }
    public double getRating() { return rating; }
    public String getDistance() { return distance; }
    public String getSpecialty() { return specialty; }
    public double getLat() { return lat; }
    public double getLng() { return lng; }
}
