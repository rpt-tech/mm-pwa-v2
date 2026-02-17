export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">MM Vietnam</h3>
            <p className="text-sm">Online Shopping</p>
          </div>
          {/* TODO: Footer links, newsletter, social - migrate from source */}
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-center">
          &copy; {new Date().getFullYear()} MM Vietnam. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
