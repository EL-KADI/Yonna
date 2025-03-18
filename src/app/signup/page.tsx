"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import FormHelperText from "@mui/material/FormHelperText";
import AppTheme from "../shared-theme/AppTheme";
import { useThemeSettings } from "../shared-theme/ThemeContext";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  boxShadow: theme.shadows[2],
  ...theme.applyStyles("dark", {
    boxShadow: theme.shadows[2],
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "104dvh",
  minHeight: "100%",
  padding: theme.spacing(1.75),
  [theme.breakpoints.up("sm")]: {
    height: "100dvh",
    padding: theme.spacing(4),
  },
  "@media (max-width: 360px) and (max-height: 568px)": {
    height: "130dvh",
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignUp() {
  const router = useRouter();
  const { disableCustomTheme } = useThemeSettings();
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
    dateOfBirth: dayjs(),
    gender: "female",
  });

  const [errors, setErrors] = React.useState({
    name: { error: false, message: "" },
    email: { error: false, message: "" },
    password: { error: false, message: "" },
    rePassword: { error: false, message: "" },
    dateOfBirth: { error: false, message: "" },
    gender: { error: false, message: "" },
    general: { error: false, message: "" },
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: { error: false, message: "" },
      general: { error: false, message: "" },
    }));
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: date || dayjs(),
    }));

    setErrors((prev) => ({
      ...prev,
      dateOfBirth: { error: false, message: "" },
      general: { error: false, message: "" },
    }));
  };

  const validateInputs = () => {
    const newErrors = {
      name: { error: false, message: "" },
      email: { error: false, message: "" },
      password: { error: false, message: "" },
      rePassword: { error: false, message: "" },
      dateOfBirth: { error: false, message: "" },
      gender: { error: false, message: "" },
      general: { error: false, message: "" },
    };

    let isValid = true;

    if (!formData.name) {
      newErrors.name.error = true;
      newErrors.name.message = "Name is required.";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email.error = true;
      newErrors.email.message = "Email is required.";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email.error = true;
      newErrors.email.message = "Please enter a valid email address.";
      isValid = false;
    }

    const passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (!formData.password) {
      newErrors.password.error = true;
      newErrors.password.message = "Password is required.";
      isValid = false;
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password.error = true;
      newErrors.password.message =
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.";
      isValid = false;
    }

    if (formData.password !== formData.rePassword) {
      newErrors.rePassword.error = true;
      newErrors.rePassword.message = "Passwords do not match.";
      isValid = false;
    }

    const birthDate = formData.dateOfBirth;
    const minDate = dayjs("1910-01-01");
    const maxDate = dayjs("2020-12-31");

    if (!birthDate.isValid()) {
      newErrors.dateOfBirth.error = true;
      newErrors.dateOfBirth.message = "Please select a valid date.";
      isValid = false;
    } else if (birthDate.isBefore(minDate) || birthDate.isAfter(maxDate)) {
      newErrors.dateOfBirth.error = true;
      newErrors.dateOfBirth.message = "The date of birth must be valid.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateInputs()) {
      return;
    }

    try {
      const response = await fetch(
        "https://linked-posts.routemisr.com/users/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            rePassword: formData.rePassword,
            dateOfBirth: formData.dateOfBirth.format("M-D-YYYY"),
            gender: formData.gender,
          }),
        }
      );

      const data = await response.json();

      if (data.message === "success") {
        router.push("/signin");
      } else {
        handleSignupError(data);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: { error: true, message: "An error occurred during sign up" },
      }));
    }
  };

  const handleSignupError = (data: any) => {
    if (data.message === "Email already exists") {
      setErrors((prev) => ({
        ...prev,
        email: { error: true, message: "This email is already registered" },
      }));
    } else if (data.message.includes("password")) {
      setErrors((prev) => ({
        ...prev,
        password: { error: true, message: data.message },
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        general: {
          error: true,
          message: data.message || "An error occurred during sign up",
        },
      }));
    }
  };

  return (
    <AppTheme disableCustomTheme={disableCustomTheme}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card
          sx={{
            mt: {
              xs: 0,
              sm: "-15px",
            },
            backgroundColor: "rgba(5, 7, 10, 0.4)",
          }}
          variant="outlined"
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign up
          </Typography>
          {errors.general.error && (
            <Typography color="error" sx={{ textAlign: "center" }}>
              {errors.general.message}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                fullWidth
                id="name"
                placeholder="Sayed Ragheb"
                error={errors.name.error}
                helperText={errors.name.message}
                value={formData.name}
                onChange={handleInputChange}
                color={errors.name.error ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                error={errors.email.error}
                helperText={errors.email.message}
                value={formData.email}
                onChange={handleInputChange}
                color={errors.email.error ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Box sx={{ display: "flex", flexGrow: 0.6 }}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                </Box>
                <FormLabel htmlFor="rePassword">Re-Password</FormLabel>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                <TextField
                  fullWidth
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  variant="outlined"
                  error={errors.password.error}
                  helperText={errors.password.message}
                  value={formData.password}
                  onChange={handleInputChange}
                  color={errors.password.error ? "error" : "primary"}
                />
                <Box sx={{ display: "flex", width: "100%", mr: "auto" }}>
                  <TextField
                    sx={{ mr: "auto", width: "100%" }}
                    fullWidth
                    name="rePassword"
                    placeholder="••••••"
                    type="password"
                    id="rePassword"
                    autoComplete="new-password"
                    variant="outlined"
                    error={errors.rePassword.error}
                    helperText={errors.rePassword.message}
                    value={formData.rePassword}
                    onChange={handleInputChange}
                    color={errors.rePassword.error ? "error" : "primary"}
                  />
                </Box>
              </Box>
            </FormControl>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
              }}
            >
              <FormControl error={errors.dateOfBirth.error}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={["DatePicker"]}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <FormLabel htmlFor="dateOfBirth">Date Of Birth</FormLabel>
                      <DatePicker
                        value={formData.dateOfBirth}
                        onChange={handleDateChange}
                        slotProps={{
                          textField: {
                            error: errors.dateOfBirth.error,
                          },
                        }}
                      />
                      {errors.dateOfBirth.error && (
                        <FormHelperText>
                          {errors.dateOfBirth.message}
                        </FormHelperText>
                      )}
                    </Box>
                  </DemoContainer>
                </LocalizationProvider>
              </FormControl>
              <FormLabel
                sx={{
                  transform: { xs: "translateX(0px)", sm: "translateX(40px)" },
                  mt: { xs: "20px", sm: "10px" },
                }}
                id="demo-controlled-radio-buttons-group"
              >
                Gender
              </FormLabel>
              <RadioGroup
                sx={{
                  width: { xs: "100%", sm: "85%" },
                  mt: { xs: 0, sm: "30px" },
                }}
                row
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Female"
                />
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Male"
                />
              </RadioGroup>
            </Box>
            <Button type="submit" fullWidth variant="contained">
              Sign up
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: "text.secondary" }}>or</Typography>
          </Divider>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pb: "10px",
            }}
          >
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link
                href="/Yoona/signin"
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  ); 
}