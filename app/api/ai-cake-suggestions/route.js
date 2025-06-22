import { NextResponse } from 'next/server';

// You would replace this with a real AI call (OpenAI, etc.)
async function getAISuggestions(budget, preferences) {
  // Example: Call OpenAI or your own logic here
  // For now, return mock data
  return [
    {
      id: 1,
      name: "AI Chocolate Dream",
      shape: preferences.shape || "round",
      flavor: "chocolate",
      layers: 2,
      price: 1200,
      frostingColor: "bg-pink-400",
      toppings: ["Fresh Berries"],
      description: "A rich chocolate cake with berries, AI suggested.",
    },
    {
      id: 2,
      name: "AI Vanilla Bliss",
      shape: preferences.shape || "round",
      flavor: "vanilla",
      layers: 1,
      price: 1100,
      frostingColor: "bg-blue-400",
      toppings: ["Nuts"],
      description: "A light vanilla cake with nuts, AI suggested.",
    },
    {
      id: 3,
      name: "AI Strawberry Surprise",
      shape: preferences.shape || "round",
      flavor: "strawberry",
      layers: 3,
      price: 1400,
      frostingColor: "bg-yellow-400",
      toppings: ["Chocolate Chips"],
      description: "A fruity strawberry cake with chocolate chips, AI suggested.",
    },
  ];
}

export async function POST(req) {
  const { budget, preferences } = await req.json();
  const suggestions = await getAISuggestions(budget, preferences);
  return NextResponse.json({ suggestions });
}
