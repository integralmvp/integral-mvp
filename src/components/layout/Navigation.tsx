const Navigation = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <button
            onClick={() => scrollToSection('hero')}
            className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors"
          >
            INTEGRAL
          </button>

          {/* 메뉴 */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => scrollToSection('routes')}
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              경로 찾기
            </button>
            <button
              onClick={() => scrollToSection('storages')}
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              공간 찾기
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              서비스 소개
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
