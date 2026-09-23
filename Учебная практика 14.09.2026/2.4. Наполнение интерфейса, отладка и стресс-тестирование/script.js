import routes from './routes.js'

const state = {
  partners: [],
}

const content = document.querySelector('.content')

const renderPartners = () => {
  content.innerHTML = ''

  state.partners.forEach(({ legal_form, company_name, inn, contact_email, phone, rating, discount }) => {
    const partnerCard = document.createElement('div')
    partnerCard.className = 'partner-card'

    const header = document.createElement('div')
    header.className = 'partner-card-header'

    const partnerData = document.createElement('div')
    partnerData.className = 'partner-data'

    const partnerName = document.createElement('p')
    partnerName.textContent = `${legal_form} | ${company_name}`

    const partnerDiscount = document.createElement('p')
    partnerDiscount.textContent = `${discount}%`

    const data = document.createElement('p')
    data.className = 'partner-info'
    data.textContent = `${inn}\n${phone ?? 'Телефон не указан'}\n${contact_email}\nРейтинг: ${rating}`

    header.appendChild(partnerName)
    header.appendChild(partnerDiscount)
    partnerData.appendChild(data)

    partnerCard.appendChild(header)
    partnerCard.appendChild(partnerData)
    content.appendChild(partnerCard)
  })
}

const init = async () => {
  try {
    const response = await fetch(routes.partnersSummaryPath())
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    state.partners = await response.json()
    renderPartners()
  } catch (e) {
    console.error('Не удалось загрузить партнёров:', e)
    content.textContent = 'Ошибка загрузки данных партнёров.'
  }
}

document.addEventListener('DOMContentLoaded', init)
