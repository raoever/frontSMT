import { api } from "../lib/apiClient";

export type JsonFile = {
  _id: string;
  title: string;
  filename: string;
  size: number;
  createdAt: string;
  updatedAt: string;
};

export type JsonFileDetail = JsonFile & { data: any };

export async function listFiles(): Promise<JsonFile[]> {
  const { data } = await api.get("/files");
  return data;
}

export async function getFile(id: string): Promise<JsonFileDetail> {
  const { data } = await api.get(`/files/${id}`);
  return data;
}

export async function createFile(payload: {
  title: string;
  file: File;
}): Promise<JsonFileDetail> {
  const form = new FormData();
  form.append("title", payload.title);
  form.append("file", payload.file);
  const { data } = await api.post(
    "https://backsmt.onrender.com/api/json",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}

export async function updateFile(
  id: string,
  payload: { title: string; file?: File }
): Promise<JsonFileDetail> {
  const form = new FormData();
  form.append("title", payload.title);
  if (payload.file) form.append("file", payload.file);
  const { data } = await api.put(`/files/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteFile(id: string): Promise<void> {
  await api.delete(`/files/${id}`);
}
