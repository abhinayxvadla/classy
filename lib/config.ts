export const APP_NAME = "Classy";
export const APP_TAGLINE = "Prompt it. Push it. Track it.";

export const PLATFORM_FEE_PERCENT = 15;

export const SECURITY_QUESTIONS = [
  "What was the name of your first school?",
  "What is your mother's maiden name?",
  "What was the make and model of your first car?",
  "In what city were you born?",
  "What was the name of your childhood best friend?",
  "What was your childhood nickname?",
  "What is the name of the street you grew up on?",
] as const;

export type SecurityQuestion = (typeof SECURITY_QUESTIONS)[number];
