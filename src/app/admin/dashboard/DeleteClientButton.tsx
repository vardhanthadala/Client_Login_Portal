"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteClientAction } from "@/app/actions/admin"

export default function DeleteClientButton({ clientId, companyName }: { clientId: string, companyName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to permanently delete the client "${companyName}"? This action cannot be undone and will delete all their data.`)) {
      setIsDeleting(true)
      const res = await deleteClientAction(clientId)
      if (res.error) {
        alert(res.error)
      }
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="destructive" 
      size="sm"
      className="h-8 w-8 p-0"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Delete Client"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
