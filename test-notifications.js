// Test script to verify the notification functionality
// Run this with: node test-notifications.js

const testNotificationAPI = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing Notification API...\n');

  try {
    // Test 1: Fetch admin notifications
    console.log('1️⃣ Testing admin notifications fetch...');
    const adminResponse = await fetch(`${baseURL}/api/notifications?targetRole=admin&limit=10`);
    const adminData = await adminResponse.json();
    
    if (adminData.success) {
      console.log('✅ Admin notifications fetched successfully');
      console.log(`   Found ${adminData.notifications.length} notifications`);
      console.log(`   Unread count: ${adminData.pagination.unreadCount}`);
    } else {
      console.log('❌ Failed to fetch admin notifications:', adminData.error);
    }

    // Test 2: Create a test notification
    console.log('\n2️⃣ Testing notification creation...');
    const createResponse = await fetch(`${baseURL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'system',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        priority: 'medium',
        targetRole: 'admin'
      }),
    });
    
    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log('✅ Test notification created successfully');
      console.log(`   Notification ID: ${createData.notificationId}`);
    } else {
      console.log('❌ Failed to create test notification:', createData.error);
    }

    // Test 3: Test customer notifications (with a mock user ID)
    console.log('\n3️⃣ Testing customer notifications...');
    const customerResponse = await fetch(`${baseURL}/api/notifications/customer?userId=test_user_123`);
    const customerData = await customerResponse.json();
    
    if (customerData.success) {
      console.log('✅ Customer notifications fetched successfully');
      console.log(`   Found ${customerData.notifications.length} notifications`);
    } else {
      console.log('❌ Failed to fetch customer notifications:', customerData.error);
    }

    console.log('\n🎉 Notification API testing completed!');

  } catch (error) {
    console.error('❌ Error testing notification API:', error.message);
    console.log('\n💡 Make sure your Next.js development server is running on http://localhost:3000');
  }
};

// Run the test
testNotificationAPI();
