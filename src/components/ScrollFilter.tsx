import { Fab, Zoom } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useEffect, useState } from "react";

const ScrollButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.body.scrollHeight;

      setShowButton(scrollTop > 200);
      setAtBottom(scrollTop + windowHeight >= fullHeight - 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollToBottom = () =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

  const handleClick = () => {
    atBottom ? scrollToTop() : scrollToBottom();
  };

  return (
    <Zoom in={showButton}>
      <Fab
        color="primary"
        onClick={handleClick}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          boxShadow: 3,
          zIndex: 1000,
        }}
      >
        {atBottom ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Fab>
    </Zoom>
  );
};

export default ScrollButton;