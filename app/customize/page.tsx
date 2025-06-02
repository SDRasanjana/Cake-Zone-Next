import React from 'react';
import CakeCustomizationForm from '../../components/CakeCustomizationForm'; // Adjust path as necessary

const CustomizeCakePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 py-8 px-4 flex flex-col items-center justify-center">
      <main className="w-full">
        <CakeCustomizationForm />
      </main>
    </div>
  );
};

export default CustomizeCakePage;
