enum LicenseCategory {
  BANEDAG = 'banedag',
  KONKURRANSE = 'konkurranse',
  PASSASJER_LEDSAGER = 'passasjer_ledsager',
  TEST = 'test',
  TRENING = 'trening'
}

enum BanedagType {
  GATEBILER = 'gatebiler',
  RACING = 'racing',
  SPEEDTEST = 'speedtest'
}

enum KonkurranseType {
  AUTOSLALAM = 'autoslalam',
  AUTOSLALAM_LEDSAGER = 'autoslalam_ledsager',
  BILCROSS = 'bilcross',
  FORENKLA_KONKURANSEFORMER = 'forenkla_konkuranseformer',
  BILTRIAL = 'biltrial',
  CROSSKART = 'crosskart',
  CROSSKART_SPRINTLOP = 'crosskart_sprintlop',
  OFFROAD_CHALLENGE = 'offroad_challenge',
  RALLY_KARTLESER = 'rally_kartleser',
  REGULARITY = 'regularity',
  STREET_LEGAL = 'street_legal',
  TERRENG_TOURING = 'terreng_touring',
  VETERANLOP = 'veteranlop',
  NORSK_FUNSPORT = 'norsk_funsport'
}

enum PassasjerLedsagerType {
  BANEDAG = 'banedag',
  BILTRIAL = 'biltrial',
  DRIFTING = 'drifting',
  LEDSAGERLISENS = 'ledsagerlisens',
  OFFROAD_CHALLENGE = 'offroad_challenge',
  STREET_LEGAL = 'street_legal',
  STREET_LEGAL_FORENKLA = 'street_legal_forenkla',
  TERRENG_TOURING = 'terreng_touring'
}

enum TestType {
  DRAGRACE = 'dragrace',
  RALLY = 'rally',
  RALLYCROSS = 'rallycross'
}

enum TreningType {
  AUTOSLALAM = 'autoslalam',
  AUTOSLALAM_PASSASJER = 'autoslalam_passasjer',
  BILCROSS = 'bilcross',
  BILCROSS_JR = 'bilcross_jr',
  BILTRIAL = 'biltrial',
  CROSSKART = 'crosskart',
  DRIFTING = 'drifting',
  KARTING = 'karting',
  MOTORKAHNA = 'motorkahna',
  OFFROAD_GRENER = 'offroad_grener',
  RALLY_PASSASJER = 'rally_passasjer',
  STREET_LEGAL = 'street_legal',
  TERRENG_TOURING_FAMILIE = 'terreng_touring_familie',
  VETERAN = 'veteran'
}

interface License {
  id: string;
  category: LicenseCategory;
  subType: string;
  name: string;
  description: string;
  price: number;
  duration: {
    type: 'single' | 'period';
    validFrom?: Date;
    validTo?: Date;
  };
  requirements: {
    minAge?: number;
    maxAge?: number;
    needsMedical?: boolean;
    needsClubMembership?: boolean;
  };
  restrictions?: string[];
} 