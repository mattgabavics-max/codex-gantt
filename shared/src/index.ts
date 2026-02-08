export type ShareAccessType = "readonly" | "editable";

export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  deletedAt?: string | null;
};

export type ProjectVersion = {
  id: string;
  projectId: string;
  versionNumber: number;
  snapshotData: unknown;
  createdAt: string;
  createdBy: string;
};

export type Task = {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  color?: string | null;
  position: number;
  createdAt: string;
};

export type ShareLink = {
  id: string;
  projectId: string;
  token: string;
  accessType: ShareAccessType;
  createdAt: string;
  expiresAt?: string | null;
};

export type RegisterRequestBody = {
  email: string;
  password: string;
};

export type RegisterResponseBody = {
  token: string;
};

export type LoginRequestBody = {
  email: string;
  password: string;
};

export type LoginResponseBody = {
  token: string;
};

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ProjectListResponse = PaginatedResponse<Project>;

export type CreateProjectRequestBody = {
  name: string;
  isPublic?: boolean;
};

export type ProjectResponse = {
  project: Project;
  tasks?: Task[];
};

export type UpdateProjectRequestBody = {
  name?: string;
  isPublic?: boolean;
};

export type ProjectVersionResponse = {
  version: ProjectVersion;
};

export type ProjectVersionsResponse = PaginatedResponse<ProjectVersion>;

export type CreateProjectVersionRequestBody = {
  snapshotData: unknown;
};

export type CreateTaskRequestBody = {
  name: string;
  startDate: string;
  endDate: string;
  color?: string | null;
  position: number;
};

export type UpdateTaskRequestBody = {
  name?: string;
  startDate?: string;
  endDate?: string;
  color?: string | null;
  position?: number;
};

export type TaskResponse = {
  task: Task;
};

export type BulkUpdateTasksRequestBody = {
  tasks: Array<{
    id: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    color?: string | null;
    position?: number;
  }>;
};

export type BulkUpdateTasksResponse = {
  tasks: Task[];
};
