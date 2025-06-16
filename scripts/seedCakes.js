import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";
import dbConnect from "../lib/mongodb.js";
import Cake from "../lib/models/Cake.js";

const cakes = [
  { name: "Butterscotch Fudge Cake", price: 95.00, image: "/Butterscoch-Fudge.jpg", rating: 4.8, description: "Rich butterscotch layered with creamy fudge", category: "Classic", stock: 10 },
  { name: "Marble Cake", price: 95.00, image: "/marbel.jpg", rating: 4.5, description: "Classic vanilla and chocolate swirl", category: "Classic", stock: 10 },
  { name: "Mocha Chocolate Cake", price: 95.00, image: "/mocha-chocolate.jpg", rating: 4.9, description: "Coffee-infused dark chocolate delight", category: "Chocolate", stock: 10 },
  { name: "Pineapple Gateau", price: 105.00, image: "/pineapple.jpg", rating: 4.7, description: "Cream cheese frosted classic", category: "Fruit", stock: 10 },
  { name: "Ultimate Chocolate Cake", price: 89.00, image: "/ultimate.jpg", rating: 4.6, description: "Zesty lemon with fresh blueberries", category: "Chocolate", stock: 10 },
  { name: "Red Velvet Cake", price: 99.00, image: "/red-velvet.jpg", rating: 4.8, description: "Sweet and salty perfection", category: "Red Velvet", stock: 10 },
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
