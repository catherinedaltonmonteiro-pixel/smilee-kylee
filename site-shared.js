/*
=========================================================
SMILEE KYLEE — SITE SHARED CODE
File name: site-shared.js

This one file controls:
- Emergency notice
- Funding notice
- Main navigation
- Active navigation tab
- Footer
- Return to Top button
=========================================================
*/

(function () {
  "use strict";

  const NAVIGATION = [
    ["index.html", "Home"],
    ["kylee.html", "Meet Kylee"],
    ["mission.html", "Vision & Mission"],
    ["timeline.html", "Timeline"],
    ["shop.html", "Shop"],
    ["donate.html", "Donate"],
    ["case.html", "The Case"],
    ["story.html", "What We Know"],
    ["questions.html", "Public Questions"],
    ["memories.html", "Memories"],
    ["help.html", "Get Help"]
  ];

  function getCurrentPage() {
    let page = window.location.pathname.split("/").pop() || "index.html";
    page = page.split("?")[0].split("#")[0].toLowerCase();

    if (page === "" || page === "/") {
      return "index.html";
    }

    return page;
  }

  function buildNavigation() {
    const currentPage = getCurrentPage();

    return NAVIGATION.map(function (item) {
      const href = item[0];
      const label = item[1];

      const active =
        currentPage === href
          ? ' class="active" aria-current="page"'
          : "";

      return (
        '<a href="' +
        href +
        '"' +
        active +
        ">" +
        label +
        "</a>"
      );
    }).join("");
  }

  function buildTop() {
    return `
      <div class="emergency-bar">
        If you are in immediate danger, call 911.
        For crisis and support resources,
        <a href="help.html">Get Help</a>.
      </div>

      <div class="funding-notice">
        <strong>Funding Notice:</strong>
        Donations, merchandise proceeds after costs and fees, and other financial support go toward building Smilee Kylee and its future programs, resources, and supportive housing for women in need.
      </div>

      <header class="site-header">
        <div class="nav-wrap">

          <a class="brand" href="index.html">
            Smilee Kylee
          </a>

          <nav class="main-nav" aria-label="Main navigation">
            ${buildNavigation()}
          </nav>

        </div>
      </header>
    `;
  }

  function buildFooter() {
    return `
      <footer class="site-footer">

        <div class="footer-grid">

          <div class="footer-column">
            <h3>Smilee Kylee</h3>
            <p>
              Created in loving memory of Kylee M. Monteiro.
            </p>
            <p>
              Her memory becomes someone else's hope.
            </p>
          </div>

          <div class="footer-column">
            <h4>Explore</h4>

            <a href="index.html">Home</a>
            <a href="kylee.html">Meet Kylee</a>
            <a href="mission.html">Vision &amp; Mission</a>
            <a href="timeline.html">Timeline</a>
            <a href="case.html">The Case</a>
            <a href="story.html">What We Know</a>
            <a href="questions.html">Public Questions</a>
            <a href="memories.html">Memories</a>
            <a href="help.html">Get Help</a>
          </div>

          <div class="footer-column">
            <h4>Support</h4>

            <a href="shop.html">
              Shop Smilee Kylee
            </a>

            <a href="donate.html">
              Donate
            </a>

            <a
              href="https://www.paypal.com/ncp/payment/BKQGJZW65HJS4"
              target="_blank"
              rel="noopener noreferrer">
              PayPal
            </a>

            <a
              href="https://cash.app/$justice4Kylee"
              target="_blank"
              rel="noopener noreferrer">
              Cash App
            </a>

            <a
              href="https://venmo.com/u/smileekylee"
              target="_blank"
              rel="noopener noreferrer">
              Venmo
            </a>

            <a
              href="https://smilee-kylee-shop.fourthwall.com/"
              target="_blank"
              rel="noopener noreferrer">
              Fourthwall Shop
            </a>

          </div>

        </div>

        <div class="footer-bottom">
          <p>
            May her memory become safety, healing,
            opportunity and hope.
          </p>

          <p>
            &copy; 2026 Smilee Kylee
          </p>
        </div>

      </footer>

      <button
        type="button"
        id="returnToTop"
        class="return-to-top">
        Return to Top
      </button>
    `;
  }

  function addStyles() {
    if (document.getElementById("smilee-shared-styles")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "smilee-shared-styles";

    style.textContent = `

      .emergency-bar {
        background: #553765;
        color: white;
        text-align: center;
        padding: 10px 18px;
        font-size: 14px;
        line-height: 1.5;
      }

      .emergency-bar a {
        color: white;
        font-weight: bold;
        text-decoration: underline;
      }

      .funding-notice {
        background: #efd2df;
        color: #342f35;
        text-align: center;
        padding: 10px 18px;
        font-size: 13px;
        line-height: 1.5;
      }

      .site-header {
        background: #fffaf5;
        border-bottom: 1px solid rgba(125, 90, 145, 0.2);
        position: relative;
        z-index: 50;
      }

      .nav-wrap {
        max-width: 1200px;
        margin: 0 auto;
        padding: 18px 22px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .brand {
        color: #553765;
        text-decoration: none;
        font-size: 25px;
        font-weight: 800;
        white-space: nowrap;
      }

      .main-nav {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 7px;
      }

      .main-nav a {
        color: #553765;
        text-decoration: none;
        padding: 8px 10px;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 700;
      }

      .main-nav a:hover {
        background: #efd2df;
      }

      .main-nav a.active {
        background: #7d5a91;
        color: white;
      }

      .site-footer {
        background: #553765;
        color: white;
        padding: 48px 22px 24px;
        margin-top: 50px;
      }

      .footer-grid {
        max-width: 1100px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 40px;
      }

      .footer-column h3,
      .footer-column h4 {
        color: white;
        margin-top: 0;
        margin-bottom: 14px;
      }

      .footer-column p {
        line-height: 1.65;
      }

      .footer-column a {
        display: block;
        width: fit-content;
        color: white;
        text-decoration: none;
        margin: 8px 0;
      }

      .footer-column a:hover {
        text-decoration: underline;
      }

      .footer-bottom {
        max-width: 1100px;
        margin: 34px auto 0;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.25);
        text-align: center;
        line-height: 1.6;
      }

      .return-to-top {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 1000;
        border: none;
        border-radius: 999px;
        background: #7d5a91;
        color: white;
        padding: 12px 18px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 5px 18px rgba(0, 0, 0, 0.18);
      }

      .return-to-top:hover {
        background: #553765;
      }

      @media (max-width: 850px) {

        .nav-wrap {
          flex-direction: column;
          align-items: center;
        }

        .main-nav {
          justify-content: center;
        }

        .footer-grid {
          grid-template-columns: 1fr;
          text-align: center;
        }

        .footer-column a {
          margin-left: auto;
          margin-right: auto;
        }

      }

    `;

    document.head.appendChild(style);
  }

  function loadSharedSite() {
    addStyles();

    const topArea =
      document.getElementById("site-shared-top");

    const footerArea =
      document.getElementById("site-shared-footer");

    if (topArea) {
      topArea.innerHTML = buildTop();
    }

    if (footerArea) {
      footerArea.innerHTML = buildFooter();
    }

    const topButton =
      document.getElementById("returnToTop");

    if (topButton) {
      topButton.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      loadSharedSite
    );
  } else {
    loadSharedSite();
  }

})();
