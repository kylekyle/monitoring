declare module '@kensingtontech/monitoring' {

  export interface MonitoringOptions {
    iframes?: boolean;
    existing?: boolean;
  }

  export function monitoring(target: HTMLElement, options?: MonitoringOptions): Monitoring;

  export interface Monitoring {

    added(selector: string, callback?: (element: HTMLElement, entry: unknown) => boolean | void ): RemoveMonitor;

    removed(selector: string, callback?: (element: HTMLElement, entry: unknown) => boolean | void ): RemoveMonitor;

    appeared(selector: string, callback?: (element: HTMLElement, entry: IntersectionObserverEntry) => boolean | void ): RemoveMonitor;

    disappeared(selector: string, callback?: (element: HTMLElement, entry: IntersectionObserverEntry) => boolean | void ): RemoveMonitor;

    resized(selector: string, callback?: (element: HTMLElement, entry: ResizeObserverEntry) => boolean | void ): RemoveMonitor;

    cancel();

  }


  export interface RemoveMonitor {
    cancel(): void;
  }

  export default monitoring;

}
