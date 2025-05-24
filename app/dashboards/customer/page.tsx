"use client";
import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Heart, 
  Plus,
  Calendar,
  DollarSign,
  Star,
  Clock,
  Bell,
  User,
  Settings,
  LogOut,
  ChefHat,
  Palette,
  Layers,
  Sparkles
} from 'lucide-react';

type BudgetKey = '1500' | '2000' | '2000+';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCake, setSelectedCake] = useState<number | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetKey>('1500');
  const [notifications, setNotifications] = useState(3);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'customize', label: 'Customize Cake', icon: ChefHat },
    { id: 'orders', label: 'My Orders', icon: ShoppingCart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const recentOrders = [
    { id: 1, name: 'Chocolate Birthday Cake', status: 'delivered', date: '2025-05-20', price: 1450, image: '🎂' },
    { id: 2, name: 'Vanilla Wedding Cake', status: 'processing', date: '2025-05-22', price: 2200, image: '🍰' },
    { id: 3, name: 'Red Velvet Anniversary', status: 'pending', date: '2025-05-25', price: 1650, image: '❤️' },
  ];

  const budgetSuggestions = {
    '1500': [
      { id: 1, name: 'Classic Chocolate', layers: 1, price: 1200, image: '🍫', description: 'Simple chocolate cake with buttercream' },
      { id: 2, name: 'Vanilla Delight', layers: 2, price: 1350, image: '🍰', description: 'Basic vanilla sponge with cream filling' },
      { id: 3, name: 'Strawberry Simple', layers: 1, price: 1450, image: '🍓', description: 'Fresh strawberry cake with berry topping' },
    ],
    '2000': [
      { id: 4, name: 'Premium Chocolate', layers: 2, price: 1800, image: '🍫', description: 'Rich chocolate cake with ganache and decorations' },
      { id: 5, name: 'Deluxe Vanilla', layers: 3, price: 1900, image: '🍰', description: 'Multi-layer vanilla with premium frosting' },
      { id: 6, name: 'Berry Supreme', layers: 2, price: 1950, image: '🍓', description: 'Mixed berry cake with cream cheese frosting' },
    ],
    '2000+': [
      { id: 7, name: 'Luxury Chocolate Tower', layers: 4, price: 2800, image: '🍫', description: 'Premium chocolate with gold decorations' },
      { id: 8, name: 'Wedding Special', layers: 3, price: 2500, image: '🍰', description: 'Elegant multi-tier with royal icing' },
      { id: 9, name: 'Designer Fruit Cake', layers: 3, price: 2200, image: '🍓', description: 'Artisan fruit cake with handcrafted decorations' },
    ]
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">18</p>
            </div>
            <Package className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">₹1,245</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('customize')}
            className="flex items-center p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border-2 border-dashed border-pink-200 hover:border-pink-300 transition-colors group"
          >
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200">
              <Plus className="w-6 h-6 text-pink-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">Design New Cake</p>
              <p className="text-sm text-gray-500">Create custom cake</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors group">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">Schedule Order</p>
              <p className="text-sm text-gray-500">Plan ahead</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          <button 
            onClick={() => setActiveTab('orders')}
            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-2xl">
                  {order.image}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-800">{order.name}</p>
                  <p className="text-sm text-gray-500">Ordered on {order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">₹{order.price}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCustomize = () => (
    <div className="space-y-6">
      {/* Budget Categories */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose Budget Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedBudget('1500')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedBudget === '1500' 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">₹1,500</p>
              <p className="text-sm text-gray-600">Budget Category</p>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedBudget('2000')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedBudget === '2000' 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">₹2,000</p>
              <p className="text-sm text-gray-600">Budget Category</p>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedBudget('2000+')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedBudget === '2000+' 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <p className="text-2xl font-bold">₹2,000+</p>
              <p className="text-sm text-gray-600">Premium Category</p>
            </div>
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">AI Budget Suggestions for ₹{selectedBudget}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {budgetSuggestions[selectedBudget].map((cake) => (
            <div 
              key={cake.id} 
              className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedCake === cake.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedCake(cake.id)}
            >
              <div className="text-4xl mb-3 text-center">{cake.image}</div>
              <h4 className="font-semibold text-gray-800 mb-2">{cake.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{cake.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Layers className="w-4 h-4 mr-1" />
                  {cake.layers} layers
                </div>
                <span className="font-bold text-orange-600">₹{cake.price}</span>
              </div>
              {selectedCake === cake.id && (
                <button className="w-full mt-3 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Customize Further
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Customization Form */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customize Your Cake</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flavor</label>
            <label htmlFor="flavor-select" className="block text-sm font-medium text-gray-700 mb-2">Flavor</label>
            <select
              id="flavor-select"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              aria-label="Flavor"
            >
              <option>Chocolate</option>
              <option>Vanilla</option>
              <option>Strawberry</option>
              <option>Red Velvet</option>
              <option>Lemon</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layers</label>
            <label htmlFor="layers-select" className="block text-sm font-medium text-gray-700 mb-2">Layers</label>
            <select
              id="layers-select"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              aria-label="Layers"
            >
              <option>1 Layer</option>
              <option>2 Layers</option>
              <option>3 Layers</option>
              <option>4+ Layers</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frosting Color</label>
            <div className="flex space-x-2">
              {['bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-white'].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full ${color} border-2 border-gray-300 hover:scale-110 transition-transform`}
                  title={color.replace('bg-', '').replace('-400', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                ></button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Toppings</label>
            <div className="space-y-2">
              {['Fresh Berries', 'Chocolate Chips', 'Sprinkles', 'Nuts', 'Edible Flowers'].map((topping) => (
                <label key={topping} className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                  <span className="ml-2 text-sm text-gray-700">{topping}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
            Generate 3D Preview
          </button>
          <button className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">My Orders</h3>
      <div className="space-y-4">
        {recentOrders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl mr-4">
                  {order.image}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{order.name}</h4>
                  <p className="text-sm text-gray-500">Order #CK00{order.id}</p>
                  <p className="text-sm text-gray-500">Ordered on {order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-800">₹{order.price}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors">
                Track Order
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Reorder
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Rate & Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'customize':
        return renderCustomize();
      case 'orders':
        return renderOrders();
      case 'notifications':
        return (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600 mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Order Update</p>
                  <p className="text-sm text-gray-600">Your Chocolate Birthday Cake has been delivered!</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-green-50 rounded-lg">
                <Bell className="w-5 h-5 text-green-600 mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Special Offer</p>
                  <p className="text-sm text-gray-600">Get 20% off on your next order above ₹2000</p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
                <Bell className="w-5 h-5 text-yellow-600 mt-1 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Reminder</p>
                  <p className="text-sm text-gray-600">Don't forget to rate your last order</p>
                  <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="bg-white rounded-xl shadow-sm border p-6">Content for {activeTab}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍰</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Cake Delight</h1>
                <p className="text-sm text-gray-500">Customer Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-orange-600" />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JD</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Premium Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r min-h-screen hidden lg:block">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-600'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                      {item.id === 'notifications' && notifications > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notifications}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-10">
          <div className="flex justify-around py-2">
            {sidebarItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center p-2 ${
                    activeTab === item.id ? 'text-orange-600' : 'text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === 'customize' ? 'Cake Customization' : activeTab}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'overview' && 'Welcome back! Here\'s your cake ordering summary.'}
                {activeTab === 'customize' && 'Design your perfect cake with AI assistance.'}
                {activeTab === 'orders' && 'Track and manage your cake orders.'}
                {activeTab === 'notifications' && 'Stay updated with your order status and offers.'}
              </p>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;