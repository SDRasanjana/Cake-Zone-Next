// Test script for the notification system
// This script tests the notification API endpoints

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

console.log('🧪 NOTIFICATION SYSTEM TEST');
console.log('===========================');

async function testNotificationAPI() {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    try {
        console.log('Testing notification API endpoints...\n');

        // Test 1: Create a promotional notification
        console.log('1️⃣ Testing notification creation...');
        const createResponse = await fetch(`${baseUrl}/api/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'promotional_alert',
                title: 'Test Promotional Alert',
                message: 'Get 20% off on all birthday cakes this weekend!',
                targetAudience: 'customers',
                priority: 'high',
                createdBy: 'admin@cakezone.com',
                metadata: {
                    actionUrl: '/menu',
                    actionText: 'Shop Now'
                }
            }),
        });

        const createResult = await createResponse.json();
        console.log('Create notification result:', createResult);

        if (createResult.success) {
            console.log('✅ Notification created successfully!');
            const notificationId = createResult.notificationId;

            // Test 2: Fetch notifications for admin
            console.log('\n2️⃣ Testing admin notification fetch...');
            const adminResponse = await fetch(`${baseUrl}/api/notifications?admin=true`);
            const adminResult = await adminResponse.json();
            console.log('Admin notifications:', {
                success: adminResult.success,
                count: adminResult.notifications?.length || 0,
                stats: adminResult.stats
            });

            if (adminResult.success) {
                console.log('✅ Admin can fetch notifications!');
            }

            // Test 3: Fetch notifications for customer
            console.log('\n3️⃣ Testing customer notification fetch...');
            const customerResponse = await fetch(`${baseUrl}/api/notifications?userId=test-customer&userRole=customer`);
            const customerResult = await customerResponse.json();
            console.log('Customer notifications:', {
                success: customerResult.success,
                count: customerResult.notifications?.length || 0
            });

            if (customerResult.success) {
                console.log('✅ Customer can fetch notifications!');
            }

            // Test 4: Mark notification as read
            console.log('\n4️⃣ Testing mark as read...');
            const markReadResponse = await fetch(`${baseUrl}/api/notifications`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    notificationId: notificationId,
                    userId: 'test-customer',
                    action: 'markAsRead'
                }),
            });

            const markReadResult = await markReadResponse.json();
            console.log('Mark as read result:', markReadResult);

            if (markReadResult.success) {
                console.log('✅ Notification marked as read!');
            }

            console.log('\n🎉 All notification API tests completed!');
            console.log('\nNext steps:');
            console.log('1. Open admin dashboard at /dashboards/admin');
            console.log('2. Go to Notifications tab');
            console.log('3. Create a new promotional notification');
            console.log('4. Check customer dashboard at /dashboards/customer');
            console.log('5. Verify notification appears in customer notifications');

        } else {
            console.log('❌ Failed to create notification:', createResult.error);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testNotificationAPI();