"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  Avatar,
  Box,
  Card,
  CircularProgress,
  Typography,
} from "@mui/material";
import { red } from "@mui/material/colors";

export default function UserProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<{ name: string; photo: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = searchParams.get("name");
    const photo = searchParams.get("photo");

    if (!name || !photo) {
      if (id === "default") {
        setUser({
          name: "Default User",
          photo: "/default-avatar.jpg",
        });
      } else {
        router.push("/");
        return;
      }
    } else {
      setUser({
        name: decodeURIComponent(name),
        photo: decodeURIComponent(photo),
      });
    }
    setLoading(false);
  }, [searchParams, router, id]);

  if (loading) {
    return (
      <Box sx={{backgroundColor: "#070E16",height:"100vh"}}>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h5">User data not available</Typography>
      </Box>
    );
  }

  return (
    <>
    <Box sx={{backgroundColor: "#070E16",height:"100vh"}}>
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 4, pt: 8 }}>
      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Avatar
            src={user.photo || "/default-avatar.jpg"}
            sx={{
              width: 150,
              height: 150,
              mx: "auto",
              mb: 2,
              bgcolor: red[500],
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-avatar.jpg";
            }}
          >
            {user.name[0]}
          </Avatar>
          <Typography variant="h4" gutterBottom>
            {user.name}
          </Typography>
        </Box>
      </Card>
    </Box>
    </Box>
    </>
  );
}