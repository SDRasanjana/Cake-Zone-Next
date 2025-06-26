import { NextResponse } from 'next/server';

// Return mock AI suggestions filtered by budget
async function getAISuggestions(budget, preferences) {
  // Define mock suggestions for each budget
  const allSuggestions = {
    "1500": [
      {
        id: 1,
        name: "AI Chocolate Dream",
        shape: preferences.shape || "round",
        flavor: "chocolate",
        layers: 1,
        price: 1300,
        frostingColor: "bg-pink-400",
        toppings: ["Fresh Berries"],
        description: "A simple chocolate cake with berries, AI suggested.",
      },
      {
        id: 2,
        name: "AI Vanilla Bliss",
        shape: preferences.shape || "round",
        flavor: "vanilla",
        layers: 1,
        price: 1400,
        frostingColor: "bg-blue-400",
        toppings: ["Nuts"],
        description: "A light vanilla cake with nuts, AI suggested.",
      },
      {
        id: 3,
        name: "AI Strawberry Surprise",
        shape: preferences.shape || "round",
        flavor: "strawberry",
        layers: 1,
        price: 1450,
        frostingColor: "bg-yellow-400",
        toppings: ["Chocolate Chips"],
        description: "A fruity strawberry cake with chocolate chips, AI suggested.",
      },
    ],
    "2000": [
      {
        id: 4,
        name: "AI Premium Chocolate",
        shape: preferences.shape || "round",
        flavor: "chocolate",
        layers: 2,
        price: 1800,
        frostingColor: "bg-pink-400",
        toppings: ["Fresh Berries", "Nuts"],
        description: "A rich chocolate cake with berries and nuts, AI suggested.",
      },
      {
        id: 5,
        name: "AI Deluxe Vanilla",
        shape: preferences.shape || "round",
        flavor: "vanilla",
        layers: 2,
        price: 1900,
        frostingColor: "bg-blue-400",
        toppings: ["Nuts", "Chocolate Chips"],
        description: "A deluxe vanilla cake with nuts and chocolate chips, AI suggested.",
      },
      {
        id: 6,
        name: "AI Berry Supreme",
        shape: preferences.shape || "round",
        flavor: "strawberry",
        layers: 2,
        price: 1950,
        frostingColor: "bg-yellow-400",
        toppings: ["Fresh Berries", "Chocolate Chips"],
        description: "A supreme strawberry cake with berries and chocolate chips, AI suggested.",
      },
    ],
    "2000+": [
      {
        id: 7,
        name: "AI Luxury Chocolate Tower",
        shape: preferences.shape || "round",
        flavor: "chocolate",
        layers: 3,
        price: 2500,
        frostingColor: "bg-pink-400",
        toppings: ["Fresh Berries", "Nuts", "Chocolate Chips"],
        description: "A luxury chocolate tower with all toppings, AI suggested.",
      },
      {
        id: 8,
        name: "AI Wedding Special",
        shape: preferences.shape || "round",
        flavor: "vanilla",
        layers: 3,
        price: 2600,
        frostingColor: "bg-blue-400",
        toppings: ["Nuts", "Chocolate Chips", "Fresh Berries"],
        description: "A wedding special vanilla cake with all toppings, AI suggested.",
      },
      {
        id: 9,
        name: "AI Designer Fruit Cake",
        shape: preferences.shape || "round",
        flavor: "strawberry",
        layers: 3,
        price: 2700,
        frostingColor: "bg-yellow-400",
        toppings: ["Fresh Berries", "Chocolate Chips", "Nuts"],
        description: "A designer fruit cake with all toppings, AI suggested.",
      },
    ],
  };
  return allSuggestions[budget] || allSuggestions["1500"];
}

export async function POST(req) {
  const { budget, preferences } = await req.json();
  const suggestions = await getAISuggestions(budget, preferences);
  return NextResponse.json({ suggestions });
}
