import { apiClient, withMockFallback } from "@/api/client"
import { clients } from "@/data/mock"
import type { Client } from "@/types/client"

export interface ClientDto {
  id: string | number
  name: string
  email: string
  phone?: string
  nit?: string
  company_name?: string
  is_active?: boolean
  total_quoted?: number | string
  quotes_count?: number
  last_activity?: string
}

export interface ClientPayloadDto {
  name: string
  company_name?: string
  email: string
  phone?: string
  nit?: string
}

function mapClient(dto: ClientDto): Client {
  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    nit: dto.nit,
    companyType: dto.company_name ? "company" : "person",
    totalQuoted: Number(dto.total_quoted ?? 0),
    quotesCount: dto.quotes_count ?? 0,
    lastActivity: dto.last_activity ?? "",
  }
}

function toClientPayload(client: Omit<Client, "id" | "totalQuoted" | "quotesCount" | "lastActivity">): ClientPayloadDto {
  return {
    name: client.name,
    company_name: client.companyType === "company" ? client.name : "",
    email: client.email,
    phone: client.phone,
    nit: client.nit,
  }
}

export async function listClients(search = "") {
  const response = apiClient.get<ClientDto[]>("/clients/", { params: { search } }).then((res) => res.data.map(mapClient))
  return withMockFallback(response, clients)
}

export async function createClient(payload: Omit<Client, "id" | "totalQuoted" | "quotesCount" | "lastActivity">) {
  const fallback: Client = {
    ...payload,
    id: crypto.randomUUID(),
    totalQuoted: 0,
    quotesCount: 0,
    lastActivity: new Date().toISOString().slice(0, 10),
  }
  const response = apiClient.post<ClientDto>("/clients/", toClientPayload(payload)).then((res) => mapClient(res.data))
  return withMockFallback(response, fallback)
}
