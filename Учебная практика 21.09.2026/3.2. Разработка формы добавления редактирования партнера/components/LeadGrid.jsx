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

  useEffect(() => {
    dispatch(fetchPartners())
  }, [])

  // console.log('[LeadGrid] partners:', partners)

  if (status === 'loading') return <div>Загрузка...</div>
  if (status === 'failed') return <div>Ошибка: {error}</div>

  const renderPartnerCard = ({ legal_form, company_name, inn, contact_email, phone, rating, discount }) => {
    return (
      <div className='partner-card' key={inn} onClick={() => setIsEditModalOpen(true)}>
        <div className='partner-card-header'>
          <p>
            {`${legal_form} | ${company_name}`}
          </p>
          <p>
            {`${discount}%`}
          </p>
        </div>
        <div className='partner-data'>
          <p className='partner-info'>
            {`${inn}\n${phone ?? 'Телефон не указан'}\n${contact_email}\nРейтинг: ${rating}`}
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

      <AddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <EditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </>
  )
}
