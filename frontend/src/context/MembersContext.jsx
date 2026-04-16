// src/context/MembersContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BASE_URL } from "../services/api";
import memberService from "../services/memberService";

const MembersContext = createContext();

export const MembersProvider = ({ children }) => {
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await memberService.getAll();
      const map = {};
      res.data.forEach((m) => { map[m.id] = m; });
      setMembersMap(map);
    } catch (err) {
      console.error("Error preloading members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // Call after adding/updating a member to keep map fresh
  const refreshMembers = () => fetchMembers();

  const getImageSrc = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `${BASE_URL}/uploads/${image}`;
  };

  return (
    <MembersContext.Provider value={{ membersMap, loading, refreshMembers, getImageSrc }}>
      {children}
    </MembersContext.Provider>
  );
};

// Custom hook for easy usage in any component
export const useMembers = () => useContext(MembersContext);

export default MembersContext;
