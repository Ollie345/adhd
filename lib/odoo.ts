const ODOO_URL = process.env.ODOO_URL
const ODOO_DB = process.env.ODOO_DB
const ODOO_USERNAME = process.env.ODOO_USERNAME
const ODOO_PASSWORD = process.env.ODOO_PASSWORD

type JSONRPCResult<T> = {
  jsonrpc: "2.0"
  id: number | string
  result?: T
  error?: { code: number; message: string; data?: any }
}

async function rpc<T>(service: string, method: string, args: any[]): Promise<T> {
  if (!ODOO_URL || !ODOO_DB || !ODOO_USERNAME || !ODOO_PASSWORD) {
    throw new Error("Missing Odoo env vars")
  }
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { service, method, args },
      id: Date.now(),
    }),
  })
  const data = (await res.json()) as JSONRPCResult<T>
  if ((data as any).error) throw new Error((data as any).error?.message || "Odoo RPC error")
  return (data as any).result as T
}

export async function odooAuthenticate(): Promise<number | null> {
  try {
    const uid = await rpc<number | false>("common", "login", [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD])
    return uid ? Number(uid) : null
  } catch (e) {
    console.error("Odoo auth failed:", e)
    return null
  }
}

export async function ensureTag(uid: number, tagName: string): Promise<number | null> {
  try {
    const existing = await rpc<any[]>("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "crm.tag",
      "search_read",
      [[["name", "=", tagName]]],
      { fields: ["id"], limit: 1 },
    ])
    if (existing?.length) return existing[0].id as number
    const id = await rpc<number>("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "crm.tag",
      "create",
      [{ name: tagName }],
    ])
    return id
  } catch (e) {
    console.error("ensureTag error:", e)
    return null
  }
}

export async function ensurePartner(uid: number, email: string, name: string): Promise<number | null> {
  try {
    if (!email) return null
    const existing = await rpc<any[]>("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "res.partner",
      "search_read",
      [[["email", "ilike", email]]],
      { fields: ["id"], limit: 1 },
    ])
    if (existing?.length) return existing[0].id as number
    const id = await rpc<number>("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "res.partner",
      "create",
      [{ name, email }],
    ])
    return id
  } catch (e) {
    console.error("ensurePartner error:", e)
    return null
  }
}

export async function createLead(uid: number, leadData: Record<string, any>): Promise<number> {
  const id = await rpc<number>("object", "execute_kw", [
    ODOO_DB,
    uid,
    ODOO_PASSWORD,
    "crm.lead",
    "create",
    [leadData],
  ])
  return id
}

export async function postNote(uid: number, leadId: number, noteText: string): Promise<void> {
  try {
    await rpc("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "crm.lead",
      "message_post",
      [leadId],
      { body: noteText, message_type: "comment", subtype_xmlid: "mail.mt_note" },
    ])
  } catch (e) {
    console.error("postNote error:", e)
  }
}


