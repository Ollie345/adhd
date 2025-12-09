import axios, { AxiosError } from "axios"

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

// Normalize URL (remove trailing slashes)
function normalizeUrl(url: string | undefined): string {
  if (!url) throw new Error("ODOO_URL is not set")
  return url.replace(/\/+$/, "")
}

async function rpc<T>(service: string, method: string, args: any[]): Promise<T> {
  const startTime = Date.now()
  
  if (!ODOO_URL || !ODOO_DB || !ODOO_USERNAME || !ODOO_PASSWORD) {
    throw new Error("Missing Odoo env vars")
  }

  const baseUrl = normalizeUrl(ODOO_URL)
  const url = `${baseUrl}/jsonrpc`

  try {
    const response = await axios.post<JSONRPCResult<T>>(
      url,
      {
        jsonrpc: "2.0",
        method: "call",
        params: { service, method, args },
        id: Date.now(),
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000, // 15 second timeout
      }
    )

    const duration = Date.now() - startTime
    const data = response.data

    if (data.error) {
      console.error(`[Odoo RPC] Error after ${duration}ms:`, {
        service,
        method,
        error: data.error,
      })
      throw new Error(data.error?.message || "Odoo RPC error")
    }

    console.log(`[Odoo RPC] Success in ${duration}ms:`, { service, method })
    return data.result as T
  } catch (error) {
    const duration = Date.now() - startTime
    
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError
      if (axiosError.code === "ECONNABORTED") {
        console.error(`[Odoo RPC] Timeout after ${duration}ms:`, { service, method, url })
        throw new Error(`Odoo RPC timeout after 15s: ${service}.${method}`)
      } else if (axiosError.response) {
        console.error(`[Odoo RPC] HTTP ${axiosError.response.status} after ${duration}ms:`, {
          service,
          method,
          status: axiosError.response.status,
          data: axiosError.response.data,
        })
        throw new Error(`Odoo RPC HTTP error ${axiosError.response.status}: ${service}.${method}`)
      } else if (axiosError.request) {
        console.error(`[Odoo RPC] Connection error after ${duration}ms:`, {
          service,
          method,
          message: axiosError.message,
        })
        throw new Error(`Odoo RPC connection error: ${service}.${method} - ${axiosError.message}`)
      }
    }
    
    console.error(`[Odoo RPC] Unknown error after ${duration}ms:`, {
      service,
      method,
      error,
    })
    throw error
  }
}

export async function odooAuthenticate(): Promise<number | null> {
  try {
    const startTime = Date.now()
    console.log("[Odoo Auth] Starting authentication...")
    
    const uid = await rpc<number | false>("common", "authenticate", [
      ODOO_DB,
      ODOO_USERNAME,
      ODOO_PASSWORD,
      {},
    ])
    
    const duration = Date.now() - startTime
    
    if (uid && typeof uid === "number") {
      console.log(`[Odoo Auth] Success in ${duration}ms, UID: ${uid}`)
      return Number(uid)
    }
    
    console.warn(`[Odoo Auth] Failed in ${duration}ms: Invalid UID returned`)
    return null
  } catch (e) {
    console.error("[Odoo Auth] Authentication failed:", e)
    return null
  }
}

export async function ensureTag(uid: number, tagName: string): Promise<number | null> {
  try {
    const startTime = Date.now()
    console.log(`[Odoo Tag] Ensuring tag exists: ${tagName}`)
    
    const existing = await rpc<any[]>("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "crm.tag",
      "search_read",
      [[["name", "=", tagName]]],
      { fields: ["id"], limit: 1 },
    ])
    
    if (existing?.length) {
      const tagId = existing[0].id as number
      const duration = Date.now() - startTime
      console.log(`[Odoo Tag] Found existing tag in ${duration}ms: ${tagName} (ID: ${tagId})`)
      return tagId
    }
    
    const id = await rpc<number>("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "crm.tag",
      "create",
      [{ name: tagName }],
    ])
    
    const duration = Date.now() - startTime
    console.log(`[Odoo Tag] Created tag in ${duration}ms: ${tagName} (ID: ${id})`)
    return id
  } catch (e) {
    console.error(`[Odoo Tag] Error ensuring tag "${tagName}":`, e)
    return null
  }
}

export async function ensurePartner(uid: number, email: string, name: string): Promise<number | null> {
  try {
    if (!email) {
      console.warn("[Odoo Partner] No email provided, skipping partner creation")
      return null
    }
    
    const startTime = Date.now()
    console.log(`[Odoo Partner] Ensuring partner exists: ${email}`)
    
    const existing = await rpc<any[]>("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "res.partner",
      "search_read",
      [[["email", "ilike", email]]],
      { fields: ["id"], limit: 1 },
    ])
    
    if (existing?.length) {
      const partnerId = existing[0].id as number
      const duration = Date.now() - startTime
      console.log(`[Odoo Partner] Found existing partner in ${duration}ms: ${email} (ID: ${partnerId})`)
      return partnerId
    }
    
    const id = await rpc<number>("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "res.partner",
      "create",
      [{ name, email }],
    ])
    
    const duration = Date.now() - startTime
    console.log(`[Odoo Partner] Created partner in ${duration}ms: ${email} (ID: ${id})`)
    return id
  } catch (e) {
    console.error(`[Odoo Partner] Error ensuring partner "${email}":`, e)
    return null
  }
}

export async function createLead(uid: number, leadData: Record<string, any>): Promise<number> {
  const startTime = Date.now()
  console.log(`[Odoo Lead] Creating lead: ${leadData.name}`)
  
  try {
    const id = await rpc<number>("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "crm.lead",
      "create",
      [leadData],
    ])
    
    const duration = Date.now() - startTime
    console.log(`[Odoo Lead] Created lead in ${duration}ms: ${leadData.name} (ID: ${id})`)
    return id
  } catch (e) {
    const duration = Date.now() - startTime
    console.error(`[Odoo Lead] Error creating lead "${leadData.name}" after ${duration}ms:`, e)
    throw e
  }
}

export async function postNote(uid: number, leadId: number, noteText: string): Promise<void> {
  try {
    const startTime = Date.now()
    console.log(`[Odoo Note] Posting note to lead ${leadId}`)
    
    await rpc("object", "execute_kw", [
      ODOO_DB,
      uid,
      ODOO_PASSWORD,
      "crm.lead",
      "message_post",
      [leadId],
      { body: noteText, message_type: "comment", subtype_xmlid: "mail.mt_note" },
    ])
    
    const duration = Date.now() - startTime
    console.log(`[Odoo Note] Posted note in ${duration}ms to lead ${leadId}`)
  } catch (e) {
    console.error(`[Odoo Note] Error posting note to lead ${leadId}:`, e)
    throw e
  }
}
