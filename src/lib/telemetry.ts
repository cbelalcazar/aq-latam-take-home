export interface TelemetryEvent {
  step: string;
  latencyMs: number;
  model?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export class Telemetry {
  public static log(event: TelemetryEvent) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event
    };
    
    // In production, this would go to a logging service (Datadog, Axiom, etc.)
    console.log(JSON.stringify(logEntry));
  }

  public static async measure<T>(
    step: string, 
    fn: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      
      this.log({
        step,
        latencyMs: Math.round(end - start),
        success: true,
        metadata
      });
      
      return result;
    } catch (error: any) {
      const end = performance.now();
      this.log({
        step,
        latencyMs: Math.round(end - start),
        success: false,
        error: error.message,
        metadata
      });
      throw error;
    }
  }
}
