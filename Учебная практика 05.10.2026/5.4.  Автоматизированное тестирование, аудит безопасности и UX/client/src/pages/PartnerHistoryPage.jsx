import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSalesHistory, salesHistorySelectors } from '../stores/salesHistory'
import { getPartner } from '../stores/partnersSlice'

import { Header } from '../components/ui/Header'
import { PageTitle } from '../components/ui/PageTitle'


export const PartnerHistoryPage = () => {
  const { partnerId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const history = useSelector(salesHistorySelectors.selectAll)
  const partnerInfo = useSelector((state) => state.partners.currentPartner)
  const status = useSelector((state) => state.salesHistory.status)
  const error = useSelector((state) => state.salesHistory.error)

  useEffect(() => {
    if (partnerId) {
      dispatch(getPartner(partnerId))
      dispatch(fetchSalesHistory(partnerId))
    }
  }, [partnerId])

  if ((status === 'loading' || status === 'idle') && (history.length === 0 || !partnerInfo)) {
    return <div>Загрузка истории продаж партнёра...</div>
  }

  if (status === 'failed') return <div>Ошибка: {error}</div>

  const handleBackClick = () => {
    navigate('/')
  }

  const title = `CRM: История реализации продукции - партнёр "${partnerInfo.legal_form} ${partnerInfo.partner_name}"`

  const RenderSalesTable = (salesLIst) => {
    const { sale_id, product_name, quantity, sale_date } = salesLIst
    return (
      <tr key={sale_id}>
        <td>{product_name}</td>
        <td>{quantity}</td>
        <td>{sale_date}</td>
      </tr>
    )
  }

  return (
    <>
      <PageTitle title={title} />
      <Header />
      <div className='content'>
        <div className='partner-card'>
          <div className='partner-card-header'>
            <h1>{title}</h1>
          </div>
          {history.length === 0
            ? (
              <p className='partner-data'>У данного партнера нет продаж</p>
            ) : (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Наименование продукции</th>
                    <th>Количество (шт.)</th>
                    <th>Дата продажи</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(RenderSalesTable)}
                </tbody>
              </table>
            </div>
            )
          }
          <div className='partner-data'>
            <button onClick={() => handleBackClick()}>
              Вернуться в реестр партнёров
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
