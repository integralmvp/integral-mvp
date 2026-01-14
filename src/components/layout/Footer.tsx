const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* 로고 및 소개 */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">INTEGRAL</h3>
            <p className="text-gray-400">물류 경로와 공간을 연결하는 오픈마켓</p>
          </div>

          {/* 문의 정보 (더미) */}
          <div className="text-center md:text-right">
            <p className="text-gray-400">문의</p>
            <p className="text-white">contact@integral-mvp.com</p>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; 2025 INTEGRAL. All rights reserved. (MVP Demo)</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
