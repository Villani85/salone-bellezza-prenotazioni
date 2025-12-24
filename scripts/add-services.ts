/**
 * Script per aggiungere servizi tipici di un salone di bellezza
 * 
 * Esegui con: npx tsx scripts/add-services.ts
 * 
 * Assicurati di avere le variabili d'ambiente Firebase configurate
 */

import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import * as dotenv from "dotenv"
import * as path from "path"

// Carica variabili d'ambiente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

// Inizializza Firebase Admin
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error("❌ Variabili d'ambiente Firebase mancanti!")
  console.error("Assicurati di avere:")
  console.error("  - FIREBASE_PROJECT_ID")
  console.error("  - FIREBASE_PRIVATE_KEY")
  console.error("  - FIREBASE_CLIENT_EMAIL")
  process.exit(1)
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
})

const db = getFirestore(app)

interface ServiceData {
  name: string
  category: "Capelli" | "Estetica" | "Unghie" | "Depilazione" | "Altro"
  description: string
  duration: number // minuti
  price: number
  active: boolean
}

const services: ServiceData[] = [
  // ========== CAPELLI ==========
  {
    name: "Taglio Donna",
    category: "Capelli",
    description: "Taglio professionale per capelli donna con styling finale",
    duration: 45,
    price: 35.0,
    active: true,
  },
  {
    name: "Taglio Uomo",
    category: "Capelli",
    description: "Taglio classico o moderno per capelli uomo",
    duration: 30,
    price: 25.0,
    active: true,
  },
  {
    name: "Taglio Bambino",
    category: "Capelli",
    description: "Taglio per bambini fino a 12 anni",
    duration: 25,
    price: 18.0,
    active: true,
  },
  {
    name: "Piega",
    category: "Capelli",
    description: "Piega professionale con phon e styling",
    duration: 30,
    price: 20.0,
    active: true,
  },
  {
    name: "Piega Lunga",
    category: "Capelli",
    description: "Piega per capelli lunghi con styling completo",
    duration: 45,
    price: 30.0,
    active: true,
  },
  {
    name: "Colore Completo",
    category: "Capelli",
    description: "Colorazione completa con prodotti professionali",
    duration: 90,
    price: 60.0,
    active: true,
  },
  {
    name: "Colore Radici",
    category: "Capelli",
    description: "Ritocco colore solo sulle radici",
    duration: 60,
    price: 45.0,
    active: true,
  },
  {
    name: "Meches",
    category: "Capelli",
    description: "Meches o colpi di sole per effetti naturali",
    duration: 120,
    price: 80.0,
    active: true,
  },
  {
    name: "Balayage",
    category: "Capelli",
    description: "Tecnica balayage per effetti sfumati e naturali",
    duration: 150,
    price: 100.0,
    active: true,
  },
  {
    name: "Trattamento Capelli",
    category: "Capelli",
    description: "Trattamento idratante e ristrutturante",
    duration: 30,
    price: 25.0,
    active: true,
  },
  {
    name: "Taglio + Piega",
    category: "Capelli",
    description: "Taglio e piega completo",
    duration: 60,
    price: 50.0,
    active: true,
  },
  {
    name: "Taglio + Colore",
    category: "Capelli",
    description: "Taglio e colorazione completa",
    duration: 120,
    price: 85.0,
    active: true,
  },
  {
    name: "Permanente",
    category: "Capelli",
    description: "Permanente per capelli mossi o ricci",
    duration: 120,
    price: 70.0,
    active: true,
  },
  {
    name: "Stiraggio",
    category: "Capelli",
    description: "Stiraggio chimico per capelli lisci",
    duration: 180,
    price: 120.0,
    active: true,
  },

  // ========== ESTETICA ==========
  {
    name: "Trattamento Viso",
    category: "Estetica",
    description: "Trattamento viso idratante e purificante",
    duration: 60,
    price: 45.0,
    active: true,
  },
  {
    name: "Trattamento Viso Anti-Age",
    category: "Estetica",
    description: "Trattamento viso anti-età con prodotti premium",
    duration: 75,
    price: 60.0,
    active: true,
  },
  {
    name: "Pulizia Viso",
    category: "Estetica",
    description: "Pulizia viso profonda con estrazione punti neri",
    duration: 60,
    price: 50.0,
    active: true,
  },
  {
    name: "Massaggio Viso",
    category: "Estetica",
    description: "Massaggio viso rilassante e drenante",
    duration: 30,
    price: 30.0,
    active: true,
  },
  {
    name: "Massaggio Corpo",
    category: "Estetica",
    description: "Massaggio corpo rilassante completo",
    duration: 60,
    price: 55.0,
    active: true,
  },
  {
    name: "Massaggio Drenante",
    category: "Estetica",
    description: "Massaggio drenante per gambe e glutei",
    duration: 45,
    price: 45.0,
    active: true,
  },
  {
    name: "Trattamento Corpo",
    category: "Estetica",
    description: "Trattamento corpo idratante e rassodante",
    duration: 60,
    price: 50.0,
    active: true,
  },
  {
    name: "Trattamento Cellulite",
    category: "Estetica",
    description: "Trattamento anticellulite con prodotti specifici",
    duration: 60,
    price: 60.0,
    active: true,
  },

  // ========== UNGHIE ==========
  {
    name: "Manicure Classica",
    category: "Unghie",
    description: "Manicure classica con smalto tradizionale",
    duration: 30,
    price: 20.0,
    active: true,
  },
  {
    name: "Manicure Semipermanente",
    category: "Unghie",
    description: "Manicure con smalto semipermanente",
    duration: 45,
    price: 30.0,
    active: true,
  },
  {
    name: "Pedicure Classica",
    category: "Unghie",
    description: "Pedicure classica con smalto tradizionale",
    duration: 45,
    price: 30.0,
    active: true,
  },
  {
    name: "Pedicure Semipermanente",
    category: "Unghie",
    description: "Pedicure con smalto semipermanente",
    duration: 60,
    price: 40.0,
    active: true,
  },
  {
    name: "Ricostruzione Unghie",
    category: "Unghie",
    description: "Ricostruzione unghie con gel o acrilico",
    duration: 90,
    price: 50.0,
    active: true,
  },
  {
    name: "Nail Art",
    category: "Unghie",
    description: "Decorazione unghie con nail art personalizzata",
    duration: 60,
    price: 35.0,
    active: true,
  },
  {
    name: "Manicure + Pedicure",
    category: "Unghie",
    description: "Trattamento completo mani e piedi",
    duration: 90,
    price: 60.0,
    active: true,
  },
  {
    name: "Rimozione Semipermante",
    category: "Unghie",
    description: "Rimozione smalto semipermanente",
    duration: 20,
    price: 10.0,
    active: true,
  },

  // ========== DEPILAZIONE ==========
  {
    name: "Ceretta Gambe Complete",
    category: "Depilazione",
    description: "Depilazione completa gambe con ceretta",
    duration: 45,
    price: 40.0,
    active: true,
  },
  {
    name: "Ceretta Gambe Mezze",
    category: "Depilazione",
    description: "Depilazione mezze gambe con ceretta",
    duration: 30,
    price: 25.0,
    active: true,
  },
  {
    name: "Ceretta Bikini",
    category: "Depilazione",
    description: "Depilazione zona bikini con ceretta",
    duration: 30,
    price: 30.0,
    active: true,
  },
  {
    name: "Ceretta Ascelle",
    category: "Depilazione",
    description: "Depilazione ascelle con ceretta",
    duration: 15,
    price: 15.0,
    active: true,
  },
  {
    name: "Ceretta Braccia",
    category: "Depilazione",
    description: "Depilazione braccia complete con ceretta",
    duration: 30,
    price: 25.0,
    active: true,
  },
  {
    name: "Ceretta Viso",
    category: "Depilazione",
    description: "Depilazione viso (baffi, sopracciglia, mento)",
    duration: 20,
    price: 20.0,
    active: true,
  },
  {
    name: "Ceretta Completa",
    category: "Depilazione",
    description: "Depilazione completa corpo con ceretta",
    duration: 120,
    price: 100.0,
    active: true,
  },
]

async function addServices() {
  console.log("💇 Aggiunta servizi salone di bellezza...\n")

  const servicesRef = db.collection("services")
  let added = 0
  let skipped = 0

  for (const service of services) {
    try {
      // Controlla se il servizio esiste già (per nome)
      const existingQuery = await servicesRef.where("name", "==", service.name).get()
      
      if (!existingQuery.empty) {
        console.log(`  ⏭️  ${service.name} - già esistente`)
        skipped++
        continue
      }

      await servicesRef.add({
        ...service,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      console.log(`  ✅ ${service.name} - €${service.price} (${service.duration}min) - ${service.category}`)
      added++
    } catch (error: any) {
      console.error(`  ❌ Errore aggiungendo ${service.name}:`, error.message)
    }
  }

  console.log(`\n🎉 Completato!`)
  console.log(`  • ${added} servizi aggiunti`)
  console.log(`  • ${skipped} servizi già esistenti (saltati)`)
  console.log(`  • Totale: ${services.length} servizi`)
}

addServices()
  .then(() => {
    console.log("\n✨ Script completato con successo!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n❌ Errore durante l'esecuzione:", error)
    process.exit(1)
  })

