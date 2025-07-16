import OptimizedImage from "@/components/OptimizedImage";

export default function ImageTest() {
  const testImages = [
    "/Butterscoch-Fudge-Cake.jpg",
    "/Marble-Cake-1.jpg",
    "/Mocha-Chocolate-Cake.jpg",
    "/default-cake.png",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Test Page</h1>
      <div className="grid grid-cols-2 gap-4">
        {testImages.map((src, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="h-64 relative">
              <OptimizedImage
                src={src}
                alt={`Test image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">Source: {src}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
