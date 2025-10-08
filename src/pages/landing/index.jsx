import React from "react";
import { Button, Typography, Box, Container } from "@mui/material";
import welcomeSvg from "../../assets/svg/welcome.svg";
import welcomeTitleSvg from "../../assets/svg/welcomeTitle.svg";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    const isAuthenticated = Cookies.get("token") && Cookies.get("self");
    if (isAuthenticated) {
      navigate("/patientProfile");
    } else {
      localStorage.clear();
      Cookies.remove("token");
      Cookies.remove("self");
      navigate("/signin");
    }
  };

  return (
    <Container maxWidth={false}>
      <Box
        sx={{
          width: 720,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Box textAlign="center">
          <img src={welcomeSvg} alt="Healthcare team" />
        </Box>
        <Box textAlign="center">
          <Typography
            variant="h4"
            component="h1"
            color="#242e49"
            fontWeight={"bold"}
            gutterBottom
          >
            Welcome to
          </Typography>

          <figure>
            <img src={welcomeTitleSvg} alt="Logo" />
          </figure>
        </Box>
        <Box textAlign="center">
          <Button
            variant="contained"
            sx={{
              width: 250,
              color: "primary.main",
              borderRadius: 10,
              fontSize: "1em",
              px: 5,
              py: 1,
              border: "1px solid #ccc",
              bgcolor: "#fff",
              textTransform: "none",
            }}
            onClick={handleClick}
          >
            Get Started
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LandingPage;
