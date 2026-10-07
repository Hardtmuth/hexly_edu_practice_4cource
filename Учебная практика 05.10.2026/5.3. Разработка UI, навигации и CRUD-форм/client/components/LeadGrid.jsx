import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { fetchPartners, partnersSelectors } from '../slices/partnersSlice'

import { AddModal } from './AddModal'
import { EditModal } from './EditModal'
import { OrderCalc } from './OrderCalc'


export const LeadGrid = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const partners = useSelector(partnersSelectors.selectAll)
  const status = useSelector((state) => state.partners.status)
  const error = useSelector((state) => state.partners.error)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [isOrderCalcOpen, setIsOrderCalcOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchPartners())
  }, [])

  // console.log('[LeadGrid] partners:', partners)

  if (status === 'loading' && partners.length === 0) {
    return <div>Загрузка реестра...</div>
  }
  // if (status === 'failed') return <div>Ошибка: {error}</div>

  const handleHistoryClick = (partnerId) => {
    navigate(`/partnerHistory/${partnerId}`)
  }

  const renderPartnerCard = (partner) => {
    const { partner_id, director_name, legal_form, partner_name, inn, email, phone, rating, discount } = partner
    return (
      <div className='partner-card' key={partner_id}>
        <div className='partner-card-header'>
          <p>
            {`${legal_form} | ${partner_name}`}
          </p>
          <p>
            {`${discount ?? 0}%`}
          </p>
        </div>
        <div className='partner-data'>
          <div className='partner-info-block'>
            <p className='partner-info-row'>{`${director_name === 'Not specified' ? 'Имя директора не указано' : director_name}`}</p>
            <p className='partner-info-row'>ИНН: {inn}</p>
            <p className='partner-info-row'>{`${phone === 'Not specified' ? 'Телефон не указан' : phone}`}</p>
            <p className='partner-info-row'>{email}</p>
            <p className='partner-info-row'>{`Рейтинг: ${rating}`}</p>
          </div>
          <button
            onClick={() => {
              setSelectedPartner(partner)
              setIsEditModalOpen(true)
            }}>
            Редактировать
          </button>
          <button
            onClick={() => handleHistoryClick(partner.partner_id)}
          >
            История продаж
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='navbar'>
        <h1>CRM: Реестр партнеров</h1>
        <div className='navbar-actions'>
          <button type="button" onClick={() => setIsAddModalOpen(true)}>Добавить партнера</button>
          <button type="button" onClick={() => setIsOrderCalcOpen(true)}>Калькулятор заказа</button>
        </div>
      </div>
      <div className='content'>
        {partners.map(p => renderPartnerCard(p))}
      </div>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setSelectedPartner(null)
          setIsAddModalOpen(false)
        }}
      />
      <EditModal
        key={selectedPartner?.partner_id ?? 'empty'}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          // setSelectedPartner(null)
        }}
        partner={selectedPartner}
      />
      <OrderCalc
        isOpen={isOrderCalcOpen}
        onClose={() => {
          setIsOrderCalcOpen(false)
        }}
      />
    </>
  )
}
