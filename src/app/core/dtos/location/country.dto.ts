export interface Country {
  id: number;
  name: string;
  iso3: string;
  iso2: string;
  numeric_code: string;
  phone_code: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  region_id: string;
  subregion: string;
  subregion_id: string;
  nationality: string;
  timezones: CountryTimezone[];
  translations: {
    kr: string;
    'pt-BR': string;
    pt: string;
    nl: string;
    hr: string;
    fa: string;
    de: string;
    es: string;
    fr: string;
    ja: string;
    it: string;
    cn: string;
    tr: string;
  };
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
}

export interface CountryTimezone {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
}

export const countryDefaultData: Country = {
  id: 0,
  name: '',
  iso3: '',
  iso2: '',
  numeric_code: '',
  phone_code: '',
  capital: '',
  currency: '',
  currency_name: '',
  currency_symbol: '',
  tld: '',
  native: '',
  region: '',
  region_id: '',
  subregion: '',
  subregion_id: '',
  nationality: '',
  timezones: [
    {
      zoneName: '',
      gmtOffset: 0,
      gmtOffsetName: '',
      abbreviation: '',
      tzName: '',
    },
  ],
  translations: {
    kr: '',
    'pt-BR': '',
    pt: '',
    nl: '',
    hr: '',
    fa: '',
    de: '',
    es: '',
    fr: '',
    ja: '',
    it: '',
    cn: '',
    tr: '',
  },
  latitude: '',
  longitude: '',
  emoji: '',
  emojiU: '',
};
