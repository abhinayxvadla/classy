import { z } from "zod";
import { SECURITY_QUESTIONS } from "@/lib/config";

// Indian 10-digit mobile number, optional +91 prefix
export const indianPhoneRegex = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;

// Password: min 8 characters, at least 1 letter and 1 number
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const studentGrades = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "College",
  "Working professional",
  "Other",
] as const;

export const studentSubjects = [
  "Maths",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Social Science",
  "Computer Science",
  "Commerce",
  "Other",
] as const;

export const tutorRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name is too long"),
    email: z.string().email("Please enter a valid email address").toLowerCase(),
    phone: z
      .string()
      .regex(indianPhoneRegex, "Enter a valid 10-digit Indian phone number (+91 optional)"),
    institute: z.string().max(120, "Institute name is too long").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRegex, "Password must contain at least one letter and one number"),
    confirmPassword: z.string(),
    securityQuestion: z.enum(SECURITY_QUESTIONS, {
      message: "Please select a security question",
    }),
    securityAnswer: z
      .string()
      .min(2, "Security answer must be at least 2 characters")
      .max(100, "Security answer is too long"),
    next: z.string().optional(),
    joinCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TutorRegisterInput = z.infer<typeof tutorRegisterSchema>;

export const studentRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name is too long"),
    email: z.string().email("Please enter a valid email address").toLowerCase(),
    phone: z
      .string()
      .regex(indianPhoneRegex, "Enter a valid 10-digit Indian phone number (+91 optional)"),
    grade: z.string().min(1, "Please select your grade or class"),
    subjects: z.array(z.string()).min(1, "Please select at least one subject"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRegex, "Password must contain at least one letter and one number"),
    confirmPassword: z.string(),
    securityQuestion: z.enum(SECURITY_QUESTIONS, {
      message: "Please select a security question",
    }),
    securityAnswer: z
      .string()
      .min(2, "Security answer must be at least 2 characters")
      .max(100, "Security answer is too long"),
    next: z.string().optional(),
    joinCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  expectedRole: z.enum(["tutor", "student"]),
  joinCode: z.string().optional(),
  next: z.string().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const forgotPasswordStep1Schema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
});

export type ForgotPasswordStep1Input = z.infer<typeof forgotPasswordStep1Schema>;

export const forgotPasswordStep2Schema = z
  .object({
    email: z.string().email("Please enter a valid email address").toLowerCase(),
    securityAnswer: z.string().min(1, "Security answer is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRegex, "Password must contain at least one letter and one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordStep2Input = z.infer<typeof forgotPasswordStep2Schema>;

export const resetPasswordForcedSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRegex, "Password must contain at least one letter and one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordForcedInput = z.infer<typeof resetPasswordForcedSchema>;

export const resetPasswordVoluntarySchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(passwordRegex, "Password must contain at least one letter and one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordVoluntaryInput = z.infer<typeof resetPasswordVoluntarySchema>;
