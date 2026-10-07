import { Header } from '../components/Header'
import { LeadGrid } from '../components/LeadGrid'
import { PageTitle } from '../components/PageTitle'

export const MainPage = () => {
  return (
    <>
      <PageTitle title={`CRM: Список партнеров и скидок`} />
      <Header />
      <LeadGrid />
    </>
  )
}