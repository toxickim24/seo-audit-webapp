import { useState } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import "./App.css";

function App() {

  const tabs = [
    { id: "seo-audit", label: "SEO Audit" },
    { id: "seo-pricing", label: "Pricing" },
    { id: "seo-tools", label: "Tools" },
    { id: "seo-contact", label: "Contact" },
    { id: "leads-management", label: "Lead Management" },
  ];

  const [activeTab, setActiveTab] = useState("seo-audit");

  return (
    <div>
      <Header tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <Main activeTab={activeTab} />
      <Footer />
    </div>
  );
}

export default App;