import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Plus } from 'lucide-react'
import Form from '../Utils/Form'
import AlertDialog from '../Utils/AlertDialog'
import ExpandedAsset from './ExpandedAsset' 
import { userAuth } from '../../context/AuthContext'
import { fetchAssets, addAsset, updateAsset, deleteAsset } from '../Utils/Operations'
import LoadingAnimation from '../Utils/LoadingAnimation'

const AssetsTable = () => {
  const [openActionMenu, setOpenActionMenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, showAbove: false })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, assetId: null })
  const [expandedAsset, setExpandedAsset] = useState(null) 
  const [isExpandedAssetOpen, setIsExpandedAssetOpen] = useState(false) 
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const { session } = userAuth()

  useEffect(() => {
    if (session?.user?.id) {
      loadAssets()
    }
  }, [session?.user?.id])

  const loadAssets = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchAssets(session.user.id)

      if (result.success) {
        setAssets(result.data || [])
      } else {
        setError(result.error)
        console.error('Failed to load assets:', result.error)
      }
    } catch (err) {
      setError('Failed to load assets')
      console.error('Error loading assets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenu && !event.target.closest('.action-menu-container')) {
        setOpenActionMenu(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openActionMenu])

  // total asset value calc ( in AED )
  const totalAssets = assets.reduce((sum, asset) => {
    // conversion rates 
    const conversionRates = {
      'AED': 1,
      'INR': 0.043,
      '$': 3.67
    }
    return sum + (asset.amount * (conversionRates[asset.currency] || 1))
  }, 0)

  const handleActionMenuClick = (assetId, buttonElement) => {
    if (openActionMenu === assetId) {
      setOpenActionMenu(null)
      return
    }

    // actions menu doesnt get covered by the table 
    const rect = buttonElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const menuHeight = 120 
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
    setOpenActionMenu(assetId)
  }

  const handleActionClick = (assetId, action) => {
    setOpenActionMenu(null)

    if (action === 'edit') {
      const asset = assets.find(a => a.id === assetId)
      setEditingAsset(asset)
      setIsEditing(true)
      setIsFormOpen(true)
    } else if (action === 'delete') {
      setDeleteDialog({ isOpen: true, assetId })
    } else if (action === 'view') {
      const asset = assets.find(a => a.id === assetId)
      setExpandedAsset(asset)
      setIsExpandedAssetOpen(true) 
    }
  }

  const handleDeleteConfirm = async () => {
    if (deleteDialog.assetId && session?.user?.id) {
      try {
        const result = await deleteAsset(deleteDialog.assetId, session.user.id)

        if (result.success) {
          setAssets(prev => prev.filter(a => a.id !== deleteDialog.assetId))
        } else {
          setError(result.error)
          console.error('Failed to delete asset:', result.error)
        }
      } catch (err) {
        setError('Failed to delete asset')
        console.error('Error deleting asset:', err)
      }
    }
    setDeleteDialog({ isOpen: false, assetId: null })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, assetId: null })
  }

  const handleAddAsset = () => {
    setEditingAsset(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (assetData) => {
    if (!session?.user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      if (isEditing) {
        const result = await updateAsset(assetData.id, assetData, session.user.id)

        if (result.success) {
          setAssets(prev =>
            prev.map(a => a.id === assetData.id ? result.data : a)
          )
        } else {
          setError(result.error)
          console.error('Failed to update asset:', result.error)
        }
      } else {
        const result = await addAsset(assetData, session.user.id)

        if (result.success) {
          setAssets(prev => [result.data, ...prev])
        } else {
          setError(result.error)
          console.error('Failed to add asset:', result.error)
        }
      }
    } catch (err) {
      setError('Failed to save asset')
      console.error('Error saving asset:', err)
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingAsset(null)
    setIsEditing(false)
  }

  const handleExpandedAssetClose = () => {
    setIsExpandedAssetOpen(false)
    setExpandedAsset(null)
  }

  const handleExpandedAssetSave = async (updatedAsset) => {
    if (!session?.user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      const result = await updateAsset(updatedAsset.id, updatedAsset, session.user.id)

      if (result.success) {
        setAssets(prev =>
          prev.map(a => a.id === updatedAsset.id ? result.data : a)
        )
        setExpandedAsset(result.data) 
      } else {
        setError(result.error)
        console.error('Failed to update asset:', result.error)
      }
    } catch (err) {
      setError('Failed to update asset')
      console.error('Error updating asset:', err)
    }
  }

  const handleExpandedAssetDelete = async (assetToDelete) => {
    if (!session?.user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      const result = await deleteAsset(assetToDelete.id, session.user.id)

      if (result.success) {
        setAssets(prev => prev.filter(a => a.id !== assetToDelete.id))
        setIsExpandedAssetOpen(false)
        setExpandedAsset(null)
      } else {
        setError(result.error)
        console.error('Failed to delete asset:', result.error)
      }
    } catch (err) {
      setError('Failed to delete asset')
      console.error('Error deleting asset:', err)
    }
  }

  const formatAmount = (amount, currency) => {
    const currencySymbols = {
      'AED': 'AED',
      'INR': '₹',
      '$': '$'
    }

    const symbol = currencySymbols[currency] || currency
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)

    return `${symbol} ${formattedNumber}`
  }

  if (loading) {
    return <LoadingAnimation message='Loading assets...' />
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
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
        <div className="flex flex-row sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#f8f9fa] mb-2">
              Assets
            </h1>
          </div>

          {/* Add Asset Button */}
          <button
            onClick={handleAddAsset}
            className="ml-2 flex items-center gap-2 px-6 py-2 border border-[#333] bg-[#202020] hover:bg-[#282828] text-[#f8f9fa] font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-[#202020] border-x border-[#333]">
        <div className="h-[297px] overflow-y-auto overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1a1a] sticky top-0 z-10 border-b border-[#333]">
              <tr>
                <th className="text-left py-4 px-6 text-[#f8f9fa] font-medium text-lg">
                  Name
                </th>
                <th className="text-right py-4 px-4 text-[#f8f9fa] font-medium text-lg">
                  Amount
                </th>
                <th className="w-12 py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr
                  key={asset.id}
                  className={`border-b border-[#333] hover:bg-[#222] transition-colors duration-200 ${index % 2 === 0 ? 'bg-[#1f1f1f]' : 'bg-[#202020]'
                    }`}
                >
                  <td className="py-4 px-6 text-[#f8f9fa] text-base">
                    {asset.name}
                  </td>
                  <td className="py-4 px-4 text-[#f8f9fa] text-base text-right font-medium">
                    {formatAmount(asset.amount, asset.currency)}
                  </td>
                  <td className="py-4 px-2 relative action-menu-container">
                    <button
                      ref={openActionMenu === asset.id ? buttonRef : null}
                      onClick={(e) => handleActionMenuClick(asset.id, e.currentTarget)}
                      className="p-1 hover:bg-[#333] rounded transition-colors duration-200 touch-manipulation"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="w-4 h-4 text-[#f8f9fa]" />
                    </button>

                    {openActionMenu === asset.id && (
                      <div
                        ref={menuRef}
                        className="fixed w-32 mt-1 bg-[#282828] border border-[#333] rounded-lg shadow-lg z-50 animate-slideDown"
                        style={{
                          top: `${menuPosition.top}px`,
                          left: `${menuPosition.left}px`
                        }}
                      >
                        <button
                          onClick={() => handleActionClick(asset.id, 'view')}
                          className="w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#333] transition-colors duration-200 rounded-t-lg text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleActionClick(asset.id, 'edit')}
                          className="w-full px-4 py-2 text-left text-[#f8f9fa] hover:bg-[#333] transition-colors duration-200 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleActionClick(asset.id, 'delete')}
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
          {assets.length === 0 && !loading && (
            <div className="py-8 text-center text-[#f8f9fa]">
              <div className="text-lg mb-2">No assets found</div>
              <div className="text-sm">Add your first asset to get started</div>
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
            {formatAmount(totalAssets, 'AED')}
          </div>
        </div>
      </div>

      <Form
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        formType="asset"
        data={editingAsset}
        isEditing={isEditing}
        isViewOnly={!isEditing && editingAsset}
      />

      <ExpandedAsset
        isOpen={isExpandedAssetOpen}
        onClose={handleExpandedAssetClose}
        asset={expandedAsset}
        onSave={handleExpandedAssetSave}
        onDelete={handleExpandedAssetDelete}
      />

      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone and will permanently remove this asset from your records."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </div>
  )
}

export default AssetsTable