"use client";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { useUser } from "../_Components/UserContext/UserContext";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Slide, SlideProps } from "@mui/material";


function SlowSlide(props: SlideProps) {
  return <Slide {...props} timeout={800} />;
}

export default function Account() {
  const router = useRouter();
  const { userData, fetchUserData } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  useEffect(() => {
    fetchUserData().finally(() => setLoading(false));
  }, [fetchUserData]);

  const handlePasswordChange = async () => {
    setPasswordError("");

    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Password must contain at least 8 characters, including uppercase, lowercase, number and special character"
      );
      return;
    }

    try {
      const token = localStorage.getItem("Token");
      const response = await fetch(
        "https://linked-posts.routemisr.com/users/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            token: token || "",
          },
          body: JSON.stringify({
            password: currentPassword,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.message || "Failed to change password");
        return;
      }

      setShowToast(true);
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordFields(false);

      
      setTimeout(() => {
        localStorage.removeItem("Token");
        router.push("/signin");
      }, 6000);
    } catch (err) {
      setPasswordError("Something went wrong while changing password");
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError("File size must be less than 4MB");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const token = localStorage.getItem("Token");
      if (!token) {
        setError("User token is missing. Please login again.");
        return;
      }

      const response = await fetch(
        "https://linked-posts.routemisr.com/users/upload-photo",
        {
          method: "PUT",
          headers: {
            token: token,
            Accept: "*/*",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error || "Failed to upload photo");
        return;
      }

      await fetchUserData();
    } catch (err) {
      setError("Something went wrong while uploading photo.");
    }
  };

  if (loading) {
    return (
      <Box sx={{backgroundColor: "#070E16",height:"100vh"}}>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "error.main",
        }}
      >
        {error}
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        No user data found.
      </Box>
    );
  }

  return (
    <>
          <Box sx={{backgroundColor: "#070E16",height:"100vh"}}>

      <Card
        sx={{
          mx: "auto",
          width: { sm: "50%", xs: "95%" },
          mb: "130px",
           transform: "translateY(70px)",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <CardActionArea>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: { md: "25%", sm: "40%", xs: "40%" },
                aspectRatio: "1 / 1",
                mx: "auto",
                mt: "5px",
                overflow: "hidden",
                borderRadius: "50%",
                cursor: "pointer",
                "&:hover .hover-text": {
                  transform: "translateY(0%)",
                },
                "&:focus .hover-text": {
                  transform: "translateY(0%)",
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar
                sx={{
                  width: "100%",
                  height: "100%",
                  paddingTop: "3px",
                  aspectRatio: "1 / 1",
                }}
                src={userData.photo || "/broken-image.jpg"}
              />

              <Typography
                component="div"
                className="hover-text"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  left: 0,
                  color: "#fff",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  p: { sm: 1.3, xs: 0.7 },
                  textAlign: "center",
                  fontSize: { sm: "10px", xs: "8.5px" },
                  transform: "translateY(100%)",
                  transition: "0.5s all",
                }}
              >
                Upload Photo
              </Typography>
            </Box>
          </Box>

          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {userData.name}
            </Typography>
            <Typography gutterBottom variant="h6" component="div">
              {userData.email}
            </Typography>
            <Typography gutterBottom variant="h6" component="div">
              Date: {userData.dateOfBirth}
            </Typography>
            <Typography gutterBottom variant="h6" component="div">
              Gender: {userData.gender}
            </Typography>
          </CardContent>
        </CardActionArea>

        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          accept="image/*"
          onChange={handlePhotoUpload}
        />
      </Card>
      
      <FormGroup
        sx={{
          mx: "auto",
          width: { sm: "50%", xs: "95%" },
          mt: "30px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <FormControlLabel
          required
          control={
            <Switch
              checked={showPasswordFields}
              onChange={(e) => setShowPasswordFields(e.target.checked)}
            />
          }
          label="Change Password"
          sx={{
            "& .MuiFormControlLabel-asterisk": { display: "none" },
            color:"white"
          }}
        />
      </FormGroup>

      <Box
        component="form"
        noValidate
        autoComplete="off"
        sx={{
          "& > :not(style)": {
            m: 1,
            width: "25ch",
          },
          mx: "auto",
          width: { sm: "50%", xs: "95%" },
          mt: "10px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          overflow: "hidden",
          gap: 5,
        }}
      >
        <SlowSlide
          direction="right"
          in={showPasswordFields}
          mountOnEnter
          unmountOnExit
        >
          <TextField
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            type="password"
            label="Current Password"
            variant="standard"
            error={!!passwordError}
          />
        </SlowSlide>
        <SlowSlide
          direction="left"
          in={showPasswordFields}
          mountOnEnter
          unmountOnExit
        >
          <TextField
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            label="New Password"
            variant="standard"
            error={!!passwordError}
          />
        </SlowSlide>
      </Box>

      {passwordError && (
        <Typography color="error" sx={{ textAlign: "center", mt: 2 }}>
          {passwordError}
        </Typography>
      )}

      <SlowSlide
        direction="up"
        in={showPasswordFields}
        mountOnEnter
        unmountOnExit
      >
        
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, pb: 5 ,backgroundColor: "#070E16", }}>
          <Button
            variant="outlined"
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword}
          >
            Change Password
          </Button>
        </Box>
      </SlowSlide>

      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={SlowSlide}
      >
        <Alert
          onClose={() => setShowToast(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Password changed successfully! Please sign in again.
        </Alert>
      </Snackbar>
      </Box>
    </>
  );
}
