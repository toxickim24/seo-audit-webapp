import "../css/Footer.css";

function Footer({ partnerData }) {
  const year = new Date().getFullYear();
  const companyName = partnerData?.company_name || "SEO Mojo";

  return (
    <footer>
      <p>
        © {year} {companyName}. All Rights Reserved. Made by{" "}
        <a
          href="https://webdesigndavao.xyz/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Web Design Davao
        </a>
      </p>
    </footer>
  );
}

export default Footer;