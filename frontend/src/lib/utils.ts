import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um número de telefone para o padrão de link da API do WhatsApp.
 * @param phoneNumber - O número de telefone a ser formatado (ex: "(62) 99999-8888").
 * @returns A URL formatada para o WhatsApp (ex: "https://wa.me/5562999998888" ).
 */
export function formatWhatsAppLink(phoneNumber: string): string {
  // 1. Remove todos os caracteres que não são dígitos
  const cleanedNumber = phoneNumber.replace(/\D/g, '');

  // 2. Adiciona o prefixo do Brasil (55) e monta a URL final
  // Garante que o número tenha 10 ou 11 dígitos para adicionar o DDD corretamente.
  // Números com 8 ou 9 dígitos sem DDD não funcionarão corretamente.
  const whatsappUrl = `https://wa.me/55${cleanedNumber}`;

  return whatsappUrl;
}
