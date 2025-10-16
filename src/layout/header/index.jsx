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
import usePatient from "../../hooks/usePatient";
import { BORDER_RADIUS, ICON_SIZE } from "../../constant/lookUpConstant";
import SemiBoldText from "../../components/typography/semiBoldText";
import RegularText from "../../components/typography/regularText";
import { ArrowBackIos } from "@mui/icons-material";
import { IoIosArrowBack } from "react-icons/io";
import RoundedIconButton from "../../components/button/roundedIconButton";

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

const Header = ({
  title,
  inSideMenu,
  drawerWidth,
  isSearch,
  isPatientView,
  toggleDrawer,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patient } = usePatient();

  const onChangeSearch = (value) => {
    dispatch(searchPatient({ value }));
  };

  const userData = useAuth();

  const handleEditUser = () => {
    navigate("/managePatient/basicDetails", {
      state: {
        from: "BasicDetails",
        mode: "edit",
        patientId: patient?.patientId,
      },
    });
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: theme.palette.primary.bg_head,
        borderBottomLeftRadius: BORDER_RADIUS.XL,
        borderBottomRightRadius: BORDER_RADIUS.XL,
        paddingX: 0,
      }}
    >
      <Toolbar>
        <Box
          sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: `calc(${drawerWidth}px - 16px)`,
            }}
          >
            {inSideMenu ? (
              <RoundedIconButton
                sx={{
                  mr: 1,
                }}
                onClick={toggleDrawer}
              >
                <MenuIcon
                  size={ICON_SIZE.MD}
                  sx={{ color: theme.palette.primary.main }}
                />
              </RoundedIconButton>
            ) : (
              <RoundedIconButton
                sx={{
                  mr: 1,
                }}
                onClick={() => navigate(-1)}
              >
                <IoIosArrowBack
                  color={theme.palette.primary.main}
                  size={ICON_SIZE.MD}
                />
              </RoundedIconButton>
            )}
            <Box>
              {!inSideMenu && title ? (
                <SemiBoldText>{title}</SemiBoldText>
              ) : (
                <>
                  <SemiBoldText>
                    {userData?.name
                      ? `Hi, ${userData?.name}`
                      : "Kokum Therapist"}
                  </SemiBoldText>
                  {userData?.clinicName && (
                    <RegularText>{userData?.clinicName}</RegularText>
                  )}
                </>
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
              <Search sx={{ backgroundColor: "#fff", boxShadow: 1 }}>
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
              <RoundedIconButton
                sx={{
                  ml: 1,
                }}
                onClick={() => navigate("/managePatient/basicDetails")}
              >
                <IoAdd color={theme.palette.primary.main} size={ICON_SIZE.MD} />
              </RoundedIconButton>
            </Box>
          )}

          {isPatientView && <PatientHeaderTabs />}
        </Box>
        <Box>
          {!isPatientView ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <RoundedIconButton
                sx={{
                  ml: 1,
                }}
                onClick={() => navigate("/notifications")}
              >
                <FaBell
                  color={theme.palette.primary.main}
                  size={ICON_SIZE.MD}
                />
              </RoundedIconButton>
              <RoundedIconButton
                sx={{
                  ml: 1,
                }}
                onClick={() => navigate("/myProfile")}
              >
                <IoPerson
                  color={theme.palette.primary.main}
                  size={ICON_SIZE.MD}
                />
              </RoundedIconButton>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <RoundedIconButton
                sx={{
                  ml: 1,
                }}
                onClick={handleEditUser}
              >
                <IoPerson color={theme.palette.primary.main} />
              </RoundedIconButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
