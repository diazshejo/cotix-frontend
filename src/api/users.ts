import { apiClient } from "@/api/client"
import type { TeamMember, UserRole } from "@/types/user"

interface TeamMemberDto {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  is_active: boolean
  email_verified: boolean
}

export interface CreateMemberPayload {
  email: string
  first_name: string
  last_name: string
  role: UserRole
  password: string
}

function mapMember(dto: TeamMemberDto): TeamMember {
  return {
    id: String(dto.id),
    email: dto.email,
    firstName: dto.first_name,
    lastName: dto.last_name,
    fullName: `${dto.first_name} ${dto.last_name}`.trim() || dto.email,
    role: dto.role,
    isActive: dto.is_active,
    emailVerified: dto.email_verified,
  }
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const res = await apiClient.get<TeamMemberDto[]>("/auth/users/")
  return res.data.map(mapMember)
}

export async function createTeamMember(payload: CreateMemberPayload): Promise<TeamMember> {
  const res = await apiClient.post<TeamMemberDto>("/auth/users/", payload)
  return mapMember(res.data)
}

export async function updateTeamMemberRole(id: string, role: UserRole): Promise<TeamMember> {
  const res = await apiClient.patch<TeamMemberDto>(`/auth/users/${id}/`, { role })
  return mapMember(res.data)
}

export async function removeTeamMember(id: string): Promise<void> {
  await apiClient.delete(`/auth/users/${id}/`)
}
