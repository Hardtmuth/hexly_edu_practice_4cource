import React from 'react'
import { createPortal } from 'react-dom'
import '../styles.css'

export const AddModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h3>CRM: Добавить Пртнера</h3>
        <p>Тут будет форма для добавдения партнера</p>
        <div className="form-group">
          <button type="button" onClick={onClose}>Отмена</button>
          <button type="submit">Добвавить</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
