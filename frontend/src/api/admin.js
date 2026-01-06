// src/api/admin.js

// FRONTEND-ONLY MOCK ADMIN API

export const getOverview = async () => {
  return {
    data: {
      active_orphanages: Number(localStorage.getItem("orphanageCount")) || 3,
      total_students: Number(localStorage.getItem("studentCount")) || 42,
    },
  };
};

export const getOrphanages = async () => {
  return {
    data: JSON.parse(localStorage.getItem("orphanages")) || [
      { id: 1, name: "Sunrise Orphanage", students: 18 },
      { id: 2, name: "Hope Home", students: 24 },
    ],
  };
};
