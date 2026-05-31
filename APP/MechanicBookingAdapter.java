package com.example.fixwheel;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class MechanicBookingAdapter extends RecyclerView.Adapter<MechanicBookingAdapter.Holder> {

    public interface OnBookingClickListener {
        void onBookingClick(BookingModel booking);
    }

    private List<BookingModel> list = new ArrayList<>();
    private BookingModel selected;
    private final OnBookingClickListener listener;

    public MechanicBookingAdapter(OnBookingClickListener listener) {
        this.listener = listener;
    }

    public void setList(List<BookingModel> bookings) {
        list = bookings != null ? bookings : new ArrayList<>();
        notifyDataSetChanged();
    }

    public void setSelected(BookingModel booking) {
        selected = booking;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public Holder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_mechanic_booking, parent, false);
        return new Holder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull Holder holder, int position) {
        BookingModel b = list.get(position);
        holder.nameTV.setText(b.customerName);
        holder.metaTV.setText(b.issueDisplay + " · Rs. " + b.currentPrice);
        holder.statusTV.setText(statusLabel(b.status));
        boolean isSelected = selected != null && selected.id.equals(b.id);
        holder.itemView.setBackgroundColor(isSelected ? 0xFFE3F2FD : 0xFFFFFFFF);
        holder.itemView.setOnClickListener(v -> {
            selected = b;
            notifyDataSetChanged();
            listener.onBookingClick(b);
        });
    }

    private static String statusLabel(String status) {
        switch (status) {
            case "pending": return "Awaiting you";
            case "countered": return "Waiting for customer";
            case "confirmed": return "In progress";
            case "completion_pending": return "Awaiting confirmation";
            default: return status;
        }
    }

    @Override
    public int getItemCount() {
        return list.size();
    }

    static class Holder extends RecyclerView.ViewHolder {
        TextView nameTV, metaTV, statusTV;

        Holder(View itemView) {
            super(itemView);
            nameTV = itemView.findViewById(R.id.bookingCustomerName);
            metaTV = itemView.findViewById(R.id.bookingMeta);
            statusTV = itemView.findViewById(R.id.bookingStatus);
        }
    }
}
