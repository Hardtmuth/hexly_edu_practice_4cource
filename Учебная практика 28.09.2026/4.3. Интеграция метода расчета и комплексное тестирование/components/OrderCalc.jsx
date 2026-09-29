import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import '../styles.css'
import { useDispatch } from 'react-redux'
import { MessageBox } from './MessageBox'

export const OrderCalc = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const [errors, setErrors] = useState({})

  const [msgBox, setMsgBox] = useState({
    type: 'info',
    message: '',
    showCancel: false,
  })

  const formFields = {
    productId: null,
    quantity: 0,
    param1: 0,
    param2: 0,
  }

  const [form, setForm] = useState(formFields)

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'param1' || name === 'param2') {
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

    if (name === 'quantity') {
      if (value === '') {
        setForm((prev) => ({ ...prev, [name]: '' }))
        return
      }
      const num = Number(value)

      if (Number.isNaN(num)) {
        return
      }
      setForm((prev) => ({ ...prev, [name]: num }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Валидация перед отправкой
  const validate = () => {
    const errs = {}

    if (!form.productId) {
      errs.productId = true
      setMsgBox({
        type: 'error',
        message:
          'Продукт не выбран. Пожалуйста, выберете продукт и повторите попытку.',
        showCancel: false,
      })
      return false
    }

    if (form.quantity !== undefined && form.quantity !== null && form.quantity !== '') {
      const q = Number(form.quantity)
      if (Number.isNaN(q)) {
        errs.quantity = true
        setMsgBox({
          type: 'error',
          message:
            'Количество не указано. Пожалуйста, введите количество и повторите попытку.',
          showCancel: false,
        })
        return false
      }
      if (q < 0) {
        errs.rating = true
        setMsgBox({
          type: 'error',
          message:
            'Количество не может быть отрицательным. Пожалуйста, введите значение больше 0 и повторите попытку.',
          showCancel: false,
        })
        return false
      }
    }

    if (form.param1 !== undefined && form.param1 !== null && form.param1 !== '') {
      const p1 = Number(form.param1)
      if (Number.isNaN(p1)) {
        errs.param1 = true
        setMsgBox({
          type: 'error',
          message:
            'Параметр 1 не указан. Пожалуйста, введите Параметр 1 и повторите попытку.',
          showCancel: false,
        })
        return false
      }
      if (p1 < 0 || p1 > 5) {
        errs.rating = true
        setMsgBox({
          type: 'error',
          message:
            'Параметр 1 не может быть отрицательным или превышать 5. Пожалуйста, введите значение от 0 до 5 и повторите попытку.',
          showCancel: false,
        })
        return false
      }
    }

    if (form.param2 !== undefined && form.param2 !== null && form.param2 !== '') {
      const p2 = Number(form.param2)
      if (Number.isNaN(p2)) {
        errs.param2 = true
        setMsgBox({
          type: 'error',
          message:
            'Параметр 2 не указан. Пожалуйста, введите Параметр 2 и повторите попытку.',
          showCancel: false,
        })
        return false
      }
      if (p2 < 0 || p2 > 5) {
        errs.rating = true
        setMsgBox({
          type: 'error',
          message:
            'Параметр 2 не может быть отрицательным или превышать 5. Пожалуйста, введите значение от 0 до 5 и повторите попытку.',
          showCancel: false,
        })
        return false
      }
    }

    setErrors(errs)
    return true
  }

  const handleSubmit = async(e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      ...form,
      productId: Number(form.productId) // FIX
    }

    try {
      console.log('Submited payload: ', payload)
      // await dispatch(addPartner(payload)).unwrap()
      setMsgBox({
        type: 'info',
        message: `Результат рассчета ${JSON.stringify(payload)}`, // TODO fetch result
        showCancel: false,
      })
    } catch (error) {
      console.error('Ошибка при получении результатов рассчета:', error)
      const serverMessage = error?.error
      || 'Не удалось получить результаты расчета. Возможно, сервер временно недоступен или данные некорректны. Попробуйте позже.'

      setMsgBox({
        type: 'error',
        message: serverMessage,
        showCancel: false,
      })
    }
  }

  const handleClose = () => {
    const hasData = Object.values(form).some(
      (v) => v && String(v).trim() !== ''
    )
    if (hasData) {
      setMsgBox({
        type: 'warning',
        message:
          'Вы заполнили часть полей. При закрытии окна все несохранённые данные будут потеряны. Продолжить?',
        showCancel: true,
      })
    } else {
      onClose()
    }
  }

  const handleMsgBoxConfirm = () => {
    setMsgBox({ type: 'info', message: '', showCancel: false })
    setForm(formFields)
    onClose()
  }

  const handleMsgBoxCancel = () => {
    setMsgBox({ type: 'info', message: '', showCancel: false })
  }

  const productsMap = [
    { productId: 1, productName: 'Стиральный порошок "Альфа"'},
    { productId: 2, productName: 'Мыло жидкое "Стандарт"'},
    { productId: 3, productName: 'Кондиционер для белья'},
  ] // TODO Fetch product list with ID*

  const RenderProductsOptions = (productList) => {
    return (
      <>
        <option value=''>Выберете продукт</option>
        {productList.map(p => {
          return (
            <option
              key={p.productId}
              value={p.productId}
            >
              {p.productName}
            </option>
          )
          })}
      </>
    )
  }

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>&times;</button>
        <h3>Калькулятор заказа</h3>

        <form onSubmit={handleSubmit} className="form-group">
          {/* Выпадающий список */}
          <div className="form-group">
            <label htmlFor="productId">Продукт</label>
            <select
              id="productId"
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
            >
              {RenderProductsOptions(productsMap)}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Количество</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="От 1 до 5 (например: 4.5)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="param1">Параметр 1</label>
            <input
              type="number"
              id="param1"
              name="param1"
              step="0.1"
              value={form.param1}
              onChange={handleChange}
              placeholder="От 1 до 5 (например: 4.5)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="param2">Параметр 2</label>
            <input
              type="number"
              id="param2"
              name="param2"
              step="0.1"
              value={form.param2}
              onChange={handleChange}
              placeholder="От 1 до 5 (например: 4.5)"
            />
          </div>

          <div className="form-group">
            <button type="button" onClick={handleClose}>Отмена</button>
            <button type="submit">Рассчитать</button>
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
