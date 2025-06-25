"use client"
import { useSession } from "next-auth/react"
import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RoleGuard({
  children,
  allowedRoles
}: {
  children: ReactNode
  allowedRoles: string[]
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    
    if (
      status === "unauthenticated" ||
      !session?.user?.role ||
      !allowedRoles.includes(session.user.role)
    ) {
      router.push("/unauthorized")
    }
  }, [status, session, allowedRoles, router])

  if (status === "loading" || !session?.user?.role) {
    return <div>Loading...</div>
  }

  if (!allowedRoles.includes(session.user.role)) {
    return null
  }

  return <>{children}</>
}