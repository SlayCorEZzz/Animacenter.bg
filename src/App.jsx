import { BookingProvider } from './components/BookingModal.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import HeroSection from './components/sections/HeroSection.jsx';
import TherapistsIntroSection from './components/sections/TherapistsIntroSection.jsx';
import ServicesHeadingSection from './components/sections/ServicesHeadingSection.jsx';
import ServicesGridSection from './components/sections/ServicesGridSection.jsx';
import WhyChooseUsSection from './components/sections/WhyChooseUsSection.jsx';
import MassageBenefitsSection from './components/sections/MassageBenefitsSection.jsx';
import TherapistSection from './components/sections/TherapistSection.jsx';
import PriceListSection from './components/sections/PriceListSection.jsx';
import BookingCtaSection from './components/sections/BookingCtaSection.jsx';
import GallerySection from './components/sections/GallerySection.jsx';
import OffersSection from './components/sections/OffersSection.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

export default function App() {
  return (
    <BookingProvider>
      <div id="top" />
      <SiteHeader />
      <div id="page" className="main-container">
        <div id="main-content">
          <div id="main" role="main" className="vamtam-main layout-full">
            <div className="page-wrapper">
              <article id="post-17" className="full post-17 page type-page status-publish hentry">
                <div className="page-content clearfix the-content-parent">
                  <div
                    data-elementor-type="wp-page"
                    data-elementor-id="17"
                    className="elementor elementor-17"
                    data-elementor-post-type="page"
                  >
                    <HeroSection />
                    <TherapistsIntroSection />
                    <ServicesHeadingSection />
                    <ServicesGridSection />
                    <WhyChooseUsSection />
                    <MassageBenefitsSection />
                    <TherapistSection />
                    <PriceListSection />
                    <BookingCtaSection />
                    <GallerySection />
                    <OffersSection />
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
      <ScrollToTop />
    </BookingProvider>
  );
}
