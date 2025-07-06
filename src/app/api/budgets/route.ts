import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Budget } from '@/types/transaction';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const category = searchParams.get('category');
    
    const filter: Record<string, unknown> = {};
    
    if (month) {
      filter.month = month;
    }
    
    if (category) {
      filter.category = category;
    }
    
    const budgets = await db
      .collection('budgets')
      .find(filter)
      .sort({ month: -1, category: 1 })
      .toArray();
    
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    
    const body = await request.json();
    const budget: Budget = {
      ...body,
      amount: parseFloat(body.amount),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Check if budget already exists for this category and month
    const existingBudget = await db.collection('budgets').findOne({
      category: budget.category,
      month: budget.month
    });
    
    if (existingBudget) {
      return NextResponse.json({ error: 'Budget already exists for this category and month' }, { status: 400 });
    }
    
    const result = await db.collection('budgets').insertOne({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt
    });
    
    return NextResponse.json({ _id: result.insertedId, ...budget });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
