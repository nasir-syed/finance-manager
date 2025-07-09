import { useState, useRef, useEffect } from 'react'
import { ChevronDown, MoreHorizontal, Plus } from 'lucide-react'
import Form from '../Utils/Form'
import AlertDialog from '../Utils/AlertDialog'
import { userAuth } from '../../context/AuthContext'
import { fetchBudgets, addBudget, updateBudget, deleteBudget } from '../Utils/Operations'
import LoadingAnimation from '../Utils/LoadingAnimation'

const BudgetTable = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const [openActionMenu, setOpenActionMenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, showAbove: false })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, budgetId: null })
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const { session } = userAuth()

  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // year options 
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 76 }, (_, i) =>
    String(currentYear + i)
  )

  useEffect(() => {
    if (session?.user?.id) {
      loadBudgets();
    }
  }, [session?.user?.id, selectedMonth, selectedYear]);


  const loadBudgets = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchBudgets(session.user.id)

      if (result.success) {
        setBudgets(result.data || [])
      } else {
        setError(result.error)
        console.error('Failed to load budgets:', result.error)
      }
    } catch (err) {
      setError('Failed to load budgets')
      console.error('Error loading budgets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMonthDropdownOpen && !event.target.closest('.month-dropdown')) {
        setIsMonthDropdownOpen(false)
      }
      if (isYearDropdownOpen && !event.target.closest('.year-dropdown')) {
        setIsYearDropdownOpen(false)
      }
      if (openActionMenu && !event.target.closest('.action-menu-container')) {
        setOpenActionMenu(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMonthDropdownOpen, isYearDropdownOpen, openActionMenu])

  // filter budgets by selected month and year
  const filteredBudgets = budgets.filter(budget =>
    budget.month === selectedMonth && budget.year === selectedYear
  )

  // calculate total budget for selected month and year
  const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0)

  const handleActionMenuClick = (budgetId, buttonElement) => {
    if (openActionMenu === budgetId) {
      setOpenActionMenu(null)
      return
    }

    // ensuring menu doesnt get covered by the table
    const rect = buttonElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const menuHeight = 90
    const menuWidth = 120

    const spaceBelow = viewportHeight - rect.bottom
    const showAbove = spaceBelow < menuHeight && rect.top > menuHeight

    let left = rect.right - menuWidth
    let top = showAbove ? rect.top - menuHeight : rect.bottom

    if (left < 10) left = rect.left
    if (left + menuWidth > viewportWidth - 10) left = viewportWidth - menuWidth - 10
    if (top < 10) top = 10
    if (top + menuHeight > viewportHeight - 10) top = viewportHeight - menuHeight - 10

    setMenuPosition({
      top: Math.max(10, top),
      left: Math.max(10, left),
      showAbove
    })
    setOpenActionMenu(budgetId)
  }

  const handleActionClick = (budgetId, action) => {
    setOpenActionMenu(null)

    if (action === 'edit') {
      const budget = budgets.find(b => b.id === budgetId)
      setEditingBudget(budget)
      setIsEditing(true)
      setIsFormOpen(true)
    } else if (action === 'delete') {
      setDeleteDialog({ isOpen: true, budgetId })
    }
  }

  const handleDeleteConfirm = async () => {
    if (deleteDialog.budgetId && session?.user?.id) {
      try {
        const result = await deleteBudget(deleteDialog.budgetId, session.user.id)

        if (result.success) {
          setBudgets(prev => prev.filter(b => b.id !== deleteDialog.budgetId))
        } else {
          setError(result.error)
          console.error('Failed to delete budget:', result.error)
        }
      } catch (err) {
        setError('Failed to delete budget')
        console.error('Error deleting budget:', err)
      }
    }
    setDeleteDialog({ isOpen: false, budgetId: null })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, budgetId: null })
  }

  const handleAddBudget = () => {
    setEditingBudget(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (budgetData) => {
    if (!session?.user?.id) {
      setError('User not authenticated')
      return
    }

    const budgetWithMonthYear = {
      ...budgetData,
      month: selectedMonth,
      year: selectedYear
    }

    try {
      if (isEditing) {
        const result = await updateBudget(budgetWithMonthYear.id, budgetWithMonthYear, session.user.id)

        if (result.success) {
          setBudgets(prev =>
            prev.map(b => b.id === budgetWithMonthYear.id ? result.data : b)
          )
        } else {
          setError(result.error)
          console.error('Failed to update budget:', result.error)
        }
      } else {
        const result = await addBudget(budgetWithMonthYear, session.user.id)

        if (result.success) {
          setBudgets(prev => [result.data, ...prev])
        } else {
          setError(result.error)
          console.error('Failed to add budget:', result.error)
        }
      }
    } catch (err) {
      setError('Failed to save budget')
      console.error('Error saving budget:', err)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingBudget(null)
    setIsEditing(false)
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return <LoadingAnimation message='Loading budget...' />
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
              Monthly Budget
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

            {/* Add Budget Button */}
            <button
              onClick={handleAddBudget}
              className="ml-2 flex items-center gap-2 px-6 py-2 border border-[#333] bg-[#202020] hover:bg-[#282828] text-[#f8f9fa] font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-[#202020] border-x border-[#333]">
        <div className="h-[295px] overflow-y-auto overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] sticky top-0 z-10 border-b border-[#333]">
              <tr>
                <th className="text-left py-4 px-6 text-[#f8f9fa] font-medium text-lg">
                  Category
                </th>
                <th className="text-right py-4 px-4 text-[#f8f9fa] font-medium text-lg">
                  Amount
                </th>
                <th className="w-12 py-4 px-4"></th>
              </tr>
            </thead>


            <tbody>
              {filteredBudgets.map((budget, index) => (
                <tr
                  key={budget.id}
                  className={`border-b border-[#333] hover:bg-[#222] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1f1f1f]' : 'bg-[#202020]'
                    }`}
                >
                  <td className="py-4 px-6 text-[#f8f9fa] text-base">
                    {budget.category}
                  </td>
                  <td className="py-4 px-4 text-[#f8f9fa] text-base text-right font-medium">
                    {formatAmount(budget.amount)}
                  </td>
                  <td className="py-4 px-2 relative action-menu-container">
                    <button
                      ref={openActionMenu === budget.id ? buttonRef : null}
                      onClick={(e) => handleActionMenuClick(budget.id, e.currentTarget)}
                      className="p-1 hover:bg-[#333] rounded transition-colors duration-200 touch-manipulation"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="w-4 h-4 text-[#f8f9fa]" />
                    </button>

                    {openActionMenu === budget.id && (
                      <div
                        ref={menuRef}
                        className="fixed w-32 mt-1 bg-[#282828] border border-[#333] rounded-lg shadow-lg z-50 animate-slideDown"
                        style={{
                          top: `${menuPosition.top}px`,
                          left: `${menuPosition.left}px`
                        }}
                      >
                        <button
                          onClick={() => handleActionClick(budget.id, 'edit')}
                          className="w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#333] transition-colors duration-200 rounded-t-lg text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleActionClick(budget.id, 'delete')}
                          className="w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#333] transition-colors duration-200 rounded-b-lg text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBudgets.length === 0 && !loading && (
            <div className="py-8 text-center text-[#f8f9fa]">
              <div className="text-lg mb-2">No budgets found for {selectedMonth} {selectedYear}</div>
              <div className="text-sm">Add your first budget to get started</div>
            </div>
          )}
        </div>
      </div>

      {/* Total Section */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-b-2xl p-6 border-t-0">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#f8f9fa]">
            Total
          </h2>
          <div className="text-xl mr-8 font-semibold text-[#f8f9fa]">
            {formatAmount(totalBudget)}
          </div>
        </div>
      </div>

      <Form
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        formType="budget"
        data={editingBudget}
        isEditing={isEditing}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget"
        message={`Are you sure you want to delete this budget category for ${selectedMonth} ${selectedYear}? This action cannot be undone and will permanently remove this budget from your records.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  )
}

export default BudgetTable