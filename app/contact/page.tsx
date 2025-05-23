import Navbar from "../../components/Navbar";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="p-10 text-center">
        <h1 className="text-4xl font-bold text-orange-500 mb-4">Contact Us</h1>
        <p className="text-gray-600">
          You can reach us via email: <strong>support@cakezone.ai</strong>
        </p>
      </div>
    </>
  );
}
