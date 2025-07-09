import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { userAuth } from '../../context/AuthContext'
import { fetchBudgetsByMonthYear, fetchTransactionsByMonthYear } from '../Utils/Operations'
import LoadingAnimation from '../Utils/LoadingAnimation'

const OverUnderBudgetTable = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [comparisonData, setComparisonData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { session } = userAuth()

  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 76 }, (_, i) =>
    String(currentYear + i)
  )

  const getMonthNumber = (monthName) => {
    return monthOptions.indexOf(monthName) + 1
  }

  useEffect(() => {
    if (session?.user?.id) {
      loadData()
    }
  }, [session?.user?.id, selectedMonth, selectedYear]);


  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const monthNumber = getMonthNumber(selectedMonth)

      const [budgetResult, transactionResult] = await Promise.all([
        fetchBudgetsByMonthYear(session.user.id, selectedMonth, selectedYear),
        fetchTransactionsByMonthYear(session.user.id, monthNumber, parseInt(selectedYear))
      ])

      if (budgetResult.success && transactionResult.success) {
        processComparisonData(budgetResult.data || [], transactionResult.data || [])
      } else {
        const errorMsg = budgetResult.error || transactionResult.error
        setError(errorMsg)
        console.error('Failed to load data:', errorMsg)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const processComparisonData = (budgets, transactions) => {
    // only expenses considered 
    const expenditureTransactions = transactions.filter(transaction =>
      transaction.type !== 'Income'
    )

    // group expense transactions by category and sum the amounts
    const transactionsByCategory = expenditureTransactions.reduce((acc, transaction) => {
      const category = transaction.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += transaction.amount
      return acc
    }, {})

    const budgetsByCategory = budgets.reduce((acc, budget) => {
      acc[budget.category] = budget.amount
      return acc
    }, {})

    const allCategories = new Set([
      ...Object.keys(budgetsByCategory),
      ...Object.keys(transactionsByCategory)
    ])

    const comparison = Array.from(allCategories).map(category => {
      const budgetAmount = budgetsByCategory[category] || 0
      const spentAmount = transactionsByCategory[category] || 0
      const difference = budgetAmount - spentAmount
      const hasBudget = budgetsByCategory[category] !== undefined
      const hasTransactions = transactionsByCategory[category] !== undefined

      return {
        category,
        budgetAmount,
        spentAmount,
        difference,
        hasBudget,
        hasTransactions,
        isOverBudget: difference < 0,
        isUnderBudget: difference > 0
      }
    })

    comparison.sort((a, b) => a.category.localeCompare(b.category))
    setComparisonData(comparison)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMonthDropdownOpen && !event.target.closest('.month-dropdown')) {
        setIsMonthDropdownOpen(false)
      }
      if (isYearDropdownOpen && !event.target.closest('.year-dropdown')) {
        setIsYearDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMonthDropdownOpen, isYearDropdownOpen])

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return <LoadingAnimation message={'Loading comparison data...'} />
  }

  return (
    <div className="w-full max-w-500px mx-auto py-4 sm:px-5 sm:py-0">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-300 hover:text-red-100 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-t-2xl px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#f8f9fa] mb-2">
              Budget vs Spending
            </h1>
          </div>

          <div className="flex gap-2">
            {/* Month Dropdown */}
            <div className="relative month-dropdown">
              <button
                onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                className="flex items-center justify-between gap-3 px-4 py-2 bg-[#242424] border border-[#666] rounded-lg text-[#f8f9fa] hover:bg-[#343434] transition-colors duration-200 text-sm sm:text-base font-medium min-w-[120px]"
              >
                <span>{selectedMonth}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMonthDropdownOpen && (
                <div className="absolute top-full mt-1 right-0 w-full bg-[#282828] border border-[#333] rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto animate-slideDown">
                  {monthOptions.map((month) => (
                    <button
                      key={month}
                      onClick={() => {
                        setSelectedMonth(month)
                        setIsMonthDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#333] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg text-sm sm:text-base ${selectedMonth === month ? 'bg-[#333]' : ''
                        }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Year Dropdown */}
            <div className="relative year-dropdown">
              <button
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className="flex items-center justify-between gap-3 px-4 py-2 bg-[#242424] border border-[#666] rounded-lg text-[#f8f9fa] hover:bg-[#343434] transition-colors duration-200 text-sm sm:text-base font-medium min-w-[100px]"
              >
                <span>{selectedYear}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isYearDropdownOpen && (
                <div className="absolute top-full mt-1 right-0 w-full bg-[#282828] border border-[#333] rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto animate-slideDown">
                  {yearOptions.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year)
                        setIsYearDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#333] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg text-sm sm:text-base ${selectedYear === year ? 'bg-[#333]' : ''
                        }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-[#202020] border-x border-[#333]">
        <div className="h-[295px] overflow-y-auto overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] sticky top-0 z-10 border-b border-[#333]">
              <tr>
                <th className="text-left py-4 px-6 text-[#f8f9fa] font-medium text-lg">
                  Category
                </th>
                <th className="text-right py-4 px-4 text-[#f8f9fa] font-medium text-lg">
                  Budget
                </th>
                <th className="text-right py-4 px-4 text-[#f8f9fa] font-medium text-lg">
                  Spent
                </th>
                <th className="text-right py-4 px-4 text-[#f8f9fa] font-medium text-lg">
                  Net
                </th>
              </tr>
            </thead>

            <tbody>
              {comparisonData.map((item, index) => (
                <tr
                  key={item.category}
                  className={`border-b border-[#333] hover:bg-[#222] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1f1f1f]' : 'bg-[#202020]'
                    }`}
                >
                  <td className="py-4 px-6 text-[#f8f9fa] text-base">
                    {item.category}
                    {!item.hasBudget && (
                      <span className="text-yellow-400 text-sm ml-2">(no budget)</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-[#f8f9fa] text-base text-right font-medium">
                    {formatAmount(item.budgetAmount)}
                  </td>
                  <td className="py-4 px-4 text-[#f8f9fa] text-base text-right font-medium">
                    {formatAmount(item.spentAmount)}
                  </td>
                  <td className="py-4 px-4 text-base text-right font-medium">
                    <span className={`${item.isOverBudget ? 'text-red-400' :
                        item.isUnderBudget ? 'text-green-400' : 'text-[#f8f9fa]'
                      }`}>
                      {item.isOverBudget ? '-' : ''}{formatAmount(Math.abs(item.difference))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {comparisonData.length === 0 && !loading && (
            <div className="py-8 text-center text-[#f8f9fa]">
              <div className="text-lg mb-2">No data found for {selectedMonth} {selectedYear}</div>
              <div className="text-sm">Add budgets and transactions to see comparison</div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-b-2xl p-6 border-t-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-[#f8f9fa] mb-1">Total Budget</div>
            <div className="text-lg font-semibold text-[#f8f9fa]">
              {formatAmount(comparisonData.reduce((sum, item) => sum + item.budgetAmount, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-[#f8f9fa] mb-1">Total Spent</div>
            <div className="text-lg font-semibold text-[#f8f9fa]">
              {formatAmount(comparisonData.reduce((sum, item) => sum + item.spentAmount, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverUnderBudgetTable