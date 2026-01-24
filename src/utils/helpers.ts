import mongoose from 'mongoose';

export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const sanitizeUser = (user: any) => {
  const { password, __v, ...sanitizedUser } = user.toObject ? user.toObject() : user;
  return sanitizedUser;
};

export const calculatePagination = (page: number, limit: number, total: number) => {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

export const getScoreCategory = (score: number): string => {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 30) return 'poor';
  return 'critical';
};
