import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { fetchPartners, partnersSelectors } from '../slices/partnersSlice'

import { AddModal } from './AddModal'
import { EditModal } from './EditModal'


export const LeadGrid = () => {
  const dispatch = useDispatch()

  const partners = useSelector(partnersSelectors.selectAll)
  const status = useSelector((state) => state.partners.status)
  const error = useSelector((state) => state.partners.error)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState(null)

  useEffect(() => {
    dispatch(fetchPartners())
  }, [])

  // console.log('[LeadGrid] partners:', partners)

  if (status === 'loading' && partners.length === 0) {
    return <div>Загрузка реестра...</div>
  }
  // if (status === 'failed') return <div>Ошибка: {error}</div>

  const renderPartnerCard = (partner) => {
    const { partner_id, director_name, legal_form, company_name, inn, contact_email, phone, rating, discount } = partner
    return (
      <div className='partner-card' key={partner_id} onClick={() => {
        setSelectedPartner(partner)
        setIsEditModalOpen(true)
      }}>
        <div className='partner-card-header'>
          <p>
            {`${legal_form} | ${company_name}`}
          </p>
          <p>
            {`${discount ?? 0}%`}
          </p>
        </div>
        <div className='partner-data'>
          <p className='partner-info'>
            {`${director_name === 'Not specified' ? 'Имя директора не указано' : director_name}\n${inn}\n${phone ?? 'Телефон не указан'}\n${contact_email}\nРейтинг: ${rating}`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='navbar'>
        <h1>CRM: Реестр партнеров</h1>
        <button type="button" onClick={() => setIsAddModalOpen(true)}>Добавить партнера</button>
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
    </>
  )
}
