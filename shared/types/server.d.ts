
export interface ActivityEntry {
  timestamp?: Date;
  source?: string;
  component?: string;
  event?: string;
  eventValue?: any;
  level?: string;
  data?: Record<string, any>;
  req?: any;
  username?: string;
  user_id?: string;
  elapsed?: number;
}

// provided by RivServer to api functions as req
export interface RivRequest {
  id: string;
  user?: any;  // user object if available
  ip?: string; // user IP address if available
}

export type ConsoleLogMethod = (...args: any[]) => void;
