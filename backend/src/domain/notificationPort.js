class NotificationPort {
  async sendOrderConfirmation(clientEmail, orderDetails) {
    throw new Error("Method not implemented");
  }

  async sendNewOrderNotification(adminEmail, orderDetails) {
    throw new Error("Method not implemented");
  }
}

module.exports = NotificationPort;
