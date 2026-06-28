import type { KnowledgeDocument, DocumentStatus, Collection, User, ActivityEvent, SearchHistoryItem } from "../types";
import { apiFetch } from "../api";

export const documentsService = {
  async list(): Promise<KnowledgeDocument[]> {
    return apiFetch<KnowledgeDocument[]>("/documents");
  },
  
  async get(id: string): Promise<KnowledgeDocument | null> {
    try {
      return await apiFetch<KnowledgeDocument>(`/documents/${id}`);
    } catch {
      return null;
    }
  },
  
  async search(params: {
    q?: string;
    collectionId?: string;
    department?: string;
    documentType?: string;
    tag?: string;
    status?: DocumentStatus;
  }): Promise<KnowledgeDocument[]> {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.collectionId) query.set("collectionId", params.collectionId);
    if (params.department) query.set("department", params.department);
    if (params.documentType) query.set("documentType", params.documentType);
    if (params.tag) query.set("tag", params.tag);
    if (params.status) query.set("status", params.status);

    return apiFetch<KnowledgeDocument[]>(`/documents?${query.toString()}`);
  },

  async upload(formData: FormData): Promise<KnowledgeDocument> {
    return apiFetch<KnowledgeDocument>("/documents/upload", {
      method: "POST",
      body: formData,
    });
  },

  async updateMetadata(id: string, metadata: Partial<KnowledgeDocument>): Promise<KnowledgeDocument> {
    return apiFetch<KnowledgeDocument>(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(metadata),
    });
  },

  async archive(id: string): Promise<KnowledgeDocument> {
    return apiFetch<KnowledgeDocument>(`/documents/${id}/archive`, {
      method: "POST",
    });
  },

  async chunks(id: string): Promise<any[]> {
    return apiFetch<any[]>(`/documents/${id}/chunks`);
  },

  async indexingStatus(id: string): Promise<any> {
    return apiFetch<any>(`/documents/${id}/indexing-status`);
  },

  async index(id: string): Promise<KnowledgeDocument> {
    return apiFetch<KnowledgeDocument>(`/documents/${id}/index`, {
      method: "POST",
    });
  },

  async reindex(id: string): Promise<KnowledgeDocument> {
    return apiFetch<KnowledgeDocument>(`/documents/${id}/reindex`, {
      method: "POST",
    });
  }
};


export const collectionsService = {
  async list(): Promise<Collection[]> {
    return apiFetch<Collection[]>("/collections");
  },
  
  async get(id: string): Promise<Collection | null> {
    try {
      return await apiFetch<Collection>(`/collections/${id}`);
    } catch {
      return null;
    }
  },
  
  async create(collection: Collection & { id: string }): Promise<Collection> {
    return apiFetch<Collection>("/collections", {
      method: "POST",
      body: JSON.stringify(collection),
    });
  },
  
  async update(id: string, collection: Partial<Collection>): Promise<Collection> {
    return apiFetch<Collection>(`/collections/${id}`, {
      method: "PUT",
      body: JSON.stringify(collection),
    });
  }
};

export const usersService = {
  async list(): Promise<User[]> {
    return apiFetch<User[]>("/users");
  },
};

export const activityService = {
  async list(): Promise<ActivityEvent[]> {
    return apiFetch<ActivityEvent[]>("/audit");
  },
};

export const searchHistoryService = {
  async list(): Promise<SearchHistoryItem[]> {
    return apiFetch<SearchHistoryItem[]>("/search-history");
  },
};

export const analyticsService = {
  async dashboard() {
    return apiFetch<any>("/analytics/dashboard");
  },
};

