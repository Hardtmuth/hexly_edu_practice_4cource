import React from 'react'
import { createPortal } from 'react-dom'
import '../styles.css'

export const EditModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h3>CRM: Карточка партнера [Редактирование]</h3>
        <p>Тут будет форма редактирования партнера</p>
        <div className="form-group">
          <button type="button" onClick={onClose}>Отмена</button>
          <button type="submit">Изменить</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
