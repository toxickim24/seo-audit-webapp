import { useState } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  // Tab Content
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "seo-onpage", label: "SEO On-Page" },
    { id: "seo-technical", label: "SEO Technical" },
    { id: "seo-offpage", label: "SEO Off-page" },
    { id: "seo-performance", label: "SEO Performance" },
    { id: "lead-pdf", label: "Leads Management" },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div>
      <Header tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <Main activeTab={activeTab} />
      <Footer />
    </div>
  );
}

export default App;
