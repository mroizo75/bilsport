// Importer fra parent directory
import { PrismaClient } from '../node_modules/@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

// Lisensdata basert på https://www.bilsportlisens.no/
const licenseData = [
  // === BANEDAG ===
  {
    category: 'Banedag',
    description: 'Lisenser for banedag-aktiviteter',
    subTypes: [
      {
        name: 'Banedag - Gatebiler',
        description: 'For kjøring med vanlige gatebiler på bane',
        price: 220,
        activities: ['Autoslalåm', 'Bilcross', 'Biltrial', 'Crosskart', 'Folkrace', 'Gatebane', 'Utforkjøring', 'Rallycross']
      },
      {
        name: 'Banedag - Gokart',
        description: 'For gokart-kjøring på banedag',
        price: 220,
        activities: ['Gokart']
      },
      {
        name: 'Banedag - Motorsykkel',
        description: 'For motorsykkel på banedag',
        price: 220,
        activities: ['Roadracing/Supersport MC']
      }
    ]
  },
  
  // === ESPORT ===
  {
    category: 'Esport',
    description: 'Lisenser for e-sport konkurranser',
    subTypes: [
      {
        name: 'Esport - Konkurranse',
        description: 'For deltakelse i e-sport konkurranser',
        price: 250,
        activities: ['Esport']
      }
    ]
  },
  
  // === KONKURRANSE ===
  {
    category: 'Konkurranse',
    description: 'Lisenser for konkurranser (én dag)',
    subTypes: [
      {
        name: 'Autoslalåm - Konkurranse',
        description: 'For konkurranse i Autoslalåm',
        price: 350,
        activities: ['Autoslalåm']
      },
      {
        name: 'Bilcross - Konkurranse',
        description: 'For konkurranse i Bilcross',
        price: 350,
        activities: ['Bilcross']
      },
      {
        name: 'Biltrial - Konkurranse',
        description: 'For konkurranse i Biltrial',
        price: 350,
        activities: ['Biltrial']
      },
      {
        name: 'Crosskart - Konkurranse',
        description: 'For konkurranse med Crosskart',
        price: 350,
        activities: ['Crosskart']
      },
      {
        name: 'Drifting - Konkurranse',
        description: 'For konkurranse i Drifting',
        price: 350,
        activities: ['Drifting']
      },
      {
        name: 'Dragracing - Konkurranse',
        description: 'For konkurranse i Dragracing',
        price: 350,
        activities: ['Dragracing']
      },
      {
        name: 'Folkrace - Konkurranse',
        description: 'For konkurranse i Folkrace',
        price: 350,
        activities: ['Folkrace']
      },
      {
        name: 'Gatebane - Konkurranse',
        description: 'For konkurranse på Gatebane',
        price: 350,
        activities: ['Gatebane']
      },
      {
        name: 'Gokart - Konkurranse',
        description: 'For konkurranse i Gokart',
        price: 350,
        activities: ['Gokart']
      },
      {
        name: 'Rally - Konkurranse',
        description: 'For konkurranse i Rally',
        price: 350,
        activities: ['Rally']
      },
      {
        name: 'Rallycross - Konkurranse',
        description: 'For konkurranse i Rallycross',
        price: 350,
        activities: ['Rallycross']
      },
      {
        name: 'Roadracing/Supersport MC - Konkurranse',
        description: 'For MC konkurranse',
        price: 350,
        activities: ['Roadracing/Supersport MC']
      },
      {
        name: 'Time Attack - Konkurranse',
        description: 'For Time Attack konkurranse',
        price: 350,
        activities: ['Time Attack']
      },
      {
        name: 'Utforkjøring - Konkurranse',
        description: 'For konkurranse i Utforkjøring',
        price: 350,
        activities: ['Utforkjøring']
      }
    ]
  },
  
  // === PASSASJER/LEDSAGER ===
  {
    category: 'Passasjer/Ledsager',
    description: 'Lisenser for passasjerer og ledsagere',
    subTypes: [
      {
        name: 'Autoslalåm - Passasjer',
        description: 'Passasjerlisens for Autoslalåm',
        price: 220,
        activities: ['Autoslalåm']
      },
      {
        name: 'Folkrace - Passasjer',
        description: 'Passasjerlisens for Folkrace',
        price: 220,
        activities: ['Folkrace']
      },
      {
        name: 'Gatebane - Passasjer',
        description: 'Passasjerlisens for Gatebane',
        price: 220,
        activities: ['Gatebane']
      },
      {
        name: 'Rally - Passasjer',
        description: 'Passasjerlisens for Rally',
        price: 220,
        activities: ['Rally']
      },
      {
        name: 'Rallycross - Passasjer',
        description: 'Passasjerlisens for Rallycross',
        price: 220,
        activities: ['Rallycross']
      },
      {
        name: 'Roadracing/Supersport MC - Passasjer',
        description: 'Passasjerlisens for MC',
        price: 220,
        activities: ['Roadracing/Supersport MC']
      },
      {
        name: 'Time Attack - Passasjer',
        description: 'Passasjerlisens for Time Attack',
        price: 220,
        activities: ['Time Attack']
      },
      {
        name: 'Utforkjøring - Passasjer',
        description: 'Passasjerlisens for Utforkjøring',
        price: 220,
        activities: ['Utforkjøring']
      }
    ]
  },
  
  // === TEST ===
  {
    category: 'Test',
    description: 'Lisenser for testing (én dag)',
    subTypes: [
      {
        name: 'Crosskart - Test',
        description: 'For testing av Crosskart',
        price: 220,
        activities: ['Crosskart']
      },
      {
        name: 'Rally - Test',
        description: 'For testing i Rally',
        price: 220,
        activities: ['Rally']
      },
      {
        name: 'Rallycross - Test',
        description: 'For testing i Rallycross',
        price: 220,
        activities: ['Rallycross']
      }
    ]
  },
  
  // === TRENING ===
  {
    category: 'Trening',
    description: 'Lisenser for trening (én dag)',
    subTypes: [
      {
        name: 'Autoslalåm - Trening',
        description: 'For trening i Autoslalåm',
        price: 220,
        activities: ['Autoslalåm']
      },
      {
        name: 'Bilcross - Trening',
        description: 'For trening i Bilcross',
        price: 220,
        activities: ['Bilcross']
      },
      {
        name: 'Biltrial - Trening',
        description: 'For trening i Biltrial',
        price: 220,
        activities: ['Biltrial']
      },
      {
        name: 'Crosskart - Trening',
        description: 'For trening med Crosskart',
        price: 220,
        activities: ['Crosskart']
      },
      {
        name: 'Drifting - Trening',
        description: 'For trening i Drifting',
        price: 220,
        activities: ['Drifting']
      },
      {
        name: 'Dragracing - Trening',
        description: 'For trening i Dragracing',
        price: 220,
        activities: ['Dragracing']
      },
      {
        name: 'Folkrace - Trening',
        description: 'For trening i Folkrace',
        price: 220,
        activities: ['Folkrace']
      },
      {
        name: 'Gatebane - Trening',
        description: 'For trening på Gatebane',
        price: 220,
        activities: ['Gatebane']
      },
      {
        name: 'Gokart - Trening',
        description: 'For trening i Gokart',
        price: 220,
        activities: ['Gokart']
      },
      {
        name: 'Rally - Trening',
        description: 'For trening i Rally',
        price: 220,
        activities: ['Rally']
      },
      {
        name: 'Rallycross - Trening',
        description: 'For trening i Rallycross',
        price: 220,
        activities: ['Rallycross']
      },
      {
        name: 'Roadracing/Supersport MC - Trening',
        description: 'For MC trening',
        price: 220,
        activities: ['Roadracing/Supersport MC']
      },
      {
        name: 'Time Attack - Trening',
        description: 'For Time Attack trening',
        price: 220,
        activities: ['Time Attack']
      },
      {
        name: 'Utforkjøring - Trening',
        description: 'For trening i Utforkjøring',
        price: 220,
        activities: ['Utforkjøring']
      }
    ]
  }
]

async function main() {
  console.log('🚀 Starter seeding av lisenser...')

  let categoriesCreated = 0
  let subTypesCreated = 0
  let licensesCreated = 0
  let skipped = 0

  for (const categoryData of licenseData) {
    // Sjekk om kategori allerede eksisterer
    let category = await prisma.licenseCategory.findFirst({
      where: { name: categoryData.category }
    })

    if (!category) {
      // Opprett kategori
      category = await prisma.licenseCategory.create({
        data: {
          name: categoryData.category,
          description: categoryData.description
        }
      })
      categoriesCreated++
      console.log(`✅ Kategori: ${categoryData.category}`)
    } else {
      console.log(`⏭️  Kategori eksisterer: ${categoryData.category}`)
    }

    // Opprett subTypes for denne kategorien
    for (const subTypeData of categoryData.subTypes) {
      // Sjekk om subType allerede eksisterer
      const existingSubType = await prisma.licenseSubType.findFirst({
        where: {
          name: subTypeData.name,
          categoryId: category.id
        }
      })

      if (existingSubType) {
        console.log(`  ⏭️  SubType eksisterer: ${subTypeData.name}`)
        skipped++
        continue
      }

      // Opprett SubType
      const subType = await prisma.licenseSubType.create({
        data: {
          name: subTypeData.name,
          description: subTypeData.description,
          price: new Decimal(subTypeData.price),
          categoryId: category.id
        }
      })
      subTypesCreated++

      // Opprett License for hver aktivitet
      for (const activity of subTypeData.activities) {
        const licenseName = `${activity} - ${categoryData.category}`
        
        const existingLicense = await prisma.license.findFirst({
          where: {
            name: licenseName,
            subTypeId: subType.id
          }
        })

        if (!existingLicense) {
          await prisma.license.create({
            data: {
              subTypeId: subType.id,
              category: categoryData.category,
              name: licenseName,
              description: `${subTypeData.description} - ${activity}`,
              price: new Decimal(subTypeData.price)
            }
          })
          licensesCreated++
        }
      }

      console.log(`  ✅ ${subTypeData.name} (${subTypeData.price} kr) → ${subTypeData.activities.length} lisens(er)`)
    }
  }

  console.log('\n🎉 Ferdig!')
  console.log(`✅ Kategorier: ${categoriesCreated}`)
  console.log(`✅ SubTypes: ${subTypesCreated}`)
  console.log(`✅ Lisenser: ${licensesCreated}`)
  console.log(`⏭️  Hoppet over: ${skipped}`)
  console.log(`📊 Totalt: ${categoriesCreated + subTypesCreated + licensesCreated} elementer`)
}

main()
  .catch((error) => {
    console.error('❌ Feil under seeding:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
