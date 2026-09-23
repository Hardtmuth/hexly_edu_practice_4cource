import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles.css'

export const AddModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const [form, setForm] = useState({
    legal_form: '',
    company_name: '',
    inn: '',
    contact_email: '',
    phone: '',
    rating: '',
    address: '',
    director_name: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

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

  const handleSubmit = (e) => {
    e.preventDefault()

    const payload = {
      ...form,
      rating: form.rating ? Number(form.rating) : null,
    }

    console.log('[AddModal Form] add partner data:', payload);
    // dispatch(addPartner(payload))
    onClose()
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <h3>Добавить партнёра</h3>

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
              required
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
              required
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
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit">Добавить</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
