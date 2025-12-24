"use server"

import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"
import type { EmailLog, Booking, Customer } from "@/types"
import { logger } from "@/lib/logger"

// ReSend API configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_API_URL = "https://api.resend.com/emails"

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

/**
 * Send email using ReSend API
 */
async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    logger.warn("ReSend API key not configured, email not sent", { to: options.to, subject: options.subject })
    // In development, just log the email
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email (dev mode):", {
        to: options.to,
        subject: options.subject,
        html: options.html.substring(0, 200) + "...",
      })
      return { success: true, messageId: "dev-mode" }
    }
    return { success: false, error: "Email service not configured" }
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: options.from || process.env.EMAIL_FROM || "Salone <noreply@salone.it>",
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      logger.error("ReSend API error", { error: data, to: options.to })
      return { success: false, error: data.message || "Failed to send email" }
    }

    logger.info("Email sent successfully", { to: options.to, messageId: data.id })
    return { success: true, messageId: data.id }
  } catch (error: any) {
    logger.error("Error sending email", { error: error.message || error, to: options.to })
    return { success: false, error: error.message || "Failed to send email" }
  }
}

/**
 * Log email to database
 */
async function logEmail(
  options: { to: string; subject: string; template: string; bookingId?: string; customerId?: string },
  result: { success: boolean; messageId?: string; error?: string }
): Promise<void> {
  try {
    const emailLog: Omit<EmailLog, "id"> = {
      to: options.to,
      subject: options.subject,
      template: options.template,
      bookingId: options.bookingId,
      customerId: options.customerId,
      sentAt: new Date().toISOString(),
      status: result.success ? "sent" : result.error ? "failed" : "pending",
      error: result.error,
    }

    await addDoc(collection(db, "emailLogs"), emailLog)
  } catch (error: any) {
    logger.error("Error logging email", { error: error.message || error })
  }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  booking: Booking,
  customer: Customer
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    const subject = "Prenotazione confermata - " + booking.serviceName
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Prenotazione Confermata</h1>
            </div>
            <div class="content">
              <p>Ciao ${customer.firstName},</p>
              <p>La tua prenotazione è stata <strong>confermata</strong>!</p>
              
              <div class="info-box">
                <h3>Dettagli Prenotazione</h3>
                <p><strong>Servizio:</strong> ${booking.serviceName}</p>
                <p><strong>Data:</strong> ${new Date(booking.date).toLocaleDateString("it-IT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <p><strong>Orario:</strong> ${booking.startTime} - ${booking.endTime}</p>
                ${booking.servicePrice ? `<p><strong>Prezzo:</strong> €${booking.servicePrice.toFixed(2)}</p>` : ""}
              </div>
              
              <p>Ti aspettiamo!</p>
              
              <div class="footer">
                <p>Salone di Bellezza</p>
                <p>Questa è una email automatica, non rispondere.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await sendEmail({
      to: customer.email,
      subject,
      html,
    })

    await logEmail(
      {
        to: customer.email,
        subject,
        template: "booking-confirmed",
        bookingId: booking.id,
        customerId: customer.id,
      },
      result
    )

    const duration = Date.now() - startTime
    logger.info("Booking confirmation email sent", { bookingId: booking.id, customerId: customer.id, duration })
    return result
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error sending booking confirmation email", {
      error: error.message || error,
      bookingId: booking.id,
      duration,
    })
    return { success: false, error: error.message || "Failed to send email" }
  }
}

/**
 * Send booking rejection email
 */
export async function sendBookingRejectionEmail(
  booking: Booking,
  customer: Customer,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    const subject = "Prenotazione non disponibile - " + booking.serviceName
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f5576c; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Prenotazione non disponibile</h1>
            </div>
            <div class="content">
              <p>Ciao ${customer.firstName},</p>
              <p>Ci dispiace, ma la tua richiesta di prenotazione per il <strong>${new Date(booking.date).toLocaleDateString("it-IT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} alle ${booking.startTime}</strong> non può essere confermata.</p>
              
              ${reason ? `<div class="info-box"><p><strong>Motivo:</strong> ${reason}</p></div>` : ""}
              
              <p>Ti invitiamo a prenotare un altro appuntamento attraverso il nostro sistema di prenotazione online.</p>
              
              <div class="footer">
                <p>Salone di Bellezza</p>
                <p>Questa è una email automatica, non rispondere.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await sendEmail({
      to: customer.email,
      subject,
      html,
    })

    await logEmail(
      {
        to: customer.email,
        subject,
        template: "booking-rejected",
        bookingId: booking.id,
        customerId: customer.id,
      },
      result
    )

    const duration = Date.now() - startTime
    logger.info("Booking rejection email sent", { bookingId: booking.id, customerId: customer.id, duration })
    return result
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error sending booking rejection email", {
      error: error.message || error,
      bookingId: booking.id,
      duration,
    })
    return { success: false, error: error.message || "Failed to send email" }
  }
}

/**
 * Send alternative slots proposal email
 */
export async function sendAlternativeSlotsEmail(
  booking: Booking,
  customer: Customer,
  alternativeSlots: Array<{ date: string; startTime: string; endTime: string }>
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    const subject = "Slot alternativi disponibili - " + booking.serviceName
    const slotsHtml = alternativeSlots
      .map(
        (slot, index) => `
      <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea;">
        <strong>Opzione ${index + 1}:</strong><br>
        Data: ${new Date(slot.date).toLocaleDateString("it-IT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}<br>
        Orario: ${slot.startTime} - ${slot.endTime}
      </div>
    `
      )
      .join("")

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Slot alternativi disponibili</h1>
            </div>
            <div class="content">
              <p>Ciao ${customer.firstName},</p>
              <p>Lo slot che hai richiesto non è disponibile, ma abbiamo queste alternative per te:</p>
              
              ${slotsHtml}
              
              <p style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?redirect=/account" class="button" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">
                  Accedi alla tua area personale
                </a>
              </p>
              
              <p style="text-align: center; color: #666; font-size: 14px;">
                Accedi al tuo account per visualizzare e selezionare uno degli slot alternativi proposti.
              </p>
              
              <div class="footer">
                <p>Salone di Bellezza</p>
                <p>Questa è una email automatica, non rispondere.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await sendEmail({
      to: customer.email,
      subject,
      html,
    })

    await logEmail(
      {
        to: customer.email,
        subject,
        template: "alternative-slots",
        bookingId: booking.id,
        customerId: customer.id,
      },
      result
    )

    const duration = Date.now() - startTime
    logger.info("Alternative slots email sent", { bookingId: booking.id, slotsCount: alternativeSlots.length, duration })
    return result
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error sending alternative slots email", {
      error: error.message || error,
      bookingId: booking.id,
      duration,
    })
    return { success: false, error: error.message || "Failed to send email" }
  }
}

/**
 * Send booking reminder email (24h before)
 */
export async function sendBookingReminderEmail(
  booking: Booking,
  customer: Customer
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now()
  try {
    const subject = "Promemoria prenotazione - " + booking.serviceName
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Promemoria Prenotazione</h1>
            </div>
            <div class="content">
              <p>Ciao ${customer.firstName},</p>
              <p>Ti ricordiamo che hai una prenotazione domani:</p>
              
              <div class="info-box">
                <h3>Dettagli Prenotazione</h3>
                <p><strong>Servizio:</strong> ${booking.serviceName}</p>
                <p><strong>Data:</strong> ${new Date(booking.date).toLocaleDateString("it-IT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <p><strong>Orario:</strong> ${booking.startTime} - ${booking.endTime}</p>
              </div>
              
              <p>Ti aspettiamo!</p>
              
              <div class="footer">
                <p>Salone di Bellezza</p>
                <p>Questa è una email automatica, non rispondere.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await sendEmail({
      to: customer.email,
      subject,
      html,
    })

    await logEmail(
      {
        to: customer.email,
        subject,
        template: "booking-reminder",
        bookingId: booking.id,
        customerId: customer.id,
      },
      result
    )

    const duration = Date.now() - startTime
    logger.info("Booking reminder email sent", { bookingId: booking.id, customerId: customer.id, duration })
    return result
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error("Error sending booking reminder email", {
      error: error.message || error,
      bookingId: booking.id,
      duration,
    })
    return { success: false, error: error.message || "Failed to send email" }
  }
}

