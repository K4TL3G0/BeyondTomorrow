export const TVET_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
] as const;

export type TvetProvince = (typeof TVET_PROVINCES)[number];

export interface TvetCollege {
  id: string;
  name: string;
  province: TvetProvince;
  url: string;
}

export const TVET_COLLEGES = [
  { id: 'buffalo-city-tvet', name: 'Buffalo City TVET College', province: 'Eastern Cape', url: 'https://www.buffalocitytvet.edu.za' },
  { id: 'eastcape-midlands-tvet', name: 'Eastcape Midlands TVET College', province: 'Eastern Cape', url: 'https://www.emc.edu.za' },
  { id: 'ikhala-tvet', name: 'Ikhala TVET College', province: 'Eastern Cape', url: 'https://www.ikhala.edu.za' },
  { id: 'ingwe-tvet', name: 'Ingwe TVET College', province: 'Eastern Cape', url: 'https://www.ingwe.edu.za' },
  { id: 'king-hintsa-tvet', name: 'King Hintsa TVET College', province: 'Eastern Cape', url: 'https://www.kinghintsa.edu.za' },
  { id: 'ksd-tvet', name: 'King Sabata Dalindyebo TVET College', province: 'Eastern Cape', url: 'https://www.dhet.gov.za/' },
  { id: 'lovedale-tvet', name: 'Lovedale TVET College', province: 'Eastern Cape', url: 'https://www.lovedale.edu.za' },
  { id: 'port-elizabeth-tvet', name: 'Port Elizabeth TVET College', province: 'Eastern Cape', url: 'https://www.petvet.edu.za' },
  { id: 'flavius-mareka-tvet', name: 'Flavius Mareka TVET College', province: 'Free State', url: 'https://www.flaviusmareka.edu.za' },
  { id: 'goldfields-tvet', name: 'Goldfields TVET College', province: 'Free State', url: 'https://www.goldfields.edu.za' },
  { id: 'maluti-tvet', name: 'Maluti TVET College', province: 'Free State', url: 'https://www.maluti.edu.za' },
  { id: 'motheo-tvet', name: 'Motheo TVET College', province: 'Free State', url: 'https://www.motheo.edu.za' },
  { id: 'cjc-tvet', name: 'Central Johannesburg TVET College', province: 'Gauteng', url: 'https://www.cjc.edu.za' },
  { id: 'ekurhuleni-east-tvet', name: 'Ekurhuleni East TVET College', province: 'Gauteng', url: 'https://www.eec.edu.za' },
  { id: 'ewc-tvet', name: 'Ekurhuleni West TVET College', province: 'Gauteng', url: 'https://www.ewc.edu.za' },
  { id: 'sedibeng-tvet', name: 'Sedibeng TVET College', province: 'Gauteng', url: 'https://www.sedibeng.edu.za' },
  { id: 'swgc-tvet', name: 'South West Gauteng TVET College', province: 'Gauteng', url: 'https://www.swgc.edu.za' },
  { id: 'tnc-tvet', name: 'Tshwane North TVET College', province: 'Gauteng', url: 'https://www.tnc.edu.za' },
  { id: 'tshwane-south-tvet', name: 'Tshwane South TVET College', province: 'Gauteng', url: 'https://www.tsc.edu.za' },
  { id: 'westcol-tvet', name: 'Western TVET College', province: 'Gauteng', url: 'https://www.westcol.edu.za' },
  { id: 'coastal-kzn-tvet', name: 'Coastal KZN TVET College', province: 'KwaZulu-Natal', url: 'https://www.coastalkzn.edu.za' },
  { id: 'elangeni-tvet', name: 'Elangeni TVET College', province: 'KwaZulu-Natal', url: 'https://www.elangeni.edu.za' },
  { id: 'esayidi-tvet', name: 'Esayidi TVET College', province: 'KwaZulu-Natal', url: 'https://www.esayidi.edu.za' },
  { id: 'majuba-tvet', name: 'Majuba TVET College', province: 'KwaZulu-Natal', url: 'https://www.majuba.edu.za' },
  { id: 'mnambithi-tvet', name: 'Mnambithi TVET College', province: 'KwaZulu-Natal', url: 'https://www.mnambithi.edu.za' },
  { id: 'mthashana-tvet', name: 'Mthashana TVET College', province: 'KwaZulu-Natal', url: 'https://www.mthashana.edu.za' },
  { id: 'thekwini-tvet', name: 'Thekwini TVET College', province: 'KwaZulu-Natal', url: 'https://www.thekwini.edu.za' },
  { id: 'umfolozi-tvet', name: 'uMfolozi TVET College', province: 'KwaZulu-Natal', url: 'https://www.umfolozi.edu.za' },
  { id: 'umgungundlovu-tvet', name: 'uMgungundlovu TVET College', province: 'KwaZulu-Natal', url: 'https://www.umgungundlovu.edu.za' },
  { id: 'capricorn-tvet', name: 'Capricorn TVET College', province: 'Limpopo', url: 'https://www.capricorn.edu.za' },
  { id: 'lephalale-tvet', name: 'Lephalale TVET College', province: 'Limpopo', url: 'https://www.lephalale.edu.za' },
  { id: 'letaba-tvet', name: 'Letaba TVET College', province: 'Limpopo', url: 'https://www.letaba.edu.za' },
  { id: 'mopani-tvet', name: 'Mopani South East TVET College', province: 'Limpopo', url: 'https://www.mopani.edu.za' },
  { id: 'sekhukhune-tvet', name: 'Sekhukhune TVET College', province: 'Limpopo', url: 'https://www.sekhukhune.edu.za' },
  { id: 'vhembe-tvet', name: 'Vhembe TVET College', province: 'Limpopo', url: 'https://www.vhembe.edu.za' },
  { id: 'waterberg-tvet', name: 'Waterberg TVET College', province: 'Limpopo', url: 'https://www.waterberg.edu.za' },
  { id: 'ehlanzeni-tvet', name: 'Ehlanzeni TVET College', province: 'Mpumalanga', url: 'https://www.ehlanzeni.edu.za' },
  { id: 'gert-sibande-tvet', name: 'Gert Sibande TVET College', province: 'Mpumalanga', url: 'https://www.gertsibande.edu.za' },
  { id: 'nkangala-tvet', name: 'Nkangala TVET College', province: 'Mpumalanga', url: 'https://www.nkangala.edu.za' },
  { id: 'orbit-tvet', name: 'Orbit TVET College', province: 'North West', url: 'https://www.orbitcollege.co.za' },
  { id: 'taletso-tvet', name: 'Taletso TVET College', province: 'North West', url: 'https://www.taletso.edu.za' },
  { id: 'vuselela-tvet', name: 'Vuselela TVET College', province: 'North West', url: 'https://www.vuselelacollege.co.za' },
  { id: 'nc-rural-tvet', name: 'Northern Cape Rural TVET College', province: 'Northern Cape', url: 'https://www.dhet.gov.za/' },
  { id: 'nc-urban-tvet', name: 'Northern Cape Urban TVET College', province: 'Northern Cape', url: 'https://www.dhet.gov.za/' },
  { id: 'boland-tvet', name: 'Boland TVET College', province: 'Western Cape', url: 'https://www.bolandcollege.com' },
  { id: 'college-of-cape-town-tvet', name: 'College of Cape Town for TVET', province: 'Western Cape', url: 'https://www.cct.edu.za' },
  { id: 'false-bay-tvet', name: 'False Bay TVET College', province: 'Western Cape', url: 'https://www.falsebay.edu.za' },
  { id: 'northlink-tvet', name: 'Northlink TVET College', province: 'Western Cape', url: 'https://www.northlink.edu.za' },
  { id: 'south-cape-tvet', name: 'South Cape TVET College', province: 'Western Cape', url: 'https://www.southcape.edu.za' },
  { id: 'west-coast-tvet', name: 'West Coast TVET College', province: 'Western Cape', url: 'https://www.westcoastcollege.co.za' },
] as const satisfies readonly TvetCollege[];
