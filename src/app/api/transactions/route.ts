import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Transaction } from '@/types/transaction';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const filter: Record<string, unknown> = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
      filter.date = dateFilter;
    }
    
    const transactions = await db
      .collection('transactions')
      .find(filter)
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    
    const body = await request.json();
    const transaction: Transaction = {
      ...body,
      date: new Date(body.date),
      amount: parseFloat(body.amount),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('transactions').insertOne({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    });
    
    return NextResponse.json({ _id: result.insertedId, ...transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
