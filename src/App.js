import { useState } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  // Main header tabs (always visible)
  const tabs = [
    { id: "seo-audit", label: "SEO Audit" },
    { id: "pricing", label: "Pricing" },
    { id: "extension", label: "Extension" },
    { id: "widget", label: "Widget" },
    { id: "leads-management", label: "Lead Management" }, // always last
  ];

  const [activeTab, setActiveTab] = useState("seo-audit");

  return (
    <div>
      <Header tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* Main handles the secondary tabs after lead form */}
      <Main activeTab={activeTab} />
      <Footer />
    </div>
  );
}

export default App;