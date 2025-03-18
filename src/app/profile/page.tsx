"use client";

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red, green } from '@mui/material/colors';
import SaveIcon from '@mui/icons-material/Save';
import Box from "@mui/material/Box";
import Fab from '@mui/material/Fab';
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField';
import { useRef, useState, useEffect } from 'react';
import PostList from '../_Components/PostList/PostList';
import { useUser } from '../_Components/UserContext/UserContext';

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function Profile() {
  const { userData } = useUser();
  const [expanded, setExpanded] = React.useState(false);
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const likedState = localStorage.getItem('isPostLiked');
    setIsLiked(likedState === 'true');
  }, []);

  const handleLikeClick = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    localStorage.setItem('isPostLiked', newLikedState.toString());
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file (PNG, JPG, or JPEG)');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!body && !image) {
        alert('Please add either text or an image to create a post');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('Token');
      if (!token) {
        throw new Error('No token found');
      }

      const formData = new FormData();
      if (body) {
        formData.append('body', body);
      }
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch('https://linked-posts.routemisr.com/posts', {
        method: 'POST',
        headers: {
          'token': token
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();
      console.log(data);
      
  
      setBody('');
      setImage(null);
      setPreview('');
      setRefreshTrigger(prev => prev + 1);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
       <Box sx={{backgroundColor: "#070E16",height:"100vh"}}>

      <Card sx={{ maxWidth: { xs: 300, sm: 345 }, margin: '0px auto 200px', transform: "translateY(100px)", }}>
        <CardHeader
          avatar={
            <Avatar
              src={userData?.photo}
              sx={{ bgcolor: red[500] }}
              aria-label="user"
            >
              {userData?.name?.charAt(0) || ''}
            </Avatar>
          }
          title="Create New Post"
        />
        
        <CardContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            
            <Fab
              size="small"
              color="primary"
              aria-label="add image"
              onClick={() => fileInputRef.current?.click()}
              sx={{
                bgcolor: green[500],
                '&:hover': {
                  bgcolor: green[700],
                },
              }}
            >
              <SaveIcon />
            </Fab>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || (!body && !image)}
              sx={{
                bgcolor: green[500],
                '&:hover': {
                  bgcolor: green[700],
                },
              }}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </Box>

          {preview && (
            <Box sx={{ mt: 2 }}>
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '4px' }} />
            </Box>
          )}
        </CardContent>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>Comments will appear here</Typography>
          </CardContent>
        </Collapse>
      </Card>
      
      <PostList refreshTrigger={refreshTrigger} />
      </Box>
    </>
  );
}