import { getPartnersSummary } from './backend/answer.mjs'

const state = {
  partners: []
}

const content = document.querySelector(".content")

const renderPartners = () => {
  content.innerHTML = ''

  state.partners.forEach(({company_name, inn, contact_email, phone, rating, discount}) => {
    const partnerCard = document.createElement("div")
    partnerCard.className = "partner-card"

    const header = document.createElement("div")
    header.className = "partner-card-header"

    const partnerData = document.createElement("div")
    partnerData.className = "partner-data"

    const partnerName = document.createElement("p")
    partnerName.innerText = `Партнер | ${company_name}`

    const partnerRating = document.createElement("p")
    partnerRating.innerText = `${!discount ? 0 : discount} %`

    const data = document.createElement("p")
    data.innerText = `${inn}\n${phone}\n${contact_email}\nРейтинг: ${!rating ? 0 : rating}`

    header.appendChild(partnerName)
    header.appendChild(partnerRating)
    partnerData.appendChild(data)

    partnerCard.appendChild(header)
    partnerCard.appendChild(partnerData)
    content.appendChild(partnerCard)
  })
}

const init = async () => {
  try {
    state.partners = await getPartnersSummary()
    renderPartners()
  }
  catch (e) {
    console.error('Не удалось загрузить партнёров:', e)
    content.innerText = 'Ошибка загрузки данных партнёров.'
  }
}

document.addEventListener('DOMContentLoaded', init)