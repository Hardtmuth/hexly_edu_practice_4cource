import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { calculateRawMaterialThunk } from '../../stores/calculationSlice'
import { productSelectors, fetchProducts } from '../../stores/productSlice'
import { MessageBox } from './MessageBox'
import '../../assets/styles.css'

const INITIAL_FORM = {
  productId: '',
  quantity: '',
  param1: '',
  param2: '',
}

export const OrderCalc = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const products = useSelector(productSelectors.selectAll)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formCalcResult, setFormCalcResult] = useState(null)
  const [msgBox, setMsgBox] = useState({
    type: 'info',
    message: '',
    showCancel: false,
  })

  useEffect(() => {
    if (isOpen && !products.length) {
      dispatch(fetchProducts())
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target

    if (value === '') {
      setForm((prev) => ({ ...prev, [name]: '' }))
      return
    }

    const num = Number(value)
    if (Number.isNaN(num)) return

    if (name === 'param1' || name === 'param2') {
      const limited = Math.max(1, Math.min(5, Math.round(num * 10) / 10))
      setForm((prev) => ({ ...prev, [name]: limited }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: num }))
  }

  const validate = () => {
    if (!form.productId) {
      setMsgBox({
        type: 'error',
        message: 'Продукт не выбран. Выберите продукт и повторите попытку.',
        showCancel: false,
      })
      return false
    }

    const q = Number(form.quantity)
    if (!form.quantity || Number.isNaN(q) || q <= 0) {
      setMsgBox({
        type: 'error',
        message: 'Количество должно быть положительным целым числом.',
        showCancel: false,
      })
      return false
    }

    const p1 = Number(form.param1)
    if (!form.param1 || Number.isNaN(p1) || p1 <= 0 || p1 > 5) {
      setMsgBox({
        type: 'error',
        message: 'Параметр 1 должен быть числом от 0.1 до 5.',
        showCancel: false,
      })
      return false
    }

    const p2 = Number(form.param2)
    if (!form.param2 || Number.isNaN(p2) || p2 <= 0 || p2 > 5) {
      setMsgBox({
        type: 'error',
        message: 'Параметр 2 должен быть числом от 0.1 до 5.',
        showCancel: false,
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      productId: Number(form.productId),
      quantity: Number(form.quantity),
      param1: Number(form.param1),
      param2: Number(form.param2),
    }

    try {
      const res = await dispatch(calculateRawMaterialThunk(payload)).unwrap()

      if (res.result === -1) {
        setFormCalcResult(null)
        setMsgBox({
          type: 'error',
          message: res.error || 'Ошибка расчёта. Проверьте введённые данные.',
          showCancel: false,
        })
        return
      }

      setFormCalcResult(res.result)
      setMsgBox({
        type: 'info',
        message: `Результат расчёта: ${res.result} единиц сырья`,
        showCancel: false,
      })
    } catch (error) {
      setFormCalcResult(null)
      setMsgBox({
        type: 'error',
        message: error?.error
          || 'Не удалось получить результат. Сервер недоступен или данные некорректны.',
        showCancel: false,
      })
    }
  }

  const handleClose = () => {
    setForm(INITIAL_FORM)
    setFormCalcResult(null)
    setMsgBox({ type: 'info', message: '', showCancel: false })
    onClose()
  }

  const handleMsgBoxConfirm = () => {
    setMsgBox({ type: 'info', message: '', showCancel: false })
  }

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>&times;</button>
        <h3>Калькулятор заказа</h3>

        <form onSubmit={handleSubmit} className="form-group">
          <div className="form-group">
            <label htmlFor="productId">Продукт</label>
            <select
              id="productId"
              name="productId"
              value={form.productId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Выберите продукт</option>
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name}
                </option>
              ))}
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
              placeholder="Целое число больше 0 (например: 100)"
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
              placeholder="От 0.1 до 5 (например: 4.5)"
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
              placeholder="От 0.1 до 5 (например: 4.5)"
            />
          </div>

          <div className="form-group">
            <h4>
              {formCalcResult !== null
                ? `Результат расчёта: ${formCalcResult}`
                : 'Результат расчёта: -'}
            </h4>
          </div>

          <div className="form-group">
            <button type="button" onClick={handleClose}>Закрыть</button>
            <button type="submit">Рассчитать</button>
          </div>
        </form>
      </div>
      {msgBox.message && (
        <MessageBox
          type={msgBox.type}
          message={msgBox.message}
          showCancel={msgBox.showCancel}
          onConfirm={handleMsgBoxConfirm}
          onCancel={handleMsgBoxConfirm}
        />
      )}
    </div>,
    document.body
  )
}
