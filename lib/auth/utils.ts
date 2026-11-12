import { SECURITY_QUESTIONS } from "@/lib/config";

/**
 * Normalises a security answer before hashing or comparing:
 * trims leading/trailing whitespace, converts to lowercase,
 * and collapses multiple whitespace characters to a single space.
 */
export function normalizeSecurityAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Deterministically picks a decoy security question from the email address.
 * Never leaks whether an account exists for a given email.
 */
export function getDecoySecurityQuestion(email: string): string {
  const normalized = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % SECURITY_QUESTIONS.length;
  return SECURITY_QUESTIONS[index];
}

/**
 * Generates a random 10-character temporary password
 * containing uppercase, lowercase, and digits.
 */
export function generateTemporaryPassword(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  
  let pwd = "";
  // 7 letters + 3 digits
  for (let i = 0; i < 7; i++) {
    pwd += letters[Math.floor(Math.random() * letters.length)];
  }
  for (let i = 0; i < 3; i++) {
    pwd += digits[Math.floor(Math.random() * digits.length)];
  }

  // Shuffle characters
  return pwd
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

/**
 * Normalises an Indian phone number to standard 10-digit or +91 format.
 */
export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  return phone.trim();
}
