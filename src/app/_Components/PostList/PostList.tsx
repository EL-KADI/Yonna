"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red, green } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Modal from "@mui/material/Modal";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Fab from "@mui/material/Fab";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Divider from "@mui/material/Divider";
import { InputAdornment } from "@mui/material";
import { useUser } from "../UserContext/UserContext";

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
  createdAt: string;
  user: {
    name: string;
    photo?: string;
  };
  comments: Comment[];
}

interface PostListProps {
  refreshTrigger?: number;
}

interface CommentResponse {
  message: string;
  comments: Comment[];
}

const COMMENTS_PER_PAGE = 6;

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
} as const; // تحديد النوع كـ const لتجنب مشاكل أخرى محتملة

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

export default function PostList({ refreshTrigger = 0 }: PostListProps) {
  const { userData } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [visibleComments, setVisibleComments] = useState<
    Record<string, number>
  >({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [editCommentLoading, setEditCommentLoading] = useState(false);
  const [commentMenuAnchorEl, setCommentMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("Token");
    setToken(storedToken);
  }, []);

  const handleExpandClick = (postId: string) => {
    setExpandedId(expandedId === postId ? null : postId);
    if (!visibleComments[postId]) {
      setVisibleComments((prev) => ({ ...prev, [postId]: COMMENTS_PER_PAGE }));
    }
  };

  const handleShowMoreComments = (postId: string) => {
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: (prev[postId] || COMMENTS_PER_PAGE) + COMMENTS_PER_PAGE,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    postId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCommentMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    commentId: string
  ) => {
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
    if (!token) {
      alert("Please log in to edit comments");
      return;
    }

    try {
      setEditCommentLoading(true);

      const response = await fetch(
        `https://linked-posts.routemisr.com/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({
            content: editCommentContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.map((comment) =>
                comment._id === commentId
                  ? { ...comment, content: editCommentContent }
                  : comment
              ),
            };
          }
          return post;
        })
      );

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
    if (!token) {
      alert("Please log in to delete comments");
      return;
    }

    try {
      const response = await fetch(
        `https://linked-posts.routemisr.com/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            token: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: post.comments.filter(
                (comment) => comment._id !== commentId
              ),
            };
          }
          return post;
        })
      );

      handleCommentMenuClose();
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const handleEditClick = (post: Post) => {
    setSelectedPost(post);
    setSelectedPostId(post._id);
    setEditBody(post.body || "");
    setEditImagePreview(post.image || "");
    setEditImage(null);
    setRemoveImage(false);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg")
    ) {
      setEditImage(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditImagePreview(result);
        if (selectedPostId) {
          setPosts(
            posts.map((post) =>
              post._id === selectedPostId ? { ...post, image: result } : post
            )
          );
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file (PNG, JPG, or JPEG)");
    }
  };

  const handleRemoveImage = () => {
    setEditImage(null);
    setEditImagePreview("");
    setRemoveImage(true);
    if (selectedPostId) {
      setPosts(
        posts.map((post) =>
          post._id === selectedPostId ? { ...post, image: undefined } : post
        )
      );
    }
  };

  const handleEditSubmit = async () => {
    if (!token) {
      alert("Please log in to edit posts");
      return;
    }

    if (!selectedPostId) {
      console.log("Selected Post ID:", selectedPostId);
      alert("No post selected for editing");
      return;
    }

    try {
      setEditLoading(true);
      const formData = new FormData();
      formData.append("body", editBody);

      if (editImage) {
        formData.append("image", editImage);
      }

      if (removeImage) {
        formData.append("removeImage", "true");
      }

      const response = await fetch(
        `https://linked-posts.routemisr.com/posts/${selectedPostId}`,
        {
          method: "PUT",
          headers: {
            token: token,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to update post");
      }

      const updatedPost = await response.json();

      setPosts(
        posts.map((post) =>
          post._id === selectedPostId
            ? {
                ...post,
                body: editBody,
                image: removeImage
                  ? undefined
                  : editImage
                  ? updatedPost.image
                  : editImagePreview || post.image,
              }
            : post
        )
      );

      setEditDialogOpen(false);
      setEditImage(null);
      setEditImagePreview("");
      setEditBody("");
      setSelectedPost(null);
      setRemoveImage(false);
    } catch (error) {
      console.error("Error updating post:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update post. Please try again."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedPostId) {
      alert("Unable to delete post. Please try again.");
      return;
    }

    try {
      const response = await fetch(
        `https://linked-posts.routemisr.com/posts/${selectedPostId}`,
        {
          method: "DELETE",
          headers: {
            token: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts(posts.filter((post) => post._id !== selectedPostId));
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
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

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditImage(null);
    setEditImagePreview("");
    setEditBody("");
    setSelectedPost(null);
    setRemoveImage(false);
    if (selectedPostId && selectedPost) {
      setPosts(
        posts.map((post) =>
          post._id === selectedPostId
            ? { ...post, image: selectedPost.image }
            : post
        )
      );
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    if (!token) {
      alert("Please log in to comment");
      return;
    }

    if (!newComment[postId]?.trim()) {
      return;
    }

    try {
      setCommentLoading((prev) => ({ ...prev, [postId]: true }));

      const response = await fetch(
        "https://linked-posts.routemisr.com/comments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({
            content: newComment[postId],
            post: postId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data: CommentResponse = await response.json();

      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, data.comments[0]],
            };
          }
          return post;
        })
      );

      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  useEffect(() => {
    const savedLikedPosts = JSON.parse(
      localStorage.getItem("likedPosts") || "{}"
    );
    setLikedPosts(savedLikedPosts);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) {
        setError("Please log in to view posts");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://linked-posts.routemisr.com/users/664bcf3e33da217c4af21f00/posts?limit=20000",
          {
            headers: {
              token: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        const sortedPosts = data.posts.sort(
          (a: Post, b: Post) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPosts();
    }
  }, [token, refreshTrigger]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
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
    <Box sx={{ backgroundColor: "#070E16" }}>
      <Box
        sx={{
          maxWidth: { xs: 300, sm: 500, md: 600 },
          margin: "0 auto",
          mt: 4,
        }}
      >
        {posts.map((post) => (
          <Card key={post._id} sx={{ mb: 10 }}>
            <CardHeader
              avatar={
                <Avatar
                  src={post.user.photo || userData?.photo}
                  sx={{ bgcolor: red[500] }}
                  aria-label="user"
                >
                  {post.user.name[0]}
                </Avatar>
              }
              action={
                <>
                  <IconButton
                    aria-label="settings"
                    onClick={(e) => handleMenuClick(e, post._id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedPostId === post._id}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleEditClick(post)}>
                      Edit
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>Delete</MenuItem>
                  </Menu>
                </>
              }
              title={post.user.name}
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

                {/* Add comment input */}
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={newComment[post._id] || ""}
                    onChange={(e) =>
                      setNewComment((prev) => ({
                        ...prev,
                        [post._id]: e.target.value,
                      }))
                    }
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
                            disabled={
                              commentLoading[post._id] ||
                              !newComment[post._id]?.trim()
                            }
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

                <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                  {post.comments && post.comments.length > 0 ? (
                    <>
                      {post.comments
                        .slice(
                          0,
                          visibleComments[post._id] || COMMENTS_PER_PAGE
                        )
                        .map((comment, index) => (
                          <React.Fragment key={comment._id}>
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar
                                  src={comment.commentCreator.photo}
                                  alt={comment.commentCreator.name}
                                >
                                  {comment.commentCreator.name[0]}
                                </Avatar>
                              </ListItemAvatar>
                              {editingComment === comment._id ? (
                                <Box
                                  sx={{
                                    flex: 1,
                                    display: "flex",
                                    gap: 1,
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    size="small"
                                    value={editCommentContent}
                                    onChange={(e) =>
                                      setEditCommentContent(e.target.value)
                                    }
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleEditCommentSubmit(
                                          post._id,
                                          comment._id
                                        );
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() =>
                                      handleEditCommentSubmit(
                                        post._id,
                                        comment._id
                                      )
                                    }
                                    disabled={
                                      editCommentLoading ||
                                      !editCommentContent.trim()
                                    }
                                  >
                                    {editCommentLoading ? "Saving..." : "Save"}
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
                                    primary={comment.commentCreator.name}
                                    secondary={
                                      <React.Fragment>
                                        <Typography
                                          sx={{ display: "inline" }}
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
                                  {comment.commentCreator._id ===
                                    userData?._id && (
                                    <ListItemSecondaryAction>
                                      <IconButton
                                        edge="end"
                                        aria-label="comment options"
                                        onClick={(e) =>
                                          handleCommentMenuClick(e, comment._id)
                                        }
                                      >
                                        <MoreVertIcon />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  )}
                                </>
                              )}
                            </ListItem>
                            {index <
                              (visibleComments[post._id] || COMMENTS_PER_PAGE) -
                                1 && <Divider variant="inset" component="li" />}
                          </React.Fragment>
                        ))}
                      {post.comments.length >
                        (visibleComments[post._id] || COMMENTS_PER_PAGE) && (
                        <Box sx={{ textAlign: "center", mt: 2 }}>
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
                    <Typography
                      sx={{ p: 0.5 }}
                      variant="body2"
                      color="text.secondary"
                    >
                      No comments yet
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Collapse>
          </Card>
        ))}
      </Box>

      <Menu
        anchorEl={commentMenuAnchorEl}
        open={Boolean(commentMenuAnchorEl)}
        onClose={handleCommentMenuClose}
      >
        <MenuItem
          onClick={() => {
            const comment = posts
              .flatMap((post) => post.comments)
              .find((comment) => comment._id === selectedCommentId);
            if (comment) {
              handleEditCommentClick(comment);
            }
          }}
        >
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            const post = posts.find((post) =>
              post.comments.some((comment) => comment._id === selectedCommentId)
            );
            if (post && selectedCommentId) {
              handleDeleteComment(post._id, selectedCommentId);
            }
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Post</DialogTitle>
        <DialogContent>
          <Card sx={{ boxShadow: "none" }}>
            <CardHeader
              avatar={
                <Avatar
                  src={selectedPost?.user.photo || userData?.photo}
                  sx={{ bgcolor: red[500] }}
                  aria-label="user"
                >
                  {selectedPost?.user.name[0] || ""}
                </Avatar>
              }
              title={selectedPost?.user.name}
              subheader="Editing post"
            />
            <CardContent>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="What's on your mind?"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  hidden
                  ref={fileInputRef}
                  onChange={handleEditImageChange}
                />

                <Fab
                  size="small"
                  color="primary"
                  aria-label="add image"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    bgcolor: green[500],
                    "&:hover": {
                      bgcolor: green[700],
                    },
                  }}
                >
                  <SaveIcon />
                </Fab>

                {(editImagePreview || selectedPost?.image) && !removeImage && (
                  <Fab
                    size="small"
                    color="error"
                    aria-label="remove image"
                    onClick={handleRemoveImage}
                    sx={{
                      bgcolor: red[500],
                      "&:hover": {
                        bgcolor: red[700],
                      },
                    }}
                  >
                    <DeleteIcon />
                  </Fab>
                )}

                <Button
                  variant="contained"
                  onClick={handleEditSubmit}
                  disabled={
                    editLoading ||
                    (!editBody &&
                      !editImage &&
                      !editImagePreview &&
                      !removeImage)
                  }
                  sx={{
                    bgcolor: green[500],
                    "&:hover": {
                      bgcolor: green[700],
                    },
                  }}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </Button>
              </Box>

              {editImagePreview && !removeImage && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    style={{ maxWidth: "100%", borderRadius: "4px" }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <Modal
        open={!!selectedImage}
        onClose={handleCloseModal}
        sx={modalStyle}
        onClick={handleCloseModal}
      >
        <Box sx={{ position: "relative" }}>
          <IconButton onClick={handleCloseModal} sx={closeButtonStyle}>
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
    </Box>
  );
}