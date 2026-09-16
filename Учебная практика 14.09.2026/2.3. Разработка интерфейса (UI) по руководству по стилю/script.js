const state = {
  partners: [
    {
      id: 1,
      company_name: 'Parner 1',
      inn: '0000000000',
      contact_email: 'partner@one.com',
      phone: '+7-999-888-77-66',
      rating: 3,
      discount: 3,
    },
    {
      id: 2,
      company_name: 'Parner 2',
      inn: '1111111111',
      contact_email: 'second@partner.ru',
      phone: '+7-000-000-00-00',
      rating: 4,
      discount: 5,
    },
  ]
}

const content = document.querySelector(".content")

const renderPartners = () => {
  state.partners.forEach(({id, company_name, inn, contact_email, phone, rating, discount}) => {
    const partnerCard = document.createElement("div")
    partnerCard.className = "partner-card"

    const header = document.createElement("div")
    header.className = "partner-card-header"

    const partnerData = document.createElement("div")
    partnerData.className = "partner-data"

    const partnerName = document.createElement("p")
    partnerName.innerText = `Партнер | ${company_name}`

    const partnerRating = document.createElement("p")
    partnerRating.innerText = `${rating} %`

    const data = document.createElement("p")
    data.innerText = `${inn}\n${phone}\n${contact_email}\nРейтинг: ${rating}`

    header.appendChild(partnerName)
    header.appendChild(partnerRating)
    partnerData.appendChild(data)

    partnerCard.appendChild(header)
    partnerCard.appendChild(partnerData)
    content.appendChild(partnerCard)
  })
}

document.addEventListener('DOMContentLoaded', renderPartners)