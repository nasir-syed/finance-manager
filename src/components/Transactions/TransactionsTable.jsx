import { useState, useRef, useEffect } from 'react'
import { ChevronDown, MoreHorizontal, Plus, ArrowUpDown } from 'lucide-react'
import Form from '../Utils/Form'
import AlertDialog from '../Utils/AlertDialog'
import { userAuth } from '../../context/AuthContext'
import { fetchTransactions, addTransaction, updateTransaction, deleteTransaction } from '../Utils/Operations'
import LoadingAnimation from '../Utils/LoadingAnimation'

const TransactionsTable = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedColumn, setSelectedColumn] = useState('name')
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false)
  const [openActionMenu, setOpenActionMenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, showAbove: false })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, transactionId: null })
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const { session } = userAuth()

  useEffect(() => {
    if (session?.user?.id) {
      loadTransactions()
    }
  }, [session?.user?.id])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchTransactions(session.user.id)

      if (result.success) {
        setTransactions(result.data || [])
      } else {
        setError(result.error)
        console.error('Failed to load transactions:', result.error)
      }
    } catch (err) {
      setError('Failed to load transactions')
      console.error('Error loading transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const columnOptions = [
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Type' },
    { value: 'category', label: 'Category' },
    { value: 'method', label: 'Method' }
  ]

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isColumnDropdownOpen && !event.target.closest('.column-dropdown')) {
        setIsColumnDropdownOpen(false)
      }
      if (openActionMenu && !event.target.closest('.action-menu-container')) {
        setOpenActionMenu(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isColumnDropdownOpen, openActionMenu])

  // handles the column sorting
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // sort transactions based on current sort config
  const getSortedTransactions = (transactionsToSort) => {
    if (!sortConfig.key) return transactionsToSort

    return [...transactionsToSort].sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      if (sortConfig.key === 'date') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      } else if (sortConfig.key === 'amount') {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true
    const columnValue = transaction[selectedColumn]?.toString().toLowerCase() || ''
    return columnValue.includes(searchTerm.toLowerCase())
  })

  const sortedAndFilteredTransactions = getSortedTransactions(filteredTransactions)

  const handleActionMenuClick = (transactionId, buttonElement) => {
    if (openActionMenu === transactionId) {
      setOpenActionMenu(null)
      return
    }

    // for the actions menu to not be covered by the table: 
    const rect = buttonElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const menuHeight = 90 // height of the menu (2 items * 40px)
    const menuWidth = 120

    const spaceBelow = viewportHeight - rect.bottom
    const showAbove = spaceBelow < menuHeight && rect.top > menuHeight

    // position the menu considering available space
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
    setOpenActionMenu(transactionId)
  }

  const handleActionClick = (transactionId, action) => {
    setOpenActionMenu(null)

    if (action === 'edit') {
      const transaction = transactions.find(t => t.id === transactionId)
      setEditingTransaction(transaction)
      setIsEditing(true)
      setIsFormOpen(true)
    } else if (action === 'delete') {
      setDeleteDialog({ isOpen: true, transactionId })
    }
  }

  const handleDeleteConfirm = async () => {
    if (deleteDialog.transactionId && session?.user?.id) {
      try {
        const result = await deleteTransaction(deleteDialog.transactionId, session.user.id)

        if (result.success) {
          setTransactions(prev => prev.filter(t => t.id !== deleteDialog.transactionId))
          setDeleteDialog({ isOpen: false, transactionId: null })
        } else {
          setError(result.error)
          console.error('Failed to delete transaction:', result.error)
        }
      } catch (err) {
        setError('Failed to delete transaction')
        console.error('Error deleting transaction:', err)
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, transactionId: null })
  }

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (transactionData) => {
    if (!session?.user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      if (isEditing) {
        const result = await updateTransaction(transactionData.id, transactionData, session.user.id)

        if (result.success) {
          setTransactions(prev =>
            prev.map(t => t.id === transactionData.id ? result.data : t)
          )
        } else {
          setError(result.error)
          console.error('Failed to update transaction:', result.error)
        }
      } else {
        const result = await addTransaction(transactionData, session.user.id)

        if (result.success) {
          setTransactions(prev => [result.data, ...prev])
        } else {
          setError(result.error)
          console.error('Failed to add transaction:', result.error)
        }
      }
    } catch (err) {
      setError('Failed to save transaction')
      console.error('Error saving transaction:', err)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingTransaction(null)
    setIsEditing(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // a helper function to render sortable column header
  const renderSortableHeader = (key, label) => {
    return (
      <th className="text-left py-3 px-3 sm:px-4 text-sm whitespace-nowrap">
        <button
          onClick={() => handleSort(key)}
          className="flex items-center gap-2 text-[#f8f9fa] font-medium px-2 py-1 -ml-2"
        >
          <span>{label}</span>
          <ArrowUpDown
            className={`w-4 h-4 transition-color duration-200 hover:text-gray-300`}
          />
        </button>
      </th>
    )
  }

  if (loading) {
    return <LoadingAnimation message={'Loading transactions...'} />
  }



  return (
    <div className="w-full max-w-7xl mx-auto md:p-6">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-300 hover:text-red-100 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="flex flex-col bg-[#1a1a1a] rounded-t-2xl px-6 py-4 sm:flex-row gap-6">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-[#202020] border border-[#333] rounded-lg text-[#f8f9fa] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-[#444] focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Column Dropdown and Add Button */}
        <div className="flex gap-2">
          {/* Column Dropdown */}
          <div className="relative column-dropdown">
            <button
              onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              className="flex items-center justify-between w-full sm:w-auto gap-2 px-4 py-2 bg-[#202020] border border-[#333] rounded-lg text-[#f8f9fa] hover:bg-[#282828] transition-colors duration-200 text-sm sm:text-base"
            >
              <span>
                Search by: &nbsp; {columnOptions.find(col => col.value === selectedColumn)?.label} &nbsp;
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isColumnDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isColumnDropdownOpen && (
              <div className="absolute top-full mt-1 right-0 w-full sm:w-48 bg-[#202020] border border-[#333] rounded-lg shadow-lg z-20 animate-slideDown">
                {columnOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedColumn(option.value)
                      setIsColumnDropdownOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#282828] transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg text-sm sm:text-base ${selectedColumn === option.value ? 'bg-[#282828]' : ''
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Transaction Button */}
          <button
            onClick={handleAddTransaction}
            className="ml-auto sm:ml-4 flex items-center gap-2 px-6 py-2 border border-[#333] bg-[#202020] hover:bg-[#282828] text-[#f8f9fa] font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#202020] border border-[#333] rounded-b-lg overflow-hidden">
        <div className="h-[410px] overflow-y-auto">
          <div className="overflow-x-auto">

            <table className="w-full min-w-[740px]">
              <thead className="bg-[#1a1a1a] sticky top-0 z-10">
                <tr className="border-b border-[#333]">
                  {renderSortableHeader('date', 'Date')}
                  {renderSortableHeader('type', 'Type')}
                  {renderSortableHeader('name', 'Name')}
                  {renderSortableHeader('category', 'Category')}
                  {renderSortableHeader('method', 'Method')}
                  {renderSortableHeader('amount', 'Amount')}
                  <th className="w-12 py-3 px-3 sm:px-4"></th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`border-b border-[#333] hover:bg-[#222] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1f1f1f]' : 'bg-[#202020]'
                      }`}
                  >
                    <td className="py-3 px-3 sm:px-4 text-[#f8f9fa] text-sm whitespace-nowrap">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-sm whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'Income'
                          ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                          : 'bg-red-900/30 text-red-400 border border-red-700/50'
                        }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-[#f8f9fa] text-sm">
                      <div className="max-w-[150px] sm:max-w-[200px] truncate" title={transaction.name}>
                        {transaction.name}
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-[#f8f9fa] text-sm whitespace-nowrap">
                      {transaction.category}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-[#f8f9fa] text-sm whitespace-nowrap">
                      {transaction.method}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-[#f8f9fa] font-medium text-sm whitespace-nowrap">
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 relative action-menu-container">
                      <button
                        ref={openActionMenu === transaction.id ? buttonRef : null}
                        onClick={(e) => handleActionMenuClick(transaction.id, e.currentTarget)}
                        className="p-1 hover:bg-[#333] rounded transition-colors duration-200 touch-manipulation"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4 text-[#888]" />
                      </button>

                      {openActionMenu === transaction.id && (
                        <div
                          ref={menuRef}
                          className="fixed w-32 mt-1 bg-[#282828] border border-[#333] rounded-lg shadow-lg z-50 animate-slideDown"
                          style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`
                          }}
                        >
                          <button
                            onClick={() => handleActionClick(transaction.id, 'edit')}
                            className="w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#333] transition-colors duration-200 rounded-t-lg text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleActionClick(transaction.id, 'delete')}
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
            {sortedAndFilteredTransactions.length === 0 && (
              <div className="py-8 text-center text-[#f8f9fa]">
                <div className="text-lg mb-2">No transactions found</div>
                <div className="text-sm">Try adjusting your search criteria or adding transactions</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Form
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        formType="transaction"
        data={editingTransaction}
        isEditing={isEditing}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete this transaction? This action cannot be undone and will permanently remove this transaction from your records.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  )
}

export default TransactionsTable