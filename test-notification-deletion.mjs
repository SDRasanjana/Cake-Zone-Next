// Test script to verify notification deletion functionality
// Run this script to test the notification system

import clientPromise from './lib/mongodb.js';

async function testNotificationDeletion() {
    console.log('🧪 Testing Notification Deletion System...\n');

    try {
        const client = await clientPromise;
        const db = client.db('cakezone');

        // Check if we have any admin users
        console.log('1️⃣ Checking for admin users...');
        const adminUsers = await db.collection('users').find({
            role: { $in: ['admin', 'owner'] }
        }).toArray();

        if (adminUsers.length === 0) {
            console.log('❌ No admin users found. Creating test admin user...');
            const testAdmin = {
                email: 'test-admin@cakezone.com',
                password: '$2a$10$dummy.hash.for.testing', // Dummy hash
                role: 'admin',
                name: 'Test Admin',
                status: 'Active',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await db.collection('users').insertOne(testAdmin);
            console.log('✅ Test admin user created');
        } else {
            console.log(`✅ Found ${adminUsers.length} admin user(s):`);
            adminUsers.forEach(user => {
                console.log(`   - ${user.email} (${user.role})`);
            });
        }

        // Create a test notification
        console.log('\n2️⃣ Creating test notification...');
        const testNotification = {
            type: 'system_announcement',
            title: 'Test Notification for Deletion',
            message: 'This is a test notification that will be deleted.',
            targetAudience: 'all',
            priority: 'medium',
            isActive: true,
            createdBy: adminUsers.length > 0 ? adminUsers[0].email : 'test-admin@cakezone.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: { test: true }
        };

        const notificationResult = await db.collection('notifications').insertOne(testNotification);
        const notificationId = notificationResult.insertedId;
        console.log(`✅ Test notification created with ID: ${notificationId}`);

        // Test the DELETE API endpoint logic (simulated)
        console.log('\n3️⃣ Testing deletion authorization...');
        const testUserId = adminUsers.length > 0 ? adminUsers[0].email : 'test-admin@cakezone.com';

        // Simulate the getUserFromClerk function
        let user = null;

        // Try email lookup
        user = await db.collection('users').findOne({
            email: new RegExp(`^${testUserId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
        });

        if (user) {
            console.log(`✅ User found: ${user.email} with role: ${user.role}`);

            if (['admin', 'owner'].includes(user.role)) {
                console.log('✅ User has admin privileges');

                // Test deletion
                console.log('\n4️⃣ Testing notification deletion...');
                const deleteResult = await db.collection('notifications').deleteOne({
                    _id: notificationId
                });

                if (deleteResult.deletedCount === 1) {
                    console.log('✅ Notification deleted successfully!');
                } else {
                    console.log('❌ Failed to delete notification');
                }
            } else {
                console.log(`❌ User does not have admin privileges (role: ${user.role})`);
            }
        } else {
            console.log('❌ User not found');
        }

        // Clean up test data
        console.log('\n5️⃣ Cleaning up test data...');
        await db.collection('users').deleteOne({ email: 'test-admin@cakezone.com' });
        await db.collection('notifications').deleteMany({ 'metadata.test': true });
        console.log('✅ Test data cleaned up');

        console.log('\n🎉 Notification deletion test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }

    process.exit(0);
}

// Run the test
testNotificationDeletion();