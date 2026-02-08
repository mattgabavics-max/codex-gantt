import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { api } from "../api/api";
import type {
  BulkUpdateTasksRequestBody,
  BulkUpdateTasksResponse,
  CreateProjectRequestBody,
  CreateProjectVersionRequestBody,
  CreateTaskRequestBody,
  ProjectListResponse,
  ProjectResponse,
  ProjectVersionsResponse,
  TaskResponse,
  UpdateProjectRequestBody,
  UpdateTaskRequestBody
} from "../api/types";

const keys = {
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  projectVersions: (id: string) => ["projects", id, "versions"] as const
};

export function useProjects(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...keys.projects, page, pageSize],
    queryFn: async () => {
      const res = await api.get<ProjectListResponse>("/api/projects", {
        params: { page, pageSize }
      });
      return res.data;
    }
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: keys.project(projectId),
    queryFn: async () => {
      const res = await api.get<ProjectResponse>(`/api/projects/${projectId}`);
      return res.data;
    },
    enabled: Boolean(projectId)
  });
}

export function useProjectVersions(projectId: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: [...keys.projectVersions(projectId), page, pageSize],
    queryFn: async () => {
      const res = await api.get<ProjectVersionsResponse>(
        `/api/projects/${projectId}/versions`,
        { params: { page, pageSize } }
      );
      return res.data;
    },
    enabled: Boolean(projectId)
  });
}

export function useCreateProject() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProjectRequestBody) => {
      const res = await api.post<ProjectResponse>("/api/projects", payload);
      return res.data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.projects })
  });
}

export function useUpdateProject(projectId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProjectRequestBody) => {
      const res = await api.put<ProjectResponse>(`/api/projects/${projectId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: keys.project(projectId) });
      client.invalidateQueries({ queryKey: keys.projects });
    }
  });
}

export function useDeleteProject(projectId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => api.delete(`/api/projects/${projectId}`),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: keys.projects });
      client.removeQueries({ queryKey: keys.project(projectId) });
    }
  });
}

export function useCreateTask(projectId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTaskRequestBody) => {
      const res = await api.post<TaskResponse>(
        `/api/projects/${projectId}/tasks`,
        payload
      );
      return res.data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.project(projectId) })
  });
}

export function useUpdateTask(projectId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: UpdateTaskRequestBody }) => {
      const res = await api.put<TaskResponse>(`/api/tasks/${taskId}`, updates);
      return res.data;
    },
    onMutate: async ({ taskId, updates }) => {
      await client.cancelQueries({ queryKey: keys.project(projectId) });
      const previous = client.getQueryData<ProjectResponse>(keys.project(projectId));
      if (previous?.tasks) {
        client.setQueryData<ProjectResponse>(keys.project(projectId), {
          ...previous,
          tasks: previous.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        client.setQueryData(keys.project(projectId), ctx.previous);
      }
    },
    onSettled: () => client.invalidateQueries({ queryKey: keys.project(projectId) })
  });
}

export function useDeleteTask(projectId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => api.delete(`/api/tasks/${taskId}`),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.project(projectId) })
  });
}

export function useBulkUpdateTasks(projectId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkUpdateTasksRequestBody) => {
      const res = await api.patch<BulkUpdateTasksResponse>(
        `/api/projects/${projectId}/tasks/bulk`,
        payload
      );
      return res.data;
    },
    onMutate: async (payload) => {
      await client.cancelQueries({ queryKey: keys.project(projectId) });
      const previous = client.getQueryData<ProjectResponse>(keys.project(projectId));
      if (previous?.tasks) {
        client.setQueryData<ProjectResponse>(keys.project(projectId), {
          ...previous,
          tasks: previous.tasks.map((task) => {
            const updates = payload.tasks.find((update) => update.id === task.id);
            return updates ? { ...task, ...updates } : task;
          })
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        client.setQueryData(keys.project(projectId), ctx.previous);
      }
    },
    onSettled: () => client.invalidateQueries({ queryKey: keys.project(projectId) })
  });
}

export function useCreateVersion(projectId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProjectVersionRequestBody) => {
      const res = await api.post(`/api/projects/${projectId}/versions`, payload);
      return res.data;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: keys.projectVersions(projectId) })
  });
}

export const queryKeys = keys;
