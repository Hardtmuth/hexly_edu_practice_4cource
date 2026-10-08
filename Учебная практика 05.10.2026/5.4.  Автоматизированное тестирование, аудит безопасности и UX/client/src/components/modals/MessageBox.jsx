import { createPortal } from 'react-dom'

const VARIANTS = {
  error: {
    title: 'Ошибка',
    icon: '✕',
    color: '#d32f2f',
    bg: '#fde8e8',
  },
  warning: {
    title: 'Предупреждение',
    icon: '!',
    color: '#f57c00',
    bg: '#fff4e6',
  },
  info: {
    title: 'Информация',
    icon: 'i',
    color: '#1976d2',
    bg: '#e8f0fd',
  },
}

export const MessageBox = ({ type = 'info', message, onConfirm, onCancel, showCancel = false }) => {
  if (!message) return null


  console.log('[MessageBox] render', { type, message })

  const variant = VARIANTS[type]

  return createPortal(
    <div className="msgbox-overlay" onClick={onConfirm}>
      <div className="msgbox" onClick={(e) => e.stopPropagation()}>
        <div className="msgbox-icon" style={{ color: variant.color, backgroundColor: variant.bg }}>
          <span>{variant.icon}</span>
        </div>
        <div className="msgbox-body">
          <h3 className="msgbox-title">{variant.title}</h3>
          <p className="msgbox-text">{message}</p>
          <div className="msgbox-actions">
            {showCancel && (
              <button className="msgbox-btn msgbox-btn-cancel" onClick={onCancel}>
                Отмена
              </button>
            )}
            <button className="msgbox-btn msgbox-btn-ok" onClick={onConfirm}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
