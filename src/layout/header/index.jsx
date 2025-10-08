import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { styled, useTheme } from "@mui/material/styles";
import { IoAdd } from "react-icons/io5";
import { IoPerson } from "react-icons/io5";
import { FaBell } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { searchPatient } from "../../reducer/patientSlice";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PatientHeaderTabs from "../../components/patientHeaderTabs";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 16,
  backgroundColor: alpha(theme.palette.grey[200], 0.7),
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[300], 0.9),
  },
  width: "400px",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "100%",
  },
}));

const Header = ({ drawerWidth, isSearch, isPatientView, toggleDrawer }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onChangeSearch = (value) => {
    dispatch(searchPatient({ value }));
  };

  const userData = useAuth();

  return (
    <AppBar
      position="fixed"
      color="#fff"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: "#fff",
        paddingX: 1,
      }}
    >
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: `calc(${drawerWidth}px - 16px)`,
          }}
        >
          <IconButton size="large" edge="start" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {userData?.name ? `Hi, ${userData?.name}` : "Kokum Therapist"}
            </Typography>
            {userData?.clinicName && (
              <Typography variant="body2" sx={{ fontWeight: 400 }}>
                {userData?.clinicName}
              </Typography>
            )}
          </Box>
        </Box>

        {isSearch && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                autoFocus
                onChange={(e) => onChangeSearch(e.target.value)}
              />
            </Search>
            <IconButton
              color="default"
              sx={{
                ml: 1,
                border: `1px solid ${theme.palette.primary.main}`,
              }}
              onClick={() => navigate("/managePatient/basicDetails")}
            >
              <IoAdd color={theme.palette.primary.main} />
            </IconButton>
          </Box>
        )}

        {isPatientView && <PatientHeaderTabs />}
        <Box sx={{ display: "flex", alignItems: "center", ml: "auto", gap: 2 }}>
          <IconButton
            color="default"
            sx={{ ml: 1, border: `1px solid ${theme.palette.primary.main}` }}
            onClick={() => navigate("/notifications")}
          >
            <FaBell color={theme.palette.primary.main} />
          </IconButton>
          <IconButton
            color="default"
            sx={{ ml: 1, border: `1px solid ${theme.palette.primary.main}` }}
            onClick={() => navigate("/myProfile")}
          >
            <IoPerson color={theme.palette.primary.main} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
