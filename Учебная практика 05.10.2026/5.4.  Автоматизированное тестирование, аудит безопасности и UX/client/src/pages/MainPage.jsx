import { Header } from '../components/ui/Header'
import { LeadGrid } from '../components/grids/LeadGrid'
import { PageTitle } from '../components/ui/PageTitle'

export const MainPage = () => {
  return (
    <>
      <PageTitle title={`CRM: Список партнеров и скидок`} />
      <Header />
      <LeadGrid />
    </>
  )
}