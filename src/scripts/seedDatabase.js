const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Sample products based on the optics e-commerce project
const sampleProducts = [
  {
    name: "Eklook 560V7",
    category: "eyeglasses",
    price: 5000,
    colors: ["black", "grey", "golden", "light-blue", "red-brown"],
    image: "https://example.com/images/eklook-560v7.jpg",
    prescriptionEligible: false,
    recentSales: "1k+ bought in last month",
    includeLenses: true,
    brand: "Eklook",
    description: "Modern rectangular frame with a sophisticated design, perfect for both casual and professional settings.",
    features: ["Lightweight", "Durable", "Adjustable nose pads", "Spring hinges"],
    inStock: true,
    stockQuantity: 50,
    rating: 4.5,
    reviewCount: 127,
    isFeatured: true,
    isOnSale: false
  },
  {
    name: "Thomas Oval",
    category: "eyeglasses",
    price: 5000,
    colors: ["black", "grey", "golden", "light-blue", "red-brown"],
    image: "https://example.com/images/thomas-oval.jpg",
    prescriptionEligible: true,
    recentSales: "1k+ bought in last month",
    includeLenses: true,
    brand: "Thomas",
    description: "Classic oval frame that complements all face shapes, ideal for prescription lenses.",
    features: ["Prescription ready", "Comfortable fit", "Timeless design", "High-quality materials"],
    inStock: true,
    stockQuantity: 75,
    rating: 4.7,
    reviewCount: 203,
    isFeatured: true,
    isOnSale: false
  },
  {
    name: "Flora Round",
    category: "eyeglasses",
    price: 4000,
    colors: ["black", "grey", "golden", "light-blue", "red-brown"],
    image: "https://example.com/images/flora-round.jpg",
    prescriptionEligible: true,
    recentSales: "1k+ bought in last month",
    includeLenses: true,
    brand: "Flora",
    description: "Elegant round frame with floral-inspired details, perfect for a feminine touch.",
    features: ["Feminine design", "Lightweight frame", "Adjustable temples", "Prescription ready"],
    inStock: true,
    stockQuantity: 60,
    rating: 4.3,
    reviewCount: 89,
    isFeatured: false,
    isOnSale: true,
    discountPercentage: 15
  },
  {
    name: "Rayban 230V",
    category: "sunglasses",
    price: 6000,
    colors: ["black", "grey", "golden", "light-blue", "red-brown"],
    image: "https://example.com/images/rayban-230v.jpg",
    prescriptionEligible: false,
    recentSales: "1k+ bought in last month",
    includeLenses: true,
    brand: "Ray-Ban",
    description: "Iconic aviator style with premium UV protection and polarized lenses.",
    features: ["UV400 protection", "Polarized lenses", "Metal frame", "Adjustable nose pads"],
    inStock: true,
    stockQuantity: 40,
    rating: 4.8,
    reviewCount: 156,
    isFeatured: true,
    isOnSale: false
  },
  {
    name: "Ottoto Piero",
    category: "eyeglasses",
    price: 4000,
    colors: ["black", "grey", "golden", "light-blue", "red-brown"],
    image: "https://example.com/images/ottoto-piero.jpg",
    prescriptionEligible: true,
    recentSales: "1k+ bought in last month",
    includeLenses: true,
    brand: "Ottoto",
    description: "Contemporary rectangular frame with clean lines and modern aesthetics.",
    features: ["Modern design", "Lightweight", "Prescription ready", "Durable construction"],
    inStock: true,
    stockQuantity: 55,
    rating: 4.4,
    reviewCount: 78,
    isFeatured: false,
    isOnSale: false
  },
  {
    name: "Amelia E",
    category: "eyeglasses",
    price: 6000,
    colors: ["black", "grey", "golden", "light-blue", "red-brown"],
    image: "https://example.com/images/amelia-e.jpg",
    prescriptionEligible: true,
    recentSales: "1k+ bought in last month",
    includeLenses: true,
    brand: "Amelia",
    description: "Sophisticated cat-eye frame with a vintage-inspired design.",
    features: ["Cat-eye shape", "Vintage style", "Prescription ready", "Premium materials"],
    inStock: true,
    stockQuantity: 35,
    rating: 4.6,
    reviewCount: 112,
    isFeatured: true,
    isOnSale: false
  },
  {
    name: "Olga Cat",
    category: "eyeglasses",
    price: 4500,
    colors: ["black", "grey", "golden", "light-blue", "red-brown"],
    image: "https://example.com/images/olga-cat.jpg",
    prescriptionEligible: true,
    recentSales: "1k+ bought in last month",
    includeLenses: true,
    brand: "Olga",
    description: "Bold cat-eye frame with contemporary styling and excellent comfort.",
    features: ["Bold design", "Comfortable fit", "Adjustable temples", "Prescription ready"],
    inStock: true,
    stockQuantity: 45,
    rating: 4.2,
    reviewCount: 67,
    isFeatured: false,
    isOnSale: true,
    discountPercentage: 10
  },
  {
    name: "Muse Brenner",
    category: "eyeglasses",
    price: 5000,
    colors: ["black", "grey", "golden", "light-blue", "red-brown"],
    image: "https://example.com/images/muse-brenner.jpg",
    prescriptionEligible: true,
    recentSales: "1k+ bought in last month",
    includeLenses: true,
    brand: "Muse",
    description: "Artistic frame design inspired by modern art movements.",
    features: ["Artistic design", "Unique styling", "Prescription ready", "Conversation starter"],
    inStock: true,
    stockQuantity: 30,
    rating: 4.9,
    reviewCount: 45,
    isFeatured: true,
    isOnSale: false
  },
  {
    name: "Ottoto Weston",
    category: "eyeglasses",
    price: 4000,
    colors: ["black", "grey", "golden", "light-blue", "red-brown"],
    image: "https://example.com/images/ottoto-weston.jpg",
    prescriptionEligible: true,
    recentSales: "1k+ bought in last month",
    includeLenses: true,
    brand: "Ottoto",
    description: "Classic rectangular frame with refined proportions and timeless appeal.",
    features: ["Classic design", "Timeless appeal", "Prescription ready", "Professional look"],
    inStock: true,
    stockQuantity: 65,
    rating: 4.5,
    reviewCount: 134,
    isFeatured: false,
    isOnSale: false
  },
  {
    name: "Sports Pro X1",
    category: "sports",
    price: 8000,
    colors: ["black", "blue", "red", "green"],
    image: "https://example.com/images/sports-pro-x1.jpg",
    prescriptionEligible: true,
    recentSales: "500+ bought in last month",
    includeLenses: true,
    brand: "SportsPro",
    description: "High-performance sports eyewear with impact resistance and anti-fog coating.",
    features: ["Impact resistant", "Anti-fog coating", "UV protection", "Lightweight frame"],
    inStock: true,
    stockQuantity: 25,
    rating: 4.7,
    reviewCount: 89,
    isFeatured: true,
    isOnSale: false
  },
  {
    name: "Premium Lens Kit",
    category: "lenses",
    price: 3000,
    colors: ["clear", "blue-light", "photochromic"],
    image: "https://example.com/images/premium-lens-kit.jpg",
    prescriptionEligible: true,
    recentSales: "2k+ bought in last month",
    includeLenses: false,
    brand: "OptiLens",
    description: "High-quality lens options including blue-light blocking and photochromic technology.",
    features: ["Blue-light blocking", "Photochromic", "Anti-reflective", "Scratch resistant"],
    inStock: true,
    stockQuantity: 100,
    rating: 4.8,
    reviewCount: 234,
    isFeatured: true,
    isOnSale: false
  },
  {
    name: "Designer Collection A",
    category: "brands",
    price: 12000,
    colors: ["black", "gold", "silver"],
    image: "https://example.com/images/designer-collection-a.jpg",
    prescriptionEligible: true,
    recentSales: "200+ bought in last month",
    includeLenses: true,
    brand: "Designer Collection",
    description: "Luxury designer frames with premium materials and exceptional craftsmanship.",
    features: ["Luxury materials", "Exceptional craftsmanship", "Limited edition", "Premium packaging"],
    inStock: true,
    stockQuantity: 15,
    rating: 4.9,
    reviewCount: 67,
    isFeatured: true,
    isOnSale: false
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB Atlas');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully inserted ${insertedProducts.length} products`);

    // Display some sample products
    console.log('\nSample products inserted:');
    insertedProducts.slice(0, 5).forEach(product => {
      console.log(`- ${product.name} (${product.category}) - $${product.price}`);
    });

    console.log('\nDatabase seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
