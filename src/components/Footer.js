import "../css/Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer>
      <p>
        © {year} SEO Mojo. All Rights Reserved. Made by{" "}
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