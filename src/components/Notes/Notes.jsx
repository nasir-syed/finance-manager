import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import ExpandedNote from './ExpandedNote'
import Form from '../Utils/Form'
import AlertDialog from '../Utils/AlertDialog'
import { userAuth } from '../../context/AuthContext'
import { fetchNotes, addNote, updateNote, deleteNote } from '../Utils/Operations'
import LoadingAnimation from '../Utils/LoadingAnimation'

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
  const [isExpandedNoteOpen, setIsExpandedNoteOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [isFormOpen, setIsNotesFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  const { session } = userAuth()

  useEffect(() => {
    if (session?.user?.id) {
      loadNotes()
    }
  }, [session?.user?.id])

  const loadNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchNotes(session.user.id)

      if (res.success) {
        setNotes(res.data || [])
      } else {
        setError(res.error)
        console.error('Failed to load notes', res.error)
      }
    } catch (error) {
      setError('Failed to load notes')
      console.error('Error loading notes: ', error)
    } finally {
      setLoading(false)
    }
  }

  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleNoteClick = (note) => {
    setSelectedNote(note)
    setIsExpandedNoteOpen(true)
  }

  const handleCloseExpandedNote = () => {
    setIsExpandedNoteOpen(false)
    setSelectedNote(null)
  }

  const handleSaveNote = async (updatedNote) => {
    if (!session?.user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      const result = await updateNote(updatedNote.id, updatedNote, session.user.id)

      if (result.success) {
        setNotes(prevNotes =>
          prevNotes.map(note =>
            note.id === updatedNote.id ? result.data : note
          )
        )
        setSelectedNote(result.data)
      } else {
        setError(result.error)
        console.error('Failed to update note:', result.error)
      }
    } catch (err) {
      setError('Failed to update note')
      console.error('Error updating note:', err)
    }
  }

  const handleDeleteNote = (note) => {
    setNoteToDelete(note)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteNote = async () => {
    if (noteToDelete && session?.user?.id) {
      try {
        const result = await deleteNote(noteToDelete.id, session.user.id)

        if (result.success) {
          setNotes(prevNotes => prevNotes.filter(note => note.id !== noteToDelete.id))
          setNoteToDelete(null)
          setIsDeleteDialogOpen(false)
          setIsExpandedNoteOpen(false)
          setSelectedNote(null)
        } else {
          setError(result.error)
          console.error('Failed to delete note:', result.error)
        }
      } catch (err) {
        setError('Failed to delete note')
        console.error('Error deleting note:', err)
      }
    }
  }

  const cancelDeleteNote = () => {
    setNoteToDelete(null)
    setIsDeleteDialogOpen(false)
  }

  const handleAddNote = () => {
    setEditingNote(null)
    setIsEditing(false)
    setIsNotesFormOpen(true)
  }

  const handleFormSubmit = async (noteData) => {
    if (!session?.user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      if (isEditing) {
        const result = await updateNote(noteData.id, noteData, session.user.id)

        if (result.success) {
          setNotes(prevNotes =>
            prevNotes.map(note =>
              note.id === noteData.id ? result.data : note
            )
          )
        } else {
          setError(result.error)
          console.error('Failed to update note:', result.error)
        }
      } else {
        const result = await addNote(noteData, session.user.id)

        if (result.success) {
          setNotes(prevNotes => [result.data, ...prevNotes])
        } else {
          setError(result.error)
          console.error('Failed to add note:', result.error)
        }
      }
    } catch (err) {
      setError('Failed to save note')
      console.error('Error saving note:', err)
    }
  }

  const handleFormClose = () => {
    setIsNotesFormOpen(false)
    setEditingNote(null)
    setIsEditing(false)
  }

  if (loading) {
    return <LoadingAnimation message='Loading notes...' />
  }

  return (
    <>
      <div className="w-full max-w-sm mt-6 mx-auto">
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

        <div className="bg-[#202020] border border-[#333] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a1a1a] px-4 py-3 border-b border-[#333] flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[#f8f9fa]">Notes</h2>
            <button
              onClick={handleAddNote}
              className="ml-2 flex items-center gap-2 px-4 py-1 border border-[#333] bg-[#202020] hover:bg-[#282828] text-[#f8f9fa] font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Notes List */}
          <div className="h-[430px] overflow-y-auto">
            {notes.length === 0 && !loading && (
              <div className="py-8 text-center p-4 text-[#f8f9fa]">
                <div className="text-md mb-2">No notes found</div>
                <div className="text-sm">Add your first note to get started</div>
              </div>
            )}
            {notes.map((note, index) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className={`p-4 border-b border-[#333] hover:bg-[#222] transition-colors duration-200 cursor-pointer ${index % 2 === 0 ? 'bg-[#1f1f1f]' : 'bg-[#202020]'
                  } last:border-b-0`}
              >
                <h3 className="text-[#f8f9fa] font-medium text-md mb-1 line-clamp-1">
                  {note.heading}
                </h3>
                <p className="text-[#888] text-sm leading-relaxed">
                  {truncateText(note.content)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ExpandedNote
        isOpen={isExpandedNoteOpen}
        onClose={handleCloseExpandedNote}
        note={selectedNote}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />

      <Form
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        formType="note"
        data={editingNote}
        isEditing={isEditing}
      />

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={cancelDeleteNote}
        onConfirm={confirmDeleteNote}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.heading}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="destructive"
      />
    </>
  )
}

export default Notes