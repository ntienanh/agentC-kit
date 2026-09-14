declare module 'ogl' {
  export interface RendererOptions {
    canvas?: HTMLCanvasElement;
    width?: number;
    height?: number;
    dpr?: number;
    alpha?: boolean;
    depth?: boolean;
    stencil?: boolean;
    antialias?: boolean;
    premultipliedAlpha?: boolean;
    preserveDrawingBuffer?: boolean;
    powerPreference?: string;
    autoClear?: boolean;
    webgl?: number;
  }

  export class Renderer {
    constructor(options?: RendererOptions);
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    setSize(width: number, height: number): void;
    render(options: { scene: Mesh; camera?: unknown }): void;
  }
  export class Program {
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, options?: Record<string, unknown>);
    uniforms: Record<string, { value: unknown }>;
  }
  export class Mesh {
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, options?: Record<string, unknown>);
    program: Program;
    geometry: unknown;
    setParent(parent: unknown): void;
  }
  export class Color {
    constructor(...args: Array<number | string>);
    r: number;
    g: number;
    b: number;
    set(...args: Array<number | string>): void;
  }
  export class Triangle {
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, options?: Record<string, unknown>);
    attributes: Record<string, unknown>;
  }
}

declare module 'gsap' {
  export interface GsapTimeline {
    fromTo(target: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown>): unknown;
    kill(): void;
  }
  export interface GsapContext {
    (callback: (self: unknown) => void, scope?: unknown): { revert: () => void };
  }
  export interface GsapStatic {
    context: GsapContext;
    fromTo(target: unknown, fromVars: Record<string, unknown>, toVars: Record<string, unknown>): unknown;
    to(target: unknown, vars: Record<string, unknown>): unknown;
    set(target: unknown, vars: Record<string, unknown>): unknown;
    timeline(options?: Record<string, unknown>): GsapTimeline;
  }
  export const gsap: GsapStatic;
  const defaultExport: GsapStatic;
  export default defaultExport;
}
