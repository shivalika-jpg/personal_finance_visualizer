import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json'; // json, csv
    const type = searchParams.get('type') || 'transactions'; // transactions, budgets, all
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const filter: Record<string, unknown> = {};
    
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
    
    const data: Record<string, unknown> = {};
    
    if (type === 'transactions' || type === 'all') {
      const transactions = await db
        .collection('transactions')
        .find(filter)
        .sort({ date: -1 })
        .toArray();
      data.transactions = transactions;
    }
    
    if (type === 'budgets' || type === 'all') {
      const budgets = await db
        .collection('budgets')
        .find({})
        .sort({ month: -1, category: 1 })
        .toArray();
      data.budgets = budgets;
    }
    
    if (format === 'csv') {
      // Convert to CSV format
      let csvContent = '';
      
      if (data.transactions) {
        csvContent += 'Type,Amount,Date,Description,Category,Created At\n';
        (data.transactions as Record<string, unknown>[]).forEach((transaction: Record<string, unknown>) => {
          const row = [
            transaction.type,
            transaction.amount,
            new Date(transaction.date as string).toISOString().split('T')[0],
            `"${(transaction.description as string || '').replace(/"/g, '""')}"`,
            transaction.category,
            new Date(transaction.createdAt as string).toISOString()
          ].join(',');
          csvContent += row + '\n';
        });
      }
      
      if (data.budgets) {
        if (csvContent) csvContent += '\n\n';
        csvContent += 'Category,Amount,Month,Created At\n';
        (data.budgets as Record<string, unknown>[]).forEach((budget: Record<string, unknown>) => {
          const row = [
            budget.category,
            budget.amount,
            budget.month,
            new Date(budget.createdAt as string).toISOString()
          ].join(',');
          csvContent += row + '\n';
        });
      }
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="finance-data-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    // Default to JSON format
    return NextResponse.json(data, {
      headers: {
        'Content-Disposition': `attachment; filename="finance-data-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
    
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
