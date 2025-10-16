import React from "react";
import { Button, Typography, Box, Container } from "@mui/material";
import welcomeSvg from "../../assets/svg/welcome.svg";
import welcomeTitleSvg from "../../assets/svg/welcomeTitle.svg";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import SemiBoldText from "../../components/typography/semiBoldText";
import RegularText from "../../components/typography/regularText";
import RoundedButton from "../../components/button/roundedButton";

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
          width: 1120,
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Box textAlign="center">
          <img
            src={welcomeSvg}
            width={400}
            height={400}
            alt="Healthcare team"
          />
        </Box>
        <Box>
          <Box textAlign="center">
            <SemiBoldText fontSize="4em">Welcome to</SemiBoldText>
            <figure>
              <img src={welcomeTitleSvg} width={400} height={100} alt="Logo" />
            </figure>
          </Box>
          <Box textAlign="center" mt={4}>
            <RoundedButton onClick={handleClick} sx={{ width: "90%" }}>
              {" "}
              Get Started{" "}
            </RoundedButton>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LandingPage;
