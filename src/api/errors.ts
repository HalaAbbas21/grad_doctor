import axios from "axios";

export interface ApiError {
  status: number; // 0 = network failure / timeout
  message: string; // Arabic, safe to display
  fieldErrors?: Record<string, string[]>;
  raw?: unknown;
}

const STATUS_MESSAGE: Record<number, string> = {
  0: "تعذّر الاتصال بالخادم",
  401: "انتهت الجلسة، سجّل الدخول مجدداً",
  403: "لا تملك صلاحية لهذا الإجراء",
  404: "العنصر المطلوب غير موجود",
};

const GENERIC_5XX = "خطأ في الخادم، حاول لاحقاً";
const GENERIC_422 = "تحقق من البيانات المُدخلة";
const GENERIC_FALLBACK = "حدث خطأ غير متوقع";

/**
 * Never throws — this is the last line of defense before an error reaches the UI.
 * TODO(api-contract): 422 shape unverified; assumed Laravel's { message, errors: { field: [msg] } }.
 */
export function toApiError(err: unknown): ApiError {
  try {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 0;
      const body = err.response?.data as unknown;

      if (status === 0) {
        return { status: 0, message: STATUS_MESSAGE[0], raw: err };
      }

      if (status === 422) {
        const data = body as { message?: unknown; errors?: unknown } | undefined;
        const fieldErrors =
          data && typeof data.errors === "object" && data.errors !== null
            ? (data.errors as Record<string, string[]>)
            : undefined;
        const message =
          (data && typeof data.message === "string" && data.message) || GENERIC_422;
        return { status, message, fieldErrors, raw: err };
      }

      if (status >= 500) {
        return { status, message: GENERIC_5XX, raw: err };
      }

      if (STATUS_MESSAGE[status]) {
        return { status, message: STATUS_MESSAGE[status], raw: err };
      }

      const data = body as { message?: unknown } | undefined;
      const message = (data && typeof data.message === "string" && data.message) || GENERIC_FALLBACK;
      return { status, message, raw: err };
    }

    if (err instanceof Error) {
      return { status: 0, message: STATUS_MESSAGE[0], raw: err };
    }

    return { status: 0, message: GENERIC_FALLBACK, raw: err };
  } catch {
    return { status: 0, message: GENERIC_FALLBACK, raw: err };
  }
}
