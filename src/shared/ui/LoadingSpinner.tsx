import { Html } from "@react-three/drei";

interface LoadingSpinnerProps {
  message?: string;
}

/**
 * 3D Canvas 내부에서 사용하는 로딩 스피너
 * React Three Fiber의 Suspense fallback으로 사용
 */
export function CanvasLoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </Html>
  );
}

/**
 * 일반 DOM에서 사용하는 로딩 스피너
 */
export function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-xl font-medium text-gray-700">{message}</p>
    </div>
  );
}
