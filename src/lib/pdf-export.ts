"use client"

export async function exportHtmlToPdf(html: string, filename: string) {
  const html2canvasModule = await import("html2canvas")
  const html2canvas = html2canvasModule.default
  const { jsPDF } = await import("jspdf")

  const container = document.createElement("div")
  container.innerHTML = html
  container.style.position = "fixed"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = "800px"
  container.style.background = "#fff"
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    const pdf = new jsPDF("p", "mm", "a4")
    let position = 0
    const pageHeight = 297

    if (imgHeight <= pageHeight) {
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight)
    } else {
      let remainingHeight = imgHeight
      while (remainingHeight > 0) {
        if (position > 0) pdf.addPage()
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, -position, imgWidth, imgHeight)
        position += pageHeight
        remainingHeight -= pageHeight
      }
    }

    pdf.save(`${filename}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
