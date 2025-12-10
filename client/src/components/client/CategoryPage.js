import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./CategoryPage.css";

const categoryData = {
  Embroidery: {
    name: "Embroidery",
    subServices: [
      { id: "hand", name: "Hand Embroidery", description:'Intricate designs done manually using a needle and thread, allowing for personalization and unique touches.', image: "/assets/Subservices/Embrioderyservices/handembriodery.jpg" },
      { id: "machine", name: "Machine Embroidery", description:'Uses specialized sewing machines to create designs quickly and consistently, often used for larger projects.', image: "/assets/Subservices/Embrioderyservices/machineembriodery.webp" },
      { id: "pearl", name: "Pearl Embroidery", description:'Intricate needlework adding beauty to wedding attire with delicate stitching and patterns.', image: "/assets/Subservices/Embrioderyservices/pearlembriodery.jpg" },
      { id: "beads", name: "Beads Embroidery", description:'Intricate needlework adding beauty to wedding attire with delicate stitching and patterns.', image: "/assets/Subservices/Embrioderyservices/beads-embriodery.jpg" },
    ],
  },
  "Home Cooked Food": {
    name: "Home Cooked Food",
    subServices: [
      { id: "south-indian", name: "South Indian Meals",description:'Authentic South Indian cuisine: dosa, idli, sambar, vada & more, made with fresh ingredients & aromatic spices.', image: "/assets/Subservices/homebasedfoods/southindian.jpg" },
      { id: "north-indian", name: "North Indian Meals", description:'Rich North Indian cuisine: tandoori delights, creamy curries, and aromatic basmati rice.', image: "/assets/Subservices/homebasedfoods/northindian.jfif" },
      { id: "snacks", name: "Snacks",description:'Delicious Indian snacks: crispy samosas, flavorful chaat, and savory pakoras.', image: "/assets/Subservices/homebasedfoods/snacks.webp" },
    ],
  },
  "Custom Gifts": {
    name: "Custom Gifts",
    subServices: [
      { id: "handmade-gifts", name: "Handmade Gifts",description:'Exquisite handmade gifts: crafted with love, personalized with care, and infused with unique charm.', image: "/assets/Subservices/gifts/handmadegifts.jpg" },
      { id: "birthday-gifts", name: "Birthday Gifts",description:'Birthday magic in every gift: personalized, thoughtful, and unforgettable.', image: "/assets/Subservices/gifts/birthdaygifts.jpg" },
      { id: "wedding-gifts", name: "Wedding Gifts",description:'Love-filled Wedding gifts: thoughtful, elegant, and treasured forever.', image: "/assets/Subservices/gifts/weddinggifts.jpg" },
      { id: "anniversary-gifts", name: "Anniversary Gifts",description:' thoughtful gestures to celebrate your love, personalized and memorable.', image: "/assets/Subservices/gifts/anniversarygifts.webp" },

    ],
  },
  "Arts & Crafts": {
    name: "Arts & Crafts",
    subServices: [
      { id: "paintings", name: "Paintings",description:'Custom paintings that reflect your personality. Vibrant abstracts to realistic portraits, crafted with skill and artistry', image: "/assets/Subservices/arts&crafts/painting.jpg" },
      { id: "paper-crafting", name: "Paper Crafting",description:'Intricate paper designs crafted with precision. Quilling, origami, and paper cutting create unique decorative pieces.', image: "/assets/Subservices/arts&crafts/papercrafting.webp" },
      { id: "clay-modelling", name: "Clay Modelling",description:'Handmade clay figurines and decor crafted with detail. Whimsical characters to elegant pieces, each one a work of art.', image: "/assets/Subservices/arts&crafts/claymodelling.webp" },
      { id: "collage-making", name: "Collage Making",description:'Unique collages created with mixed media. Textures, colors, and materials combine to produce stunning visual effects.', image: "/assets/Subservices/arts&crafts/collagemaking.jpg" },
    ],
  },
  "Fashion & Tailoring": {
    name: "Fashion & Tailoring",
    subServices: [
      { id: "ladies-wear", name: "Ladies Wear",description:'Exquisite garments crafted with precision, from elegant sarees to stylish kurtas and western wear.', image: "/assets/Subservices/fashion&tailoring/womenwear.jpg" },
      { id: "mens-wear", name: "Mens Wear",description:'Custom-fit shirts, suits, and trousers tailored to perfection for the modern man.', image: "/assets/Subservices/fashion&tailoring/menwear.jpg" },
      { id: "kids-wear", name: "Kids Wear",description:'Adorable outfits tailored for little ones, ensuring comfort, style, and perfect fit.', image: "/assets/Subservices/fashion&tailoring/kidwear.webp" },
      { id: "ethnic-wear", name: "Ethnic Wear",description:'Intricately designed ethnic outfits, including sarees, lehengas, and sherwanis, stitched with care and attention to detail.', image:"/assets/Subservices/fashion&tailoring/ethnicwear.webp" },
      { id: "party-wear", name: "Party Wear",description:'A party dress is intended for cocktail parties, evening events, or celebrations.', image:"/assets/Subservices/fashion&tailoring/party-wear.jpg" },
    ],
  },
  "Beauty & Wellness": {
    name: "Beauty & Wellness",
    subServices: [
      { id: "bridal-makeup", name: "Bridal Makeup",description:'Transform into the beauty of your dreams on your special day. Our expert makeup artists craft flawless, long-lasting looks that enhance your natural beauty.', image: "/assets/Subservices/beauty&wellness/bridalmakeup.webp" },
      { id: "skin-care", name: "Skin Care",description:'Glow from within with our personalized skin care services. From facials to treatments, our experts help you achieve healthy, radiant skin.', image: "/assets/Subservices/beauty&wellness/skincare.jpg" },
      { id: "hair-care", name: "Hair Care",description:'Nourish your locks with our expert hair care services. From treatments to styling, our professionals ensure your hair looks and feels its best.', image: "/assets/Subservices/beauty&wellness/haircare.jpg" },
      { id: "manicure-pedicure", name: "Manicure & Pedicure",description:'Pamper your hands and feet with our luxurious mani-pedi services. Expert nail care and pampering for a polished look and feel.', image: "/assets/Subservices/beauty&wellness/manicure&pedicure.webp" },
      { id: "full-body-massage", name: "Full Body Massage",description:'Indulge in blissful relaxation with our full-body massage services. Our skilled therapists melt away stress and tension, leaving you refreshed and rejuvenated.', image: "/assets/Subservices/beauty&wellness/bodymassage.jpg" },
    ],
  },
  "Sugar Bloom": {
    name: "Sugar Bloom",
    subServices: [
      { id: "cake-artistry", name: "Cake Artistry",description:'Creating edible masterpieces, one slice at a time, Sweet celebrations, artfully crafted', image: "/assets/SubServices/sugarbloom/cake-artistry.jfif" },
      { id: "cupcake-muffin-creation", name: "Cupcake & Muffin creations",description:'Small bites, big happiness, Baked with love, topped with joy, Sweet treats for every moment', image: "/assets/SubServices/sugarbloom/cupcake.jpg" },
      { id: "cookies&biscuits", name: "Cookies & Biscuits",description:'Bite-sized happiness, Sweet moments in every crunch, and Simply irresistible.', image: "/assets/SubServices/sugarbloom/cookies.jpg" },
   {id:"Bread&pastry-delight", name:"Bread & Pastry Delight",description:'Crafting happiness, one loaf and pastry at a time, Where fresh-baked goodness meets sweet indulgence.', image:"/assets/SubServices/sugarbloom/breads.jfif" },
    ],
  },
  "Event Decoration": {
    name: "Event Decoration",
    subServices: [
        { id: "birthday", name: "Birthday Decor",description:'Customized birthday decorations for kids and adults, including theme parties, balloon decorations, and cake surprises.', image: "/assets/Subservices/eventdecoration/birthday.jpg" },
        { id: "wedding", name: "Wedding Decor", description:'Elegant wedding decorations, including flower arrangements, lighting, and furniture setup', image: "/assets/Subservices/eventdecoration/wedding.jpg" },
       { id: "festive-decor", name: "Festive Decor",description:'Colorful festive decorations for occasions like Diwali, Christmas, and Holi.', image: "/assets/Subservices/eventdecoration/festival.jpg" },
       { id: "anniversary-decor", name: "Anniversary Decor",description:'Romantic anniversary decorations, including candlelight dinners and personalized gifts.', image: "/assets/Subservices/eventdecoration/anniversary.jpg" },
       { id: "corporate-event-decor", name: "Corporate Event Decor",description:'Professional corporate event decorations, including setup, lighting, and audiovisual equipment', image: "/assets/Subservices/eventdecoration/corporateevent.webp" },
    ],
  },
  "Home Gardening Kits": {
    name: "Home Gardening Kits",
    subServices: [
      { id: "indoor-plants", name: "Indoor Plants",description:'Designed for indoor gardening, these kits include grow lights, pots, seeds, and nutrient solutions for growing plants in small spaces.', image: "/assets/Subservices/gardening/indoorplant.webp" },
      { id: "plant-kit", name: "Plant Kit",description:'These kits include seeds, containers, soil, and instructions for growing various plants like herbs, vegetables, and flowers.', image: "/assets/Subservices/gardening/plantkit.jfif" },
      { id: "herb-kit", name: "Herb Kit",description:' For growing herbs like basil, mint, and parsley.', image: "/assets/Subservices/gardening/herbkit.webp" },
      { id: "vegetable-kit", name: "Vegetable Kit",description:'For growing vegetables like tomatoes, peppers, and lettuce.', image: "/assets/Subservices/gardening/vegetablekit.jpeg" },
      { id: "flower-kit", name: "Flower Kit",description:' For growing flowers like marigolds, sunflowers, and orchids.', image:"/assets/Subservices/gardening/flowerkit.jfif" },
      { id: "microgreen-kit", name: "Microgreen Kit",description:'For growing nutrient-packed microgreens.', image: "/assets/Subservices/gardening/microgreens.jpg" },
    ],
  },
  "Traditional Festival Kits": {
    name: "Traditional Festival Kits",
    subServices: [
      { id: "puja", name: "Puja Kits",description:'A comprehensive kit containing essential items for performing puja ceremonies, including diyas, incense sticks, and sacred materials.', image: "/assets/Subservices/traditionalfestive/pujakit.jfif" },
      { id: "festival-essentials", name: "Festival Essentials",description:'A special kit for festivals like Diwali, Navratri, or Ganesh Chaturthi, containing items like idols, decorations, and sacred materials.', image: "/assets/Subservices/traditionalfestive/festiveessential.webp" },
      { id: "holi-festival-kits", name: "Holi Festival Kit",description:'Traditional Holi festival kits with attractive looks, fine finish, and cost-effective pricing, available in different specifications and designs.', image: "/assets/Subservices/traditionalfestive/holi.jpg" },
      { id: "diwali-festival-kits", name: "Diwali Festival Kit",description:'Diwali festival kits and gifts, including traditional decorations and modern essentials.', image: "/assets/Subservices/traditionalfestive/diwali.jpg" },
      { id: "ganapathi-festival-kit", name: "Ganapathi Festival Kit",description:'Ganpati traditional garland kit with 12 pieces, including 8ft green vines and marigold garlands for home decor.', image: "/assets/Subservices/traditionalfestive/ganapathi.png" },
      { id: "festive-delight-crafts", name: "Festive Delight Craft",description:'DIY craft kit for kids and adults, includes 5 craft activities like traditional wall hanging and neon rangoli.', image: "/assets/Subservices/traditionalfestive/festivedelightcraft.webp" },
      { id: "lotus-puja-decor-kit", name: " Lotus Puja Decor Kit",description:'Premium lotus-themed backdrop decoration kit with yellow curtain and pom-pom bell hangings for festivals and mandir decor.', image: "/assets/Subservices/traditionalfestive/lotusdecoration.jpg" },
    ],
  },
};

function CategoryPage() {
  const { category } = useParams();
  const categoryInfo = categoryData[category];

  if (!categoryInfo) {
    return (
      <motion.div 
        className="error-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Category not found</h2>
        <p>The category you're looking for doesn't exist.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="category-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {categoryInfo.name} - Sub Services
      </motion.h2>
      
      <div className="grid">
        {categoryInfo.subServices.length > 0 ? (
          categoryInfo.subServices.map((sub, index) => (
            <motion.div
              key={sub.id}
              className="card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <motion.img 
                src={sub.image} 
                alt={sub.name}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <h3>{sub.name}</h3>
              <p>{sub.description}</p>
              <Link to={`/services/${category}/${sub.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Providers
                </motion.button>
              </Link>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>No subservices added yet for this category.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default CategoryPage;