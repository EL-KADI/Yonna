"use client";

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import { useRouter } from 'next/navigation';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow: theme.shadows[2], 
  ...theme.applyStyles('dark', {
    boxShadow: theme.shadows[2], 
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "104dvh",
  minHeight: "100%",
  padding: theme.spacing(1.75),

  [theme.breakpoints.up("sm")]: {
    height: "100dvh",
    padding: theme.spacing(4),
  },

  '@media (max-width: 360px) and (max-height: 568px)': {
    height: "108dvh",
    marginTop: "-75px",
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


export default function SignIn() {
  
  const router = useRouter();
  
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = React.useState({
    email: { error: false, message: '' },
    password: { error: false, message: '' },
    general: { error: false, message: '' }
  });
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
 
    setErrors(prev => ({
      ...prev,
      [name]: { error: false, message: '' },
      general: { error: false, message: '' }
    }));
  };

  const validateInputs = () => {
    const newErrors = {
      email: { error: false, message: '' },
      password: { error: false, message: '' },
      general: { error: false, message: '' }
    };

    let isValid = true;

    if (!formData.email) {
      newErrors.email.error = true;
      newErrors.email.message = 'Email is required.';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email.error = true;
      newErrors.email.message = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password.error = true;
      newErrors.password.message = 'Password is required.';
      isValid = false;
    } else if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(formData.password)) {
      newErrors.password.error = true;
      newErrors.password.message = 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character';
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
      const response = await fetch('https://linked-posts.routemisr.com/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.message === "success") {
        if (data.token) {
          localStorage.setItem('Token', data.token);
          router.push('/');
        }
      } else {
        if (data.message === "Email not exist") {
          setErrors(prev => ({
            ...prev,
            email: { error: true, message: "This email is not registered" }
          }));
        } else if (data.message === "incorrect password") {
          setErrors(prev => ({
            ...prev,
            password: { error: true, message: "Incorrect password" }
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: { error: true, message: data.message || "Incorrect email or password" }
          }));
        }
      }
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: { error: true, message: "Network error. Please try again later." }
      }));
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <Card sx={{ mt: "75px",backgroundColor: 'rgba(5, 7, 10, 0.4);' }} variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          {errors.general.error && (
            <Typography color="error" sx={{ textAlign: 'center' }}>
              {errors.general.message}
            </Typography>
          )}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                error={errors.email.error}
                helperText={errors.email.message}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={errors.email.error ? 'error' : 'primary'}
                value={formData.email}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={errors.password.error}
                helperText={errors.password.message}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                color={errors.password.error ? 'error' : 'primary'}
                value={formData.password}
                onChange={handleInputChange}
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
            >
              Sign in
            </Button>
        
          </Box>
         
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ textAlign: 'center' }}>
              Don&apos;t have an account?&nbsp;
              <Link
                href="/Yoona/signup"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}