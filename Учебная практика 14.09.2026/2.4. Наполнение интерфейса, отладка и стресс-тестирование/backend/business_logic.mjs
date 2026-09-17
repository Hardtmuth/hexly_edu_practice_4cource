export const calculatePartnerDiscount = (totalQuantity) => {
  if (!totalQuantity) return null
  return (
    totalQuantity < 10000
      ? 0
      : totalQuantity < 50000
        ? 5
        : totalQuantity < 300000
          ? 10
          : 15
  )
}
