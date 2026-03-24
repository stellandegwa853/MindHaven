// Helper used by all dashboard pages for logout
export const logoutUser = () => {
  localStorage.removeItem("mh_token");
  localStorage.removeItem("mh_user");
};

// Get the stored token (for API calls later)
export const getToken = () => localStorage.getItem("mh_token");

// Get the stored user object
export const getUser = () => {
  const user = localStorage.getItem("mh_user");
  return user ? JSON.parse(user) : null;
};

// Check if user is logged in
export const isLoggedIn = () => !!localStorage.getItem("mh_token");

// Check user role
export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};