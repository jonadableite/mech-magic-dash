/**
 * Utilitários para formatação de valores monetários
 */

/**
 * Formata um valor numérico como moeda brasileira (Real)
 * @param value - Valor numérico a ser formatado
 * @param options - Opções de formatação
 * @returns String formatada como moeda brasileira
 */
export function formatCurrency(
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  } = {}
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options;

  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return showSymbol ? `R$ ${formatted}` : formatted;
}

/**
 * Formata um valor numérico como moeda brasileira com símbolo
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como "R$ 1.234,56"
 */
export function formatBRL(value: number): string {
  return formatCurrency(value);
}

/**
 * Formata um valor numérico como moeda brasileira sem símbolo
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como "1.234,56"
 */
export function formatBRLValue(value: number): string {
  return formatCurrency(value, { showSymbol: false });
}

/**
 * Converte string de moeda para número
 * @param currencyString - String no formato "R$ 1.234,56" ou "1.234,56"
 * @returns Número convertido
 */
export function parseCurrency(currencyString: string): number {
  // Remove símbolos e espaços
  const cleanString = currencyString
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "") // Remove pontos de milhares
    .replace(",", "."); // Substitui vírgula por ponto decimal

  return parseFloat(cleanString) || 0;
}

/**
 * Valida se um valor é um número válido para moeda
 * @param value - Valor a ser validado
 * @returns true se o valor é válido
 */
export function isValidCurrency(value: any): value is number {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
}
