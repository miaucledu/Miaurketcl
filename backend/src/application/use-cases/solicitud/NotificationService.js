class NotificationService {
  constructor(notificationPort) {
    this.notificationPort = notificationPort;
  }

  async notifyOrderCreated(orderDetails) {
    await this.notificationPort.sendOrderConfirmation(
      orderDetails.clientEmail,
      orderDetails
    );
    await this.notificationPort.sendNewOrderNotification(
      process.env.ADMIN_EMAIL || "admin@example.com",
      orderDetails
    );
  }
}

module.exports = NotificationService;
