import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles.css'
import { useDispatch } from 'react-redux'
import { editPartner } from '../slices/partnersSlice'
import { MessageBox } from './MessageBox'

export const EditModal = ({ isOpen, onClose, partner }) => {
  const dispatch = useDispatch()

  const [form, setForm] = useState({ ...partner })
  const [errors, setErrors] = useState({})

  const [msgBox, setMsgBox] = useState({
    type: 'info',
    message: '',
    showCancel: false,
  })

  if (!isOpen || !partner) return null

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'inn') {
      const digits = value.replace(/\D/g, '')
      const limited = digits.slice(0, 12)
      setForm((prev) => ({ ...prev, [name]: limited }))
      return
    }

    if (name === 'rating') {
      if (value === '') {
        setForm((prev) => ({ ...prev, [name]: '' }))
        return
      }
      const num = Number(value)

      if (Number.isNaN(num)) {
        return
      }
      // Ограничиваем диапазон [1, 5]
      let limited = Math.max(1, Math.min(5, num))
      // Округляем до 1 знака после запятой (шаг 0.1)
      limited = Math.round(limited * 10) / 10
      setForm((prev) => ({ ...prev, [name]: limited }))
      return
    }

    if (name !== 'phone') {
      setForm((prev) => ({ ...prev, [name]: value }))
      return
    }

    // Только цифры
    let digits = value.replace(/\D/g, '')

    // Замена\подстановка первой цифры на 7
    if (digits.length > 0 && digits[0] !== '7' && digits[0] !== '8') {
      digits = '7' + digits
    } else if (digits.length > 0 && digits[0] === '8') {
      // 8 → 7
      digits = '7' + digits.slice(1)
    }

    // Ограничиваем 11 цифрами
    digits = digits.slice(0, 11)

    let formatted = ''

    // Форматирование по маске +7 (XXX) XXX-XX-XX
    if (digits.length === 0) {
      formatted = ''
    } else if (digits.length === 1) {
      formatted = '+7'
    } else if (digits.length <= 4) {
      formatted = `+7 (${digits.slice(1)}`
    } else if (digits.length <= 7) {
      formatted = `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`
    } else if (digits.length <= 9) {
      formatted = `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    } else {
      formatted = `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
    }

    setForm((prev) => ({ ...prev, phone: formatted }))
  }

  // Проверка: были ли изменения по сравнению с исходными данными
  const hasChanges = () => {
    if (!partner) return false
    return Object.keys(form).some(
      (key) => String(form[key] ?? '') !== String(partner[key] ?? '')
    )
  }

  // Обработка «Назад/Отмена» с предупреждением
  const handleClose = () => {
    if (hasChanges()) {
      setMsgBox({
        type: 'warning',
        message:
          'Вы внесли изменения, которые не были сохранены. При закрытии окна все несохранённые данные будут потеряны. Продолжить?',
        showCancel: true,
      })
    } else {
      onClose()
    }
  }

  // Валидация перед отправкой
  const validate = () => {
    const errs = {}

    if (!form.company_name || form.company_name.trim() === '') {
      errs.company_name = true
      setMsgBox({
        type: 'error',
        message:
          'Наименование компании обязательно для заполнения. Пожалуйста, заполните поле «Название компании» и повторите попытку.',
        showCancel: false,
      })
      return false
    }

    if (!form.contact_email || form.contact_email.trim() === '') {
      errs.contact_email = true
      setMsgBox({
        type: 'error',
        message:
          'Email обязателен для заполнения. Пожалуйста, укажите корректный адрес электронной почты и повторите попытку.',
        showCancel: false,
      })
      return false
    }

    if (form.rating !== undefined && form.rating !== null && form.rating !== '') {
      const r = Number(form.rating)
      if (Number.isNaN(r)) {
        errs.rating = true
        setMsgBox({
          type: 'error',
          message:
            'Рейтинг должен быть числом от 0 до 5. Пожалуйста, удалите буквы и знаки препинания и повторите попытку.',
          showCancel: false,
        })
        return false
      }
      if (r < 0 || r > 5) {
        errs.rating = true
        setMsgBox({
          type: 'error',
          message:
            'Рейтинг не может быть отрицательным или превышать 5. Пожалуйста, введите значение от 0 до 5 и повторите попытку.',
          showCancel: false,
        })
        return false
      }
    }

    setErrors(errs)
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    const payload = {
      ...form,
      rating: form.rating ? Number(form.rating) : null,
    }

    try {
      await dispatch(editPartner({ partnerId: partner.partner_id, data: payload }))
      setMsgBox({
        type: 'info',
        message: 'Данные партнёра успешно обновлены и сохранены в базе данных.',
        showCancel: false,
      })
    } catch (error) {
      console.error('Ошибка при сохранении данных партнёра:', error)
      const serverMessage = error?.error
      || 'Не удалось сохранить данные. Возможно, сервер временно недоступен или данные некорректны. Попробуйте позже.'

      setMsgBox({
        type: 'error',
        message: serverMessage,
        showCancel: false,
      })
    }
  }

  const handleMsgBoxConfirm = () => {
    setMsgBox({ type: 'info', message: '', showCancel: false })
    onClose()
  }

  const handleMsgBoxCancel = () => {
    setMsgBox({ type: 'info', message: '', showCancel: false })
  }

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h3>CRM: Карточка партнера [Редактирование]</h3>

        <form onSubmit={handleSubmit} className="form-group">
          <div className="form-group">
            <label htmlFor="company_name">Наименование</label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              placeholder="Рога и Копыта"
            />
          </div>

          {/* Выпадающий список */}
          <div className="form-group">
            <label htmlFor="legal_form">Тип партнера</label>
            <select
              id="legal_form"
              name="legal_form"
              value={form.legal_form}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Сделайте выбор</option>
              <option value="ООО">Общества с ограниченной ответственностью (ООО)</option>
              <option value="ЗАО">Закрытое акционерное общество (ЗАО)</option>
              <option value="ИП">Индивидуальный Предприниматель (ИП)</option>
              <option value="НПД">Самозанятость (НПД)</option>
              <option value="АО">Акционерное общество (АО)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rating">Рейтинг</label>
            <input
              type="number"
              id="rating"
              name="rating"
              step="0.1"
              value={form.rating}
              onChange={handleChange}
              placeholder="От 1 до 5 (например: 4.5)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Адрес</label>
            <textarea
              id="address"
              name="address"
              rows="5"
              value={form.address}
              onChange={handleChange}
              placeholder="г. Москва, ул. Примерная, д. 1, офис 101"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">ФИО Директора</label>
            <input
              type="text"
              id="director_name"
              name="director_name"
              value={form.director_name}
              onChange={handleChange}
              placeholder="Иванов Иван Иванович"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact_email">Email</label>
            <input
              type="email"
              id="contact_email"
              name="contact_email"
              value={form.contact_email}
              onChange={handleChange}
              placeholder="example@email.com"

            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+7 (___) ___-__-__"
              inputMode="numeric"
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="inn">ИНН</label>
            <input
              type="number"
              id="inn"
              name="inn"
              value={form.inn}
              onChange={handleChange}
              placeholder="10 или 12 цифр"
              required
            />
          </div>

          <div className="form-group">
            <button type="button" onClick={handleClose}>Отмена</button>
            <button type="submit">Изменить</button>
          </div>
        </form>
      </div>
      <MessageBox
        type={msgBox.type}
        message={msgBox.message}
        showCancel={msgBox.showCancel}
        onConfirm={handleMsgBoxConfirm}
        onCancel={handleMsgBoxCancel}
      />
    </div>,
    document.body
  )
}
