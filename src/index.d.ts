declare module 'monitoring' {

  export interface MonitoringOptions {
    iframes?: boolean;
    existing?: boolean;
  }

  export function monitoring(target: HTMLElement, options?: MonitoringOptions): Monitoring;

  export interface Monitoring {

    added(selector: string, callback?: (e: HTMLElement) => void );

    removed(selector: string, callback?: (e: HTMLElement) => void );

    appeared(selector: string, callback?: (e: HTMLElement) => void );

    disappeared(selector: string, callback?: (e: HTMLElement) => void );

    resized(selector: string, callback?: (e: HTMLElement) => void );

  }

  export default monitoring;

}
