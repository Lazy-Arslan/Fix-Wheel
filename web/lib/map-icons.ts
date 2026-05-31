/** HTML for Leaflet divIcon — mechanic pin with tools emoji */
export function mechanicMarkerSize(booked = false): number {
  return booked ? 46 : 38;
}

export function mechanicMarkerHtml(booked = false, dimmed = false): string {
  const size = mechanicMarkerSize(booked);
  const bg = booked ? "#2E7D32" : "#0D47A1";
  const ring = booked ? "3px solid #A5D6A7" : "2px solid #ffffff";
  const shadow = booked
    ? "0 3px 12px rgba(46,125,50,.5)"
    : "0 2px 8px rgba(0,0,0,.35)";
  const emoji = "👨‍🔧";
  const fontSize = booked ? 22 : 18;
  const opacity = dimmed ? 0.35 : 1;

  return `<div style="
    width:${size}px;height:${size}px;
    background:${bg};
    border:${ring};
    border-radius:50% 50% 50% 8%;
    box-shadow:${shadow};
    display:flex;align-items:center;justify-content:center;
    font-size:${fontSize}px;line-height:1;
    transform:rotate(-45deg);
    opacity:${opacity};
    transition:opacity .25s ease;
  "><span style="transform:rotate(45deg);display:block">${emoji}</span></div>`;
}

export function mechanicMarkerAnchor(booked = false): [number, number] {
  const size = mechanicMarkerSize(booked);
  return [size / 2, size];
}
