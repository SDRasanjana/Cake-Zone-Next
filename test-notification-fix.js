// Test script to verify notification service works correctly after fix
import { createOrderNotification } from './lib/services/notificationService.js';

async function testNotificationService() {
  console.log('Testing notification service...');
  
  try {
    const testOrderData = {
      orderId: 'test-order-123',
      userId: 'test-user-456',
      customerName: 'John Doe',
      total: 2500,
      items: [
        { name: 'Chocolate Cake', quantity: 1, price: 1500 },
        { name: 'Vanilla Cake', quantity: 1, price: 1000 }
      ]
    };

    console.log('Creating order notification...');
    const result = await createOrderNotification(testOrderData);
    
    if (result.success) {
      console.log('✅ Notification created successfully!');
      console.log('Notification ID:', result.notificationId);
    } else {
      console.log('❌ Failed to create notification:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing notification service:', error);
  }
}

testNotificationService();
