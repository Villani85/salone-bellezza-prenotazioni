/**
 * Structured logging utility
 * In production, this can be extended to send logs to external services
 */

type LogLevel = "info" | "warn" | "error" | "debug"

interface LogContext {
  [key: string]: any
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ""
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      console.log(this.formatMessage("info", message, context))
    }
    // In production, you could send to a logging service
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage("warn", message, context))
    // In production, you could send to a logging service
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage("error", message, context))
    // In production, you could send to a logging service like Sentry, LogRocket, etc.
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.formatMessage("debug", message, context))
    }
  }
}

export const logger = new Logger()

