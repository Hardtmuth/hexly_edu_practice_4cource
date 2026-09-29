import { useEffect } from 'react'

export const PageTitle = ({ title }) => {
  useEffect(() => {
    document.title = title
  }, [title])

  return null
}
