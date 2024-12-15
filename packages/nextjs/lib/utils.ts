// import { twMerge } from 'tailwind-merge';

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateAllocation(value: string): ValidationResult {
  const allocation = parseFloat(value);

  if (isNaN(allocation)) {
    return {
      isValid: false,
      message: "Please enter a valid number",
    };
  }

  if (allocation < 0) {
    return {
      isValid: false,
      message: "Allocation cannot be negative",
    };
  }

  if (allocation > 2) {
    return {
      isValid: false,
      message: "Maximum allocation is 2%",
    };
  }

  return { isValid: true };
}
