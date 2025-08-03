import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um número de telefone para o padrão de link da API do WhatsApp.
 * @param phoneNumber - O número de telefone a ser formatado.
 * @returns A URL formatada para o WhatsApp (ex: "https://wa.me/5562999998888" ).
 */
export function formatWhatsAppLink(phoneNumber: string): string {
  const cleanedNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanedNumber.length > 11 || cleanedNumber.length < 10) {
    return phoneNumber;
  }
  
  const whatsappUrl = `https://wa.me/55${cleanedNumber}`;
  return whatsappUrl;
}

/**
 * Formata uma string de dígitos de telefone para o padrão brasileiro.
 * @param phone - A string de telefone (ex: "62999998888" ).
 * @returns A string formatada (ex: "(62) 99999-8888") ou a original se inválida.
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return 'N/A';
  
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }

  return phone;
};
