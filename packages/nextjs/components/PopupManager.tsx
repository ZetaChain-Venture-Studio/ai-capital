"use client";

import { useEffect, useState } from "react";
import OnboardingPopup from "./OnboardingPopup";

const PopupManager = ({ children }: { children: React.ReactNode }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem("onboardingAccepted") === "true";
    const isTermsPage = typeof window !== "undefined" && window.location.pathname === "/terms";

    if (!hasAccepted && !isTermsPage) {
      setIsPopupOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsPopupOpen(false);
    localStorage.setItem("onboardingAccepted", "true");
  };

  return (
    <>
      {children}
      <OnboardingPopup isOpen={isPopupOpen} onClose={handleClose} />
    </>
  );
};

export default PopupManager;
