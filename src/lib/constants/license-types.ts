export const LICENSE_TYPES = {
  KONKURRANSE: {
    label: "Konkurranse",
    subTypes: [
      { value: "AUTOSLALOM", label: "Autoslalåm", price: 220 },
      { value: "AUTOSLALOM_LEDSAGER", label: "Autoslalåm Ledsager", price: 220 },
      { value: "BILCROSS", label: "Bilcross", price: 420 },
      { value: "FORENKLA", label: "Forenkla Konkuranseformer", price: 220 },
      { value: "BILTRIAL", label: "Biltrial", price: 420 },
      { value: "CROSSKART", label: "Crosskart", price: 420 },
      { value: "CROSSKART_SPRINT", label: "Crosskart sprintløp", price: 420 },
      { value: "OFFROAD", label: "Offroad Challenge", price: 420 },
      { value: "RALLY_KARTLESER", label: "Rally Kartleser", price: 420 },
      { value: "REGULARITY", label: "Regularity", price: 100 },
      { value: "STREET_LEGAL", label: "Street Legal", price: 420 },
      { value: "TERRENG_TOURING", label: "Terreng Touring", price: 420 },
      { value: "VETERANLOP", label: "Veteranløp", price: 420 },
      { value: "FUNSPORT", label: "Norsk Funsport", price: 420 },
    ]
  },
  TRENING: {
    label: "Trening",
    subTypes: [
      { value: "AUTOSLALOM", label: "Autoslalåm", price: 220 },
      { value: "AUTOSLALOM_LEDSAGER", label: "Autoslalåm Ledsager", price: 220 },
      { value: "BILCROSS", label: "Bilcross", price: 420 },
      { value: "FORENKLA", label: "Forenkla Treningsformer", price: 220 },
      { value: "BILTRIAL", label: "Biltrial", price: 420 },
      { value: "CROSSKART", label: "Crosskart", price: 420 },
      { value: "CROSSKART_SPRINT", label: "Crosskart sprintløp", price: 420 },
      { value: "OFFROAD", label: "Offroad Challenge", price: 420 },
      { value: "RALLY_KARTLESER", label: "Rally Kartleser", price: 420 },
      { value: "REGULARITY", label: "Regularity", price: 100 },
      { value: "STREET_LEGAL", label: "Street Legal", price: 420 },
      { value: "TERRENG_TOURING", label: "Terreng Touring", price: 420 },
      { value: "VETERANLOP", label: "Veteranløp", price: 420 },
      { value: "FUNSPORT", label: "Norsk Funsport", price: 420 },
    ]
  },
  BANEDAG: {
    label: "Banedag",
    subTypes: [
      { value: "RACING", label: "Racing", price: 220 },
      { value: "DRIFTING", label: "Drifting", price: 220 },
      { value: "SUPERMOTO", label: "Supermoto", price: 220 },
    ]
  },
  PASSASJER_LEDSAGER: {
    label: "Passasjer/Ledsager",
    subTypes: [
      { value: "RACING", label: "Racing", price: 220 },
      { value: "DRIFTING", label: "Drifting", price: 220 },
      { value: "RALLY", label: "Rally", price: 220 },
      { value: "RALLYCROSS", label: "Rallycross", price: 220 },
      { value: "CROSSKART", label: "Crosskart", price: 220 },
      { value: "BILCROSS", label: "Bilcross", price: 220 },
      { value: "SHORTCAR", label: "Shortcar", price: 220 },
      { value: "DRAGRACE", label: "Dragrace", price: 220 },
    ]
  },
  TEST: {
    label: "Test",
    subTypes: [
      { value: "RACING", label: "Racing", price: 220 },
      { value: "RALLYCROSS", label: "Rallycross", price: 220 },
      { value: "CROSSKART", label: "Crosskart", price: 220 },
    ]
  }
}

export type LicenseCategory = keyof typeof LICENSE_TYPES
export type LicenseSubType = typeof LICENSE_TYPES[LicenseCategory]["subTypes"][number] 