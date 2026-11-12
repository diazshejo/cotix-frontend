import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, CheckCircle2, Copy, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { createTeamMember, listTeamMembers, removeTeamMember, updateTeamMemberRole } from "@/api/users"
import { useConfirm } from "@/components/common/ConfirmDialog"
import { PageSkeleton } from "@/components/common/Skeleton"
import { ErrorState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { InputField, SelectField } from "@/components/ui/Form"
import { Modal } from "@/components/ui/Modal"
import { queryKeys } from "@/constants/queryKeys"
import { routes } from "@/constants/routes"
import { useAuthStore } from "@/stores/authStore"
import type { TeamMember, TenantPlan, UserRole } from "@/types/user"
import { cn } from "@/utils/cn"
import { canPerform } from "@/utils/permissions"
import {
  createMemberSchema,
  editMemberRoleSchema,
  type CreateMemberForm,
  type EditMemberRoleForm,
} from "@/utils/validators"

// Must stay in sync with backend apps/tenants/services/plans.py QUOTA_MAX_USERS
const USER_LIMITS: Record<TenantPlan, number | null> = {
  free: 1,
  basic: 1,
  premium: 3,
  business: null,
}

const ROLE_LABEL: Record<UserRole, string> = {
  tenant_admin: "Administrador",
  seller: "Vendedor",
  viewer: "Lector",
  super_admin: "Super Admin",
}

const ROLE_BADGE: Record<string, string> = {
  tenant_admin: "bg-blue-100 text-blue-700",
  seller: "bg-emerald-100 text-emerald-700",
  viewer: "bg-slate-100 text-slate-600",
  super_admin: "bg-purple-100 text-purple-700",
}

function MemberAvatar({ name }: { name: string }) {
  const initial = name[0]?.toUpperCase() ?? "?"
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
      {initial}
    </div>
  )
}

interface MemberRowProps {
  member: TeamMember
  isSelf: boolean
  canManage: boolean
  onEdit: (member: TeamMember) => void
  onRemove: (member: TeamMember) => void
}

function MemberRow({ member, isSelf, canManage, onEdit, onRemove }: MemberRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-border">
      <MemberAvatar name={member.fullName} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{member.fullName}</p>
          {isSelf && <span className="shrink-0 text-xs text-muted-foreground">(Tú)</span>}
        </div>
        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>
      <span
        className={cn(
          "hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-block",
          ROLE_BADGE[member.role] ?? "bg-slate-100 text-slate-600",
        )}
      >
        {ROLE_LABEL[member.role] ?? member.role}
      </span>
      {canManage && !isSelf && (
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            className="h-8 w-8 px-0 text-muted-foreground hover:text-foreground"
            title="Cambiar rol"
            onClick={() => onEdit(member)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 px-0 text-muted-foreground hover:text-destructive"
            title="Eliminar miembro"
            onClick={() => onRemove(member)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

interface SuccessData {
  fullName: string
  email: string
  password: string
}

function AddMemberModal({
  open,
  atLimit,
  onClose,
  onSuccess,
}: {
  open: boolean
  atLimit: boolean
  onClose: () => void
  onSuccess: (data: SuccessData) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMemberForm>({ resolver: zodResolver(createMemberSchema) })

  const mutation = useMutation({
    mutationFn: (values: CreateMemberForm) =>
      createTeamMember({
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        role: values.role as UserRole,
        password: values.password,
      }),
    onSuccess: async (member, values) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers })
      reset()
      onSuccess({ fullName: member.fullName, email: member.email, password: values.password })
    },
    onError: (error) => {
      const detail =
        (error as { response?: { data?: { detail?: string; error?: string } } })?.response?.data?.detail ??
        (error as { response?: { data?: { detail?: string; error?: string } } })?.response?.data?.error
      toast.error(detail ?? "No se pudo agregar el miembro.")
    },
  })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} title="Agregar miembro" description="El miembro podrá iniciar sesión de inmediato con las credenciales que establezcas." onClose={handleClose}>
      {atLimit && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Has alcanzado el límite de usuarios de tu plan.{" "}
          <Link to={routes.settingsBilling} className="font-semibold underline underline-offset-2">
            Actualizá tu plan
          </Link>{" "}
          para agregar más miembros.
        </div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Nombre" autoComplete="off" error={errors.firstName?.message} {...register("firstName")} />
          <InputField label="Apellido" autoComplete="off" error={errors.lastName?.message} {...register("lastName")} />
        </div>
        <InputField label="Email" type="email" autoComplete="off" error={errors.email?.message} {...register("email")} />
        <SelectField label="Rol" error={errors.role?.message} {...register("role")}>
          <option value="seller">Vendedor — puede crear y enviar cotizaciones</option>
          <option value="viewer">Lector — solo puede ver</option>
          <option value="tenant_admin">Administrador — acceso completo</option>
        </SelectField>
        <InputField
          label="Contraseña inicial"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <InputField
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={atLimit} loading={mutation.isPending}>
            <Plus className="h-4 w-4" />
            Agregar miembro
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function SuccessModal({ data, onClose }: { data: SuccessData; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const credentials = `Email: ${data.email}\nContraseña: ${data.password}`

  async function handleCopy() {
    await navigator.clipboard.writeText(credentials)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <Modal open title="Miembro agregado" onClose={onClose}>
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <p className="font-semibold">{data.fullName}</p>
          <p className="mt-1 text-sm text-muted-foreground">fue agregado al equipo exitosamente.</p>
        </div>
        <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
          <p className="text-sm font-semibold text-amber-800">Credenciales temporales</p>
          <p className="mt-1 text-xs text-amber-700">
            No se envió ningún email. Comparte estas credenciales directamente con el nuevo miembro.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              readOnly
              value={credentials}
              className="field flex-1 font-mono text-xs"
              style={{ whiteSpace: "pre" }}
            />
            <Button type="button" variant="secondary" className="h-11 shrink-0 px-3" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button className="w-full" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  )
}

function EditRoleModal({
  member,
  onClose,
}: {
  member: TeamMember | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditMemberRoleForm>({
    resolver: zodResolver(editMemberRoleSchema),
    values: member ? { role: member.role as "tenant_admin" | "seller" | "viewer" } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (values: EditMemberRoleForm) => updateTeamMemberRole(member!.id, values.role as UserRole),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers })
      toast.success("Rol actualizado.")
      reset()
      onClose()
    },
    onError: () => toast.error("No se pudo cambiar el rol."),
  })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal
      open={!!member}
      title="Cambiar rol"
      description={member ? `Cambia el rol de ${member.fullName}.` : undefined}
      onClose={handleClose}
    >
      <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <SelectField label="Rol" error={errors.role?.message} {...register("role")}>
          <option value="seller">Vendedor — puede crear y enviar cotizaciones</option>
          <option value="viewer">Lector — solo puede ver</option>
          <option value="tenant_admin">Administrador — acceso completo</option>
        </SelectField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function TeamPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const canManage = canPerform(user?.role, "manageSettings")
  const confirm = useConfirm()

  const [showAdd, setShowAdd] = useState(false)
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  const { data: members, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.teamMembers,
    queryFn: listTeamMembers,
  })

  const removeMutation = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers })
      toast.success("Miembro eliminado.")
    },
    onError: () => toast.error("No se pudo eliminar el miembro."),
  })

  async function handleRemove(member: TeamMember) {
    const confirmed = await confirm({
      title: "Eliminar miembro",
      description: `¿Eliminar a ${member.fullName} del equipo? Perderá acceso inmediatamente.`,
      confirmLabel: "Eliminar",
      tone: "danger",
    })
    if (confirmed) removeMutation.mutate(member.id)
  }

  function handleAddSuccess(data: SuccessData) {
    setShowAdd(false)
    setSuccessData(data)
  }

  const plan = user?.tenantPlan ?? "free"
  const limit = USER_LIMITS[plan]
  const count = members?.length ?? 0
  const atLimit = limit !== null && count >= limit

  if (isLoading) return <PageSkeleton variant="form" />
  if (isError) {
    return (
      <ErrorState
        title="No se pudo cargar el equipo"
        description="La API no respondio correctamente."
        onAction={() => void refetch()}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label">Configuracion</p>
          <h2 className="mt-2 text-2xl font-bold">Gestion de equipo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Administra los miembros de tu equipo y sus permisos de acceso.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Agregar miembro
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="label">Miembros activos</p>
              <h3 className="mt-1 text-lg font-bold">Equipo</h3>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold",
                atLimit ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700",
              )}
            >
              {count} / {limit ?? "∞"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <div>
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isSelf={member.id === user?.id}
                  canManage={canManage}
                  onEdit={setEditingMember}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay miembros en el equipo todavía.
            </p>
          )}
        </CardContent>
      </Card>

      <AddMemberModal
        open={showAdd}
        atLimit={atLimit}
        onClose={() => setShowAdd(false)}
        onSuccess={handleAddSuccess}
      />

      {successData && (
        <SuccessModal data={successData} onClose={() => setSuccessData(null)} />
      )}

      <EditRoleModal member={editingMember} onClose={() => setEditingMember(null)} />
    </div>
  )
}
