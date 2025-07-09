import { useState, useEffect } from 'react'

const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Continue",
  cancelText = "Cancel",
  confirmVariant = "primary" // "destructive" or "primary"
}) => {
  const [isClosing, setIsClosing] = useState(false)
  const [showContent, setShowContent] = useState(false)

  //  opening animation
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      setTimeout(() => setShowContent(true), 10)
    }
  }, [isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setShowContent(false)
    setTimeout(() => onClose(), 200)
  }

  const handleConfirm = () => {
    onConfirm()
    setIsClosing(true)
    setShowContent(false)
    setTimeout(() => onClose(), 200)
  }

  const confirmButtonClass = confirmVariant === "destructive"
    ? "bg-red-500 hover:bg-red-700 text-white"
    : "bg-[#f8f9fa] hover:bg-[#e9ecef] text-[#202020]"

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-grey-400/30 backdrop-blur-sm transition-all duration-300 ${showContent ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-[#202020] border border-[#333] rounded-lg shadow-xl w-full max-w-md mx-4 transition-all duration-300 transform ${showContent && !isClosing
          ? 'scale-100 opacity-100 translate-y-0'
          : 'scale-95 opacity-0 translate-y-4'
        }`}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#f8f9fa] mb-3">
            {title}
          </h2>
          <p className="text-[#888] text-sm mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-[#282828] hover:bg-[#333] text-[#f8f9fa] rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertDialog