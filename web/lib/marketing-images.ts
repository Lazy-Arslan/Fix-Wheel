/** Marketing & local image paths for FixWheel */

const u = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const p = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/fixwheel-${seed}/${w}/${h}`;

/** Encode public-folder filenames (spaces, &, etc.) */
export const pub = (file: string) => `/${encodeURIComponent(file)}`;

export const MARKETING = {
  banner: {
    carService: u("photo-1486262715619-67b85e0b08d3", 1400),
    acRepair: pub("AC Service and repair.png"),
    carSpa: pub("car spa and cleaning.png"),
    tyres: pub("Tyre & Wheel Care.png"),
  },
  vehicles: {
    car: u("photo-1492144534655-ae79c964c9d7", 400),
    bike: u("photo-1558981403-c5f9899a28bc", 400),
    ebike: "https://yadea.com.pk/wp-content/uploads/2025/02/Yadea-Scooter-2.jpg",
    truck:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNcxLRsLnKMSidKLKff5MVTSB3aL5z3YKa2Q&s",
  },
  services: {
    car: u("photo-1486262715619-67b85e0b08d3", 500),
    ac: pub("AC Service and repair.png"),
    dent: "https://okcarhub.com/wp-content/uploads/2023/04/car-denting-and-painting-01.webp",
    spa: pub("car spa and cleaning.png"),
    tyres: pub("Tyre & Wheel Care.png"),
    battery:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs5Q7aqxr2cAvQGCJlAxcczKOpgr7n15itpA&s",
    detail: pub("car spa and cleaning.png"),
    inspect:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTufoXE9lKbSHh7nv7QBxeqw8P3DfRJ5tCZHQ&s",
  },
  promo: {
    periodic: u("photo-1486262715619-67b85e0b08d3", 400),
    polish:
      "https://www.shinearmor.com/cdn/shop/articles/Whats-the-Difference-Between-Polishing-and-Buffing--Shine-Armor-1686930145699_1200x1200.jpg?v=1686930146",
    spa: pub("car spa and cleaning.png"),
    paint:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_ozIJDo4kQG2vRLxg-JPd17ai4SMqxb35ag&s",
  },
  howItWorks: {
    map: u("photo-1567789885804-085b74f8a1b7", 300),
    phone: u("photo-1512941937669-90a1b58e7e9c", 300),
    mechanic: u("photo-1486262715619-67b85e0b08d3", 300),
  },
  cities: {
    islamabad:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxYR5LbQQWMEgRJZG8pmbRsYbLtSk8a9r72g&s",
    lahore:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOmpHH_RUoFMrddSvkjvcuFDdbYMOyyAPgtw&s",
    karachi:
      "https://cdn-blog.zameen.com/blog/wp-content/uploads/2020/08/Mazar-e-Quaid-D-14-08-1024x640.jpg",
    rawalpindi:
      "https://blog.uor.edu.pk/wp-content/uploads/2024/11/A-Wonderful-Aerial-View-of-Rawalpindi-Cricket-Stadium-640x401-1.jpg",
    peshawar:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Islamia_College_Peshawar_%28Public_Sector_University%29%2C_Khyber_Pakhtunkhwa%2C_Pakistan_cropped.jpg/330px-Islamia_College_Peshawar_%28Public_Sector_University%29%2C_Khyber_Pakhtunkhwa%2C_Pakistan_cropped.jpg",
    faisalabad:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvwhsY8E81JZwBgqHgc0k7Log4nyc6vESS1Q&s",
  },
  register: {
    customer: u("photo-1492144534655-ae79c964c9d7", 900),
    mechanic: u("photo-1486262715619-67b85e0b08d3", 900),
    hero: u("photo-1486262715619-67b85e0b08d3", 900),
  },
  automotiveFallback: (w: number) => u("photo-1486262715619-67b85e0b08d3", w),
  fallback: (seed: string, w: number, h: number) => p(seed, w, h),
};

export const PAKISTAN_CITIES = [
  {
    name: "Islamabad",
    landmark: "Faisal Mosque",
    mechanics: "120+",
    response: "18 min avg",
    detail: "Capital region — home & office doorstep service",
    img: "islamabad" as const,
  },
  {
    name: "Lahore",
    landmark: "Badshahi Mosque",
    mechanics: "200+",
    response: "22 min avg",
    detail: "Punjab hub — car, bike & rickshaw support",
    img: "lahore" as const,
  },
  {
    name: "Karachi",
    landmark: "Mazar-e-Quaid",
    mechanics: "180+",
    response: "25 min avg",
    detail: "Coastal city — 24/7 booking availability",
    img: "karachi" as const,
  },
  {
    name: "Rawalpindi",
    landmark: "Cricket Stadium",
    mechanics: "90+",
    response: "15 min avg",
    detail: "Twin cities — fast mechanic matching",
    img: "rawalpindi" as const,
  },
  {
    name: "Peshawar",
    landmark: "Islamia College",
    mechanics: "75+",
    response: "20 min avg",
    detail: "KPK gateway — bikes, cars & commercial vehicles",
    img: "peshawar" as const,
  },
  {
    name: "Faisalabad",
    landmark: "Clock Tower",
    mechanics: "85+",
    response: "19 min avg",
    detail: "Industrial hub — fleet & personal vehicle care",
    img: "faisalabad" as const,
  },
];

export const REGION_LABEL = "All Over Pakistan";

export const SUPPORT_PHONE = "0300-1234567";
export const SUPPORT_PHONE_TEL = "03001234567";
