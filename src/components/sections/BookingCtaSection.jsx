/**
 * Призивът за записване.
 *
 * Фонът беше YouTube embed. Плеърът рисува собствения си интерфейс
 * върху кадъра и той не може да бъде скрит отвън, защото се намира вътре в iframe-а;
 * а щом видеото се спре (за да не върти извън екрана), YouTube показва
 * и голямата стрелка в средата. Затова тук стои същото локално видео като в
 * хероя, пуснато от друга секунда: <video> няма чужд интерфейс и се
 * спира чисто.
 */
export default function BookingCtaSection() {
  return (
    <div
      className="elementor-element elementor-element-32389c6 e-flex e-con-boxed e-con e-parent"
      data-id="32389c6"
      data-element_type="container"
      data-e-type="container"
      data-settings={"{\"background_background\":\"video\",\"background_video_link\":\"\\/wp-content\\/uploads\\/2025\\/10\\/pexels.com_video_woman-doing-a-back-massage-6628400-720.webm\",\"background_play_on_mobile\":\"yes\",\"background_privacy_mode\":\"yes\",\"background_video_start\":9}"}
    >
      <div className="e-con-inner">
        <div className="elementor-background-video-container">
          <video className="elementor-background-video-hosted" role="presentation" autoPlay={true} muted={true} playsInline={true} loop={true} />
        </div>
        <div
          className="elementor-element elementor-element-2a883ae e-con-full e-flex e-con e-child"
          data-id="2a883ae"
          data-element_type="container"
          data-e-type="container"
        >
          <div
            className="elementor-element elementor-element-8079d13 animated-fast elementor-invisible elementor-widget elementor-widget-heading"
            data-id="8079d13"
            data-element_type="widget"
            data-e-type="widget"
            data-settings='{"_animation":"fadeIn","_animation_delay":50}'
            data-widget_type="heading.default"
          >
            <h2 className="elementor-heading-title elementor-size-default">Защо да чакате, за да се почувствате по-добре?</h2>
          </div>
          <div
            className="vamtam-has-theme-widget-styles elementor-element elementor-element-ceb580c animated-fast elementor-invisible elementor-widget elementor-widget-text-editor"
            data-id="ceb580c"
            data-element_type="widget"
            data-e-type="widget"
            data-settings='{"_animation":"fadeIn","_animation_delay":100}'
            data-widget_type="text-editor.default"
          >
            <p>Запишете своя час в ANIMA Center на ул. „Лавеле“ 11, до метростанция „Сердика“.</p>
          </div>
        </div>
        <div
          className="elementor-element elementor-element-5040a83 e-con-full e-flex e-con e-child"
          data-id="5040a83"
          data-element_type="container"
          data-e-type="container"
        >
          <div
            className="elementor-element elementor-element-dc13f48 e-con-full e-flex e-con e-child"
            data-id="dc13f48"
            data-element_type="container"
            data-e-type="container"
          >
            <div
              className="vamtam-has-theme-widget-styles elementor-element elementor-element-0ff3f0d elementor-align-center blur-background  animated-fast elementor-invisible elementor-widget elementor-widget-button"
              data-id="0ff3f0d"
              data-element_type="widget"
              data-e-type="widget"
              data-settings='{"_animation":"slideInUp"}'
              data-widget_type="button.default"
            >
              <a className="elementor-button elementor-button-link elementor-size-sm" href="tel:+359897700766">
                <span className="elementor-button-content-wrapper">
                  <span className="anima-book-btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6.6 3.5h3l1.5 3.8-2 1.4a12 12 0 0 0 5.2 5.2l1.4-2 3.8 1.5v3a1.6 1.6 0 0 1-1.7 1.6A15.5 15.5 0 0 1 5 5.2 1.6 1.6 0 0 1 6.6 3.5Z" /></svg></span>
                  <span className="elementor-button-text">+359 89 770 0766</span>
                </span>
              </a>
            </div>
          </div>
          <div
            className="elementor-element elementor-element-af78056 e-con-full animated-fast e-flex elementor-invisible e-con e-child"
            data-id="af78056"
            data-element_type="container"
            data-e-type="container"
            data-settings='{"animation":"slideInUp","animation_delay":50}'
          >
            <div
              className="vamtam-has-theme-widget-styles elementor-element elementor-element-4c6133e elementor-view-default elementor-widget elementor-widget-icon"
              data-id="4c6133e"
              data-element_type="widget"
              data-e-type="widget"
              data-widget_type="icon.default"
            >
              <div className="elementor-icon-wrapper">
                <div className="elementor-icon">
                  <svg
                    aria-hidden="true"
                    className="e-font-icon-svg e-fas-circle"
                    viewBox="0 0 512 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div
              className="elementor-element elementor-element-05c4ae3 elementor-widget__width-initial elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
              data-id="05c4ae3"
              data-element_type="widget"
              data-e-type="widget"
              data-widget_type="divider.default"
            >
              <div className="elementor-divider">
                <span className="elementor-divider-separator" />
              </div>
            </div>
            <div
              className="elementor-element elementor-element-ccf1f3f elementor-widget elementor-widget-heading"
              data-id="ccf1f3f"
              data-element_type="widget"
              data-e-type="widget"
              data-widget_type="heading.default"
            >
              <div className="elementor-heading-title elementor-size-default">или</div>
            </div>
            <div
              className="elementor-element elementor-element-3a1a935 elementor-widget__width-initial elementor-widget-divider--view-line elementor-widget elementor-widget-divider"
              data-id="3a1a935"
              data-element_type="widget"
              data-e-type="widget"
              data-widget_type="divider.default"
            >
              <div className="elementor-divider">
                <span className="elementor-divider-separator" />
              </div>
            </div>
            <div
              className="vamtam-has-theme-widget-styles elementor-element elementor-element-72131ab elementor-view-default elementor-widget elementor-widget-icon"
              data-id="72131ab"
              data-element_type="widget"
              data-e-type="widget"
              data-widget_type="icon.default"
            >
              <div className="elementor-icon-wrapper">
                <div className="elementor-icon">
                  <svg
                    aria-hidden="true"
                    className="e-font-icon-svg e-fas-circle"
                    viewBox="0 0 512 512"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div
            className="elementor-element elementor-element-cf3fe05 e-con-full e-flex e-con e-child"
            data-id="cf3fe05"
            data-element_type="container"
            data-e-type="container"
          >
            <div
              className="vamtam-has-theme-widget-styles elementor-element elementor-element-949300e animated-fast elementor-invisible elementor-widget elementor-widget-button"
              data-id="949300e"
              data-element_type="widget"
              data-e-type="widget"
              data-settings='{"_animation":"slideInUp","_animation_delay":100}'
              data-widget_type="button.default"
            >
              <a
                className="elementor-button elementor-button-link elementor-size-sm anima-book-btn"
                href="tel:+359897700766"
              >
                <span className="elementor-button-content-wrapper">
                  <span className="anima-book-btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6.6 3.5h3l1.5 3.8-2 1.4a12 12 0 0 0 5.2 5.2l1.4-2 3.8 1.5v3a1.6 1.6 0 0 1-1.7 1.6A15.5 15.5 0 0 1 5 5.2 1.6 1.6 0 0 1 6.6 3.5Z" /></svg></span>
                  <span className="elementor-button-text">Запази час</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
