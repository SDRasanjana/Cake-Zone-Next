import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; // Adjusted path to global Prisma client

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const budgetParam = searchParams.get('budget');

  if (!budgetParam) {
    return NextResponse.json({ error: 'Budget parameter is required' }, { status: 400 });
  }

  const budget = parseFloat(budgetParam);

  if (isNaN(budget) || budget <= 0) {
    return NextResponse.json({ error: 'Invalid budget parameter. Must be a positive number.' }, { status: 400 });
  }

  try {
    const suggestions = await prisma.cakeConfiguration.findMany({
      where: {
        isPredefined: true, // Assuming we only suggest pre-defined cakes
        basePrice: {
          lte: budget,
        },
      },
      take: 3,
      select: {
        id: true,
        name: true,
        description: true,
        basePrice: true,
        imageUrl: true,
        availableLayers: true,
        availableFlavors: true,
        availableToppings: true,
        availableColors: true,
        // Add any other fields relevant for a suggestion card
      },
      orderBy: {
        basePrice: 'asc', // Optional: order by price or relevance
      }
    });

    if (!suggestions) {
      // findMany returns empty array if no records, not null.
      // This check is more for if the prisma client itself had an issue,
      // but actual "no results" is handled by returning the empty array.
      return NextResponse.json({ message: 'No suggestions found for this budget.' }, { status: 200 });
    }

    return NextResponse.json(suggestions, { status: 200 });

  } catch (error) {
    console.error('Error fetching cake suggestions:', error);
    // Check if the error is a Prisma known error, otherwise generic 500
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && error.code.startsWith('P')) {
        // Prisma specific error (e.g., P2021: Table does not exist)
        return NextResponse.json({ error: 'Database error occurred.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  // Prisma client disconnection is handled by the global instance, so no explicit disconnect here.
}
