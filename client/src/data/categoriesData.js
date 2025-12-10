// src/data/categoriesData.js
export const categoryData = {
  Embroidery: {
    name: "Embroidery",
    subServices: [
      { id: "hand_embroidery", name: "Hand Embroidery", description:'Intricate designs done manually using a needle and thread, allowing for personalization and unique touches.', image: "/assets/Subservices/Embrioderyservices/handembriodery.jpg" },
      { id: "machine_embroidery", name: "Machine Embroidery", description:'Uses specialized sewing machines to create designs quickly and consistently, often used for larger projects.', image: "/assets/Subservices/Embrioderyservices/machineembriodery.webp" },
      { id: "pearl_embroidery", name: "Pearl Embroidery", description:'Elegant stitching using pearls to enhance fabrics, ideal for bridal and festive wear.', image: "/assets/Subservices/Embrioderyservices/pearlembriodery.jpg" },
      { id: "beads_embroidery", name: "Beads Embroidery", description:'Beautiful beaded artwork sewn onto fabric for decorative and fashion purposes.', image: "/assets/Subservices/Embrioderyservices/beads-embriodery.jpg" },
    ],
  },

  "Home Cooked Food": {
    name: "Home Cooked Food",
    subServices: [
      { id: "south_indian_meals", name: "South Indian Meals", description:'Authentic South Indian cuisine: dosa, idli, sambar, vada & more, made with fresh ingredients & aromatic spices.', image: "/assets/Subservices/homebasedfoods/southindian.jpg" },
      { id: "north_indian_meals", name: "North Indian Meals", description:'Rich North Indian cuisine: tandoori delights, creamy curries, and aromatic basmati rice.', image: "/assets/Subservices/homebasedfoods/northindian.jfif" },
      { id: "quick_snacks", name: "Quick Snacks", description:'Delicious Indian snacks: crispy samosas, flavorful chaat, and savory pakoras.', image: "/assets/Subservices/homebasedfoods/snacks.webp" },
    ],
  },

  "Custom Gifts": {
    name: "Custom Gifts",
    subServices: [
      { id: "handmade_gifts", name: "Handmade Gifts", description:'Exquisite handmade gifts: crafted with love, personalized with care, and infused with unique charm.', image: "/assets/Subservices/gifts/handmadegifts.jpg" },
      { id: "birthday_gifts", name: "Birthday Gifts", description:'Birthday magic in every gift: personalized, thoughtful, and unforgettable.', image: "/assets/Subservices/gifts/birthdaygifts.jpg" },
      { id: "wedding_gifts", name: "Wedding Gifts", description:'Love-filled Wedding gifts: thoughtful, elegant, and treasured forever.', image: "/assets/Subservices/gifts/weddinggifts.jpg" },
      { id: "anniversary_gifts", name: "Anniversary Gifts", description:'Thoughtful gestures to celebrate your love, personalized and memorable.', image: "/assets/Subservices/gifts/anniversarygifts.webp" },
    ],
  },
};

// ✅ Subcategory mapping for provider lookup
export const subCategoryMap = {
  'hand_embroidery': 'Hand Embroidery',
  'machine_embroidery': 'Machine Embroidery',
  'pearl_embroidery': 'Pearl Embroidery',
  'beads_embroidery': 'Beads Embroidery',

  'south_indian_meals': 'South Indian Meals',
  'north_indian_meals': 'North Indian Meals',
  'quick_snacks': 'Quick Snacks',

  'handmade_gifts': 'Handmade Gifts',
  'birthday_gifts': 'Birthday Gifts',
  'wedding_gifts': 'Wedding Gifts',
  'anniversary_gifts': 'Anniversary Gifts',
};
