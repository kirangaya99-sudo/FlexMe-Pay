declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: ConfettiOptions): Promise<null> | null;
  export default confetti;
}

declare module 'qrcode' {
  export function toDataURL(text: string, options?: any): Promise<string>;
  export function toCanvas(canvas: any, text: string, options?: any): Promise<any>;
  export function toString(text: string, options?: any): Promise<string>;
}
