export const calculatePartnerDiscount = (totalQuantity) => {
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
