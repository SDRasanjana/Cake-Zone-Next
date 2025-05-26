import React from "react";

// app/menu/page.tsx

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Chocolate Cake",
    description: "Rich and moist chocolate cake topped with ganache.",
    price: 15.99,
    image: "/images/chocolate-cake.jpg",
  },
  {
    id: 2,
    name: "Vanilla Cupcake",
    description: "Classic vanilla cupcake with buttercream frosting.",
    price: 3.99,
    image: "/images/vanilla-cupcake.jpg",
  },
  {
    id: 3,
    name: "Red Velvet Cake",
    description: "Delicious red velvet cake with cream cheese frosting.",
    price: 17.99,
    image: "/images/red-velvet-cake.jpg",
  },
];

export default function Menu() {
  return (
    <main>
      <h1>Our Menu</h1>
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "1rem",
              width: "250px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ width: "100%", borderRadius: "6px" }}
            />
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <p>
              <strong>${item.price.toFixed(2)}</strong>
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}