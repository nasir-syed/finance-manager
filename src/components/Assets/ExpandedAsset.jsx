import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

const ExpandedAsset = ({
  isOpen,
  onClose,
  asset
}) => {
  const [isClosing, setIsClosing] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // opening animation
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      setTimeout(() => setShowContent(true), 10)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setShowContent(false)
    setTimeout(() => onClose(), 200)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
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

  const getNoteContent = () => {
    if (!asset) return 'No notes added yet.'
    
    if (!asset.notes || asset.notes.trim() === '') {
      return 'No notes added yet.'
    }
    
    return asset.notes
  }

  if (!isOpen || !asset) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-grey-400/30 backdrop-blur-sm transition-all duration-300 p-4 ${showContent ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-[#202020] border border-[#333] rounded-lg shadow-xl w-full max-w-2xl mx-4 transition-all duration-300 transform ${showContent && !isClosing
          ? 'scale-100 opacity-100 translate-y-0'
          : 'scale-95 opacity-0 translate-y-4'
        }`}>
            
        {/* Header */}
        <div className="bg-[#1a1a1a] px-6 py-4 border-b border-[#333] rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#f8f9fa] flex-1">
            Asset Details
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform ml-4"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Asset Information */}
        <div className="p-6 border-b border-[#333]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Asset Name
              </label>
              <div className="text-lg font-semibold text-[#f8f9fa] bg-[#282828] border border-[#505050] rounded-lg px-3 py-2">
                {asset.name || 'Unnamed Asset'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Amount
              </label>
              <div className="text-lg font-semibold text-[#f8f9fa] bg-[#282828] border border-[#505050] rounded-lg px-3 py-2">
                {formatAmount(asset.amount, asset.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Note Content */}
        <div className="p-6 max-h-[40vh] overflow-y-auto">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Notes
          </label>
          <div className="text-[#f8f9fa] leading-relaxed whitespace-pre-wrap min-h-[200px] bg-[#282828] border border-[#505050] rounded-lg p-4 overflow-y-auto ">
            {getNoteContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpandedAsset