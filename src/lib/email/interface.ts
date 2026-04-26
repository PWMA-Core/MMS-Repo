export interface EmailSendParams {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailSendResult {
  id: string
}

export interface EmailProvider {
  send(params: EmailSendParams): Promise<EmailSendResult>
}
