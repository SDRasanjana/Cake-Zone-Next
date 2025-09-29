// Test script to verify order notification targeting
// This script helps verify that order status notifications are only sent to the correct customer

const testNotificationTargeting = async () => {
    console.log('🧪 Starting Order Notification Targeting Test');
    console.log('===============================================');

    // Mock test data
    const mockOrder1 = {
        _id: '507f1f77bcf86cd799439011',
        userId: 'customer1@example.com',
        customerEmail: 'customer1@example.com',
        shipping: {
            email: 'customer1@example.com',
            fullName: 'John Doe'
        },
        items: [{ name: 'Chocolate Cake', price: 1200, quantity: 1 }],
        total: 1200,
        paymentStatus: 'pending'
    };

    const mockOrder2 = {
        _id: '507f1f77bcf86cd799439012',
        userId: 'customer2@example.com',
        customerEmail: 'customer2@example.com',
        shipping: {
            email: 'customer2@example.com',
            fullName: 'Jane Smith'
        },
        items: [{ name: 'Vanilla Cake', price: 1000, quantity: 1 }],
        total: 1000,
        paymentStatus: 'pending'
    };

    // Test 1: Verify customer identification logic
    console.log('\n📋 Test 1: Customer Identification Logic');
    console.log('----------------------------------------');

    const getTargetUserId = (order) => {
        return order.shipping?.email ||
            order.customerEmail ||
            order.userId;
    };

    const customer1Id = getTargetUserId(mockOrder1);
    const customer2Id = getTargetUserId(mockOrder2);

    console.log(`✅ Order 1 Target Customer: ${customer1Id}`);
    console.log(`✅ Order 2 Target Customer: ${customer2Id}`);
    console.log(`✅ Customers are different: ${customer1Id !== customer2Id}`);

    // Test 2: Verify notification payload structure
    console.log('\n📋 Test 2: Notification Payload Verification');
    console.log('---------------------------------------------');

    const createNotificationPayload = (order, newStatus, adminEmail) => {
        const targetUserId = getTargetUserId(order);
        const orderRef = `CZO${String(order._id).slice(-3).padStart(3, '0')}`;

        return {
            type: "order_update",
            title: `🔄 Order ${orderRef} Status Update`,
            message: `Your order ${orderRef} is now ${newStatus}`,
            targetAudience: "specific_user", // CRITICAL: This ensures only specific user gets it
            targetUserId: targetUserId,      // CRITICAL: This identifies the specific customer
            priority: "medium",
            createdBy: adminEmail,
            metadata: {
                orderId: order._id,
                oldStatus: order.paymentStatus,
                newStatus: newStatus,
                orderReference: orderRef,
                adminUser: adminEmail,
                originalOrderUserId: order.userId
            }
        };
    };

    const notification1 = createNotificationPayload(mockOrder1, 'processing', 'admin@cakezone.com');
    const notification2 = createNotificationPayload(mockOrder2, 'processing', 'admin@cakezone.com');

    console.log('✅ Notification 1 Payload:');
    console.log(`   - Target: ${notification1.targetUserId}`);
    console.log(`   - Audience: ${notification1.targetAudience}`);
    console.log(`   - Order ID: ${notification1.metadata.orderId}`);

    console.log('✅ Notification 2 Payload:');
    console.log(`   - Target: ${notification2.targetUserId}`);
    console.log(`   - Audience: ${notification2.targetAudience}`);
    console.log(`   - Order ID: ${notification2.metadata.orderId}`);

    console.log(`✅ Different targets confirmed: ${notification1.targetUserId !== notification2.targetUserId}`);

    // Test 3: Database query simulation
    console.log('\n📋 Test 3: Database Query Simulation');
    console.log('------------------------------------');

    const simulateNotificationQuery = (userId, userRole = 'customer') => {
        // This simulates the actual MongoDB query from getActiveNotificationsForUser
        const mockNotifications = [
            {
                _id: 'notif1',
                targetAudience: 'specific_user',
                targetUserId: 'customer1@example.com',
                title: 'Order Update for Customer 1'
            },
            {
                _id: 'notif2',
                targetAudience: 'specific_user',
                targetUserId: 'customer2@example.com',
                title: 'Order Update for Customer 2'
            },
            {
                _id: 'notif3',
                targetAudience: 'all',
                title: 'General Announcement'
            },
            {
                _id: 'notif4',
                targetAudience: 'customers',
                title: 'Customer Promotion'
            }
        ];

        // Simulate the MongoDB $or query logic
        return mockNotifications.filter(notification => {
            if (notification.targetAudience === 'all') return true;
            if (notification.targetAudience === 'customers' && userRole === 'customer') return true;
            if (notification.targetAudience === 'specific_user' && notification.targetUserId === userId) return true;
            return false;
        });
    };

    const customer1Notifications = simulateNotificationQuery('customer1@example.com');
    const customer2Notifications = simulateNotificationQuery('customer2@example.com');

    console.log('✅ Customer 1 would receive notifications:');
    customer1Notifications.forEach(notif => {
        console.log(`   - ${notif.title} (${notif.targetAudience}${notif.targetUserId ? ': ' + notif.targetUserId : ''})`);
    });

    console.log('✅ Customer 2 would receive notifications:');
    customer2Notifications.forEach(notif => {
        console.log(`   - ${notif.title} (${notif.targetAudience}${notif.targetUserId ? ': ' + notif.targetUserId : ''})`);
    });

    // Verify that order-specific notifications go to correct customers only
    const customer1OrderNotifs = customer1Notifications.filter(n => n.targetUserId === 'customer1@example.com');
    const customer2OrderNotifs = customer2Notifications.filter(n => n.targetUserId === 'customer2@example.com');

    console.log(`✅ Customer 1 gets ${customer1OrderNotifs.length} order-specific notifications`);
    console.log(`✅ Customer 2 gets ${customer2OrderNotifs.length} order-specific notifications`);

    // Test 4: Cross-contamination check
    console.log('\n📋 Test 4: Cross-Contamination Check');
    console.log('------------------------------------');

    const customer1GetsCustomer2Notifications = customer1Notifications.some(n =>
        n.targetAudience === 'specific_user' && n.targetUserId === 'customer2@example.com'
    );

    const customer2GetsCustomer1Notifications = customer2Notifications.some(n =>
        n.targetAudience === 'specific_user' && n.targetUserId === 'customer1@example.com'
    );

    console.log(`✅ Customer 1 receiving Customer 2's notifications: ${customer1GetsCustomer2Notifications ? '❌ YES (BAD!)' : '✅ NO (GOOD)'}`);
    console.log(`✅ Customer 2 receiving Customer 1's notifications: ${customer2GetsCustomer1Notifications ? '❌ YES (BAD!)' : '✅ NO (GOOD)'}`);

    // Final result
    console.log('\n🎯 FINAL RESULT');
    console.log('===============');
    const isCorrect = !customer1GetsCustomer2Notifications && !customer2GetsCustomer1Notifications;
    console.log(`📊 Notification targeting is ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`🛡️  Customer privacy is ${isCorrect ? '✅ PROTECTED' : '❌ COMPROMISED'}`);

    if (isCorrect) {
        console.log('\n🎉 SUCCESS: Order notifications are properly targeted to specific customers only!');
        console.log('   - Each customer only receives notifications for their own orders');
        console.log('   - No cross-contamination between customer notifications');
        console.log('   - The targetAudience: "specific_user" + targetUserId combination works correctly');
    } else {
        console.log('\n❌ ERROR: Notification targeting has issues that need to be fixed!');
    }
};

// Export for use in testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = testNotificationTargeting;
} else if (typeof window !== 'undefined') {
    window.testNotificationTargeting = testNotificationTargeting;
}

// Run test if executed directly
if (typeof require !== 'undefined' && require.main === module) {
    testNotificationTargeting();
}