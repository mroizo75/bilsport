// Importer fra parent directory
import { PrismaClient } from '../node_modules/@prisma/client'

const prisma = new PrismaClient()

// Liste med alle klubber fra bilsportlisens.no
const clubs = [
  "Agder Motorhistoriske Klubb",
  "Agder Motorsport",
  "Arctic Raceway-Dragraceklubb",
  "Asker og Bærum Motorsport",
  "BMW Car Club Norway",
  "Bodø Gokartklubb",
  "NMK eSport",
  "Ford Club Norway",
  "Formula Offroad Norway",
  "Froland Motorsport",
  "Grenland Motorsport",
  "Haugereid Motorsport",
  "Historisk Racing Norge",
  "Hordaland Motorsport",
  "Indre Østfold Motorsport",
  "Islanders Classic Car Club",
  "Jæren Dragrace klubb",
  "Klubb Alfa Romeo Norge",
  "KNA Audi Club Norway",
  "KNA Aust-Agder",
  "KNA Bergen",
  "KNA Bodø",
  "KNA Bunes idrettslag",
  "KNA Drammen",
  "KNA Eiker",
  "KNA Fjellregionen",
  "KNA Grenland",
  "KNA Halden",
  "KNA Haugaland",
  "KNA Hedmark",
  "KNA Indre Ytre Østfold",
  "KNA Klepp Motorsport",
  "KNA Kongsberg",
  "KNA Kongsvinger",
  "KNA Lillehammer Motorsport",
  "KNA Midt Norge",
  "KNA Nordvest",
  "KNA Oppland",
  "KNA Oslo og omegn",
  "KNA Rudskogen",
  "KNA Sokndal Motorsport",
  "KNA Solør Motorsport",
  "KNA Stavanger",
  "KNA Telemark",
  "KNA Troms",
  "KNA Varna",
  "KNA Vest-Agder",
  "KNA Øvre Romerike",
  "Kristiansund Motorklubb",
  "Lillesand Motorsport",
  "NMK Andebu",
  "NMK Aremark",
  "NMK Asker",
  "NMK Aurskog-Høland",
  "NMK Bardu",
  "NMK Bergen",
  "NMK Brønnøy",
  "NMK Bø",
  "NMK Drammen",
  "NMK Dyrøy",
  "NMK Egersund",
  "NMK Elverum",
  "NMK Engerdal",
  "NMK Fluberg",
  "NMK Follo",
  "NMK Frøya",
  "NMK Gardermoen",
  "NMK Gaula Motorsport",
  "NMK Gol",
  "NMK Grane",
  "NMK Grenland",
  "NMK Hadeland",
  "NMK Halsa",
  "NMK Hamar",
  "NMK Harstad",
  "NMK Hardanger",
  "NMK Haugaland",
  "NMK Hell Motorsport",
  "NMK Hitra",
  "NMK Hønefoss",
  "NMK Hålogaland",
  "NMK Jørpeland",
  "NMK Kongsberg",
  "NMK Konsmo",
  "NMK Krabyskogen",
  "NMK Kristiansand",
  "NMK Kvinesdal",
  "NMK Larvik",
  "NMK Lister",
  "NMK Lofoten",
  "NMK Melhus",
  "NMK Midt-Gudbrandsdal",
  "NMK Midt-Troms",
  "NMK Modum og Sigdal",
  "NMK Molde",
  "NMK Namdal",
  "NMK Nedre Hallingdal",
  "NMK Nord-Gudbrandsdal",
  "NMK Nore og Uvdal",
  "NMK Notodden",
  "NMK Oppdal",
  "NMK Orkla",
  "NMK Rana",
  "NMK Rauma",
  "NMK Rena",
  "NMK Rennebu",
  "NMK Sandefjord",
  "NMK Sandnes og Jæren",
  "NMK Sarpsborg/Rudskogen",
  "NMK Seljord",
  "NMK Skjåk",
  "NMK Solør",
  "NMK Stor-Elvdal",
  "NMK Støren",
  "NMK Sunnfjord",
  "NMK Sunnmøre",
  "NMK Surnadal og Rindal",
  "NMK Sør-Gudbrandsdal",
  "NMK Tana",
  "NMK Tinn",
  "NMK Tromsø",
  "NMK Trysil",
  "NMK Trøgstad",
  "NMK Tvedestrand",
  "NMK Tynset",
  "NMK Tønsberg",
  "NMK Valdres",
  "NMK Verdal/Levanger",
  "NMK Vest Telemark",
  "NMK Vesterålen",
  "NMK Vestnes",
  "NMK Vikedal",
  "NMK Ytre Namdal",
  "NMK Ålesund",
  "NMK Åmli Nissedal",
  "Nord Østerdal Motorsport",
  "Norsk Dragracing Gardermoen",
  "Norsk Jaguar Klubb",
  "Norsk Land-Rover Klubb",
  "Norsk Land-Rover Klubb avd. Hordaland",
  "Norsk Land-Rover Klubb avd. Midt-Norge",
  "Norsk Land-Rover Klubb avd. Møre",
  "Norsk Land-Rover Klubb avd. Numedal",
  "Norsk Land-Rover Klubb avd. Rogaland",
  "Norsk Land-Rover Klubb avd. Sør",
  "Norsk Landroverklubb avd. Nord-Norge",
  "Norsk MG klubb",
  "Norsk Mini Cooper Club",
  "Norsk Morgan Klubb",
  "Norsk Mustang Club",
  "Norsk Sportsvogn Klubb",
  "Norsk Volvo Amazon Klubb",
  "Offroad Trøndelag",
  "Opelregisteretet",
  "Oslo Motorsport",
  "Oslo VW club",
  "Porsche Club Norge",
  "Porsche Club Norge avd. Agder",
  "Rogaland Motorsport",
  "Romerike Motorsport",
  "RØROS ACC",
  "Salten Motorsport",
  "Sogn Motorsport",
  "SOGNDAL AMCAR KLUBB",
  "Sør Østerdal Motorsport",
  "Trondheim Motorsport",
  "Veteran VW klubben Norge",
  "Spydeberg Motorklubb",
  "Østre Agder Motorsport",
  "Kristiansand Automobilklubb (KAK)",
  "Bergen Street Legal Team",
  "NBF",
  "KNA Green Racing Klubb",
  "BMW Fanai Norvegijoje CLUB",
  "Opel Ownersclub Norway",
  "AMCAR Sandefjord",
  "Vestmar Idrettslag",
  "Lakselv Motorklubb",
  "Toren Gammelbilklubb",
  "American Car Club Trondheim"
]

async function seedClubs() {
  console.log('🚀 Starter seeding av klubber...')
  
  let created = 0
  let skipped = 0
  
  for (const clubName of clubs) {
    try {
      // Sjekk om klubben allerede eksisterer
      const existing = await prisma.club.findFirst({
        where: { name: clubName }
      })
      
      if (existing) {
        console.log(`⏭️  Klubb finnes allerede: ${clubName}`)
        skipped++
        continue
      }
      
      // Opprett klubb med auto-generert shortName (BEHOLDER NMK/KNA!)
      const shortName = clubName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 10) // Max 10 tegn
      
      await prisma.club.create({
        data: {
          name: clubName,
          shortName: shortName || clubName.substring(0, 10).toUpperCase()
        }
      })
      
      console.log(`✅ Opprettet: ${clubName} (${shortName})`)
      created++
      
    } catch (error) {
      console.error(`❌ Feil ved oppretting av ${clubName}:`, error)
    }
  }
  
  console.log(`\n🎉 Ferdig!`)
  console.log(`✅ Opprettet: ${created} klubber`)
  console.log(`⏭️  Hoppet over: ${skipped} klubber`)
  console.log(`📊 Totalt: ${clubs.length} klubber`)
}

seedClubs()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
