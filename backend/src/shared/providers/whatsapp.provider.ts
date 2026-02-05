import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * WhatsApp Provider
 *
 * Generates WhatsApp click-to-chat links for sharing events, tickets,
 * and contacting support. Uses wa.me links which don't require
 * WhatsApp Business API.
 */

export interface WhatsAppShareLink {
  url: string;
  message: string;
}

@Injectable()
export class WhatsAppProvider {
  private readonly baseUrl = 'https://wa.me';
  private readonly supportPhone: string;
  private readonly appUrl: string;

  constructor(private configService: ConfigService) {
    this.supportPhone = this.configService.get<string>('WHATSAPP_SUPPORT_PHONE') || '';
    this.appUrl = this.configService.get<string>('APP_URL') || 'https://passaddis.com';
  }

  /**
   * Generate WhatsApp share link for an event
   */
  generateEventShareLink(
    eventTitle: string,
    eventDate: Date,
    eventVenue: string,
    eventId: string,
  ): WhatsAppShareLink {
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const message = `Check out this event on PassAddis!\n\n` +
      `*${eventTitle}*\n` +
      `📅 ${formattedDate}\n` +
      `📍 ${eventVenue}\n\n` +
      `Get your tickets here: ${this.appUrl}/events/${eventId}`;

    return {
      url: `${this.baseUrl}/?text=${encodeURIComponent(message)}`,
      message,
    };
  }

  /**
   * Generate WhatsApp share link for a ticket
   */
  generateTicketShareLink(
    eventTitle: string,
    eventDate: Date,
    ticketType: string,
  ): WhatsAppShareLink {
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const message = `I'm going to *${eventTitle}*! 🎉\n\n` +
      `📅 ${formattedDate}\n` +
      `🎫 ${ticketType} ticket\n\n` +
      `Get your tickets on PassAddis: ${this.appUrl}`;

    return {
      url: `${this.baseUrl}/?text=${encodeURIComponent(message)}`,
      message,
    };
  }

  /**
   * Generate WhatsApp link to send ticket details to someone
   */
  generateTicketSendLink(
    recipientPhone: string,
    eventTitle: string,
    eventDate: Date,
    ticketCode: string,
  ): WhatsAppShareLink {
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const message = `Your ticket for *${eventTitle}*\n\n` +
      `📅 ${formattedDate}\n` +
      `🎫 Ticket Code: ${ticketCode}\n\n` +
      `Show this code at the entrance. Enjoy the event!`;

    const formattedPhone = this.formatPhone(recipientPhone);
    return {
      url: `${this.baseUrl}/${formattedPhone}?text=${encodeURIComponent(message)}`,
      message,
    };
  }

  /**
   * Generate WhatsApp support contact link
   */
  generateSupportLink(
    subject?: string,
    orderId?: string,
  ): WhatsAppShareLink {
    let message = `Hi PassAddis Support,\n\n`;

    if (subject) {
      message += `Subject: ${subject}\n`;
    }

    if (orderId) {
      message += `Order ID: ${orderId}\n`;
    }

    message += `\nI need help with...`;

    if (!this.supportPhone) {
      return {
        url: '',
        message: 'Support phone not configured',
      };
    }

    return {
      url: `${this.baseUrl}/${this.supportPhone}?text=${encodeURIComponent(message)}`,
      message,
    };
  }

  /**
   * Generate event reminder link to share on WhatsApp
   */
  generateEventReminderLink(
    eventTitle: string,
    eventDate: Date,
    eventVenue: string,
    eventId: string,
    daysUntilEvent: number,
  ): WhatsAppShareLink {
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let timeText = '';
    if (daysUntilEvent === 0) {
      timeText = "TODAY";
    } else if (daysUntilEvent === 1) {
      timeText = "TOMORROW";
    } else {
      timeText = `in ${daysUntilEvent} days`;
    }

    const message = `🔔 Reminder: *${eventTitle}* is ${timeText}!\n\n` +
      `📅 ${formattedDate}\n` +
      `📍 ${eventVenue}\n\n` +
      `Event details: ${this.appUrl}/events/${eventId}`;

    return {
      url: `${this.baseUrl}/?text=${encodeURIComponent(message)}`,
      message,
    };
  }

  /**
   * Format phone number for WhatsApp
   * Removes spaces, dashes, and leading zeros for Ethiopian numbers
   */
  private formatPhone(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Remove leading +
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    // If starts with 0, replace with 251 (Ethiopia)
    if (cleaned.startsWith('0')) {
      cleaned = '251' + cleaned.substring(1);
    }

    // If 9 digits starting with 9, add 251
    if (cleaned.length === 9 && cleaned.startsWith('9')) {
      cleaned = '251' + cleaned;
    }

    return cleaned;
  }
}
