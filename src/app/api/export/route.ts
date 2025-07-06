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
    
    let filter: any = {};
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }
    
    let data: any = {};
    
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
        data.transactions.forEach((transaction: any) => {
          const row = [
            transaction.type,
            transaction.amount,
            new Date(transaction.date).toISOString().split('T')[0],
            `"${transaction.description.replace(/"/g, '""')}"`,
            transaction.category,
            new Date(transaction.createdAt).toISOString()
          ].join(',');
          csvContent += row + '\n';
        });
      }
      
      if (data.budgets) {
        if (csvContent) csvContent += '\n\n';
        csvContent += 'Category,Amount,Month,Created At\n';
        data.budgets.forEach((budget: any) => {
          const row = [
            budget.category,
            budget.amount,
            budget.month,
            new Date(budget.createdAt).toISOString()
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
