import { apiClient, withMockFallback } from "@/api/client"
import { catalogItems } from "@/data/mock"
import type { CatalogItem } from "@/types/catalog"

export interface CatalogItemDto {
  id: string | number
  name: string
  description?: string
  category: string | number | null
  item_type?: "product" | "service"
  sku?: string
  unit_price: number | string
  unit?: string
  currency?: "GTQ" | "USD"
  taxable?: boolean
  is_active: boolean
}

export interface CatalogItemPayloadDto {
  name: string
  description: string
  category: string | number | null
  item_type: "product" | "service"
  sku?: string
  unit_price: number
  unit: string
  currency: "GTQ" | "USD"
  taxable: boolean
  is_active: boolean
}

function mapCatalogItem(dto: CatalogItemDto): CatalogItem {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? "",
    category: dto.category ? String(dto.category) : "Sin categoria",
    unitPrice: Number(dto.unit_price),
    taxRate: dto.taxable === false ? 0 : 0.12,
    active: dto.is_active,
  }
}

function toCatalogItemPayload(item: Omit<CatalogItem, "id">): CatalogItemPayloadDto {
  return {
    name: item.name,
    description: item.description,
    category: null,
    item_type: "service",
    unit_price: item.unitPrice,
    unit: "unidad",
    currency: "GTQ",
    taxable: item.taxRate > 0,
    is_active: item.active,
  }
}

export async function listCatalogItems(search = "") {
  const response = apiClient.get<CatalogItemDto[]>("/catalog/items/", { params: { search } }).then((res) => res.data.map(mapCatalogItem))
  return withMockFallback(response, catalogItems)
}

export async function createCatalogItem(payload: Omit<CatalogItem, "id">) {
  const fallback: CatalogItem = { ...payload, id: crypto.randomUUID() }
  const response = apiClient.post<CatalogItemDto>("/catalog/items/", toCatalogItemPayload(payload)).then((res) => mapCatalogItem(res.data))
  return withMockFallback(response, fallback)
}
