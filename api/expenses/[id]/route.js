// pages/api/expenses.js
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId

// Define valid categories to match frontend
const VALID_CATEGORIES = ['Labour', 'Inventory', 'Utilities', 'Others'];

export default async function handler(req, res) {
  const client = await clientPromise;
  // Replace 'shopExpensesDB' with your actual database name if different
  const db = client.db('shopExpensesDB');
  const collection = db.collection('expenses'); // Collection name

  try {
    if (req.method === 'POST') {
      // Handle adding a new expense
      const { description, amount, category, date } = req.body;

      // Basic validation
      if (!amount || !category || !date) {
        return res.status(400).json({ message: 'Missing required fields (amount, category, date)' });
      }
      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      if (!VALID_CATEGORIES.includes(category)) {
          return res.status(400).json({ message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
      }
      // Validate date format/parse attempts
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
      }


      const newExpense = {
        description: description || '', // Allow empty description
        amount: parseFloat(amount), // Ensure amount is stored as a number
        category: category,
        date: parsedDate, // Store date as a Date object
        createdAt: new Date(), // Timestamp for creation
      };

      const result = await collection.insertOne(newExpense);
      // Return the inserted document with _id converted to string
      const insertedDoc = result.ops ? result.ops[0] : { _id: result.insertedId, ...newExpense }; // Handle different driver versions
      return res.status(201).json({ ...insertedDoc, _id: insertedDoc._id.toString() });

    } else if (req.method === 'GET') {
      // Handle fetching all expenses
      const expenses = await collection.find({}).sort({ date: -1, createdAt: -1 }).toArray(); // Sort by date then creation date descending

      // Convert _id to string and ensure date is correctly formatted (it will be ISO string by default)
      const expensesWithIdString = expenses.map(expense => ({
          ...expense,
          _id: expense._id.toString(),
          // date is already a Date object, JSON.stringify handles this to ISO string
      }));

      return res.status(200).json(expensesWithIdString);

    } else if (req.method === 'DELETE') {
      // Handle deleting an expense
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ message: 'Missing expense ID' });
      }

      try {
        const objectId = new ObjectId(id); // Validate if ID is a valid ObjectId
        const result = await collection.deleteOne({ _id: objectId });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Expense not found' });
        }

        return res.status(200).json({ message: 'Expense deleted successfully', id });

      } catch (e) {
          // Handle invalid ObjectId format
          if (e instanceof Error && e.message.includes('Argument passed in must be a string of 12 bytes or a string of 24 hex characters')) {
               return res.status(400).json({ message: 'Invalid expense ID format' });
          }
          console.error('Error deleting expense:', e);
          return res.status(500).json({ message: 'Error processing ID or deleting expense' });
      }


    } else {
      // Method not allowed
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}