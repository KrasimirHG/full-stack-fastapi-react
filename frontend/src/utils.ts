import type { ApiError } from "./client";
import useCustomToast from "./hooks/useCustomToast";

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Invalid email address",
};

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: "Invalid name",
};

export const passwordRules = (isRequired = true) => {
  const rules: any = {
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  };

  if (isRequired) {
    rules.required = "Password is required";
  }

  return rules;
};

export const confirmPasswordRules = (
  getValues: () => any,
  isRequired = true
) => {
  const rules: any = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password;
      return value === password ? true : "The passwords do not match";
    },
  };

  if (isRequired) {
    rules.required = "Password confirmation is required";
  }

  return rules;
};

export const handleError = (err: ApiError) => {
  const { showErrorToast } = useCustomToast();
  const errDetail = (err.body as any)?.detail;
  let errorMessage = errDetail || "Something went wrong.";
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    errorMessage = errDetail[0].msg;
  }
  showErrorToast(errorMessage);
};

export const isDateEqual = (date1: string, date2: string): boolean => {
  if (date1.includes(".") && date2.includes(".")) {
    return date1.split(".")[0] === date2.split(".")[0]; // Compare only the date part
  } else {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate() &&
      d1.getHours() === d2.getHours() &&
      d1.getMinutes() === d2.getMinutes() &&
      d1.getSeconds() === d2.getSeconds()
    );
  }
};

export function printDate(date: string): string {
  if (date.includes(".") && date.includes("T")) {
    return date.replace("T", " ").substring(0, 19);
  } else {
    const d = new Date(date);
    return d.toISOString().replace("T", " ").substring(0, 19);
  }
}
