import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { Trash2 } from 'lucide-react'

const ExpandedNote = ({
  isOpen,
  onClose,
  note,
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedHeading, setEditedHeading] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const [showContent, setShowContent] = useState(false)

  // opening animation
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
      setTimeout(() => setShowContent(true), 10)
    }
  }, [isOpen])

  // initalises the form data when note changes
  useEffect(() => {
    if (note) {
      setEditedHeading(note.heading)
      setEditedContent(note.content)
    }
  }, [note])

  const handleClose = () => {
    setIsClosing(true)
    setShowContent(false)
    setIsEditing(false)
    setTimeout(() => onClose(), 200)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleEdit = () => {
    // if isEditing is true, then save the content otherwise set it to true
    if (isEditing) {
      if (editedHeading.trim() && editedContent.trim()) {
        const updatedNote = {
          ...note,
          heading: editedHeading.trim(),
          content: editedContent.trim()
        }
        onSave(updatedNote)
        setIsEditing(false)
      }
    } else {
      setIsEditing(true)
    }
  }

  const handleCancel = () => {
    setEditedHeading(note.heading)
    setEditedContent(note.content)
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(note)
    handleClose()
  }

  if (!isOpen || !note) return null

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
          {isEditing ? (
            <input
              type="text"
              value={editedHeading}
              onChange={(e) => setEditedHeading(e.target.value)}
              className="text-xl font-semibold text-[#f8f9fa] bg-[#282828] border border-[#505050] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent flex-1 mr-4"
              placeholder="Note heading..."
            />
          ) : (
            <h2 className="text-xl font-semibold text-[#f8f9fa] flex-1">
              {note.heading}
            </h2>
          )}
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform ml-4"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full min-h-[300px] text-[#f8f9fa] bg-[#282828] border border-[#505050] rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
              placeholder="Write your note content here..."
            />
          ) : (
            <div className="text-[#f8f9fa] leading-relaxed whitespace-pre-wrap">
              {note.content}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[#333] flex justify-between items-center">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-[#282828] hover:bg-[#333] text-[#f8f9fa] rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div></div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 hover:scale-110 transform"
              title="Delete note"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={handleEdit}
              className="px-6 py-2 bg-[#f8f9fa] hover:bg-[#e9ecef] text-[#202020] rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2 hover:scale-105 transform"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpandedNote