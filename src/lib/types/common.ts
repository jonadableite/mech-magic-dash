/**
 * Common Types
 * Shared types across the application following SOLID principles
 */

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export type PromiseValue<T> = T extends Promise<infer U> ? U : T;

export type FunctionType<T extends (...args: any[]) => any> = T;

export type ConstructorType<T = {}> = new (...args: any[]) => T;

export type ClassType<T = {}> = ConstructorType<T>;

export type InstanceType<T extends ClassType> =
  T extends ClassType<infer U> ? U : never;

export type MethodNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export type PropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export type AsyncFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

export type SyncFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => ReturnType<T>;

export type EventHandler<T = any> = (event: T) => void | Promise<void>;

export type ErrorHandler = (error: Error) => void | Promise<void>;

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type PaginationResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type SortParams = {
  field: string;
  direction: "asc" | "desc";
};

export type FilterParams = {
  [key: string]: any;
};

export type SearchParams = {
  query?: string;
  fields?: string[];
};

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export type ApiError = {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
};

export type ServiceResult<T = any> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

export type RepositoryResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type UseCaseResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ControllerResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};
