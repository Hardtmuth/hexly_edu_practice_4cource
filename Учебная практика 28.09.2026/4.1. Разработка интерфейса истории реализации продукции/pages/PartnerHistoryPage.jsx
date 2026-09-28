import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSalesHistory, salesHistorySelectors } from '../slices/salesHistory'

import { Header } from '../components/Header'
import { PageTitle } from '../components/PageTitle'


export const PartnerHistoryPage = () => {
  const { partnerId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const history = useSelector(salesHistorySelectors.selectAll)
  const status = useSelector((state) => state.salesHistory.status)
  const error = useSelector((state) => state.salesHistory.error)

  useEffect(() => {
    dispatch(fetchSalesHistory(partnerId))
  }, [partnerId])

  if (status === 'loading' && history.length === 0) {
    return <div>Загрузка истории продаж партнера...</div>
  }
  if (status === 'failed') return <div>Ошибка: {error}</div>

  const handleBackClick = () => {
    navigate('/')
  }

  const title = `CRM: История реализации продукции - партнёр "${history[0].legal_form} ${history[0].company_name}"`

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
          {!history[0].sale_id
            ? <p>У данного партнера нет продаж</p>
            : (
            <div>
              <table>
                <tr>
                  <th>Наименование продукции</th>
                  <th>Количество (шт.)</th>
                  <th>Дата продажи</th>
                </tr>
                {history.map(RenderSalesTable)}
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
