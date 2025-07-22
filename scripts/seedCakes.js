import "../loadEnv.js";
console.log("MONGODB_URI:", process.env.MONGODB_URI);
import mongoose from "mongoose";
import dbConnect from "../lib/dbConnect.js";
import Cake from "../lib/models/Cake.js";

const cakes = [
  {
    name: "Butterscotch Fudge Cake",
    price: 95.0,
    image: "/Butterscoch-Fudge-Cake.jpg",
    rating: 4.8,
    description:
      "A rich, moist cake layered with creamy butterscotch fudge and topped with caramel drizzle. Perfect for those who love a sweet and buttery treat.",
    category: "Classic",
    stock: 10,
    ingredients: [
      "Butterscotch chips",
      "Brown sugar",
      "Butter",
      "Eggs",
      "Flour",
      "Caramel sauce",
    ],
    weight: "1.2 kg",
  },
  {
    name: "Marble Cake",
    price: 95.0,
    image: "/Marble-Cake-1.jpg",
    rating: 4.5,
    description:
      "Classic vanilla and chocolate cake batters swirled together for a beautiful marbled effect. Soft, fluffy, and visually stunning.",
    category: "Classic",
    stock: 10,
    ingredients: [
      "Vanilla extract",
      "Cocoa powder",
      "Butter",
      "Sugar",
      "Eggs",
      "Flour",
    ],
    weight: "1.0 kg",
  },
  {
    name: "Mocha Chocolate Cake",
    price: 95.0,
    image: "/Mocha-Chocolate-Cake.jpg",
    rating: 4.9,
    description:
      "A decadent dark chocolate cake infused with espresso, layered with mocha cream, and finished with chocolate shavings.",
    category: "Chocolate",
    stock: 10,
    ingredients: [
      "Dark chocolate",
      "Espresso",
      "Cocoa powder",
      "Butter",
      "Eggs",
      "Sugar",
    ],
    weight: "1.3 kg",
  },
  {
    name: "Pineapple Gateau",
    price: 105.0,
    image: "/Pineapple-Gateaux.jpg",
    rating: 4.7,
    description:
      "A light and airy sponge cake layered with whipped cream and juicy pineapple chunks, finished with a pineapple glaze.",
    category: "Fruit",
    stock: 10,
    ingredients: [
      "Pineapple",
      "Whipped cream",
      "Sponge cake",
      "Sugar",
      "Eggs",
      "Pineapple glaze",
    ],
    weight: "1.1 kg",
  },
  {
    name: "Ultimate Chocolate Cake",
    price: 89.0,
    image: "/Ultimate-Chocolate-Cake.jpg",
    rating: 4.6,
    description:
      "An ultra-rich chocolate cake with layers of chocolate ganache and fudge, perfect for true chocolate lovers.",
    category: "Chocolate",
    stock: 10,
    ingredients: [
      "Cocoa powder",
      "Chocolate ganache",
      "Butter",
      "Eggs",
      "Sugar",
      "Flour",
    ],
    weight: "1.4 kg",
  },
  {
    name: "Red Velvet Cake",
    price: 99.0,
    image: "/Red-velvet-cake-1-1.jpg",
    rating: 4.8,
    description:
      "A classic red velvet cake with a hint of cocoa, layered with smooth cream cheese frosting and finished with red velvet crumbs.",
    category: "Red Velvet",
    stock: 10,
    ingredients: [
      "Cocoa powder",
      "Buttermilk",
      "Cream cheese",
      "Butter",
      "Eggs",
      "Red food coloring",
    ],
    weight: "1.2 kg",
  },
];

async function seed() {
  await dbConnect();
  await Cake.deleteMany();
  await Cake.insertMany(cakes);
  console.log("Cakes seeded!");
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
