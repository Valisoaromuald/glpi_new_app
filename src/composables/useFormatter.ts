export function useFormatter() {
  /**
   * Formate un nombre avec un nombre de décimales défini
   * @param {number} number - Le nombre à formater
   * @param {number} afterCommaNumber - Le nombre de chiffres après la virgule
   * @returns {string} Le nombre formaté
   */
  function formatNumber(number:number, afterCommaNumber:number) {
    if (isNaN(number) || isNaN(afterCommaNumber)) {
      console.warn("useFormatter: les arguments doivent être des nombres")
      return "—"
    }
 
    return parseFloat(number.toFixed(afterCommaNumber)).toLocaleString("fr-FR", {
      minimumFractionDigits: afterCommaNumber,
      maximumFractionDigits: afterCommaNumber,
    })
  }
 
  return { formatNumber }
}