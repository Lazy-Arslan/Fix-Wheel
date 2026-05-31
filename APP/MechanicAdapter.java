package com.example.fixwheel;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.RatingBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

public class MechanicAdapter extends RecyclerView.Adapter<MechanicAdapter.ViewHolder> {

    public interface OnBookListener {
        void onBook(MechanicModel mechanic);
    }

    private List<MechanicModel> mechanicList;
    private final OnBookListener bookListener;

    public MechanicAdapter(List<MechanicModel> list, OnBookListener bookListener) {
        this.mechanicList = list != null ? list : new ArrayList<>();
        this.bookListener = bookListener;
    }

    public void updateList(List<MechanicModel> list) {
        this.mechanicList = list != null ? list : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.mechanic_item, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        MechanicModel mechanic = mechanicList.get(position);
        holder.shopName.setText(mechanic.getShopName());
        holder.distance.setText(mechanic.getDistance());
        holder.specialty.setText(mechanic.getSpecialty());
        holder.ratingBar.setRating((float) mechanic.getRating());
        holder.bookBtn.setOnClickListener(v -> {
            if (mechanic.getId() == null || mechanic.getId().isEmpty()) {
                Toast.makeText(v.getContext(), "Mechanic data incomplete", Toast.LENGTH_SHORT).show();
                return;
            }
            if (bookListener != null) bookListener.onBook(mechanic);
        });
    }

    @Override
    public int getItemCount() {
        return mechanicList.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView shopName, distance, specialty;
        RatingBar ratingBar;
        Button bookBtn;

        ViewHolder(View itemView) {
            super(itemView);
            shopName = itemView.findViewById(R.id.shopName);
            distance = itemView.findViewById(R.id.distance);
            specialty = itemView.findViewById(R.id.specialty);
            ratingBar = itemView.findViewById(R.id.ratingBar);
            bookBtn = itemView.findViewById(R.id.bookBtn);
        }
    }
}
