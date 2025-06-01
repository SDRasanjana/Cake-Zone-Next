"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    billingAddress: "",
    city: "",
    country: "",
    state: "",
    zipCode: "",
    creditCardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#F8F9FB] group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        {/* Main Content */}
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
            <h1 className="text-[#141C24] tracking-light text-[32px] font-bold leading-tight px-4 text-left pb-3 pt-6">
              Checkout
            </h1>

            <form onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    First Name
                  </p>
                  <input
                    name="firstName"
                    placeholder="Enter your first name"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    Last Name
                  </p>
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
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    Email Address
                  </p>
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
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    Company Name (Optional)
                  </p>
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
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    Billing Address
                  </p>
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
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    City
                  </p>
                  <input
                    name="city"
                    placeholder="Enter city"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    Country
                  </p>
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
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    State
                  </p>
                  <input
                    name="state"
                    placeholder="Enter state"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    ZIP Code
                  </p>
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
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    Credit Card Number
                  </p>
                  <div className="flex w-full flex-1 items-stretch rounded-xl">
                    <input
                      name="creditCardNumber"
                      placeholder="Enter your credit card number"
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                      value={formData.creditCardNumber}
                      onChange={handleInputChange}
                    />
                    <div className="text-[#3F5374] flex border border-[#D4DBE8] bg-[#F8F9FB] items-center justify-center pr-[15px] rounded-r-xl border-l-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                      >
                        <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z" />
                      </svg>
                    </div>
                  </div>
                </label>
              </div>

              {/* Expiry Date and CVV */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    Expiry Date
                  </p>
                  <input
                    name="expiryDate"
                    placeholder="MM/YY"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#141C24] focus:outline-0 focus:ring-0 border border-[#D4DBE8] bg-[#F8F9FB] focus:border-[#D4DBE8] h-14 placeholder:text-[#3F5374] p-[15px] text-base font-normal leading-normal"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </label>
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#141C24] text-base font-medium leading-normal pb-2">
                    CVV
                  </p>
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
                  <p className="text-[#141C24] text-lg font-bold leading-tight tracking-[-0.015em]">
                    Purchase Details
                  </p>
                  <div className="flex items-end gap-3 justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-[#3F5374] text-base font-normal leading-normal">
                        Cake
                      </p>
                      <p className="text-[#3F5374] text-base font-normal leading-normal">
                        Quantity: 1
                      </p>
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
                <p className="text-[#3F5374] text-sm font-normal leading-normal">
                  Order Total
                </p>
                <p className="text-[#141C24] text-sm font-normal leading-normal text-right">
                  $14.00
                </p>
              </div>
              <div className="flex justify-between gap-x-6 py-2">
                <p className="text-[#3F5374] text-sm font-normal leading-normal">
                  Plan Details
                </p>
                <p className="text-[#141C24] text-sm font-normal leading-normal text-right">
                  • Exclusive flavors • Custom cake designs • Express delivery
                  options
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
