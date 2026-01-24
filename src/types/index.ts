import { Request, ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// User Types
export type UserRole = 'admin' | 'inspector' | 'viewer';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// ORS Plan Types
export type ORSStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface IORSScores {
  engine: number;
  brakes: number;
  tires: number;
  transmission: number;
  electrical: number;
  suspension: number;
  steering: number;
  bodyExterior: number;
  interior: number;
  safetyEquipment: number;
}

export interface ITextDocumentation {
  engineNotes?: string;
  brakesNotes?: string;
  tiresNotes?: string;
  transmissionNotes?: string;
  electricalNotes?: string;
  suspensionNotes?: string;
  steeringNotes?: string;
  bodyExteriorNotes?: string;
  interiorNotes?: string;
  safetyEquipmentNotes?: string;
}

export interface IORSPlan {
  _id: string;
  vehicleId: string;
  vehicleType: string;
  inspectionDate: Date;
  nextInspectionDate: Date;
  status: ORSStatus;
  scores: IORSScores;
  overallScore: number;
  textDocumentation: ITextDocumentation;
  notes?: string;
  createdBy: string | IUserResponse;
  assignedTo?: string | IUserResponse;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface AuthRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: IUserResponse;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Query Types
export interface ORSQueryParams {
  search?: string;
  scoreMin?: number;
  scoreMax?: number;
  status?: ORSStatus;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserQueryParams {
  search?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
}
