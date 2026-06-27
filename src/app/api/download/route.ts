import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch file: ${res.statusText}`)
    }

    const blob = await res.blob()
    // Try to decode URI component so we get a clean filename instead of %20 etc
    let filename = url.split("/").pop() || "download"
    try {
      filename = decodeURIComponent(filename)
    } catch(e) {}

    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename="${filename}"`)
    headers.set("Content-Type", res.headers.get("Content-Type") || "application/octet-stream")

    return new NextResponse(blob, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
