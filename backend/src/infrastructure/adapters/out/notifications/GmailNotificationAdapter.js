const nodemailer = require("nodemailer");

class GmailNotificationAdapter {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendOrderConfirmation(clientEmail, orderDetails) {
    const itemsList = orderDetails.items
      .map((item) => `<li>${item.nombre} - $${item.precio}</li>`)
      .join("");

    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: clientEmail,
      subject: `Pedido #${orderDetails.id} - Pendiente de Pago`,
      html: `
        <h2>Gracias por tu compra</h2>
        <p>Tu pedido está <strong>pendiente de pago</strong>.</p>
        <h3>Desglose:</h3>
        <ul>${itemsList}</ul>
        <p><strong>Total: $${orderDetails.total}</strong></p>
        <h3>Instrucciones de pago:</h3>
        <p>${orderDetails.paymentInstructions}</p>
      `,
    });
  }

  async sendNewOrderNotification(adminEmail, orderDetails) {
    await this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: adminEmail,
      subject: `Nuevo pedido #${orderDetails.id}`,
      html: `
        <h2>Nuevo pedido recibido</h2>
        <p>Cliente: ${orderDetails.clientName} (${orderDetails.clientEmail})</p>
        <p>Total: $${orderDetails.total}</p>
        <p>Estado: Pendiente de Pago</p>
      `,
    });
  }
}

module.exports = GmailNotificationAdapter;
