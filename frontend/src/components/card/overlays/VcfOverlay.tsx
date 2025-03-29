"use client"

import type React from "react"
import { useEffect } from "react"
import "./Overlays.css"

interface VcfOverlayProps {
  isOpen: boolean
  onClose: () => void
  card: {
    display_name: string
    card_pic?: string
    floating_actions?: any[]
    display_address?: string
    bio?: string
    card_username: string
  }
}

const VcfOverlay: React.FC<VcfOverlayProps> = ({ isOpen, onClose, card }) => {
  useEffect(() => {
    if (isOpen) {
      generateAndDownloadVcf()
      onClose() // Close after generating
    }
  }, [isOpen])

  const generateAndDownloadVcf = () => {
    // Prepare basic vCard fields
    const displayName = card.display_name
    const nField = `${displayName};;;;`
    const fnField = displayName

    // Process telephone and email information from floating actions
    const telLines: string[] = []
    const emailLines: string[] = []
    
    if (card.floating_actions) {
      const floating = Array.isArray(card.floating_actions) ? card.floating_actions : []
      
      floating.forEach((action) => {
        const type = action.type || ''
        const contact = (action.contact || action.url || '').trim()
        if (!contact) return

        if (type === 'Call' || type === 'Whatsapp' || type === 'WhatsApp') {
          const phoneNumber = contact.replace(/[^0-9+]/g, '')
          if (type === 'Whatsapp' || type === 'WhatsApp') {
            telLines.push(`TEL;TYPE=cell,WhatsApp:${phoneNumber}`)
          } else {
            telLines.push(`TEL;TYPE=voice,HOME:${phoneNumber}`)
          }
        } else if (type === 'Email') {
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
            emailLines.push(`EMAIL:${contact}`)
          }
        } else if (type === 'SMS') {
          const phoneNumber = contact.replace(/[^0-9+]/g, '')
          telLines.push(`TEL;TYPE=cell,SMS:${phoneNumber}`)
        }
      })
    }

    // Process address field
    const adrField = card.display_address 
      ? `ADR;TYPE=HOME:;;${card.display_address.replace(/\n/g, ' ')};;;;\r\n` 
      : ""

    // Build the user's card URL
    const cardUrl = `${window.location.origin}/${card.card_username}`
    const urlField = `URL:${cardUrl}\r\n`

    // Prepare NOTE field
    const noteField = card.bio ? `NOTE:${card.bio.replace(/\n/g, ' ')}\r\n` : ""

    // Build the vCard content (v3.0)
    let vcf = "BEGIN:VCARD\r\n"
    vcf += "VERSION:3.0\r\n"
    vcf += `FN:${fnField}\r\n`
    vcf += `N:${nField}\r\n`
    
    telLines.forEach(tel => vcf += `${tel}\r\n`)
    emailLines.forEach(email => vcf += `${email}\r\n`)
    vcf += adrField
    vcf += urlField
    vcf += noteField
    vcf += "END:VCARD\r\n"

    // Create download
    const blob = new Blob([vcf], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${displayName.replace(/[^a-z0-9]/gi, '_')}.vcf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="overlay">
      <div className="overlay-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Generating Contact Card</h2>
        <p>Your vCard (.vcf) download should start shortly...</p>
      </div>
    </div>
  )
}

export default VcfOverlay