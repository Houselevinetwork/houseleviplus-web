/**
 * @houselevi/security/audit-logger/audit-logger
 * DPA 2019 compliant audit logging
 */

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

export class AuditLogger {
  private logs: AuditLog[] = [];

  /**
   * Log an action (DPA 2019 compliant)
   */
  log(
    userId: string,
    action: string,
    resource: string,
    status: 'success' | 'failure',
    details?: any
  ): AuditLog {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      userId,
      action,
      resource,
      status,
      details,
    };

    this.logs.push(log);
    return log;
  }

  /**
   * Get audit logs for user
   */
  getUserLogs(userId: string): AuditLog[] {
    return this.logs.filter((log) => log.userId === userId);
  }

  /**
   * Get audit logs by action
   */
  getLogsByAction(action: string): AuditLog[] {
    return this.logs.filter((log) => log.action === action);
  }

  /**
   * Get all logs (for admin)
   */
  getAllLogs(): AuditLog[] {
    return [...this.logs];
  }

  /**
   * Get logs in date range
   */
  getLogsByDateRange(startDate: Date, endDate: Date): AuditLog[] {
    return this.logs.filter((log) => log.timestamp >= startDate && log.timestamp <= endDate);
  }
}
