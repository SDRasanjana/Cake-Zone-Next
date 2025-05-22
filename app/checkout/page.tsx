'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    billingAddress: '',
    city: '',
    country: '',
    state: '',
    zipCode: '',
    creditCardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#F8F9FB] group/design-root overflow-x-hidden" 
      style={{fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif'}}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#E4E9F1] px-10 py-3">
          <div className="flex items-center gap-4 text-[#141C24]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-[#141C24] text-lg font-bold leading-tight tracking-[-0.015em]">Cake Delight</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-[#141C24] text-sm font-medium leading-normal" href="#">Home</a>
              <a className="text-[#141C24] text-sm font-medium leading-normal" href="#">Shop</a>
              <a className="text-[#141C24] text-sm font-medium leading-normal" href="#">About Us</a>
              <a className="text-[#141C24] text-sm font-medium leading-normal" href="#">Contact</a>
            </div>
            <div className="flex gap-2">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#F4C753] text-[#141C24] text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Sign In</span>
              </button>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#E4E9F1] text-[#141C24] text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Cart</span>
              </button>
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#E4E9F1] text-[#141C24] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                <div className="text-[#141C24]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18L59.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,152,204a28,28,0,1,0,28-28H83.17a8,8,0,0,1-7.87-6.57L72.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,222.14,58.87ZM96,204a12,12,0,1,1-12-12A12,12,0,0,1,96,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,192,204Zm4-74.57A8,8,0,0,1,188.1,136H69.22L57.59,72H206.41Z" />
                  </svg>
                </div>
              </button>
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#E4E9F1] text-[#141C24] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                <div className="text-[#141C24]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
                  </svg>
                </div>
              </button>
            </div>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10">
              <Image 
                src="/api/placeholder/40/40" 
                alt="Profile" 
                width={40} 
                height={40} 
                className="rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
            <h1 className="text-[#141C24] tracking-light text-[32px] font-bold leading-tight px-4 text-left pb-3 pt-6">Checkout</h1>
            
            <form onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">First Name</p>
                  <input
                    name="firstName"
                    placeholder="Enter your first name"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">Last Name</p>
                  <input
                    name="lastName"
                    placeholder="Enter your last name"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              {/* Email */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">Email Address</p>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              {/* Company Name */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">Company Name (Optional)</p>
                  <input
                    name="companyName"
                    placeholder="Enter your company name"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              {/* Billing Address */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">Billing Address</p>
                  <input
                    name="billingAddress"
                    placeholder="Enter your billing address"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              {/* City and Country */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">City</p>
                  <input
                    name="city"
                    placeholder="Enter city"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">Country</p>
                  <input
                    name="country"
                    placeholder="Enter country"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              {/* State and ZIP */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">State</p>
                  <input
                    name="state"
                    placeholder="Enter state"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">ZIP Code</p>
                  <input
                    name="zipCode"
                    placeholder="Enter ZIP code"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              {/* Credit Card Number */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">Credit Card Number</p>
                  <div className="flex w-full flex-1 items-stretch rounded-xl">
                    <input
                      name="creditCardNumber"
                      placeholder="Enter your credit card number"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                      value={formData.creditCardNumber}
                      onChange={handleInputChange}
                    />
                    <div className="text-[#3F5374] flex border border-[#D4DBE8] bg-[#F8F9FB] items-center justify-center pr-[15px] rounded-r-xl border-l-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z" />
                      </svg>
                    </div>
                  </div>
                </label>
              </div>

              {/* Expiry Date and CVV */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">Expiry Date</p>
                  <input
                    name="expiryDate"
                    placeholder="MM/YY"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">CVV</p>
                  <input
                    name="cvv"
                    placeholder="Enter CVV"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.cvv}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex px-4 py-3">
                <button
                  type="submit"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-[#F4C753] text-[#141C24] text-base font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Checkout Now</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="layout-content-container flex flex-col w-[360px]">
            <div className="p-4">
              <div className="flex flex-col items-stretch justify-start rounded-xl shadow-[0_0_4px_rgba(0,0,0,0.1)] bg-[#F8F9FB]">
                <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl">
                  <Image 
                    src="/api/placeholder/360/200" 
                    alt="Cake" 
                    width={360} 
                    height={200} 
                    className="rounded-xl object-cover w-full aspect-video"
                  />
                </div>
                <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 px-4">
                  <p className="text-[#141C24] text-lg font-bold leading-tight tracking-[-0.015em]">Purchase Details</p>
                  <div className="flex items-end gap-3 justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-[#3F5374] text-base font-normal leading-normal">Cake</p>
                      <p className="text-[#3F5374] text-base font-normal leading-normal">Quantity: 1</p>
                    </div>
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#F4C753] text-[#141C24] text-sm font-medium leading-normal">
                      <span className="truncate">Edit Order</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between gap-x-6 py-2">
                <p className="text-[#3F5374] text-sm font-normal leading-normal">Order Total</p>
                <p className="text-[#141C24] text-sm font-normal leading-normal text-right">$14.00</p>
              </div>
              <div className="flex justify-between gap-x-6 py-2">
                <p className="text-[#3F5374] text-sm font-normal leading-normal">Plan Details</p>
                <p className="text-[#141C24] text-sm font-normal leading-normal text-right">• Exclusive flavors • Custom cake designs • Express delivery options</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-col gap-6 px-5 py-10 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a className="text-[#3F5374] text-base font-normal leading-normal min-w-40" href="#">Terms of Service</a>
            <a className="text-[#3F5374] text-base font-normal leading-normal min-w-40" href="#">Privacy Policy</a>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#">
              <div className="text-[#3F5374]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z" />
                </svg>
              </div>
            </a>
            <a href="#">
              <div className="text-[#3F5374]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z" />
                </svg>
              </div>
            </a>
            <a href="#">
              <div className="text-[#3F5374]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z" />
                </svg>
              </div>
            </a>
          </div>
          <p className="text-[#3F5374] text-base font-normal leading-normal">© 2025 Cake Delight. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}