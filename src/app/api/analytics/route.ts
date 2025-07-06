import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { MonthlyExpense, CategorySummary } from '@/types/transaction';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'monthly' or 'categories'
    
    if (type === 'monthly') {
      // Get monthly expenses for the last 12 months
      const monthlyExpenses = await db.collection('transactions').aggregate([
        {
          $match: {
            type: 'expense',
            date: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            total: { $sum: '$amount' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]).toArray();
      
      const formattedData: MonthlyExpense[] = monthlyExpenses.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        total: item.total
      }));
      
      return NextResponse.json(formattedData);
    }
    
    if (type === 'categories') {
      const month = searchParams.get('month');
      const currentMonth = month || new Date().toISOString().slice(0, 7);
      
      // Get category-wise breakdown for the specified month
      const [year, monthNum] = currentMonth.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      
      const categoryData = await db.collection('transactions').aggregate([
        {
          $match: {
            type: 'expense',
            category: { $exists: true, $ne: '' },
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { total: -1 }
        }
      ]).toArray();
      
      // Get budgets for the same month
      const budgets = await db.collection('budgets').find({ month: currentMonth }).toArray();
      const budgetMap = new Map(budgets.map(b => [b.category, b.amount]));
      
      const formattedData: CategorySummary[] = categoryData.map(item => ({
        category: item._id,
        total: item.total,
        count: item.count,
        budget: budgetMap.get(item._id)
      }));
      
      return NextResponse.json(formattedData);
    }
    
    if (type === 'budget-comparison') {
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      
      // Get actual spending by category for the month
      const actualSpending = await db.collection('transactions').aggregate([
        {
          $match: {
            type: 'expense',
            date: { $gte: startDate, $lte: endDate },
            category: { $exists: true, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$category',
            actual: { $sum: '$amount' }
          }
        }
      ]).toArray();
      
      // Get budgets for the month
      const budgets = await db.collection('budgets').find({ month }).toArray();
      
      // Combine budget and actual data
      const budgetComparisonMap = new Map();
      
      // Add budgets
      budgets.forEach(budget => {
        budgetComparisonMap.set(budget.category, {
          category: budget.category,
          budgeted: budget.amount,
          actual: 0,
          difference: budget.amount,
          percentage: 0
        });
      });
      
      // Add actual spending
      actualSpending.forEach(expense => {
        const existing = budgetComparisonMap.get(expense._id) || {
          category: expense._id,
          budgeted: 0,
          actual: 0,
          difference: 0,
          percentage: 0
        };
        
        existing.actual = expense.actual;
        existing.difference = existing.budgeted - expense.actual;
        existing.percentage = existing.budgeted > 0 ? (expense.actual / existing.budgeted) * 100 : 0;
        
        budgetComparisonMap.set(expense._id, existing);
      });
      
      return NextResponse.json(Array.from(budgetComparisonMap.values()));
    }
    
    if (type === 'trends') {
      // Get spending trends over time
      const trends = await db.collection('transactions').aggregate([
        {
          $match: {
            type: 'expense',
            date: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              category: '$category'
            },
            total: { $sum: '$amount' }
          }
        },
        {
          $group: {
            _id: {
              year: '$_id.year',
              month: '$_id.month'
            },
            categories: {
              $push: {
                category: '$_id.category',
                amount: '$total'
              }
            },
            total: { $sum: '$total' }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]).toArray();
      
      return NextResponse.json(trends);
    }
    
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
