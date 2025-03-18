"use client";

import * as React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import { useUser } from "./_Components/UserContext/UserContext";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { InputAdornment } from "@mui/material";

interface Comment {
  _id: string;
  content: string;
  commentCreator: {
    _id: string;
    name: string;
    photo: string;
  };
  createdAt: string;
}

interface Post {
  _id: string;
  body?: string;
  image?: string;
  createdAt: string; // تمت إضافتها هنا
  user: {
    _id: string;
    name: string;
    photo: string;
  };
  comments: Comment[];
}

interface PaginationInfo {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage: number;
  total: number;
}

interface ApiResponse {
  message: string;
  paginationInfo: PaginationInfo;
  posts: Post[];
}

interface CommentResponse {
  message: string;
  comments: Comment[];
}

const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1300,
} as const;

const imageStyle: React.CSSProperties = {
  maxHeight: "90vh",
  maxWidth: "90vw",
  objectFit: "contain",
};

const closeButtonStyle = {
  position: "absolute",
  top: 20,
  right: 20,
  color: "white",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
} as const;

const COMMENTS_PER_PAGE = 6;

export default function Home() {
  const router = useRouter();
  const { userData } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [visibleComments, setVisibleComments] = useState<Record<string, number>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [editCommentLoading, setEditCommentLoading] = useState(false);
  const [commentMenuAnchorEl, setCommentMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const navigateToUserProfile = (userId: string, userName: string, userPhoto: string) => {
    router.push(`/user/${userId}?name=${encodeURIComponent(userName)}&photo=${encodeURIComponent(userPhoto || "")}`);
  };

  const handleExpandClick = (postId: string) => {
    setExpandedId(expandedId === postId ? null : postId);
    if (!visibleComments[postId]) {
      setVisibleComments(prev => ({ ...prev, [postId]: COMMENTS_PER_PAGE }));
    }
  };

  const handleShowMoreComments = (postId: string) => {
    setVisibleComments(prev => ({
      ...prev,
      [postId]: (prev[postId] || COMMENTS_PER_PAGE) + COMMENTS_PER_PAGE
    }));
  };

  const handleLikeClick = (postId: string) => {
    setLikedPosts((prev) => {
      const newLikedPosts = {
        ...prev,
        [postId]: !prev[postId],
      };
      localStorage.setItem("likedPosts", JSON.stringify(newLikedPosts));
      return newLikedPosts;
    });
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleCommentMenuClick = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    event.stopPropagation();
    setCommentMenuAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleCommentMenuClose = () => {
    setCommentMenuAnchorEl(null);
    setSelectedCommentId(null);
  };

  const handleEditCommentClick = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditCommentContent(comment.content);
    handleCommentMenuClose();
  };

  const handleEditCommentSubmit = async (postId: string, commentId: string) => {
    const token = localStorage.getItem("Token");
    if (!token) {
      alert("Please log in to edit comments");
      return;
    }

    try {
      setEditCommentLoading(true);

      const response = await fetch(`https://linked-posts.routemisr.com/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          content: editCommentContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment => 
              comment._id === commentId
                ? { ...comment, content: editCommentContent }
                : comment
            ),
          };
        }
        return post;
      }));

      setEditingComment(null);
      setEditCommentContent("");
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment");
    } finally {
      setEditCommentLoading(false);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const token = localStorage.getItem("Token");
    if (!token) {
      alert("Please log in to delete comments");
      return;
    }

    try {
      const response = await fetch(`https://linked-posts.routemisr.com/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          token: token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: post.comments.filter(comment => comment._id !== commentId),
          };
        }
        return post;
      }));

      handleCommentMenuClose();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!newComment[postId]?.trim()) return;

    const token = localStorage.getItem("Token");
    if (!token) {
      alert("Please log in to comment");
      return;
    }

    try {
      setCommentLoading(prev => ({ ...prev, [postId]: true }));

      const response = await fetch("https://linked-posts.routemisr.com/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          content: newComment[postId],
          post: postId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data: CommentResponse = await response.json();
      
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [...post.comments, data.comments[0]],
          };
        }
        return post;
      }));

      setNewComment(prev => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchPosts = async (pageNumber: number) => {
    try {
      const token = localStorage.getItem("Token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(
        `https://linked-posts.routemisr.com/posts?limit=10&page=${pageNumber}`,
        {
          headers: {
            token: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  };

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || (paginationInfo && page >= paginationInfo.numberOfPages)) return;

    try {
      setLoadingMore(true);
      const data = await fetchPosts(page + 1);
      setPosts(prev => [...prev, ...data.posts]);
      setPaginationInfo(data.paginationInfo);
      setPage(prev => prev + 1);
    } catch (error) {
      setError("Failed to load more posts");
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, paginationInfo]);

  useEffect(() => {
    const savedLikedPosts = JSON.parse(
      localStorage.getItem("likedPosts") || "{}"
    );
    setLikedPosts(savedLikedPosts);
  }, []);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        const data = await fetchPosts(1);
        setPosts(data.posts);
        setPaginationInfo(data.paginationInfo);
        setLoading(false);
      } catch (error) {
        setError("Failed to load posts");
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, []);

  useEffect(() => {
    if (loading || !lastPostRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(lastPostRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadMorePosts]);

  if (loading) {
    return (
      <Box sx={{backgroundColor: "#070E16",height:"100vh"}}>
      <Box sx={{ display: "flex", justifyContent: "center", transform: "translateY(700%)" }}>
        <CircularProgress />
      </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4, color: "error.main" }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <>
    <Box sx={{backgroundColor: "#070E16",}}>
      <Box sx={{ maxWidth: { xs: 300, sm: 500, md: 600 }, margin: "auto", pt: 15, }}>
        {posts.map((post, index) => (
          <Card 
            key={post._id} 
            sx={{ mb: 10 }}
            ref={index === posts.length - 1 ? lastPostRef : null}
          >
            <CardHeader
              avatar={
                <Avatar
                  src={post.user.photo}
                  sx={{ 
                    bgcolor: red[500], 
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  aria-label="user"
                  onClick={() => navigateToUserProfile(post.user._id, post.user.name, post.user.photo)}
                >
                  {post.user.name[0]}
                </Avatar>
              }
              title={
                <Typography
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  onClick={() => navigateToUserProfile(post.user._id, post.user.name, post.user.photo)}
                >
                  {post.user.name}
                </Typography>
              }
              subheader={formatDate(post.createdAt)}
            />
            {post.body && (
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {post.body}
                </Typography>
              </CardContent>
            )}
            {post.image && (
              <CardMedia
                component="img"
                height="194"
                image={post.image}
                alt="Post image"
                sx={{
                  objectFit: "cover",
                  cursor: "pointer",
                  transition: "opacity 0.4s ease",
                  "&:hover": {
                    opacity: 0.9,
                  },
                }}
                onClick={() => handleImageClick(post.image!)}
              />
            )}
            <CardActions disableSpacing>
              <IconButton
                aria-label="add to favorites"
                onClick={() => handleLikeClick(post._id)}
                sx={{
                  color: likedPosts[post._id] ? red[500] : "inherit",
                  transition: "color 0.4s ease",
                  "&:hover": {
                    color: likedPosts[post._id] ? red[700] : red[200],
                  },
                }}
              >
                <FavoriteIcon />
              </IconButton>
              <ExpandMore
                expand={expandedId === post._id}
                onClick={() => handleExpandClick(post._id)}
                aria-expanded={expandedId === post._id}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </CardActions>
            <Collapse in={expandedId === post._id} timeout="auto" unmountOnExit>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comments
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={newComment[post._id] || ""}
                    onChange={(e) => setNewComment(prev => ({ ...prev, [post._id]: e.target.value }))}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit(post._id);
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleCommentSubmit(post._id)}
                            disabled={commentLoading[post._id] || !newComment[post._id]?.trim()}
                            size="small"
                          >
                            {commentLoading[post._id] ? (
                              <CircularProgress size={20} />
                            ) : (
                              <SendIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                    
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {post.comments && post.comments.length > 0 ? (
                    <>
                      {[...post.comments]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, visibleComments[post._id] || COMMENTS_PER_PAGE)
                        .map((comment, index) => (
                          <React.Fragment key={comment._id}>
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar 
                                  src={comment.commentCreator.photo} 
                                  alt={comment.commentCreator.name}
                                  sx={{ 
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 }
                                  }}
                                  onClick={() => navigateToUserProfile(comment.commentCreator._id, comment.commentCreator.name, comment.commentCreator.photo)}
                                >
                                  {comment.commentCreator.name[0]}
                                </Avatar>
                              </ListItemAvatar>
                              {editingComment === comment._id ? (
                                <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    value={editCommentContent}
                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleEditCommentSubmit(post._id, comment._id);
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => handleEditCommentSubmit(post._id, comment._id)}
                                    disabled={editCommentLoading || !editCommentContent.trim()}
                                  >
                                    {editCommentLoading ? 'Saving...' : 'Save'}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                      setEditingComment(null);
                                      setEditCommentContent("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </Box>
                              ) : (
                                <>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        sx={{ 
                                          cursor: 'pointer',
                                          '&:hover': { textDecoration: 'underline' }
                                        }}
                                        onClick={() => navigateToUserProfile(comment.commentCreator._id, comment.commentCreator.name, comment.commentCreator.photo)}
                                      >
                                        {comment.commentCreator.name}
                                      </Typography>
                                    }
                                    secondary={
                                      <React.Fragment>
                                        <Typography
                                          sx={{ display: 'inline' }}
                                          component="span"
                                          variant="body2"
                                          color="text.primary"
                                        >
                                          {comment.content}
                                        </Typography>
                                        {" — "}
                                        {formatDate(comment.createdAt)}
                                      </React.Fragment>
                                    }
                                  />
                                  {comment.commentCreator._id === userData?._id && (
                                    <ListItemSecondaryAction>
                                      <IconButton
                                        edge="end"
                                        aria-label="comment options"
                                        onClick={(e) => handleCommentMenuClick(e, comment._id)}
                                      >
                                        <MoreVertIcon />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  )}
                                </>
                              )}
                            </ListItem>
                            {index < (visibleComments[post._id] || COMMENTS_PER_PAGE) - 1 && (
                              <Divider variant="inset" component="li" />
                            )}
                          </React.Fragment>
                        ))}
                      {post.comments.length > (visibleComments[post._id] || COMMENTS_PER_PAGE) && (
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Button
                            onClick={() => handleShowMoreComments(post._id)}
                            variant="text"
                            color="primary"
                          >
                            Show More Comments
                          </Button>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No comments yet
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Collapse>
          </Card>
        ))}
        {loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
      </Box>

      <Menu
        anchorEl={commentMenuAnchorEl}
        open={Boolean(commentMenuAnchorEl)}
        onClose={handleCommentMenuClose}
      >
        <MenuItem onClick={() => {
          const comment = posts
            .flatMap(post => post.comments)
            .find(comment => comment._id === selectedCommentId);
          if (comment) {
            handleEditCommentClick(comment);
          }
        }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => {
          const post = posts.find(post =>
            post.comments.some(comment => comment._id === selectedCommentId)
          );
          if (post && selectedCommentId) {
            handleDeleteComment(post._id, selectedCommentId);
          }
        }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Modal
        open={!!selectedImage}
        onClose={handleCloseModal}
        sx={modalStyle}
        onClick={handleCloseModal}
      >
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={handleCloseModal}
            sx={closeButtonStyle}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Enlarged post"
              style={imageStyle}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </Box>
        
      </Modal>
    </>
  );
}