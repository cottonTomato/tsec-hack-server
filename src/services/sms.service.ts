import twilio from 'twilio';
import { twilioKey, twilioAccountSid } from '../common/config';

let client: undefined | twilio.Twilio;

export function getTwilioClient() {
  if (!client) {
    client = twilio(twilioAccountSid, twilioKey);
  }
  return client;
}
