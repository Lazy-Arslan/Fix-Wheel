package com.example.fixwheel;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * REST client for the FixWheel Next.js API (same as web app).
 */
public final class ApiClient {

    private static final ExecutorService EXECUTOR = Executors.newCachedThreadPool();

    public interface LoginCallback {
        void onSuccess(String userType, String username, String usercnic);
        void onNotFound();
        void onError(String message);
    }

    public interface SimpleCallback {
        void onSuccess();
        void onError(String message);
    }

    public interface MechanicsCallback {
        void onSuccess(List<MechanicModel> mechanics);
        void onError(String message);
    }

    public interface ProfileCallback {
        void onSuccess(JSONObject profile);
        void onError(String message);
    }

    public interface BookingCallback {
        void onSuccess(BookingModel booking);
        void onError(String message);
    }

    public interface BookingsCallback {
        void onSuccess(List<BookingModel> bookings);
        void onError(String message);
    }

    public interface PlacesCallback {
        void onSuccess(JSONArray suggestions);
        void onError(String message);
    }

    public interface StringCallback {
        void onSuccess(String text);
        void onError(String message);
    }

    private ApiClient() {}

    public static void login(String name, String cnic, LoginCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                JSONObject body = new JSONObject();
                body.put("name", name);
                body.put("cnic", cnic.replaceAll("\\D", ""));
                HttpResult result = post("/api/auth/login", body.toString());
                if (result.code == 404) {
                    runOnMain(callback::onNotFound);
                    return;
                }
                if (result.code != 200) {
                    runOnMain(() -> callback.onError(parseError(result.body)));
                    return;
                }
                JSONObject json = new JSONObject(result.body);
                final String userType = json.getString("userType");
                final String username = json.getString("username");
                final String usercnic = json.getString("usercnic");
                runOnMain(() -> callback.onSuccess(userType, username, usercnic));
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void registerCustomer(JSONObject data, SimpleCallback callback) {
        EXECUTOR.execute(() -> postSimple("/api/customers", data.toString(), callback));
    }

    public static void registerMechanic(JSONObject data, SimpleCallback callback) {
        EXECUTOR.execute(() -> postSimple("/api/mechanics", data.toString(), callback));
    }

    public static void getMechanicsNearby(double lat, double lng, double radiusKm,
                                          MechanicsCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                String path = "/api/mechanics/nearby?lat=" + lat + "&lng=" + lng + "&radius=" + radiusKm;
                parseMechanicsList(get(path), callback);
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void getMechanicsForMap(double lat, double lng, double radiusKm,
                                          MechanicsCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                String path = "/api/mechanics/map?lat=" + lat + "&lng=" + lng + "&radius=" + radiusKm;
                parseMechanicsList(get(path), callback);
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void getMechanicProfile(String name, String cnic, ProfileCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                String path = "/api/mechanics/profile?name="
                        + URLEncoder.encode(name, "UTF-8")
                        + "&cnic=" + URLEncoder.encode(cnic.replaceAll("\\D", ""), "UTF-8");
                HttpResult result = get(path);
                if (result.code != 200) {
                    runOnMain(() -> callback.onError(parseError(result.body)));
                    return;
                }
                JSONObject json = new JSONObject(result.body);
                JSONObject profile = json.getJSONObject("profile");
                runOnMain(() -> callback.onSuccess(profile));
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void searchPlaces(String input, PlacesCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                String path = "/api/osm/search?input=" + URLEncoder.encode(input, "UTF-8");
                HttpResult result = get(path);
                if (result.code != 200) {
                    runOnMain(() -> callback.onError(parseError(result.body)));
                    return;
                }
                JSONArray suggestions = new JSONObject(result.body).getJSONArray("suggestions");
                runOnMain(() -> callback.onSuccess(suggestions));
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void reverseGeocode(double lat, double lng, StringCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                String path = "/api/osm/reverse-geocode?lat=" + lat + "&lng=" + lng;
                HttpResult result = get(path);
                if (result.code != 200) {
                    runOnMain(() -> callback.onError(parseError(result.body)));
                    return;
                }
                String address = new JSONObject(result.body).optString("address", "");
                runOnMain(() -> callback.onSuccess(address));
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void createBooking(JSONObject body, BookingCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                HttpResult result = post("/api/bookings", body.toString());
                if (result.code != 200) {
                    runOnMain(() -> callback.onError(parseError(result.body)));
                    return;
                }
                BookingModel booking = new BookingModel(
                        new JSONObject(result.body).getJSONObject("booking"));
                runOnMain(() -> callback.onSuccess(booking));
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void getActiveCustomerBooking(String name, String cnic, BookingCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                String path = "/api/bookings?role=customer&active=true&name="
                        + URLEncoder.encode(name, "UTF-8")
                        + "&cnic=" + URLEncoder.encode(cnic.replaceAll("\\D", ""), "UTF-8");
                HttpResult result = get(path);
                if (result.code != 200) {
                    runOnMain(() -> callback.onError(parseError(result.body)));
                    return;
                }
                JSONObject json = new JSONObject(result.body);
                if (!json.has("booking") || json.isNull("booking")) {
                    runOnMain(() -> callback.onSuccess(null));
                    return;
                }
                Object raw = json.get("booking");
                if (raw == null || raw == JSONObject.NULL) {
                    runOnMain(() -> callback.onSuccess(null));
                    return;
                }
                BookingModel booking = new BookingModel((JSONObject) raw);
                runOnMain(() -> callback.onSuccess(booking));
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void getMechanicBookings(String name, String cnic, BookingsCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                String path = "/api/bookings?role=mechanic&name="
                        + URLEncoder.encode(name, "UTF-8")
                        + "&cnic=" + URLEncoder.encode(cnic.replaceAll("\\D", ""), "UTF-8");
                HttpResult result = get(path);
                if (result.code != 200) {
                    runOnMain(() -> callback.onError(parseError(result.body)));
                    return;
                }
                JSONArray arr = new JSONObject(result.body).getJSONArray("bookings");
                List<BookingModel> list = new ArrayList<>();
                for (int i = 0; i < arr.length(); i++) {
                    list.add(new BookingModel(arr.getJSONObject(i)));
                }
                runOnMain(() -> callback.onSuccess(list));
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void patchBooking(String id, JSONObject body, BookingCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                HttpResult result = patch("/api/bookings/" + id, body.toString());
                if (result.code != 200) {
                    runOnMain(() -> callback.onError(parseError(result.body)));
                    return;
                }
                BookingModel booking = new BookingModel(
                        new JSONObject(result.body).getJSONObject("booking"));
                runOnMain(() -> callback.onSuccess(booking));
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    public static void cancelBooking(String id, String customerName, String customerCnic,
                                     SimpleCallback callback) {
        EXECUTOR.execute(() -> {
            try {
                JSONObject body = new JSONObject();
                body.put("customerName", customerName);
                body.put("customerCnic", customerCnic.replaceAll("\\D", ""));
                HttpResult result = delete("/api/bookings/" + id, body.toString());
                if (result.code != 200) {
                    runOnMain(() -> callback.onError(parseError(result.body)));
                    return;
                }
                runOnMain(callback::onSuccess);
            } catch (Exception e) {
                runOnMain(() -> callback.onError(networkMessage(e)));
            }
        });
    }

    private static void postSimple(String path, String jsonBody, SimpleCallback callback) {
        try {
            HttpResult result = post(path, jsonBody);
            if (result.code == 200) {
                runOnMain(callback::onSuccess);
            } else {
                runOnMain(() -> callback.onError(parseError(result.body)));
            }
        } catch (Exception e) {
            runOnMain(() -> callback.onError(networkMessage(e)));
        }
    }

    private static void parseMechanicsList(HttpResult result, MechanicsCallback callback)
            throws Exception {
        if (result.code != 200) {
            runOnMain(() -> callback.onError(parseError(result.body)));
            return;
        }
        JSONArray arr = new JSONObject(result.body).getJSONArray("mechanics");
        List<MechanicModel> list = new ArrayList<>();
        for (int i = 0; i < arr.length(); i++) {
            list.add(new MechanicModel(arr.getJSONObject(i)));
        }
        runOnMain(() -> callback.onSuccess(list));
    }

    private static HttpResult post(String path, String jsonBody) throws Exception {
        return request("POST", path, jsonBody);
    }

    private static HttpResult patch(String path, String jsonBody) throws Exception {
        return request("PATCH", path, jsonBody);
    }

    private static HttpResult delete(String path, String jsonBody) throws Exception {
        return request("DELETE", path, jsonBody);
    }

    private static HttpResult get(String path) throws Exception {
        return request("GET", path, null);
    }

    private static HttpResult request(String method, String path, String jsonBody) throws Exception {
        URL url = new URL(FixWheelConfig.API_BASE_URL + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(method);
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(15000);
        conn.setRequestProperty("Content-Type", "application/json");
        if (jsonBody != null && !method.equals("GET")) {
            conn.setDoOutput(true);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
            }
        }
        return readResponse(conn);
    }

    private static HttpResult readResponse(HttpURLConnection conn) throws Exception {
        int code = conn.getResponseCode();
        BufferedReader reader;
        if (code >= 200 && code < 300) {
            reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
        } else {
            reader = new BufferedReader(new InputStreamReader(
                    conn.getErrorStream() != null ? conn.getErrorStream() : conn.getInputStream(),
                    StandardCharsets.UTF_8));
        }
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        reader.close();
        return new HttpResult(code, sb.toString());
    }

    private static String parseError(String body) {
        try {
            JSONObject json = new JSONObject(body);
            if (json.has("error")) return json.getString("error");
            if (json.has("errors")) {
                JSONObject errors = json.getJSONObject("errors");
                Iterator<String> keys = errors.keys();
                if (keys.hasNext()) return errors.getString(keys.next());
            }
        } catch (Exception ignored) {}
        return "Request failed";
    }

    private static String networkMessage(Exception e) {
        return "Cannot reach server. Check FixWheelConfig.API_BASE_URL and npm run dev. "
                + e.getMessage();
    }

    private static void runOnMain(Runnable r) {
        new android.os.Handler(android.os.Looper.getMainLooper()).post(r);
    }

    private static final class HttpResult {
        final int code;
        final String body;

        HttpResult(int code, String body) {
            this.code = code;
            this.body = body;
        }
    }
}
