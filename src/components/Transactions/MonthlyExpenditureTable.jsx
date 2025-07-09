import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { userAuth } from '../../context/AuthContext'
import { fetchTransactionsByMonthYear } from '../Utils/Operations'
import LoadingAnimation from '../Utils/LoadingAnimation'

const MonthlyExpenditureTable = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [transactionData, setTransactionData] = useState([])
  const [expenditureData, setExpenditureData] = useState([])
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
  }, [session?.user?.id, selectedMonth, selectedYear])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const monthNumber = getMonthNumber(selectedMonth)

      const transactionResult = await fetchTransactionsByMonthYear(
        session.user.id,
        monthNumber,
        parseInt(selectedYear)
      )

      if (transactionResult.success) {
        setTransactionData(transactionResult.data || [])
        processExpenditureData(transactionResult.data || [])
      } else {
        setError(transactionResult.error)
        console.error('Failed to load transactions:', transactionResult.error)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const processExpenditureData = (transactions) => {
    const methodData = {}

    transactions.forEach(transaction => {
      const method = transaction.method
      const type = transaction.type
      const amount = transaction.amount

      if (!methodData[method]) {
        methodData[method] = {
          method: method,
          income: 0,
          expenditure: 0
        }
      }

      if (type === 'Income') {
        methodData[method].income += amount
      } else {
        methodData[method].expenditure += amount
      }
    })

    const expenditureArray = Object.values(methodData).sort((a, b) =>
      a.method.localeCompare(b.method)
    )

    setExpenditureData(expenditureArray)
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

  const totalIncome = expenditureData.reduce((sum, item) => sum + item.income, 0)
  const totalExpenditure = expenditureData.reduce((sum, item) => sum + item.expenditure, 0)

  if (loading) {
    return <LoadingAnimation message={'Loading expenditure data...'} />
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
              Monthly Expenditure
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

      {/* Expenditure Table */}
      <div className="bg-[#202020] border-x border-[#333]">
        <div className="h-[295px] overflow-y-auto overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] sticky top-0 z-10 border-b border-[#333]">
              <tr>
                <th className="text-left py-4 px-6 text-[#f8f9fa] font-medium text-lg">
                  Method
                </th>
                <th className="text-right py-4 px-4 text-[#f8f9fa] font-medium text-lg">
                  Income
                </th>
                <th className="text-right py-4 px-4 text-[#f8f9fa] font-medium text-lg">
                  Expenditure
                </th>
              </tr>
            </thead>

            <tbody>
              {expenditureData.map((item, index) => (
                <tr
                  key={item.method}
                  className={`border-b border-[#333] hover:bg-[#222] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1f1f1f]' : 'bg-[#202020]'
                    }`}
                >
                  <td className="py-4 px-6 text-[#f8f9fa] text-base">
                    {item.method}
                  </td>
                  <td className="py-4 px-4 text-green-400 text-base text-right font-medium">
                    {formatAmount(item.income)}
                  </td>
                  <td className={`py-4 px-4 text-base text-right ${item.expenditure != 0 ? 'text-red-400' : 'text-[#f8f9fa]'} font-medium`}>
                    {item.expenditure != 0 ? formatAmount(item.expenditure) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {expenditureData.length === 0 && !loading && (
            <div className="py-8 text-center text-[#f8f9fa]">
              <div className="text-lg mb-2">No transactions found for {selectedMonth} {selectedYear}</div>
              <div className="text-sm">Add transactions to see expenditure breakdown</div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-b-2xl p-6 border-t-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-[#f8f9fa] mb-1">Total Income</div>
            <div className="text-lg font-semibold text-green-400">
              {formatAmount(totalIncome)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-[#f8f9fa] mb-1">Total Exp.</div>
            <div className="text-lg font-semibold text-red-400">
              {formatAmount(totalExpenditure)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-[#f8f9fa] mb-1">Net Amount</div>
            <div className={`text-lg font-semibold ${(totalIncome - totalExpenditure) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
              {formatAmount(totalIncome - totalExpenditure)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonthlyExpenditureTable