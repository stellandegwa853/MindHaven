export const loginUser = (role) => {
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("role", role);
};

export const logoutUser = () => {
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("role");
};

export const isAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

export const getUserRole = () => {
  return localStorage.getItem("role");
};